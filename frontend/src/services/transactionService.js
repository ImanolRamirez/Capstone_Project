import { apiRequest } from "./apiClient";

export const getTransactions = async () => {
  return apiRequest("/api/transactions");
};

export const createTransaction = async (data) => {
  return apiRequest("/api/transactions", {
    method: "POST",
    body: JSON.stringify(data)
  });
};

export const deleteTransaction = async (transactionId) => {
  return apiRequest(`/api/transactions/${transactionId}`, {
    method: "DELETE"
  });
};