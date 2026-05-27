# whitelist.py
# Whitelist of trusted popular domains that should not be marked as spam

import re
from email.utils import parseaddr

# Comprehensive list of popular trusted domains
TRUSTED_DOMAINS = {
    # Social Media & Communication
    "facebook.com", "fb.com", "messenger.com", "meta.com",
    "twitter.com", "x.com", "t.co",
    "instagram.com",
    "linkedin.com",
    "snapchat.com",
    "tiktok.com",
    "pinterest.com",
    "reddit.com",
    "discord.com", "discordapp.com",
    "telegram.org",
    "whatsapp.com",
    "signal.org",
    "wechat.com",
    "line.me",
    "viber.com",
    "skype.com",
    "teams.microsoft.com",
    
    # Google Services
    "google.com", "gmail.com", "googlemail.com",
    "youtube.com", "youtu.be",
    "googleusercontent.com",
    "googlegroups.com",
    "googleplay.com",
    "android.com",
    "chrome.com", "chromium.org",
    "googleapis.com",
    "google-analytics.com",
    "googletagmanager.com",
    "googleadservices.com",
    "doubleclick.net",
    "gstatic.com",
    "googlesyndication.com",
    
    # Microsoft
    "microsoft.com", "outlook.com", "hotmail.com", "live.com",
    "msn.com", "office.com", "office365.com",
    "azure.com", "onedrive.com", "sharepoint.com",
    "xbox.com", "xboxlive.com",
    "bing.com",
    "microsoftonline.com",
    
    # Apple
    "apple.com", "icloud.com", "me.com", "mac.com",
    "appstore.com", "itunes.com",
    "appleid.apple.com",
    
    # Amazon
    "amazon.com", "amazon.co.uk", "amazon.de", "amazon.fr",
    "amazon.in", "amazon.ca", "amazon.com.au", "amazon.co.jp",
    "aws.amazon.com", "amazonaws.com",
    "kindle.com",
    "audible.com",
    "imdb.com",
    "primevideo.com",
    
    # Entertainment & Streaming
    "netflix.com",
    "spotify.com",
    "hulu.com",
    "disney.com", "disneyplus.com",
    "hbo.com", "hbomax.com", "max.com",
    "paramount.com",
    "peacocktv.com",
    "twitch.tv",
    "youtube.com",
    "vimeo.com",
    "dailymotion.com",
    "soundcloud.com",
    "bandcamp.com",
    
    # E-commerce & Shopping
    "ebay.com",
    "etsy.com",
    "shopify.com",
    "paypal.com",
    "stripe.com",
    "alibaba.com",
    "aliexpress.com",
    "walmart.com",
    "target.com",
    "bestbuy.com",
    "costco.com",
    "homedepot.com",
    "lowes.com",
    "zappos.com",
    "asos.com",
    "zalando.com",
    "wayfair.com",
    "overstock.com",
    "groupon.com",
    
    # Banking & Finance
    "chase.com", "bankofamerica.com", "wellsfargo.com",
    "citi.com", "usbank.com", "capitalone.com",
    "americanexpress.com", "amex.com",
    "visa.com", "mastercard.com",
    "square.com",
    "venmo.com",
    "cashapp.com",
    "coinbase.com",
    "binance.com",
    "robinhood.com",
    "fidelity.com",
    "schwab.com",
    "etrade.com",
    
    # Tech Companies & Development
    "github.com", "gitlab.com", "bitbucket.org",
    "stackoverflow.com", "stackexchange.com",
    "dropbox.com", "box.com",
    "slack.com", "zoom.us", "zoom.com",
    "salesforce.com", "oracle.com", "ibm.com",
    "codepen.io", "codecademy.com", "codecademy.co",
    "cursor.com", "mail.cursor.com", "render.com",
    "bandlab.com", "openai.com", "mongodb.com",
    "vercel.com", "info.vercel.com",
    "notion.so", "notion.com",
    "atlassian.com", "jira.com", "confluence.com",
    "trello.com",
    "asana.com",
    "basecamp.com",
    "linear.app",
    "figma.com",
    "canva.com",
    "adobe.com", "autodesk.com",
    "docker.com",
    "kubernetes.io",
    "terraform.io",
    "hashicorp.com",
    
    # Cloud Services
    "aws.amazon.com", "amazonaws.com",
    "azure.com",
    "cloud.google.com",
    "digitalocean.com",
    "heroku.com",
    "netlify.com",
    "cloudflare.com",
    "fastly.com",
    "akamai.com",
    
    # News & Media
    "cnn.com", "bbc.com", "nytimes.com", "washingtonpost.com",
    "reuters.com", "bloomberg.com", "wsj.com",
    "theguardian.com", "forbes.com",
    "techcrunch.com",
    "theverge.com",
    "wired.com",
    "medium.com",
    "substack.com",
    
    # Education & Learning
    "edu",  # All .edu domains
    "coursera.org", "udemy.com", "khanacademy.org",
    "edx.org", "udacity.com",
    "pluralsight.com",
    "linkedin.com",  # LinkedIn Learning
    "skillshare.com",
    "masterclass.com",
    
    # Government
    "gov",  # All .gov domains
    "usa.gov",
    
    # Travel & Transportation
    "airbnb.com", "uber.com", "lyft.com",
    "doordash.com", "grubhub.com", "ubereats.com",
    "expedia.com", "booking.com", "tripadvisor.com",
    "kayak.com",
    "priceline.com",
    "hotels.com",
    "marriott.com",
    "hilton.com",
    "delta.com",
    "united.com",
    "americanairlines.com",
    "southwest.com",
    
    # Food Delivery & Restaurants
    "doordash.com", "grubhub.com", "ubereats.com",
    "postmates.com",
    "starbucks.com", "mcdonalds.com",
    "dominos.com", "pizzahut.com",
    "subway.com",
    "chipotle.com",
    
    # Hardware & Electronics
    "nvidia.com", "intel.com", "amd.com",
    "samsung.com", "sony.com", "lg.com",
    "hp.com", "dell.com", "lenovo.com",
    "asus.com", "acer.com",
    "logitech.com",
    "razer.com",
    
    # Fashion & Retail
    "nike.com", "adidas.com",
    "zara.com",
    "h&m.com", "hm.com",
    "uniqlo.com",
    "gap.com",
    "oldnavy.com",
    
    # Health & Fitness
    "fitbit.com",
    "myfitnesspal.com",
    "strava.com",
    "calm.com",
    "headspace.com",
    
    # Productivity & Tools
    "notion.so", "notion.com",
    "evernote.com",
    "onenote.com",
    "todoist.com",
    "ticktick.com",
    "habitica.com",
    
    # Email Providers
    "protonmail.com", "proton.me",
    "zoho.com",
    "yandex.com",
    "mail.com",
    "gmx.com",
    "tutanota.com",
    "fastmail.com",
    "hey.com",
    "mailbox.org",
    "posteo.de",
    
    # Other Popular Services
    "reddit.com",
    "quora.com",
    "medium.com",
    "wordpress.com",
    "tumblr.com",
    "blogger.com",
    "wix.com",
    "squarespace.com",
    "shopify.com",
}

