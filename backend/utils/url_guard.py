# url_guard.py
# Helper to load and use URLGuardPipeline for URL classification

import os
import re

import joblib
import pandas as pd
import tldextract


URL_MODEL_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), "models", "url_guard_pipeline.joblib")

try:
    url_pipeline = joblib.load(URL_MODEL_PATH)
except Exception as e:
    print(f"WARNING: Could not load URL model at {URL_MODEL_PATH}: {e}")
    url_pipeline = None

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
        except Exception:
            # Fallback if predict_proba is not available for some reason
            label = url_pipeline.predict(df)[0]
            confidence = 1.0

        # Derive a simple risk level from label + confidence
        if label == "benign":
            risk_level = "low"
        else:
            if confidence >= 0.8:
                risk_level = "high"
            elif confidence >= 0.6:
                risk_level = "medium"
            else:
                risk_level = "low"

        # Safe-domain override: if the URL clearly belongs to a very common
        # trusted domain, and the model is not highly confident, downgrade
        # the risk to benign/low to avoid noisy false positives.
        try:
            ext = tldextract.extract(url)
            base_domain = ext.domain
            suffix = ext.suffix
        except Exception:
            base_domain = ""
            suffix = ""

        if base_domain in SAFE_DOMAINS and suffix in {"com", "net", "org"}:
            if label != "benign" and confidence < 0.9:
                label = "benign"
                risk_level = "low"

        return {
            "url": url,
            "label": str(label),
            "confidence": confidence,
            "risk_level": risk_level
        }
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
