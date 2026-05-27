# pdf_export.py
import os
import re
from fpdf import FPDF
from datetime import datetime

REPORTS_DIR = "reports"
os.makedirs(REPORTS_DIR, exist_ok=True)

# Theme colors matching website (RGB values)
PRIMARY_COLOR = (102, 126, 234)  # #667eea
SECONDARY_COLOR = (118, 75, 162)  # #764ba2
ACCENT_COLOR = (240, 147, 251)  # #f093fb
SUCCESS_COLOR = (16, 185, 129)  # #10b981
DANGER_COLOR = (239, 68, 68)  # #ef4444
TEXT_COLOR = (30, 41, 59)  # #1e293b
TEXT_SECONDARY = (100, 116, 139)  # #64748b
BG_COLOR = (255, 255, 255)  # #ffffff
SURFACE_COLOR = (248, 250, 252)  # #f8fafc

def hex_to_rgb(hex_color):
    """Convert hex color to RGB tuple"""
    hex_color = hex_color.lstrip('#')
    return tuple(int(hex_color[i:i+2], 16) for i in (0, 2, 4))

def clean_text_for_pdf(text):
    """
    Remove or replace Unicode characters (emojis, special symbols) that 
    can't be encoded by standard PDF fonts.
    """
    if not text:
        return ""
    
    # Remove emojis and other non-ASCII characters that cause encoding issues
    # Keep basic ASCII and common Latin-1 characters
    # This regex keeps: letters, numbers, spaces, and common punctuation
    text = str(text)
    
    # Replace common emojis with text equivalents
    emoji_replacements = {
        '😯': '[surprised]',
        '⚠️': '[WARNING]',
        '✅': '[SAFE]',
        '❌': '[BLOCKED]',
        '🔒': '[LOCKED]',
        '📧': '[EMAIL]',
        '🔗': '[LINK]',
        '🚨': '[ALERT]',
        '💬': '[MESSAGE]',
        '📊': '[CHART]',
    }
    
    for emoji, replacement in emoji_replacements.items():
        text = text.replace(emoji, replacement)
    
    # Remove remaining emojis and non-printable Unicode characters
    # Keep ASCII printable characters (32-126) and common extended ASCII (128-255)
    # Also keep common Unicode punctuation and symbols
    cleaned = ""
    for char in text:
        code = ord(char)
        # Keep ASCII printable (32-126), extended ASCII (128-255), and common Unicode ranges
        if (32 <= code <= 126) or (128 <= code <= 255) or char in '€£¥':
            cleaned += char
        elif char.isspace():
            cleaned += ' '  # Replace with space
        else:
            cleaned += '?'  # Replace unsupported characters with ?
    
    return cleaned

