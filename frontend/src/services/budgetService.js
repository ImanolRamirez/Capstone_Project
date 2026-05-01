import { apiRequest } from "./apiClient";

export const getBudgets = (month, year) =>
  apiRequest(`/api/budgets?month=${month}&year=${year}`);

export const createBudget = (data) =>
  apiRequest("/api/budgets", { method: "POST", body: JSON.stringify(data) });

export const updateBudget = (id, amount) =>
  apiRequest(`/api/budgets/${id}`, { method: "PUT", body: JSON.stringify({ amount }) });

export const deleteBudget = (id) =>
  apiRequest(`/api/budgets/${id}`, { method: "DELETE" });
