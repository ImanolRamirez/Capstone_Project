const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

export async function apiRequest(endpoint, options = {}) {

  const token = localStorage.getItem("token");

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: token ? `Bearer ${token}` : "",
      ...options.headers
    }
  });

  if (!response.ok) {
    // 401 = token expired or invalid — clear auth and redirect to login
    if (response.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
      throw new Error("Session expired. Please log in again.");
    }

    const errorData = await response.json().catch(() => ({}));
    // Flask-JWT-Extended uses "msg", other errors use "error"
    throw new Error(errorData.error || errorData.msg || `Request failed (${response.status})`);
  }

  return response.json();
}