def export_report_pdf(report_data, emails=None):
    """
    report_data: dict returned by generate_report
    emails: optional list of email objects for detailed report
    returns PDF bytes
    """
    pdf = FPDF()
    pdf.add_page()
    pdf.set_auto_page_break(auto=True, margin=20)
    
    # Set document properties
    pdf.set_title("Spamurai Email Analysis Report")
    pdf.set_author("Spamurai")
    pdf.set_subject("Email Security Analysis Report")
    
    # Header with gradient effect (simulated with colored background)
    pdf.set_fill_color(*PRIMARY_COLOR)
    pdf.rect(0, 0, 210, 40, 'F')
    
    # Title
    pdf.set_font("Arial", "B", 24)
    pdf.set_text_color(255, 255, 255)
    pdf.set_xy(0, 12)
    pdf.cell(210, 10, "Spamurai", ln=False, align="C")
    
    pdf.set_font("Arial", "", 14)
    pdf.set_xy(0, 22)
    pdf.cell(210, 10, "Email Security Analysis Report", ln=False, align="C")
    
    # Reset text color
    pdf.set_text_color(*TEXT_COLOR)
    pdf.set_y(50)
    
    # Report metadata
    pdf.set_font("Arial", "", 10)
    pdf.set_text_color(*TEXT_SECONDARY)
    generated_at = report_data.get('generated_at', datetime.now().isoformat())
    try:
        dt = datetime.fromisoformat(generated_at.replace('Z', '+00:00'))
        formatted_date = dt.strftime("%B %d, %Y at %I:%M %p")
    except:
        formatted_date = generated_at
    pdf.cell(0, 6, f"Generated: {formatted_date}", ln=True)
    pdf.ln(5)
    
    # Summary Section
    pdf.set_text_color(*TEXT_COLOR)
    pdf.set_font("Arial", "B", 16)
    pdf.set_fill_color(*SURFACE_COLOR)
    pdf.rect(10, pdf.get_y(), 190, 8, 'F')
    pdf.cell(0, 8, "Executive Summary", ln=True)
    pdf.ln(3)
    
    total_emails = report_data.get('total_emails', 0)
    spam_count = report_data.get('spam_count', 0)
    ham_count = report_data.get('ham_count', 0)
    phishing_count = report_data.get('phishing_count', 0)
    spam_percentage = report_data.get('spam_percentage', 0)
    ham_percentage = report_data.get('ham_percentage', 0)
    
    pdf.set_font("Arial", "", 11)
    pdf.cell(0, 7, f"Total Emails Analyzed: {total_emails}", ln=True)
    pdf.ln(2)
    
    # Statistics with colored boxes
    y_start = pdf.get_y()
    box_height = 25
    
    # Spam box
    pdf.set_fill_color(*DANGER_COLOR)
    pdf.rect(10, y_start, 90, box_height, 'F')
    pdf.set_text_color(255, 255, 255)
    pdf.set_font("Arial", "B", 14)
    pdf.set_xy(10, y_start + 3)
    pdf.cell(90, 7, "Spam Detected", ln=False, align="C")
    pdf.set_font("Arial", "B", 20)
    pdf.set_xy(10, y_start + 10)
    pdf.cell(90, 10, f"{spam_count}", ln=False, align="C")
    pdf.set_font("Arial", "", 10)
    pdf.set_xy(10, y_start + 18)
    pdf.cell(90, 6, f"{spam_percentage}% of total", ln=False, align="C")
    
    # Safe box
    pdf.set_fill_color(*SUCCESS_COLOR)
    pdf.rect(110, y_start, 90, box_height, 'F')
    pdf.set_xy(110, y_start + 3)
    pdf.set_font("Arial", "B", 14)
    pdf.cell(90, 7, "Safe Emails", ln=False, align="C")
    pdf.set_font("Arial", "B", 20)
    pdf.set_xy(110, y_start + 10)
    pdf.cell(90, 10, f"{ham_count}", ln=False, align="C")
    pdf.set_font("Arial", "", 10)
    pdf.set_xy(110, y_start + 18)
    pdf.cell(90, 6, f"{ham_percentage}% of total", ln=False, align="C")
    
    pdf.set_y(y_start + box_height + 5)
    pdf.set_text_color(*TEXT_COLOR)
    pdf.ln(3)
    
    # Phishing section
    pdf.set_font("Arial", "B", 12)
    pdf.set_fill_color(*SURFACE_COLOR)
    pdf.rect(10, pdf.get_y(), 190, 7, 'F')
    pdf.cell(0, 7, f"Phishing Attempts Detected: {phishing_count}", ln=True)
    pdf.ln(5)
    
    # Top Keywords Section
    top_keywords = report_data.get("top_keywords", [])
    if top_keywords:
        pdf.set_font("Arial", "B", 16)
        pdf.set_fill_color(*SURFACE_COLOR)
        pdf.rect(10, pdf.get_y(), 190, 8, 'F')
        pdf.cell(0, 8, "Top Suspicious Keywords", ln=True)
        pdf.ln(3)
        
        pdf.set_font("Arial", "", 10)
        for idx, k in enumerate(top_keywords[:10], 1):
            keyword = clean_text_for_pdf(k.get('keyword', ''))
            count = k.get('count', 0)
            
            # Alternate row colors
            if idx % 2 == 0:
                pdf.set_fill_color(*SURFACE_COLOR)
                pdf.rect(10, pdf.get_y(), 190, 6, 'F')
            
            pdf.set_text_color(*TEXT_COLOR)
            pdf.cell(150, 6, f"{idx}. {keyword}", ln=False)
            pdf.set_text_color(*PRIMARY_COLOR)
            pdf.set_font("Arial", "B", 10)
            pdf.cell(40, 6, f"{count} occurrence(s)", ln=True, align="R")
            pdf.set_font("Arial", "", 10)
            pdf.ln(1)
    
    # Detailed Email Analysis (if emails provided)
    if emails and len(emails) > 0:
        pdf.ln(5)
        pdf.set_font("Arial", "B", 16)
        pdf.set_fill_color(*SURFACE_COLOR)
        pdf.rect(10, pdf.get_y(), 190, 8, 'F')
        pdf.cell(0, 8, "Email Analysis Details", ln=True)
        pdf.ln(3)
        
        # Show top 10 spam/phishing emails
        spam_emails = [e for e in emails if str(e.get("classification", "")).lower() == "spam"][:10]
        phishing_emails = [e for e in emails if e.get("phishing_indicators") and e["phishing_indicators"].get("keywords")][:10]
        
        if spam_emails:
            pdf.set_font("Arial", "B", 12)
            pdf.set_text_color(*DANGER_COLOR)
            pdf.cell(0, 7, "Recent Spam Emails", ln=True)
            pdf.ln(2)
            pdf.set_text_color(*TEXT_COLOR)
            pdf.set_font("Arial", "", 9)
            
            for idx, email in enumerate(spam_emails[:5], 1):
                if pdf.get_y() > 270:  # New page if needed
                    pdf.add_page()
                    pdf.set_y(20)
                
                subject = clean_text_for_pdf(email.get('subject', 'No Subject'))[:60]
                sender = clean_text_for_pdf(email.get('sender', 'Unknown'))[:40]
                date = clean_text_for_pdf(email.get('date', ''))[:30]
                prob = email.get('spam_probability', 0)
                # Ensure probability is capped at 100%
                prob = min(100.0, max(0.0, float(prob)))
                
                pdf.set_fill_color(*SURFACE_COLOR)
                pdf.rect(10, pdf.get_y(), 190, 15, 'F')
                
                pdf.set_font("Arial", "B", 9)
                pdf.set_text_color(*TEXT_COLOR)
                pdf.cell(0, 5, f"{idx}. {subject}", ln=True)
                
                pdf.set_font("Arial", "", 8)
                pdf.set_text_color(*TEXT_SECONDARY)
                pdf.cell(0, 4, f"From: {sender}", ln=True)
                pdf.cell(0, 4, f"Date: {date} | Spam Probability: {prob:.1f}%", ln=True)
                pdf.ln(2)
        
        if phishing_emails:
            if pdf.get_y() > 270:
                pdf.add_page()
                pdf.set_y(20)
            
            pdf.ln(3)
            pdf.set_font("Arial", "B", 12)
            pdf.set_text_color(*DANGER_COLOR)
            pdf.cell(0, 7, "Phishing Attempts", ln=True)
            pdf.ln(2)
            pdf.set_text_color(*TEXT_COLOR)
            pdf.set_font("Arial", "", 9)
            
            for idx, email in enumerate(phishing_emails[:5], 1):
                if pdf.get_y() > 270:
                    pdf.add_page()
                    pdf.set_y(20)
                
                subject = clean_text_for_pdf(email.get('subject', 'No Subject'))[:60]
                sender = clean_text_for_pdf(email.get('sender', 'Unknown'))[:40]
                keywords = [clean_text_for_pdf(k) for k in email.get('phishing_indicators', {}).get('keywords', [])[:3]]
                
                pdf.set_fill_color(*SURFACE_COLOR)
                pdf.rect(10, pdf.get_y(), 190, 18, 'F')
                
                pdf.set_font("Arial", "B", 9)
                pdf.set_text_color(*TEXT_COLOR)
                pdf.cell(0, 5, f"{idx}. {subject}", ln=True)
                
                pdf.set_font("Arial", "", 8)
                pdf.set_text_color(*TEXT_SECONDARY)
                pdf.cell(0, 4, f"From: {sender}", ln=True)
                if keywords:
                    keywords_text = ', '.join(keywords)
                    pdf.cell(0, 4, f"Keywords: {keywords_text}", ln=True)
                pdf.ln(2)
    
    # Footer
    pdf.set_auto_page_break(auto=False)
    pdf.set_y(-15)
    pdf.set_font("Arial", "I", 8)
    pdf.set_text_color(*TEXT_SECONDARY)
    pdf.cell(0, 5, "Generated by Spamurai - Email Security Analysis Tool", ln=True, align="C")
    pdf.cell(0, 5, f"Report ID: {datetime.now().strftime('%Y%m%d%H%M%S')}", ln=True, align="C")
    
    # Generate PDF bytes (output() returns bytearray)
    pdf_buffer = pdf.output()
    # Convert bytearray to bytes if needed
    if isinstance(pdf_buffer, bytearray):
        return bytes(pdf_buffer)
    return pdf_buffer
