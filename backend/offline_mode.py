import joblib
import numpy as np
from utils.phishing import detect_phishing_indicators
from utils.url_guard import analyze_urls_in_text
from utils.whitelist import is_whitelisted_email

# Load trained pipeline once (lazy loading - happens on first import)
clf_pipeline = None

def _load_model():
    """Lazy load the model on first use"""
    global clf_pipeline
    if clf_pipeline is None:
        try:
            print("📦 Loading spam detection model...")
            clf_pipeline = joblib.load("models/spam_model.joblib")
            print("✅ Model loaded successfully")
        except FileNotFoundError:
            print(f"WARNING: models/spam_model.joblib not found")
            clf_pipeline = False  # Use False to indicate file not found
        except Exception as e:
            print(f"WARNING: Model load failed: {e}")
            clf_pipeline = False

def analyze_email_offline(text: str, sender: str = None):
    """
    Analyze email for spam/phishing.
    
    Args:
        text: Email body text
        sender: Sender email address (optional, for whitelist checking)
    """
    _load_model()  # Load model on first use
    if not clf_pipeline:
        return {
            "classification": "unknown",
            "spam_probability": 0,
            "ham_probability": 0,
            "phishing_indicators": {},
            "warning_level": "low",
            "warning_message": "Model not loaded"
        }

    # Check whitelist first
    is_whitelisted = False
    sender_domain = None
    if sender:
        is_whitelisted, sender_domain = is_whitelisted_email(sender)
        if is_whitelisted:
            # Whitelisted domain - force ham classification
            print(f"✅ Whitelisted domain detected: {sender_domain} from sender: {sender}")
            return {
                "classification": "ham",
                "spam_probability": 0.0,
                "ham_probability": 100.0,
                "phishing_indicators": {},
                "url_risks": [],
                "warning_level": "low",
                "warning_message": f"Email from trusted domain: {sender_domain}",
                "whitelisted": True,
                "sender_domain": sender_domain
            }
        else:
            print(f"⚠️ Domain not whitelisted: {sender_domain} from sender: {sender}")

    try:
        pred_proba = clf_pipeline.predict_proba([text])[0]
        
        # Get class order from the model to ensure correct mapping
        # The model might have classes in different order (e.g., ['ham', 'spam'] or ['spam', 'ham'])
        if hasattr(clf_pipeline, 'classes_'):
            classes = clf_pipeline.classes_
            print(f"🔍 Model classes order: {classes}")
        else:
            # Try to get classes from the final estimator in the pipeline
            if hasattr(clf_pipeline, 'named_steps'):
                final_estimator = clf_pipeline.named_steps.get(list(clf_pipeline.named_steps.keys())[-1])
                if hasattr(final_estimator, 'classes_'):
                    classes = final_estimator.classes_
                    print(f"🔍 Model classes order (from final estimator): {classes}")
                else:
                    classes = ['ham', 'spam']  # Default assumption
                    print(f"⚠️ Could not determine class order, assuming: {classes}")
            else:
                classes = ['ham', 'spam']  # Default assumption
                print(f"⚠️ Could not determine class order, assuming: {classes}")
        
        # Map probabilities to correct classes
        ham_idx = None
        spam_idx = None
        
        if len(classes) == 2:
            # Handle both string and numeric classes
            # Try to find ham/spam by string matching first
            for i, cls in enumerate(classes):
                cls_str = str(cls).lower()
                if cls_str == 'ham' or cls_str == '0':
                    ham_idx = i
                elif cls_str == 'spam' or cls_str == '1':
                    spam_idx = i
            
            # If numeric classes [0, 1], assume 0=ham, 1=spam (standard convention)
            if ham_idx is None or spam_idx is None:
                if all(isinstance(c, (int, float, np.integer, np.floating)) for c in classes):
                    print(f"🔍 Numeric classes detected: {classes}, assuming 0=ham, 1=spam")
                    ham_idx = 0
                    spam_idx = 1
                else:
                    # Fallback: assume first is ham, second is spam
                    print(f"⚠️ Could not find ham/spam in classes {classes}, using default order")
                    ham_idx = 0
                    spam_idx = 1
            
            ham_raw = float(pred_proba[ham_idx])
            spam_raw = float(pred_proba[spam_idx])
        else:
            # Fallback to default order if unexpected number of classes
            print(f"⚠️ Unexpected number of classes ({len(classes)}), using default order")
            ham_idx = 0
            spam_idx = 1 if len(pred_proba) > 1 else 0
            ham_raw = float(pred_proba[0])
            spam_raw = float(pred_proba[1]) if len(pred_proba) > 1 else 0.0
        
        # Debug: Print raw probabilities to understand the model output
        print(f"🔍 Raw model output - pred_proba shape: {pred_proba.shape}, values: {pred_proba}")
        print(f"🔍 Using indices - ham_idx: {ham_idx}, spam_idx: {spam_idx}")
        print(f"🔍 Raw float values BEFORE processing - spam_raw: {spam_raw}, ham_raw: {ham_raw}")
        
        # Handle edge cases: if values are already in percentage form (> 1.0), divide by 100
        if spam_raw > 1.0:
            print(f"⚠️ Warning: spam_raw > 1.0 ({spam_raw}), dividing by 100")
            spam_raw = spam_raw / 100.0
        if ham_raw > 1.0:
            print(f"⚠️ Warning: ham_raw > 1.0 ({ham_raw}), dividing by 100")
            ham_raw = ham_raw / 100.0
        
        # Ensure values are in valid range [0, 1]
        spam_raw = max(0.0, min(1.0, spam_raw))
        ham_raw = max(0.0, min(1.0, ham_raw))
        
        # Normalize probabilities to sum to 1.0 (in case they don't already)
        total = spam_raw + ham_raw
        if total > 0:
            spam_raw = spam_raw / total
            ham_raw = ham_raw / total
        else:
            # Fallback if both are 0
            spam_raw = 0.5
            ham_raw = 0.5
        
        # Convert to percentage with more precision (2 decimal places)
        spam_probability = round(spam_raw * 100, 2)
        ham_probability = round(ham_raw * 100, 2)
        
        # Final safety check: cap at 100% and ensure they sum to 100%
        spam_probability = min(100.0, max(0.0, spam_probability))
        ham_probability = min(100.0, max(0.0, ham_probability))
        
        # Ensure they sum to 100% (normalize if needed)
        total_prob = spam_probability + ham_probability
        if total_prob > 0:
            spam_probability = round((spam_probability / total_prob) * 100, 2)
            ham_probability = round((ham_probability / total_prob) * 100, 2)
        else:
            spam_probability = 50.0
            ham_probability = 50.0
        
        # Debug logging with full details
        print(f"📊 Email Analysis - Spam: {spam_probability}%, Ham: {ham_probability}%")
        print(f"📊 After conversion - spam_raw: {spam_raw:.6f}, ham_raw: {ham_raw:.6f}")
        print(f"📊 Final percentages - spam: {spam_probability}%, ham: {ham_probability}%")

        # Improved classification logic:
        # - Use a more balanced threshold (60%) to catch more spam
        # - Consider phishing indicators and URL risks in classification
        # - If spam probability is above threshold OR has strong phishing/URL indicators, classify as spam
        if spam_probability >= 60.0:
            classification = "spam"
        elif spam_probability >= 40.0:
            # Medium probability - check for additional indicators
            classification = "ham"  # Will be re-evaluated after phishing/URL analysis
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
    # More aggressive: any non-benign, non-unknown, non-error label is considered malicious
    has_malicious_url = any(
        r.get("label") and 
        r.get("label").lower() != "benign" and 
        r.get("label").lower() != "unknown" and 
        r.get("label").lower() != "error" 
        for r in url_risks
    )
    # Also check if any URL has medium or high risk level (even if label is benign but confidence is low)
    has_suspicious_url = has_high_risk_url or has_medium_risk_url

    # Derive a more graded warning level and re-evaluate classification
    # Priority order:
    # 1) Very high spam probability => spam + high
    # 2) High-risk URL or malicious URL => spam + high (URLs are strong indicators)
    # 3) Strong phishing indicators + moderate spam => spam + high
    # 4) Medium spam probability => spam + medium
    # 5) Medium URL risk or phishing keywords => ham + medium warning
    # 6) Otherwise => ham + low

    is_phishing_flag = bool(phishing_info.get("is_phishing"))
    phishing_keywords_count = len(phishing_info.get("keywords", []))

    # Re-evaluate classification based on URL and phishing indicators
    # If URL is malicious or suspicious, override to spam
    if has_malicious_url or has_high_risk_url:
        classification = "spam"
        warning_level = "high"
        warning_message = "⚠️ MALICIOUS URL DETECTED! This email contains dangerous links. Do NOT click any links."
    elif has_suspicious_url:
        # Medium risk URLs should also trigger spam classification
        classification = "spam"
        warning_level = "high"
        warning_message = "⚠️ SUSPICIOUS URL DETECTED! This email contains potentially dangerous links. Exercise extreme caution."
    elif is_phishing_flag and (spam_probability >= 40.0 or phishing_keywords_count >= 3):
        # Strong phishing indicators override classification
        classification = "spam"
        warning_level = "high"
        warning_message = "⚠️ PHISHING ATTEMPT DETECTED! Multiple phishing indicators found. Do not provide any personal information."
    elif spam_probability >= 60.0:
        # Model is confident it's spam
        classification = "spam"
        warning_level = "high"
        warning_message = "⚠️ SPAM DETECTED! This email is likely spam. Proceed with extreme caution."
    elif spam_probability >= 50.0:
        # Moderate spam probability
        classification = "spam"
        warning_level = "medium"
        warning_message = "⚠️ Potential spam detected. Review carefully before taking any action."
    elif spam_probability >= 40.0 or has_medium_risk_url or (is_phishing_flag and phishing_keywords_count >= 2):
        # Suspicious but not definitive
        classification = "ham"  # Keep as ham but raise warning
        warning_level = "medium"
        warning_message = "⚠️ Some suspicious signals detected. Review carefully before clicking links or providing information."
    else:
        # Ham-dominant with no strong phishing/URL risk
        classification = "ham"
        warning_level = "low"
        warning_message = "✅ Looks safe overall. No major issues detected."

    result = {
        "classification": classification,
        "spam_probability": spam_probability,
        "ham_probability": ham_probability,
        "phishing_indicators": phishing_info,
        "url_risks": url_risks,
        "warning_level": warning_level,
        "warning_message": warning_message
    }
    
    # Add whitelist info if sender was provided
    if sender:
        result["sender_domain"] = sender_domain
        result["whitelisted"] = is_whitelisted
    
    return result
