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

// FORGOT PASSWORD — get security question by email
export const getSecurityQuestion = async (email) => {
  return apiRequest("/api/forgot-password/question", {
    method: "POST",
    body: JSON.stringify({ email })
  });
};

// FORGOT PASSWORD — verify answer and reset password
export const resetPasswordViaSecurity = async (email, security_answer, new_password) => {
  return apiRequest("/api/forgot-password/reset", {
    method: "POST",
    body: JSON.stringify({ email, security_answer, new_password })
  });
};