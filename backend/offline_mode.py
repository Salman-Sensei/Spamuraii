import joblib
from utils.phishing import detect_phishing_indicators
from utils.url_guard import analyze_urls_in_text

# Load trained pipeline once
try:
    clf_pipeline = joblib.load("models/spam_model.joblib")
except Exception as e:
    print(f"WARNING: Model load failed: {e}")
    clf_pipeline = None

def analyze_email_offline(text: str):
    if not clf_pipeline:
        return {
            "classification": "unknown",
            "spam_probability": 0,
            "ham_probability": 0,
            "phishing_indicators": {},
            "warning_level": "low",
            "warning_message": "Model not loaded"
        }

    try:
        pred_proba = clf_pipeline.predict_proba([text])[0]

        # convert probabilities to percentage
        spam_probability = round(float(pred_proba[1]) * 100, 1)
        ham_probability = round(float(pred_proba[0]) * 100, 1)

        # Conservative classification:
        # - Only call it spam if spam_probability is very high.
        # - Otherwise treat as ham (possibly with elevated warning level).
        if spam_probability >= 90.0:
            classification = "spam"
        else:
            classification = "ham"

    except Exception as e:
        return {
            "classification": "error",
            "spam_probability": 0,
            "ham_probability": 0,
            "phishing_indicators": {},
            "url_risks": [],
            "warning_level": "low",
            "warning_message": f"Model predict error: {e}"
        }

    phishing_info = detect_phishing_indicators(text)

    url_risks = analyze_urls_in_text(text)
    phishing_info["url_risks"] = url_risks

    # Look at URL risk levels from the URL model
    has_high_risk_url = any(r.get("risk_level") == "high" for r in url_risks)
    has_medium_risk_url = any(r.get("risk_level") == "medium" for r in url_risks)

    # Derive a more graded warning level
    # Priority order:
    # 1) Very high spam probability => high
    # 2) High-risk URL or strong phishing with non-trivial spam => high
    # 3) Medium spam / medium URL risk / phishing keywords => medium
    # 4) Otherwise => low

    is_phishing_flag = bool(phishing_info.get("is_phishing"))

    if spam_probability >= 90.0:
        # Model is very confident it's spam
        warning_level = "high"
        warning_message = "Potential spam or phishing detected. Proceed with extreme caution."
    elif has_high_risk_url or (is_phishing_flag and spam_probability >= 50.0):
        # High-risk URL is always serious, or phishing indicators + at least moderate spam probability
        warning_level = "high"
        warning_message = "Potential phishing risk detected. Proceed with extreme caution."
    elif spam_probability >= 70.0 or has_medium_risk_url or is_phishing_flag:
        # Suspicious, but not extreme
        warning_level = "medium"
        warning_message = "Some suspicious signals detected. Review carefully."
    else:
        # Ham-dominant with no strong phishing/URL risk
        warning_level = "low"
        warning_message = "Looks safe overall. No major issues detected."

    return {
        "classification": classification,
        "spam_probability": spam_probability,
        "ham_probability": ham_probability,
        "phishing_indicators": phishing_info,
        "url_risks": url_risks,
        "warning_level": warning_level,
        "warning_message": warning_message
    }
