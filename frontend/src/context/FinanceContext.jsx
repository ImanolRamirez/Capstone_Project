import { createContext, useContext, useState, useCallback } from "react";

const FinanceContext = createContext(null);

export function FinanceProvider({ children }) {
  const [refreshKey, setRefreshKey] = useState(0);

  const triggerRefresh = useCallback(() => {
    setRefreshKey(k => k + 1);
  }, []);

  return (
    <FinanceContext.Provider value={{ refreshKey, triggerRefresh }}>
      {children}
    </FinanceContext.Provider>
  );
}

export function useFinance() {
  return useContext(FinanceContext);
}
