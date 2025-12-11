import React, { useState, useEffect, useRef } from "react";
import {
  googleLogin,
  fetchEmails,
  analyzeOffline,
  generateReport,
  exportPDF,
  logout,
  analyzeUrl
} from "./api";
import "./App.css";

function App() {
  const [manualText, setManualText] = useState("");
  const [analysis, setAnalysis] = useState(null);
  const [urlInput, setUrlInput] = useState("");
  const [urlResult, setUrlResult] = useState(null);
  const [urlError, setUrlError] = useState("");
  const [isUrlValid, setIsUrlValid] = useState(false);
  const [emails, setEmails] = useState([]);
  const [emailCount, setEmailCount] = useState(10);
  const [report, setReport] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isUrlAnalyzing, setIsUrlAnalyzing] = useState(false);
  const [typingTimeout, setTypingTimeout] = useState(null);

  const emailAnalyzerRef = useRef(null);
  const urlScannerRef = useRef(null);
  const aboutRef = useRef(null);

  // Real-time analysis with debounce
  useEffect(() => {
    if (typingTimeout) clearTimeout(typingTimeout);
    
    if (manualText.trim().length > 10) {
      setIsAnalyzing(true);
      setTypingTimeout(setTimeout(() => {
        handleManualAnalyze();
      }, 1000));
    }
    
    return () => clearTimeout(typingTimeout);
  }, [manualText]);

  const handleManualAnalyze = async () => {
    if (!manualText.trim()) {
      setAnalysis(null);
      return;
    }

    try {
      const data = await analyzeOffline(manualText);
      setAnalysis(data);
    } catch (error) {
      console.error('Analysis error:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const scrollToSection = (ref) => {
    if (ref?.current) {
      ref.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const validateUrl = (value) => {
    const trimmed = value.trim();
    if (!trimmed) {
      setIsUrlValid(false);
      setUrlError("");
      return;
    }
    try {
      // URL constructor throws if invalid
      // Ensure protocol to avoid treating plain text as valid
      const candidate = trimmed.match(/^https?:\/\//i) ? trimmed : `http://${trimmed}`;
      // eslint-disable-next-line no-new
      new URL(candidate);
      setIsUrlValid(true);
      setUrlError("");
    } catch {
      setIsUrlValid(false);
      setUrlError("Please enter a valid URL (e.g., https://example.com)");
    }
  };

  const handleUrlAnalyze = async () => {
    if (!urlInput.trim()) {
      setUrlResult(null);
      setUrlError("Please enter a URL first.");
      setIsUrlValid(false);
      return;
    }

    if (!isUrlValid) {
      setUrlError("Please fix the URL format before analyzing.");
      return;
    }

    setIsUrlAnalyzing(true);
    try {
      const data = await analyzeUrl(urlInput.trim());
      setUrlResult(data);
    } catch (error) {
      console.error("URL analysis error:", error);
    } finally {
      setIsUrlAnalyzing(false);
    }
  };

  // Rest of your existing handlers
  const handleGoogleLogin = async () => {
    const data = await googleLogin();
    if (data.auth_url) {
      window.location.href = data.auth_url;
    }
  };

  const handleFetchEmails = async () => {
    setIsAnalyzing(true);
    try {
      const data = await fetchEmails(emailCount || 10);
      if (data.error) {
        alert("Login expired. Please login again.");
        return;
      }
      setEmails(data.emails || []);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleReport = async () => {
    setIsAnalyzing(true);
    try {
      const data = await generateReport(emails);
      setReport(data);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handlePDF = async () => {
    setIsAnalyzing(true);
    try {
      const data = await exportPDF(emails);
      if (data.filename) {
        alert("PDF Exported to backend folder: " + data.filename);
      }
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="app-container">
      <header className="main-header">
        <div className="nav">
          <div className="nav-left">
            <span className="logo-icon">🛡️</span>
            <span className="logo-text">Spamurai</span>
          </div>
          <nav className="nav-links">
            <button
              className="nav-link"
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            >
              Home
            </button>
            <button className="nav-link" onClick={() => scrollToSection(emailAnalyzerRef)}>
              Email Analyzer
            </button>
            <button className="nav-link" onClick={() => scrollToSection(urlScannerRef)}>
              Offline URL Scanner
            </button>
            <button className="nav-link" onClick={() => scrollToSection(aboutRef)}>
              About
            </button>
          </nav>
          <div className="nav-actions">
            <button className="btn text" onClick={() => scrollToSection(emailAnalyzerRef)}>
              Analyze Email
            </button>
            <button className="btn primary" onClick={handleGoogleLogin}>
              Login with Google
            </button>
          </div>
        </div>

        <div className="hero">
          <h1>Advanced Email & URL Protection</h1>
          <p className="tagline">
            Scan your inbox, analyze suspicious emails, and check links offline before you click.
          </p>
          <div className="hero-actions">
            <button className="btn primary" onClick={() => scrollToSection(emailAnalyzerRef)}>
              Analyze an Email
            </button>
            <button className="btn" onClick={() => scrollToSection(urlScannerRef)}>
              Scan a URL
            </button>
          </div>
        </div>
      </header>

      <div className="main-content">
        {/* Gmail Inbox Scan */}
        <section className="section">
          <h2>📥 Gmail Inbox Scan</h2>
          <p className="section-description">
            Securely connect with Google to fetch and analyze your recent emails.
          </p>
          <div className="email-fetch-controls">
            <div className="email-count-control">
              <label htmlFor="email-count">Emails to fetch</label>
              <input
                id="email-count"
                type="number"
                min="1"
                max="100"
                value={emailCount}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  if (Number.isNaN(val)) {
                    setEmailCount(10);
                  } else {
                    setEmailCount(Math.min(100, Math.max(1, val)));
                  }
                }}
                className="email-count-input"
              />
            </div>
            <div className="gmail-actions">
              <button className="btn" onClick={handleGoogleLogin}>
                Login with Google
              </button>
              <button className="btn" onClick={handleFetchEmails} disabled={isAnalyzing}>
                {isAnalyzing ? "Loading..." : "Fetch Gmail Emails"}
              </button>
            </div>
          </div>
        </section>

        {/* Email Fetching */}
        <div className="section">
          <div className="email-fetch-controls">
            <div className="email-count-control">
              <label htmlFor="email-count">Emails to fetch</label>
              <input
                id="email-count"
                type="number"
                min="1"
                max="100"
                value={emailCount}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  if (Number.isNaN(val)) {
                    setEmailCount(10);
                  } else {
                    setEmailCount(Math.min(100, Math.max(1, val)));
                  }
                }}
                className="email-count-input"
              />
            </div>
            <button className="btn" onClick={handleFetchEmails} disabled={isAnalyzing}>
              {isAnalyzing ? "Loading..." : "Fetch Gmail Emails"}
            </button>
          </div>
        </div>

        {/* Email List */}
        {emails.length > 0 && (
          <section className="section">
            <h2>📧 Inbox Scan Results</h2>
            <div className="email-list">
              {emails.map((email, index) => (
                <div key={index} className={`email-card ${email.classification}`}>
                  <h3>{email.subject || "No Subject"}</h3>
                  <p className="sender">From: {email.sender}</p>
                  <div className="email-body">{email.body}</div>
                  
                  <div className="analysis-results">
                    <div className="probability-bars">
                      <div className="probability-bar">
                        <span>Spam: {email.spam_probability}%</span>
                        <div className="bar-container">
                          <div 
                            className="bar spam" 
                            style={{ width: `${email.spam_probability}%` }}
                          ></div>
                        </div>
                      </div>
                      <div className="probability-bar">
                        <span>Ham: {email.ham_probability}%</span>
                        <div className="bar-container">
                          <div 
                            className="bar ham" 
                            style={{ width: `${email.ham_probability}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>

                    {email.warning_level === 'high' && (
                      <div className="warning-message">
                        ⚠️ {email.warning_message}
                      </div>
                    )}

                    {email.phishing_indicators?.suspicious_urls?.length > 0 && (
                      <div className="suspicious-links">
                        <h4>⚠️ Suspicious Links:</h4>
                        <div className="link-buttons">
                          {email.phishing_indicators.suspicious_urls.map((url, idx) => (
                            <a 
                              key={idx} 
                              href={url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="link-button"
                              onClick={(e) => {
                                if (!window.confirm('This link appears suspicious. Are you sure you want to proceed?')) {
                                  e.preventDefault();
                                }
                              }}
                            >
                              {new URL(url).hostname}
                            </a>
                          ))}
                        </div>
                      </div>
                    )}

                    {email.phishing_indicators?.url_risks?.length > 0 && (
                      <div className="suspicious-links">
                        <h4>🌐 URL Risk Assessment:</h4>
                        <ul className="url-risk-list">
                          {email.phishing_indicators.url_risks.map((u, idx) => (
                            <li key={idx}>
                              <span className="url-text">{u.url}</span>
                              <span className={`url-label ${u.label || "unknown"}`}>
                                {u.label || "unknown"}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Report Section */}
        {emails.length > 0 && (
          <section className="section">
            <div className="action-buttons">
              <button className="btn" onClick={handleReport} disabled={isAnalyzing}>
                {isAnalyzing ? "Generating..." : "Generate Report"}
              </button>
              <button className="btn" onClick={handlePDF} disabled={isAnalyzing}>
                Export PDF
              </button>
            </div>

            {report && (
              <div className="report-box">
                <h2>📊 Email Analysis Report</h2>
                <div className="report-stats">
                  <div className="stat-card">
                    <h3>{report.total_emails}</h3>
                    <p>Total Emails</p>
                  </div>
                  <div className="stat-card">
                    <h3 className="spam">{report.spam_count}</h3>
                    <p>Spam</p>
                  </div>
                  <div className="stat-card">
                    <h3 className="ham">{report.ham_count}</h3>
                    <p>Ham</p>
                  </div>
                  <div className="stat-card">
                    <h3 className="phishing">{report.phishing_count}</h3>
                    <p>Phishing</p>
                  </div>
                </div>

                {report.top_keywords.length > 0 && (
                  <div className="keywords-section">
                    <h3>🔍 Top Suspicious Keywords</h3>
                    <div className="keywords-list">
                      {report.top_keywords.map((kw, idx) => (
                        <span key={idx} className="keyword-tag">
                          {kw.keyword} <span className="count">({kw.count})</span>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </section>
        )}

        {/* Email Analyzer */}
        <section ref={emailAnalyzerRef} className="section">
          <h2>🔍 Analyze Any Email</h2>
          <div className={`text-area-container ${analysis?.warning_level || ''}`}>
            <textarea
              className="email-input"
              rows="8"
              placeholder="Paste email content here for instant analysis..."
              value={manualText}
              onChange={(e) => setManualText(e.target.value)}
              spellCheck="false"
            />
            {isAnalyzing && <div className="loader">Analyzing...</div>}
          </div>

          {analysis && (
            <div className={`analysis-result ${analysis.warning_level}`}>
              <div className="result-header">
                <h3>
                  {analysis.classification === 'spam' ? '⚠️ Spam Detected' : '✅ Safe Email'}
                </h3>
                <div className="probability-bars">
                  <div className="probability-bar">
                    <span>Spam: {analysis.spam_probability}%</span>
                    <div className="bar-container">
                      <div 
                        className="bar spam" 
                        style={{ width: `${analysis.spam_probability}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="probability-bar">
                    <span>Ham: {analysis.ham_probability}%</span>
                    <div className="bar-container">
                      <div 
                        className="bar ham" 
                        style={{ width: `${analysis.ham_probability}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="warning-section">
                <p className={`warning-message ${analysis.warning_level}`}>
                  {analysis.warning_message}
                </p>

                {analysis.phishing_indicators?.suspicious_urls?.length > 0 && (
                  <div className="suspicious-links">
                    <h4>⚠️ Suspicious Links Found:</h4>
                    <div className="link-buttons">
                      {analysis.phishing_indicators.suspicious_urls.map((url, idx) => (
                        <a 
                          key={idx} 
                          href={url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="link-button"
                          onClick={(e) => {
                            if (!window.confirm('This link appears suspicious. Are you sure you want to proceed?')) {
                              e.preventDefault();
                            }
                          }}
                        >
                          {new URL(url).hostname}
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </section>

        {/* Offline URL Scanner */}
        <section ref={urlScannerRef} className="section">
          <h2>🌐 Offline URL Scanner</h2>
          <p className="section-description">
            Check any link before you open it. We never send your URL to the cloud.
          </p>
          <div className="url-scanner">
            <input
              type="text"
              className="url-input"
              placeholder="Paste a URL here (e.g., https://example.com)"
              value={urlInput}
              onChange={(e) => {
                const value = e.target.value;
                setUrlInput(value);
                validateUrl(value);
              }}
            />
            <button
              className="btn"
              onClick={handleUrlAnalyze}
              disabled={isUrlAnalyzing || !isUrlValid}
            >
              {isUrlAnalyzing ? "Analyzing..." : "Analyze URL"}
            </button>
            {isUrlValid && (!urlResult || (urlResult.label === "benign" && urlResult.risk_level !== "high")) && (
              <button
                type="button"
                className="btn btn-success open-url-btn"
                onClick={() => {
                  const target = urlInput.trim();
                  if (!target) return;
                  const href = target.match(/^https?:\/\//i) ? target : `http://${target}`;
                  window.open(href, "_blank", "noopener,noreferrer");
                }}
              >
                Open URL
              </button>
            )}
          </div>

          {urlError && (
            <p className="url-error-text">{urlError}</p>
          )}

          {urlResult && (
            <div className={`url-result ${urlResult.risk_level || ""}`}>
              <p className="url-result-text">
                URL: <span className="url-text">{urlResult.url}</span>
              </p>
              <p>
                Classification:
                <span className={`url-label ${urlResult.label || "unknown"}`}>
                  {urlResult.label || "unknown"}
                </span>
              </p>
              {urlResult.label !== "benign" && (
                <p className="warning-message high">
                  ⚠️ This URL looks risky. The Open URL button is disabled for your safety.
                </p>
              )}
              {urlResult.error && (
                <p className="warning-message low">{urlResult.error}</p>
              )}
            </div>
          )}
        </section>

        {/* About Section */}
        <section ref={aboutRef} className="section about-section">
          <h2>About Spamurai</h2>
          <p>
            Spamurai is an offline-first security companion that analyzes emails and URLs using
            locally trained machine learning models. No email content or URLs are sent to any
            external service.
          </p>
          <p>
            Use Gmail Inbox Scan to review recent messages, the Email Analyzer to paste any
            suspicious text, and the Offline URL Scanner to check links before you click.
          </p>
        </section>

        {/* Logout */}
        <section className="section">
          <button className="btn logout-btn" onClick={logout}>
            Logout
          </button>
        </section>
      </div>
    </div>
  );
}

export default App;