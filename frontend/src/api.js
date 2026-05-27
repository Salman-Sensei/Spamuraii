// src/api.js
const API_BASE = "http://localhost:5000";

// Test backend connection on module load
export async function testBackendConnection() {
  try {
    const res = await fetch(`${API_BASE}/api/health`, {
      method: "GET",
      credentials: "include"
    });
    if (res.ok) {
      const data = await res.json();
      console.log("✅ Backend connection OK:", data);
      return true;
    }
    return false;
  } catch (error) {
    console.error("❌ Backend not reachable:", error.message);
    return false;
  }
}

export async function googleLogin() {
  console.log(`📡 Calling ${API_BASE}/auth/google`);
  try {
    const res = await fetch(`${API_BASE}/auth/google`, {
      credentials: "include",
      method: "GET"
    });
    
    console.log(`📥 Response status: ${res.status} ${res.statusText}`);
    
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({ 
        error: `HTTP ${res.status}: ${res.statusText}. Make sure the backend server is running on port 5000.` 
      }));
      console.error('❌ Server error:', errorData);
      throw new Error(errorData.error || `Failed to connect to server: ${res.statusText}`);
    }
    
    const data = await res.json();
    console.log('📦 Response data:', data);
    
    if (data.error) {
      console.error('❌ Error in response:', data.error);
      throw new Error(data.error);
    }
    
    return data;
  } catch (error) {
    if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
      console.error('❌ Network error - backend not reachable');
      throw new Error('Cannot connect to backend server. Please make sure the backend is running on http://localhost:5000');
    }
    throw error;
  }
}

export async function fetchEmails(params = {}) {
  const queryParams = new URLSearchParams();
  if (params.startDate) queryParams.append('startDate', params.startDate);
  if (params.endDate) queryParams.append('endDate', params.endDate);
  // Only add limit if explicitly provided, otherwise let backend use default (50)
  if (params.limit || params.maxResults) {
    const limit = params.limit || params.maxResults;
    queryParams.append('limit', limit);
  }
  
  const url = `${API_BASE}/api/emails${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
  
  // Add timeout to prevent hanging (increased to 120 seconds for large email batches)
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 120000); // 120 second timeout
  
  try {
    const res = await fetch(url, {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json"
      },
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({ error: `HTTP ${res.status}: ${res.statusText}` }));
      throw new Error(errorData.error || `Failed to fetch emails: ${res.statusText}`);
    }
    
    return res.json();
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error('Request timeout - server is taking too long to respond');
    }
    throw error;
  }
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

export async function analyzeUrl(url) {
  const res = await fetch(`${API_BASE}/api/url_offline`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url }),
    credentials: "include"
  });
  
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ error: `HTTP ${res.status}: ${res.statusText}` }));
    throw new Error(errorData.error || `Failed to analyze URL: ${res.statusText}`);
  }
  
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
  
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ error: `HTTP ${res.status}: ${res.statusText}` }));
    throw new Error(errorData.error || `Failed to export PDF: ${res.statusText}`);
  }
  
  // Get the blob and create download link
  const blob = await res.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `spamurai_report_${new Date().toISOString().split('T')[0]}.pdf`;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
  
  return { success: true, message: "PDF downloaded successfully" };
}

export async function logout() {
  const res = await fetch(`${API_BASE}/api/logout`, {
    method: "POST",
    credentials: "include"
  });
  return res.json();
}

export async function getUserInfo() {
  // Add timeout to prevent hanging
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
  
  try {
    const res = await fetch(`${API_BASE}/api/user`, {
      credentials: "include",
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    
    if (!res.ok) {
      if (res.status === 401) {
        return { authenticated: false, error: "Not authenticated" };
      }
      const errorData = await res.json().catch(() => ({ error: "Failed to get user info" }));
      throw new Error(errorData.error || "Failed to get user info");
    }
    return res.json();
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error('Request timeout - server is taking too long to respond');
    }
    throw error;
  }
}

export async function checkAuthStatus() {
  // Add timeout to prevent hanging
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 second timeout
  
  try {
    const res = await fetch(`${API_BASE}/api/auth/status`, {
      credentials: "include",
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    return res.json();
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      return { authenticated: false, error: 'Request timeout' };
    }
    throw error;
  }
}
