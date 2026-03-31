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
    throw new Error("API request failed");
  }

  return response.json();
}