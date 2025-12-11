import React, { useState } from "react";
import { analyzeUrl } from "../api";
import Card from "../components/Card";
import Button from "../components/Button";

export default function UrlScan() {
  const [urlInput, setUrlInput] = useState("");
  const [urlResult, setUrlResult] = useState(null);
  const [urlError, setUrlError] = useState("");
  const [isUrlValid, setIsUrlValid] = useState(false);
  const [isUrlAnalyzing, setIsUrlAnalyzing] = useState(false);

  const validateUrl = (value) => {
    const trimmed = value.trim();
    if (!trimmed) {
      setIsUrlValid(false);
      setUrlError("");
      return;
    }
    try {
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

  return (
    <div className="page-grid-single">
      <Card
        title="🌐 Offline URL Scanner"
        subtitle="Check any link safely using your local URL Guard model."
        actions={
          <Button onClick={handleUrlAnalyze} disabled={isUrlAnalyzing || !isUrlValid}>
            {isUrlAnalyzing ? "Analyzing..." : "Analyze URL"}
          </Button>
        }
      >
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
        </div>

        {urlError && <p className="url-error-text">{urlError}</p>}

        {isUrlValid && (!urlResult || urlResult.label === "benign") && (
          <Button
            variant="ghost"
            className="open-url-btn"
            onClick={() => {
              const target = urlInput.trim();
              if (!target) return;
              const href = target.match(/^https?:\/\//i) ? target : `http://${target}`;
              window.open(href, "_blank", "noopener,noreferrer");
            }}
          >
            Open URL
          </Button>
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
            {urlResult.error && <p className="warning-message low">{urlResult.error}</p>}
          </div>
        )}
      </Card>
    </div>
  );
}
