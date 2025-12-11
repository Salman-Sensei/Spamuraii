// src/api.js
const API_BASE = "http://localhost:5000";

export async function googleLogin() {
  const res = await fetch(`${API_BASE}/auth/google`, {
    credentials: "include"
  });
  return res.json();
}

export async function fetchEmails(limit = 10) {
  const res = await fetch(`${API_BASE}/api/emails?limit=${encodeURIComponent(limit)}`, {
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

export async function analyzeUrl(url) {
  const res = await fetch(`${API_BASE}/api/url_offline`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url }),
    credentials: "include"
  });
  return res.json();
}
