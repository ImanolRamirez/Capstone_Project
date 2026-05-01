import { useEffect, useState } from "react";
import { getTransactions } from "../services/transactionService";
import { useFinance } from "../context/FinanceContext";

export default function useTransactions() {
  const { refreshKey } = useFinance();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    getTransactions()
      .then(setTransactions)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [refreshKey]);

  return { transactions, loading, error };
}
