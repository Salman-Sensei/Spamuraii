import React from "react";
import Card from "../components/Card";
import Button from "../components/Button";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const navigate = useNavigate();

  return (
    <div className="dashboard-grid">
      <Card
        title="Inbox Scan"
        subtitle="Fetch recent Gmail messages and see spam risk at a glance."
        actions={
          <Button onClick={() => navigate("/email")}>Open Email Scanner</Button>
        }
      >
        <p className="muted-text">
          Connect your Gmail, pull in the latest emails, and generate a summary report of
          spam, ham, and phishing indicators.
        </p>
      </Card>

      <Card
        title="Manual Email Analysis"
        subtitle="Paste any email content and get an instant safety verdict."
        actions={
          <Button variant="ghost" onClick={() => navigate("/email")}>
            Analyze a message
          </Button>
        }
      >
        <p className="muted-text">
          Use the offline spam model and phishing heuristics to classify arbitrary text
          without sending it to any external service.
        </p>
      </Card>

      <Card
        title="Offline URL Scanner"
        subtitle="Check links before clicking them."
        actions={
          <Button onClick={() => navigate("/url")}>
            Scan a URL
          </Button>
        }
      >
        <p className="muted-text">
          Paste any URL and let Spamurai run your local URL Guard model to detect suspicious
          domains and phishing redirects.
        </p>
      </Card>
    </div>
  );
}
