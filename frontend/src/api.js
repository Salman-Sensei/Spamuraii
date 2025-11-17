// src/api.js
const API_BASE = "http://localhost:5000";

export async function googleLogin() {
  const res = await fetch(`${API_BASE}/auth/google`, {
    credentials: "include"
  });
  return res.json();
}

export async function fetchEmails() {
  const res = await fetch(`${API_BASE}/api/emails`, {
    credentials: "include"
  });
  return res.json();
}

export async function analyzeOffline(message) {
  const res = await fetch(`${API_BASE}/predict`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message }),
    credentials: "include"
  });
  return res.json();
}

export async function generateReport(emails) {
  const res = await fetch(`${API_BASE}/api/report`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ emails }),
    credentials: "include"
  });
  return res.json();
}

export async function exportPDF(emails) {
  const res = await fetch(`${API_BASE}/api/export_pdf`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ emails }),
    credentials: "include"
  });
  return res.json();
}

export async function logout() {
  const res = await fetch(`${API_BASE}/api/logout`, {
    method: "POST",
    credentials: "include"
  });
  return res.json();
}
