import joblib
from utils.phishing import detect_phishing_indicators

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
        prediction = clf_pipeline.predict([text])[0]

        classification = "spam" if prediction == 1 else "ham"

        # convert probabilities to percentage
        spam_probability = round(float(pred_proba[1]) * 100, 1)
        ham_probability = round(float(pred_proba[0]) * 100, 1)

    except Exception as e:
        return {
            "classification": "error",
            "spam_probability": 0,
            "ham_probability": 0,
            "phishing_indicators": {},
            "warning_level": "low",
            "warning_message": f"Model predict error: {e}"
        }

    # Phishing detection
    phishing_info = detect_phishing_indicators(text)

    # Assign warning
    warning_level = "high" if classification == "spam" or phishing_info.get("is_phishing") else "low"
    warning_message = "Potential spam or phishing detected." if warning_level == "high" else "No major issues detected."

    return {
        "classification": classification,
        "spam_probability": spam_probability,
        "ham_probability": ham_probability,
        "phishing_indicators": phishing_info,
        "warning_level": warning_level,
        "warning_message": warning_message
    }
