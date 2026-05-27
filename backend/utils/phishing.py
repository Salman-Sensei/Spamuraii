# phishing.py
import re

def detect_phishing_indicators(text):
    text_lower = text.lower()

    # Trimmed phishing keywords (removed words our model already handles)
    keywords = [
        "verify", "update your account", "password",
        "bank", "click here", "login now", "security alert",
        "suspended", "verify identity", "payment failed", "account locked",
        # Extra phrases not in spam model
        "additional income", "be your own boss", "best price", "cash bonus",
        "consolidate debt", "financial freedom", "free consultation",
        "full refund", "get out of debt", "get paid", "giveaway", 
        "guaranteed", "increase sales", "increase traffic", "incredible deal",
        "lower rates", "lowest price", "make money", "miracle", "once in a lifetime",
        "potential earnings", "prize", "promise", "pure profit", "risk-free",
        "satisfaction guaranteed", "save big money", "save up to", "special promotion",
        "urgent", "winner", "you are a winner", "you have been selected"
    ]

    # Use set for faster check
    keywords_set = set(k.lower() for k in keywords)
    found = [kw for kw in keywords_set if kw in text_lower]

    # More sensitive phishing detection:
    # - If 1+ high-risk keywords OR 2+ any keywords → phishing
    high_risk_keywords = {
        "verify", "update your account", "password", "bank", "click here", 
        "login now", "security alert", "suspended", "verify identity", 
        "payment failed", "account locked", "urgent"
    }
    high_risk_found = [kw for kw in found if kw in high_risk_keywords]
    
    # More sensitive: 1 high-risk keyword OR 2+ any keywords
    is_phishing = len(high_risk_found) >= 1 or len(found) >= 2

    return {
        "is_phishing": is_phishing,
        "keywords": found,
        "high_risk_keywords": high_risk_found
    }
