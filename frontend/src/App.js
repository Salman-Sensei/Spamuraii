import React, { useState, useEffect } from "react";
import {
  googleLogin,
  fetchEmails,
  analyzeOffline,
  generateReport,
  exportPDF,
  logout
} from "./api";
import "./App.css";

function App() {
  const [manualText, setManualText] = useState("");
  const [analysis, setAnalysis] = useState(null);
  const [emails, setEmails] = useState([]);
  const [report, setReport] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [typingTimeout, setTypingTimeout] = useState(null);

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
      const data = await fetchEmails();
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
      <header>
        <h1>🛡️ Spamurai</h1>
        <p className="tagline">Advanced Email Protection</p>
      </header>

      <div className="main-content">
        {/* Google Login */}
        <div className="section">
          <button className="btn primary" onClick={handleGoogleLogin}>
            Login with Google
          </button>
        </div>

        {/* Email Fetching */}
        <div className="section">
          <button className="btn" onClick={handleFetchEmails} disabled={isAnalyzing}>
            {isAnalyzing ? "Loading..." : "Fetch Gmail Emails"}
          </button>
        </div>

        {/* Email List */}
        {emails.length > 0 && (
          <div className="section">
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
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Report Section */}
        {emails.length > 0 && (
          <div className="section">
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
          </div>
        )}

        {/* Offline Analysis */}
        <div className="section">
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
        </div>

        {/* Logout */}
        <div className="section">
          <button className="btn logout-btn" onClick={logout}>
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;