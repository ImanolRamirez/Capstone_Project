import { apiRequest } from "./apiClient";

export const getDebts = async () => {
  return apiRequest("/api/debts");
};