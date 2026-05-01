import { Box } from "@mui/material";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import Navbar from "./Navbar";
import assetAtlasLogo from "../assets/AssetAtlas.png";
import { useLanguage } from "../context/LanguageContext";

import HomeIcon from "@mui/icons-material/Home";
import DashboardIcon from "@mui/icons-material/Dashboard";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";
import SavingsIcon from "@mui/icons-material/Savings";

function Layout() {

  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { t } = useLanguage();

  const NAV_ITEMS = [
    { labelKey: "nav.home",         path: "/home",         icon: <HomeIcon /> },
    { labelKey: "nav.dashboard",    path: "/dashboard",    icon: <DashboardIcon /> },
    { labelKey: "nav.accounts",     path: "/accounts",     icon: <AccountBalanceIcon /> },
    { labelKey: "nav.transactions", path: "/transactions", icon: <ReceiptLongIcon /> },
    { labelKey: "nav.debts",        path: "/debts",        icon: <CreditCardIcon /> },
    { labelKey: "nav.budgets",      path: "/budgets",      icon: <SavingsIcon /> },
    { labelKey: "nav.transfer",     path: "/transfer",     icon: <SwapHorizIcon /> },
  ];

  return (

    <Box>

      <Navbar />

      <Box sx={{ display: "flex" }}>

        {/* SIDEBAR */}

        <Box
          sx={{
            width: 240,
            minHeight: "100vh",
            borderRight: "1px solid #E0E0E0",
            display: "flex",
            flexDirection: "column",
            p: 2,
            backgroundColor: "#fff"
          }}
        >

          {/* LOGO */}

          <Box sx={{ display: "flex", justifyContent: "center", mb: 4, mt: 1 }}>
            <Box
              component="img"
              src={assetAtlasLogo}
              alt="AssetAtlas"
              sx={{ width: 150, height: "auto" }}
            />
          </Box>

          {/* NAV ITEMS */}

          {NAV_ITEMS.map(({ labelKey, path, icon }) => {
            const active = pathname === path || pathname.startsWith(path + "/");
            return (
              <Box
                key={path}
                onClick={() => navigate(path)}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1.5,
                  px: 2,
                  py: 1.25,
                  mb: 0.5,
                  borderRadius: 3,
                  cursor: "pointer",
                  fontWeight: active ? "bold" : "normal",
                  fontSize: "0.95rem",
                  color: active ? "#14684D" : "#555",
                  backgroundColor: active ? "#e8f5e9" : "transparent",
                  transition: "all 0.18s",
                  "&:hover": {
                    backgroundColor: active ? "#d0edda" : "#f5f5f5",
                    color: "#14684D"
                  },
                  "& svg": {
                    fontSize: 20,
                    color: active ? "#14684D" : "#888",
                    transition: "color 0.18s"
                  }
                }}
              >
                {icon}
                {t(labelKey)}
              </Box>
            );
          })}

        </Box>

        {/* PAGE CONTENT */}

        <Box sx={{ flexGrow: 1, p: 4, backgroundColor: "#fafafa", minHeight: "100vh" }}>
          <Outlet />
        </Box>

      </Box>

    </Box>

  );

}

export default Layout;