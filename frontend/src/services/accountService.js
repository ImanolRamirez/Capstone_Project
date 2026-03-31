import { apiRequest } from "./apiClient";

export const getAccounts = async () => {
  return apiRequest("/api/accounts");
};