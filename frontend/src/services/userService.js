import { apiRequest } from "./apiClient";

export const getMe = async () => {
  return apiRequest("/api/user/me");
};

export const updateProfile = async (data) => {
  return apiRequest("/api/user/update", {
    method: "PUT",
    body: JSON.stringify(data)
  });
};

export const changePassword = async (currentPassword, newPassword) => {
  return apiRequest("/api/user/password", {
    method: "PUT",
    body: JSON.stringify({ currentPassword, newPassword })
  });
};

export const updateSecurity = async (security_question, security_answer) => {
  return apiRequest("/api/user/security", {
    method: "PUT",
    body: JSON.stringify({ security_question, security_answer })
  });
};

export const updateLanguage = async (language) => {
  return apiRequest("/api/user/language", {
    method: "PUT",
    body: JSON.stringify({ language })
  });
};
