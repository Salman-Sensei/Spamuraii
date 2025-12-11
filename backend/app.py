# app.py
# Allow OAuth to work with HTTP in development - MUST be at top
import os
os.environ['OAUTHLIB_INSECURE_TRANSPORT'] = '1'
os.environ['OAUTHLIB_RELAX_TOKEN_SCOPE'] = '1'

from flask import Flask, request, jsonify, session, redirect
from flask_cors import CORS
import joblib
import base64
from datetime import datetime

import google_auth_oauthlib.flow
import google.oauth2.credentials
import googleapiclient.discovery

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

# Load model file presence check (model itself is used inside offline_mode, but keep a sanity check)
try:
    # do not rely on this model object here for predictions; offline_mode will load its own copy.
    _ = joblib.load("models/spam_model.joblib")
except FileNotFoundError:
    print("WARNING: models/spam_model.joblib not found. Make sure model is present in models/ directory.")
except Exception as e:
    print(f"WARNING: could not load spam_model.joblib during startup: {e}")

# =================== GOOGLE OAUTH ===================
@app.route("/auth/google")
def google_auth():
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

    return jsonify({"auth_url": auth_url})

@app.route("/oauth2callback")
def oauth2callback():
    returned_state = request.args.get("state")
    if not returned_state:
        return jsonify({"error": "No state parameter"}), 400

    if returned_state not in oauth_states:
        return jsonify({"error": "State not found"}), 400

    flow = oauth_states[returned_state]["flow"]
    try:
        flow.fetch_token(authorization_response=request.url)
    except Exception as e:
        return jsonify({"error": f"Failed to fetch token: {str(e)}"}), 400

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

    # redirect back to frontend (your frontend runs on 3001)
    return redirect("http://localhost:3000")

# =================== EMAIL FETCH & ANALYSIS ===================
@app.route("/api/emails", methods=["GET"])
def get_emails():
    if "credentials" not in session:
        return jsonify({"error": "Not authenticated"}), 401

    # Optional limit parameter for how many emails to fetch
    try:
        limit = int(request.args.get("limit", 10))
    except (TypeError, ValueError):
        limit = 10
    # keep limit within a reasonable safe range
    limit = max(1, min(limit, 100))

    creds = google.oauth2.credentials.Credentials(**session["credentials"])
    try:
        service = googleapiclient.discovery.build("gmail", "v1", credentials=creds)
        messages_resp = service.users().messages().list(userId="me", maxResults=limit).execute()
        messages = messages_resp.get("messages", []) or []
    except Exception as e:
        return jsonify({"error": f"Failed to fetch emails: {str(e)}"}), 500

    emails_data = []
    for m in messages:
        try:
            msg = service.users().messages().get(userId="me", id=m["id"], format="full").execute()
            headers = msg.get("payload", {}).get("headers", []) or []
            subject = next((h["value"] for h in headers if h.get("name") == "Subject"), "")
            sender = next((h["value"] for h in headers if h.get("name") == "From"), "")
            date = next((h["value"] for h in headers if h.get("name") == "Date"), "")

            body = ""
            payload = msg.get("payload", {})
            # parts may contain multi-part payload
            parts = payload.get("parts", []) or []
            if parts:
                for part in parts:
                    if part.get("mimeType") == "text/plain" and part.get("body", {}).get("data"):
                        body = base64.urlsafe_b64decode(part["body"]["data"]).decode("utf-8", errors="replace")
                        break
            # fallback to top-level body
            if not body and payload.get("body", {}).get("data"):
                body = base64.urlsafe_b64decode(payload["body"]["data"]).decode("utf-8", errors="replace")

            # Offline analysis using local model & vectorizer
            analysis = analyze_email_offline(body)

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
    if not message:
        return jsonify({"error": "No message provided"}), 400

    analysis = analyze_email_offline(message)
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
    filename = export_report_pdf(report_data)
    return jsonify({"filename": filename})

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

if __name__ == "__main__":
    # Run on 0.0.0.0 if you want other devices in the network to reach it,
    # but for local dev the default is fine.
    app.run(debug=True)
