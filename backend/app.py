# app.py
# Allow OAuth to work with HTTP in development - MUST be at top
import os
import warnings
import sys

# Suppress warnings
warnings.filterwarnings('ignore', category=UserWarning, module='urllib3')
warnings.filterwarnings('ignore', category=FutureWarning, module='google.api_core')
warnings.filterwarnings('ignore', message='.*packages_distributions.*')

# Suppress the "An error occurred" print from google.api_core
# This happens because Python 3.9's importlib.metadata doesn't have packages_distributions
_original_stderr = sys.stderr
_original_stdout = sys.stdout

class FilteredStream:
    def __init__(self, original):
        self.original = original
    def write(self, text):
        # Suppress specific error messages
        if "An error occurred: module 'importlib.metadata' has no attribute 'packages_distributions'" in text:
            return
        self.original.write(text)
    def flush(self):
        self.original.flush()
    def __getattr__(self, name):
        return getattr(self.original, name)

# Temporarily redirect stderr and stdout during imports
sys.stderr = FilteredStream(sys.stderr)
sys.stdout = FilteredStream(sys.stdout)

os.environ['OAUTHLIB_INSECURE_TRANSPORT'] = '1'
os.environ['OAUTHLIB_RELAX_TOKEN_SCOPE'] = '1'

from flask import Flask, request, jsonify, session, redirect, send_file
from flask_cors import CORS
import joblib
import base64
import re
from datetime import datetime, timedelta

import google_auth_oauthlib.flow
import google.oauth2.credentials
import googleapiclient.discovery

# Restore stderr and stdout after imports
sys.stderr = _original_stderr
sys.stdout = _original_stdout

from utils.preprocess import clean_email
from utils.phishing import detect_phishing_indicators
from utils.url_guard import classify_url
from utils.url_features import URLFeatureExtractor

# local modules (relative imports)
from offline_mode import analyze_email_offline
from report_utils import generate_report
from pdf_export import export_report_pdf

app = Flask(__name__)

# ====== CORS ======
CORS(app,
     supports_credentials=True,
     origins=["http://localhost:3000", "http://localhost:3001"],
     methods=["GET", "POST", "OPTIONS"],
     allow_headers=["Content-Type", "Authorization"])

# ====== Session Config ======
app.secret_key = os.environ.get("SPAMURAI_SECRET", "spamurai_dev_secret_please_change")
app.config.update(
    SESSION_COOKIE_SECURE=False,  # True if using HTTPS
    SESSION_COOKIE_HTTPONLY=True,
    SESSION_COOKIE_SAMESITE='Lax',  # works with HTTP in development
    SESSION_COOKIE_DOMAIN='localhost',  # explicit domain for cross-origin
    PERMANENT_SESSION_LIFETIME=3600
)

CLIENT_SECRETS_FILE = "client_secret.json"
REDIRECT_URI = "http://localhost:5000/oauth2callback"
SCOPES = [
    "https://www.googleapis.com/auth/gmail.readonly",
    "openid",
    "https://www.googleapis.com/auth/userinfo.email",
    "https://www.googleapis.com/auth/userinfo.profile"
]

oauth_states = {}  # in-memory state

# Skip model loading at startup - models will be loaded lazily when needed
# This speeds up startup significantly
print("⏭️  Skipping model pre-loading (will load on first use)")

# =================== GOOGLE OAUTH ===================
@app.route("/auth/google")
def google_auth():
    try:
        print(f"🔗 Using redirect URI: {REDIRECT_URI}")
        print(f"📁 Client secrets file: {CLIENT_SECRETS_FILE}")
        
        if not os.path.exists(CLIENT_SECRETS_FILE):
            return jsonify({"error": f"Client secrets file not found: {CLIENT_SECRETS_FILE}"}), 500
        
        flow = google_auth_oauthlib.flow.Flow.from_client_secrets_file(
            CLIENT_SECRETS_FILE,
            scopes=SCOPES,
            redirect_uri=REDIRECT_URI
        )
        auth_url, state = flow.authorization_url(
            access_type="offline",
            include_granted_scopes="true",
            prompt="consent"
        )

        session["state"] = state
        oauth_states[state] = {"created_at": datetime.now(), "flow": flow}
        print(f"✅ OAuth flow initiated, state: {state[:10]}...")

        return jsonify({"auth_url": auth_url})
    except Exception as e:
        print(f"❌ Error initiating OAuth: {str(e)}")
        return jsonify({"error": f"Failed to initiate OAuth: {str(e)}"}), 500

