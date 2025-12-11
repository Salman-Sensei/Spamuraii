import React, { useState, useEffect } from "react";
import { googleLogin, fetchEmails, analyzeOffline, generateReport, exportPDF } from "../api";
import Card from "../components/Card";
import Button from "../components/Button";

export default function EmailScan() {
  const [manualText, setManualText] = useState("");
  const [analysis, setAnalysis] = useState(null);
  const [emails, setEmails] = useState([]);
  const [emailCount, setEmailCount] = useState(10);
  const [report, setReport] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [typingTimeout, setTypingTimeout] = useState(null);

  useEffect(() => {
    if (typingTimeout) clearTimeout(typingTimeout);

    if (manualText.trim().length > 10) {
      setIsAnalyzing(true);
      const timeoutId = setTimeout(() => {
        handleManualAnalyze();
      }, 1000);
      setTypingTimeout(timeoutId);
    }

    return () => {
      if (typingTimeout) clearTimeout(typingTimeout);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      console.error("Analysis error:", error);
    } finally {
      setIsAnalyzing(false);
    }
  };

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
    <div className="page-grid">
      <div className="page-column">
        <Card
          title="📥 Gmail Inbox Scan"
          subtitle="Securely connect with Google to fetch and analyze your recent emails."
          actions={
            <>
              <Button variant="ghost" onClick={handleGoogleLogin}>
                Login with Google
              </Button>
              <Button onClick={handleFetchEmails} disabled={isAnalyzing}>
                {isAnalyzing ? "Loading..." : "Fetch Emails"}
              </Button>
            </>
          }
        >
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
          </div>
        </Card>

        {emails.length > 0 && (
          <Card
            title="📧 Inbox Scan Results"
            subtitle="Per-email classification with spam and ham probabilities."
          >
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

                    {email.warning_level === "high" && (
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
                                if (
                                  !window.confirm(
                                    "This link appears suspicious. Are you sure you want to proceed?"
                                  )
                                ) {
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
          </Card>
        )}

        {emails.length === 0 && (
          <Card title="No emails fetched yet" subtitle="Run a scan to see inbox results here." />
        )}

        {emails.length > 0 && (
          <Card
            title="📊 Summary Report"
            subtitle="High-level breakdown of your scanned inbox."
            actions={
              <>
                <Button onClick={handleReport} disabled={isAnalyzing}>
                  {isAnalyzing ? "Generating..." : "Generate Report"}
                </Button>
                <Button variant="ghost" onClick={handlePDF} disabled={isAnalyzing}>
                  Export PDF
                </Button>
              </>
            }
          >
            {report ? (
              <div className="report-box">
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
            ) : (
              <p className="muted-text">Generate a report to see aggregate statistics here.</p>
            )}
          </Card>
        )}
      </div>

      <div className="page-column">
        <Card
          title="🔍 Analyze Any Email"
          subtitle="Paste email content below for instant offline analysis."
        >
          <div className={`text-area-container ${analysis?.warning_level || ""}`}>
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
                  {analysis.classification === "spam" ? "⚠️ Spam Detected" : "✅ Safe Email"}
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
                            if (
                              !window.confirm(
                                "This link appears suspicious. Are you sure you want to proceed?"
                              )
                            ) {
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
        </Card>
      </div>
    </div>
  );
}
