import React from 'react';
import './ReportSection.css';

const ReportSection = ({ report, onGenerateReport, onExportPDF, isGenerating }) => {
  if (!report && !isGenerating) {
    return (
      <div className="report-section">
        <div className="section-header">
          <h2>📊 Email Analysis Report</h2>
          <p className="section-description">Generate comprehensive reports and export to PDF</p>
        </div>
        <div className="report-actions">
          <button 
            className="btn btn-primary" 
            onClick={onGenerateReport}
            disabled={isGenerating}
          >
            {isGenerating ? (
              <>
                <span className="btn-spinner"></span>
                Generating...
              </>
            ) : (
              <>
                <span className="btn-icon">📊</span>
                Generate Report
              </>
            )}
          </button>
          <button 
            className="btn btn-secondary" 
            onClick={onExportPDF}
            disabled={isGenerating}
          >
            {isGenerating ? (
              <>
                <span className="btn-spinner"></span>
                Exporting...
              </>
            ) : (
              <>
                <span className="btn-icon">📄</span>
                Export PDF
              </>
            )}
          </button>
        </div>
      </div>
    );
  }

  if (isGenerating) {
    return (
      <div className="report-section">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Generating report...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="report-section">
      <div className="section-header">
        <h2>📊 Email Analysis Report</h2>
        <p className="section-description">Comprehensive analysis of your email inbox</p>
      </div>

      <div className="report-stats">
        <div className="stat-card total">
          <div className="stat-icon">📧</div>
          <div className="stat-value">{report.total_emails}</div>
          <div className="stat-label">Total Emails</div>
        </div>
        <div className="stat-card spam">
          <div className="stat-icon">⚠️</div>
          <div className="stat-value">{report.spam_count}</div>
          <div className="stat-label">Spam</div>
        </div>
        <div className="stat-card ham">
          <div className="stat-icon">✅</div>
          <div className="stat-value">{report.ham_count}</div>
          <div className="stat-label">Safe</div>
        </div>
        <div className="stat-card phishing">
          <div className="stat-icon">🔗</div>
          <div className="stat-value">{report.phishing_count}</div>
          <div className="stat-label">Phishing</div>
        </div>
      </div>

      {report.top_keywords && report.top_keywords.length > 0 && (
        <div className="keywords-section">
          <h3 className="keywords-title">
            <span className="keywords-icon">🔍</span>
            Top Suspicious Keywords
          </h3>
          <div className="keywords-list">
            {report.top_keywords.map((kw, idx) => (
              <div key={idx} className="keyword-tag">
                <span className="keyword-text">{kw.keyword}</span>
                <span className="keyword-count">({kw.count})</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="report-actions">
        <button 
          className="btn btn-secondary" 
          onClick={onExportPDF}
          disabled={isGenerating}
        >
          <span className="btn-icon">📄</span>
          Export PDF
        </button>
      </div>
    </div>
  );
};

export default ReportSection;

