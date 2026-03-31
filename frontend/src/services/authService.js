import { apiRequest } from "./apiClient";

// LOGIN USER
export const loginUser = async (email, password) => {
  return apiRequest("/api/login", {
    method: "POST",
    body: JSON.stringify({ email, password })
  });
};

// REGISTER USER
export const registerUser = async (formData) => {
  return apiRequest("/api/register", {
    method: "POST",
    body: JSON.stringify(formData)
  });
};

// CHECK IF USER IS LOGGED IN
export const isAuthenticated = () => {
  return !!localStorage.getItem("token");
};

// GET CURRENT USER (from localStorage)
export const getUser = () => {
  return JSON.parse(localStorage.getItem("user"));
};

// LOGOUT USER
export const logoutUser = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
};