@app.route("/oauth2callback")
def oauth2callback():
    returned_state = request.args.get("state")
    error = request.args.get("error")
    
    # Handle OAuth errors from Google
    if error:
        error_description = request.args.get("error_description", error)
        print(f"❌ OAuth error: {error} - {error_description}")
        return redirect(f"http://localhost:3000?oauth_error={error}&error_description={error_description}")
    
    if not returned_state:
        print("❌ No state parameter in OAuth callback")
        return redirect("http://localhost:3000?oauth_error=no_state&error_description=No state parameter received")

    if returned_state not in oauth_states:
        print(f"❌ State not found: {returned_state}")
        return redirect("http://localhost:3000?oauth_error=invalid_state&error_description=OAuth state not found or expired")

    flow = oauth_states[returned_state]["flow"]
    try:
        flow.fetch_token(authorization_response=request.url)
        print("✅ OAuth token fetched successfully")
    except Exception as e:
        print(f"❌ Failed to fetch token: {str(e)}")
        return redirect(f"http://localhost:3000?oauth_error=token_fetch_failed&error_description={str(e)}")

    creds = flow.credentials

    session["credentials"] = {
        "token": creds.token,
        "refresh_token": creds.refresh_token,
        "token_uri": creds.token_uri,
        "client_id": creds.client_id,
        "client_secret": creds.client_secret,
        "scopes": creds.scopes
    }

    # Safe cleanup
    oauth_states.pop(returned_state, None)
    session.pop("state", None)

    # redirect back to frontend
    return redirect("http://localhost:3000?oauth_success=true")

