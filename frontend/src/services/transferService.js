import { apiRequest } from "./apiClient";

export const makeTransfer = async ({ from_account_id, to_account_id, amount, memo }) => {
  return apiRequest("/api/transfer", {
    method: "POST",
    body: JSON.stringify({ from_account_id, to_account_id, amount, memo })
  });
};
