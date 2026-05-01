import { apiRequest } from "./apiClient";

export const getAccounts = async () => {
  return apiRequest("/api/accounts");
};

export const createAccount = async (data) => {
  return apiRequest("/api/accounts", {
    method: "POST",
    body: JSON.stringify(data),
  });
};

export const deleteAccount = async (accountId) => {
  return apiRequest(`/api/accounts/${accountId}`, {
    method: "DELETE",
  });
};