def extract_domain_from_email(email_string):
    """Extract domain from email address string.
    
    Args:
        email_string: Email string like "John Doe <john@example.com>" or "john@example.com"
    
    Returns:
        Domain string like "example.com" or None if not found
    """
    if not email_string:
        return None
    
    try:
        # Parse email address
        name, email = parseaddr(email_string)
        if not email:
            # If parseaddr didn't work, try direct extraction
            email_match = re.search(r'[\w\.-]+@([\w\.-]+\.\w+)', email_string)
            if email_match:
                return email_match.group(1).lower()
            return None
        
        # Extract domain from email
        if '@' in email:
            domain = email.split('@')[1].lower().strip()
            return domain
    except Exception:
        # Fallback: try regex extraction
        email_match = re.search(r'[\w\.-]+@([\w\.-]+\.\w+)', email_string)
        if email_match:
            return email_match.group(1).lower()
    
    return None

def is_whitelisted_domain(domain):
    """Check if a domain is in the whitelist.
    
    Args:
        domain: Domain string like "example.com"
    
    Returns:
        True if domain is whitelisted, False otherwise
    """
    if not domain:
        return False
    
    domain_lower = domain.lower().strip()
    
    # Direct match
    if domain_lower in TRUSTED_DOMAINS:
        return True
    
    # Check for .edu and .gov TLDs
    if domain_lower.endswith('.edu') and 'edu' in TRUSTED_DOMAINS:
        return True
    if domain_lower.endswith('.gov') and 'gov' in TRUSTED_DOMAINS:
        return True
    
    # Check parent domains (e.g., mail.google.com -> google.com)
    parts = domain_lower.split('.')
    if len(parts) >= 2:
        parent_domain = '.'.join(parts[-2:])  # Get last two parts
        if parent_domain in TRUSTED_DOMAINS:
            return True
    
    return False

def is_whitelisted_email(email_string):
    """Check if an email address is from a whitelisted domain.
    
    Args:
        email_string: Email string like "John Doe <john@example.com>"
    
    Returns:
        Tuple of (is_whitelisted: bool, domain: str or None)
    """
    domain = extract_domain_from_email(email_string)
    if not domain:
        return False, None
    
    is_whitelisted = is_whitelisted_domain(domain)
    return is_whitelisted, domain

