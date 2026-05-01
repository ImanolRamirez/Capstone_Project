import { createContext, useContext, useState, useCallback, useEffect } from "react";
import { t as translate } from "../translations";
import { updateLanguage, getMe } from "../services/userService";

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  // Load from localStorage immediately so the UI is correct on first render
  const [language, setLanguageState] = useState(
    () => localStorage.getItem("language") || "English"
  );

  // On mount, fetch the user's saved language from the DB and sync
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    getMe()
      .then((user) => {
        if (user.language && user.language !== language) {
          setLanguageState(user.language);
          localStorage.setItem("language", user.language);
        }
      })
      .catch(() => {}); // silently ignore if not logged in
  }, []); // only on mount

  const setLanguage = useCallback(async (lang) => {
    setLanguageState(lang);
    localStorage.setItem("language", lang);
    try {
      await updateLanguage(lang);
    } catch {
      // DB save failed — the local state is still updated
    }
  }, []);

  const tFn = useCallback((key) => translate(language, key), [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t: tFn }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
