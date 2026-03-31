import { apiRequest } from "./apiClient";

export const getTransactions = async () => {
  return apiRequest("/api/transactions");
};