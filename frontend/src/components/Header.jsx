import React from "react";
import Button from "./Button";

export default function Header() {
  return (
    <header className="header">
      <div className="header-left">
        <h1 className="header-title">Security Dashboard</h1>
        <p className="header-subtitle">Monitor emails and URLs in one place.</p>
      </div>
      <div className="header-right">
        <Button variant="primary">Run Scan</Button>
      </div>
    </header>
  );
}