# =================== EMAIL FETCH & ANALYSIS ===================
@app.route("/api/emails", methods=["GET"])
def get_emails():
    if "credentials" not in session:
        return jsonify({"error": "Not authenticated"}), 401

    # Optional limit parameter for how many emails to fetch
    # If no limit is provided, fetch all emails (use a high default)
    limit_param = request.args.get("limit")
    if limit_param:
        try:
            limit = int(limit_param)
        except (TypeError, ValueError):
            limit = 500  # Default to 500 if invalid
    else:
        # No limit specified - fetch all emails (cap at 1000 for safety)
        limit = 1000
    # keep limit within a reasonable safe range (increased max to 1000)
    limit = max(1, min(limit, 1000))

    # Get date filters
    start_date = request.args.get("startDate")
    end_date = request.args.get("endDate")
    
    # Build Gmail query string
    query_parts = []
    if start_date:
        # Gmail uses format: after:YYYY/MM/DD
        try:
            # Convert YYYY-MM-DD to YYYY/MM/DD
            start_formatted = start_date.replace("-", "/")
            query_parts.append(f"after:{start_formatted}")
        except Exception as e:
            print(f"Warning: Invalid startDate format: {e}")
    
        if end_date:
            # Gmail uses format: before:YYYY/MM/DD
            try:
                # Convert YYYY-MM-DD to YYYY/MM/DD
                # Add 1 day to end_date to include the entire end date
                end_dt = datetime.strptime(end_date, "%Y-%m-%d")
                end_dt = end_dt + timedelta(days=1)
                end_formatted = end_dt.strftime("%Y/%m/%d")
                query_parts.append(f"before:{end_formatted}")
            except Exception as e:
                print(f"Warning: Invalid endDate format: {e}")
    
    query = " ".join(query_parts) if query_parts else None

    creds = google.oauth2.credentials.Credentials(**session["credentials"])
    try:
        service = googleapiclient.discovery.build("gmail", "v1", credentials=creds)
        
        # Build the request with query if provided
        request_params = {
            "userId": "me",
            "maxResults": limit
        }
        if query:
            request_params["q"] = query
        
        messages_resp = service.users().messages().list(**request_params).execute()
        messages = messages_resp.get("messages", []) or []
        
        # If there are more results and we haven't hit the limit, fetch more pages
        next_page_token = messages_resp.get("nextPageToken")
        while next_page_token and len(messages) < limit:
            request_params["pageToken"] = next_page_token
            next_resp = service.users().messages().list(**request_params).execute()
            next_messages = next_resp.get("messages", []) or []
            messages.extend(next_messages)
            next_page_token = next_resp.get("nextPageToken")
            if not next_messages:
                break
        
        # Limit to requested amount
        messages = messages[:limit]
        
    except Exception as e:
        return jsonify({"error": f"Failed to fetch emails: {str(e)}"}), 500

    emails_data = []
    # Process emails with progress feedback
    total = len(messages)
    print(f"📧 Processing {total} emails...")
    
    for idx, m in enumerate(messages, 1):
        try:
            # Progress feedback every 10 emails
            if idx % 10 == 0 or idx == total:
                print(f"📧 Processing email {idx}/{total}...")
            
            # Fetch full message once (needed for both headers and body)
            msg = service.users().messages().get(userId="me", id=m["id"], format="full").execute()
            headers = msg.get("payload", {}).get("headers", []) or []
            subject = next((h["value"] for h in headers if h.get("name") == "Subject"), "")
            sender = next((h["value"] for h in headers if h.get("name") == "From"), "")
            date = next((h["value"] for h in headers if h.get("name") == "Date"), "")

            # Extract body efficiently
            body = ""
            try:
                payload = msg.get("payload", {})
                
                # Extract body more efficiently
                parts = payload.get("parts", []) or []
                if parts:
                    # Look for text/plain first (faster)
                    for part in parts:
                        if part.get("mimeType") == "text/plain" and part.get("body", {}).get("data"):
                            body = base64.urlsafe_b64decode(part["body"]["data"]).decode("utf-8", errors="replace")
                            break
                    # Fallback to text/html if no plain text
                    if not body:
                        for part in parts:
                            if part.get("mimeType") == "text/html" and part.get("body", {}).get("data"):
                                html_body = base64.urlsafe_b64decode(part["body"]["data"]).decode("utf-8", errors="replace")
                                # Simple HTML tag removal for analysis
                                body = re.sub(r'<[^>]+>', '', html_body)
                                break
                # Fallback to top-level body
                if not body and payload.get("body", {}).get("data"):
                    body = base64.urlsafe_b64decode(payload["body"]["data"]).decode("utf-8", errors="replace")
            except Exception as e:
                print(f"Warning: Could not extract body for message {m.get('id')}: {e}")
                body = ""

            # Limit body size for faster analysis (first 5000 chars should be enough)
            body_for_analysis = body[:5000] if len(body) > 5000 else body

            # Offline analysis using local model & vectorizer
            # Pass sender information for whitelist checking
            analysis = analyze_email_offline(body_for_analysis, sender=sender)

            emails_data.append({
                "id": m["id"],
                "subject": subject,
                "sender": sender,
                "date": date,
                "body": body[:500] + "..." if len(body) > 500 else body,
                "classification": analysis.get("classification", "unknown"),
                "spam_probability": analysis.get("spam_probability", 0),
                "ham_probability": analysis.get("ham_probability", 0),
                "phishing_indicators": analysis.get("phishing_indicators", {}),
                "url_risks": analysis.get("url_risks", []),
                "warning_level": analysis.get("warning_level", "low"),
                "warning_message": analysis.get("warning_message", "")
            })
        except Exception as e:
            # non fatal for single message
            print(f"Warning: Failed to process message {m.get('id')}: {e}")
            continue

    return jsonify({"emails": emails_data})

# =================== MANUAL PREDICTION ===================
@app.route("/predict", methods=["POST"])
def predict_email():
    data = request.get_json(force=True)
    message = data.get("message", "")
    sender = data.get("sender", None)  # Optional sender for whitelist checking
    if not message:
        return jsonify({"error": "No message provided"}), 400

    analysis = analyze_email_offline(message, sender=sender)
    return jsonify(analysis)

# =================== REPORT GENERATION ===================
@app.route("/api/report", methods=["POST"])
def generate_report_route():
    data = request.get_json(force=True)
    emails = data.get("emails", [])
    if not emails:
        return jsonify({"error": "No emails provided"}), 400

    report_data = generate_report(emails)
    return jsonify(report_data)

# =================== EXPORT PDF ===================
@app.route("/api/export_pdf", methods=["POST"])
def export_pdf_route():
    data = request.get_json(force=True)
    emails = data.get("emails", [])
    if not emails:
        return jsonify({"error": "No emails provided"}), 400

    report_data = generate_report(emails)
    # Pass emails for detailed report
    pdf_bytes = export_report_pdf(report_data, emails)
    
    # Return PDF as response with proper headers
    from io import BytesIO
    return send_file(
        BytesIO(pdf_bytes),
        mimetype='application/pdf',
        as_attachment=True,
        download_name=f'spamurai_report_{datetime.now().strftime("%Y%m%d")}.pdf'
    )

