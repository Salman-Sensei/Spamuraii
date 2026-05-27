# report_utils.py
from collections import Counter
from datetime import datetime

def generate_report(emails):
    """
    emails: list of email dicts (as returned by /api/emails)
    returns: dict with stats and top keywords
    """
    total_emails = len(emails)
    spam_count = sum(1 for e in emails if str(e.get("classification", "")).lower() == "spam")
    ham_count = sum(1 for e in emails if str(e.get("classification", "")).lower() == "ham")
    phishing_count = sum(1 for e in emails if e.get("phishing_indicators") and e["phishing_indicators"].get("keywords"))

    # Collect all suspicious keywords
    keywords = []
    for e in emails:
        pi = e.get("phishing_indicators") or {}
        keywords.extend(pi.get("keywords", []))

    top_keywords = [{"keyword": k, "count": v} for k, v in Counter(keywords).most_common(10)]

    report = {
        "total_emails": total_emails,
        "spam_count": spam_count,
        "ham_count": ham_count,
        "phishing_count": phishing_count,
        "spam_percentage": round((spam_count / total_emails) * 100, 2) if total_emails else 0,
        "ham_percentage": round((ham_count / total_emails) * 100, 2) if total_emails else 0,
        "top_keywords": top_keywords,
        "generated_at": datetime.now().isoformat()
    }

    return report
