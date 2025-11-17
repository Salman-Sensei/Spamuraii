# pdf_export.py
import os
from fpdf import FPDF
from datetime import datetime

REPORTS_DIR = "reports"
os.makedirs(REPORTS_DIR, exist_ok=True)

def export_report_pdf(report_data):
    """
    report_data: dict returned by generate_report
    returns filename (relative) saved into reports/
    """
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"report_{timestamp}.pdf"
    filepath = os.path.join(REPORTS_DIR, filename)

    pdf = FPDF()
    pdf.add_page()
    pdf.set_auto_page_break(auto=True, margin=15)

    pdf.set_font("Arial", "B", 16)
    pdf.cell(0, 10, "Spamurai - Email Analysis Report", ln=True, align="C")
    pdf.ln(5)

    pdf.set_font("Arial", "", 12)
    pdf.cell(0, 8, f"Generated: {report_data.get('generated_at', datetime.now().isoformat())}", ln=True)
    pdf.ln(5)

    pdf.set_font("Arial", "B", 12)
    pdf.cell(0, 8, "Summary", ln=True)
    pdf.set_font("Arial", "", 12)
    pdf.cell(0, 8, f"Total Emails: {report_data.get('total_emails', 0)}", ln=True)
    pdf.cell(0, 8, f"Spam: {report_data.get('spam_count', 0)} ({report_data.get('spam_percentage', 0)}%)", ln=True)
    pdf.cell(0, 8, f"Safe: {report_data.get('ham_count', 0)} ({report_data.get('ham_percentage', 0)}%)", ln=True)
    pdf.cell(0, 8, f"Phishing Attempts: {report_data.get('phishing_count', 0)}", ln=True)
    pdf.ln(8)

    top_keywords = report_data.get("top_keywords", [])
    if top_keywords:
        pdf.set_font("Arial", "B", 12)
        pdf.cell(0, 8, "Top Suspicious Keywords", ln=True)
        pdf.set_font("Arial", "", 12)
        for k in top_keywords:
            pdf.cell(0, 8, f"{k['keyword']} - {k['count']} times", ln=True)

    pdf.output(filepath)
    return filepath