# =================== AUTH STATUS ===================
@app.route("/api/auth/status", methods=["GET"])
def auth_status():
    if "credentials" not in session:
        return jsonify({"authenticated": False})
    
    try:
        creds = google.oauth2.credentials.Credentials(**session["credentials"])
        # Try to get user info to verify token is still valid
        service = googleapiclient.discovery.build("oauth2", "v2", credentials=creds)
        user_info = service.userinfo().get().execute()
        return jsonify({
            "authenticated": True,
            "email": user_info.get("email", ""),
            "name": user_info.get("name", "")
        })
    except Exception as e:
        # Token might be expired
        session.clear()
        return jsonify({"authenticated": False, "error": str(e)})

# =================== USER INFO ===================
@app.route("/api/user", methods=["GET"])
def get_user():
    if "credentials" not in session:
        return jsonify({"authenticated": False, "error": "Not authenticated"}), 401
    
    try:
        creds = google.oauth2.credentials.Credentials(**session["credentials"])
        service = googleapiclient.discovery.build("oauth2", "v2", credentials=creds)
        user_info = service.userinfo().get().execute()
        return jsonify({
            "authenticated": True,
            "email": user_info.get("email", ""),
            "name": user_info.get("name", ""),
            "picture": user_info.get("picture", "")
        })
    except Exception as e:
        session.clear()
        return jsonify({"authenticated": False, "error": str(e)}), 401

# =================== LOGOUT ===================
@app.route("/api/logout", methods=["POST"])
def logout():
    session.clear()
    return jsonify({"message": "Logged out"})


@app.route("/api/url_offline", methods=["POST"])
def url_offline():
    data = request.get_json(force=True)
    url = data.get("url", "")
    if not url:
        return jsonify({"error": "No url provided"}), 400

    result = classify_url(url)
    return jsonify(result)

# =================== HEALTH CHECK ===================
@app.route("/api/health", methods=["GET"])
def health_check():
    """Simple health check endpoint"""
    return jsonify({
        "status": "ok",
        "message": "Backend is running",
        "port": 5000
    })

# =================== DEBUG: OAuth Config ===================
@app.route("/api/oauth-config", methods=["GET"])
def oauth_config():
    """Debug endpoint to check OAuth configuration"""
    return jsonify({
        "redirect_uri": REDIRECT_URI,
        "client_secrets_file": CLIENT_SECRETS_FILE,
        "file_exists": os.path.exists(CLIENT_SECRETS_FILE),
        "message": f"Make sure this exact redirect URI is in Google Cloud Console: {REDIRECT_URI}"
    })

def check_and_install_requirements():
    """Quick check if required packages are installed, install if missing."""
    import subprocess
    import sys
    import os
    
    print("🔍 Checking requirements...")
    
    # Check if requirements file exists
    req_file = os.path.join(os.path.dirname(__file__), "requirements.txt")
    if not os.path.exists(req_file):
        print("⚠️  requirements.txt not found. Skipping auto-install.")
        return True
    
    # Quick check - only test critical packages
    critical_packages = {
        'flask': 'Flask',
        'flask_cors': 'flask-cors',
    }
    
    missing_packages = []
    for module_name, package_name in critical_packages.items():
        try:
            __import__(module_name)
        except ImportError:
            missing_packages.append(package_name)
    
    if missing_packages:
        print(f"⚠️  Missing critical packages: {', '.join(missing_packages)}")
        print("📦 Installing requirements from requirements.txt...")
        print("   (This may take a few minutes on first run)")
        try:
            subprocess.check_call([sys.executable, "-m", "pip", "install", "-r", req_file])
            print("✅ Requirements installed successfully!")
            return True
        except subprocess.CalledProcessError:
            print("❌ Failed to install requirements. Please run manually:")
            print(f"   cd {os.path.dirname(__file__)}")
            print("   pip install -r requirements.txt")
            return False
    
    print("✅ All requirements satisfied")
    return True

if __name__ == "__main__":
    # Check and install requirements if needed
    if not check_and_install_requirements():
        print("❌ Please install requirements before running the server.")
        sys.exit(1)
    
    # Run on port 5000
    # Run on 0.0.0.0 if you want other devices in the network to reach it,
    # but for local dev the default is fine.
    print("🚀 Starting Spamurai backend server...")
    print("📍 Server running on http://127.0.0.1:5000")
    app.run(debug=True, port=5000)
