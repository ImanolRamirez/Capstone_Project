

import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import { ThemeProvider, CssBaseline } from "@mui/material";
import theme from "./theme";
import "@fontsource/inter";
import { FinanceProvider } from "./context/FinanceContext.jsx";
import { LanguageProvider } from "./context/LanguageContext.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <LanguageProvider>
        <FinanceProvider>
          <App />
        </FinanceProvider>
      </LanguageProvider>
    </ThemeProvider>
  </React.StrictMode>
);
