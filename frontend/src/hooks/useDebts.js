import { useEffect, useState } from "react";
import { getDebts } from "../services/debtService";
import { useFinance } from "../context/FinanceContext";

export default function useDebts() {
  const { refreshKey } = useFinance();
  const [debts, setDebts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    getDebts()
      .then(setDebts)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [refreshKey]);

  return { debts, loading, error };
}
