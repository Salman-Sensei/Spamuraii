# url_guard.py
# Helper to load and use URLGuardPipeline for URL classification

import os
import re

import joblib
import pandas as pd
import tldextract


URL_MODEL_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), "models", "url_guard_pipeline.joblib")

# Lazy load URL model on first use
url_pipeline = None

def _load_url_model():
    """Lazy load the URL model on first use"""
    global url_pipeline
    if url_pipeline is None:
        try:
            print("📦 Loading URL guard model...")
            url_pipeline = joblib.load(URL_MODEL_PATH)
            print("✅ URL model loaded successfully")
        except FileNotFoundError:
            print(f"WARNING: Could not find URL model at {URL_MODEL_PATH}")
            url_pipeline = False  # Use False to indicate file not found
        except Exception as e:
            print(f"WARNING: Could not load URL model: {e}")
            url_pipeline = False

# Simple URL regex (not perfect but good enough for detection)
URL_REGEX = re.compile(r"https?://[^\s]+", re.IGNORECASE)

# Very small allow-list for ultra-common safe domains. This is a pragmatic
# UX guardrail to avoid scaring users for obviously benign roots such as
# google.com or github.com.
SAFE_DOMAINS = {"google", "github", "microsoft", "apple"}


def extract_urls(text: str):
    if not text:
        return []
    return URL_REGEX.findall(text)


def classify_url(url: str):
    """Classify a single URL using the loaded url_guard_pipeline.

    Returns a small JSON-serializable dict with the original URL and
    the predicted label. If the model is not available or prediction
    fails, an appropriate error and fallback label are returned.
    """
    _load_url_model()  # Load model on first use
    
    if not url_pipeline:
        return {
            "url": url,
            "label": "unknown",
            "error": "url model not loaded"
        }

    try:
        # The training script expects a DataFrame with a 'url' column
        df = pd.DataFrame({"url": [url]})

        # Base prediction and probability-based confidence
        try:
            proba = url_pipeline.predict_proba(df)[0]
            classes = url_pipeline.classes_
            best_idx = proba.argmax()
            label = classes[best_idx]
            confidence = float(proba[best_idx])
            
            # Debug logging with full details
            print(f"🔗 URL Analysis - URL: {url[:80]}...")
            print(f"   Label: {label} | Confidence: {confidence:.3f} | Is Benign: {label.lower() == 'benign'}")
        except Exception:
            # Fallback if predict_proba is not available for some reason
            label = url_pipeline.predict(df)[0]
            confidence = 1.0
            print(f"⚠️ URL Analysis - Using fallback prediction | Label: {label}")

        # More aggressive phishing detection:
        # - Any non-benign label is considered suspicious
        # - Lower confidence thresholds to catch more phishing URLs
        # - Even low confidence malicious labels should be flagged
        
        # Check if label indicates any type of threat
        malicious_labels = {"phishing", "malware", "malicious", "defacement", "spam"}
        label_lower = label.lower()
        is_malicious = label_lower in malicious_labels or label_lower != "benign"
        
        # Calculate risk level based on label and confidence
        if label.lower() == "benign":
            # Only truly benign URLs get low risk
            risk_level = "low"
        else:
            # Any non-benign label is suspicious - use very sensitive thresholds
            if confidence >= 0.3:  # Very low threshold - catch more phishing
                risk_level = "high"
            elif confidence >= 0.15:  # Even lower for medium risk
                risk_level = "medium"
            else:
                # Even low confidence malicious labels should be flagged
                risk_level = "medium"  # Changed from "low" to "medium"

        # Safe-domain override: REMOVED - phishing sites often mimic safe domains
        # We should trust the model's prediction, not override based on domain
        # This prevents false negatives where phishing sites use similar domains
        # Example: goog1e.com (with a 1 instead of l) should be flagged even if it looks safe

        result = {
            "url": url,
            "label": str(label),
            "confidence": confidence,
            "risk_level": risk_level,
            "is_malicious": is_malicious
        }
        
        # Final debug log
        print(f"   Final Risk: {risk_level} | Is Malicious: {is_malicious}")
        
        return result
    except Exception as e:
        return {
            "url": url,
            "label": "error",
            "error": str(e)
        }


def analyze_urls_in_text(text: str):
    urls = extract_urls(text)
    seen = set()
    results = []
    for u in urls:
        if u in seen:
            continue
        seen.add(u)
        results.append(classify_url(u))
    return results
