import { useEffect, useState } from "react";
import { getAccounts } from "../services/accountService";
import { useFinance } from "../context/FinanceContext";

export default function useAccounts() {
  const { refreshKey } = useFinance();
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    getAccounts()
      .then(setAccounts)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [refreshKey]);

  return { accounts, loading, error };
}
