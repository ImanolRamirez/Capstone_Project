import {
  Box,
  Typography,
  Card,
  CardContent,
  Divider,
  Chip,
  CircularProgress
} from "@mui/material";

import { useNavigate } from "react-router-dom";

import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import SupportAgentIcon from "@mui/icons-material/SupportAgent";
import SecurityIcon from "@mui/icons-material/Security";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import RequestQuoteIcon from "@mui/icons-material/RequestQuote";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";

import useAccounts from "../hooks/useAccounts";
import useDebts from "../hooks/useDebts";
import useTransactions from "../hooks/useTransactions";

const QUICK_LINKS = [
  {
    title: "Accounts",
    description: "View checking, savings, and HYSA balances.",
    icon: <AccountBalanceIcon sx={{ fontSize: 36, color: "#14684D" }} />,
    path: "/accounts",
    accent: "#e8f5e9",
    border: "#14684D"
  },
  {
    title: "Transactions",
    description: "Browse your full transaction history.",
    icon: <ReceiptLongIcon sx={{ fontSize: 36, color: "#1565C0" }} />,
    path: "/transactions",
    accent: "#e3f2fd",
    border: "#1565C0"
  },
  {
    title: "Debts",
    description: "Track loans, credit cards, and liabilities.",
    icon: <CreditCardIcon sx={{ fontSize: 36, color: "#C62828" }} />,
    path: "/debts",
    accent: "#ffebee",
    border: "#C62828"
  },
  {
    title: "Transfer",
    description: "Move money between your accounts.",
    icon: <SwapHorizIcon sx={{ fontSize: 36, color: "#6A1B9A" }} />,
    path: "/transfer",
    accent: "#f3e5f5",
    border: "#6A1B9A"
  },
  {
    title: "Financial Planning",
    description: "Investment and growth tools.",
    icon: <TrendingUpIcon sx={{ fontSize: 36, color: "#E65100" }} />,
    path: "/dashboard",
    accent: "#fff3e0",
    border: "#E65100"
  },
  {
    title: "Loans & Financing",
    description: "Explore loan and financing options.",
    icon: <RequestQuoteIcon sx={{ fontSize: 36, color: "#006064" }} />,
    path: "/debts",
    accent: "#e0f7fa",
    border: "#006064"
  },
  {
    title: "Fraud Protection",
    description: "Security alerts and fraud prevention.",
    icon: <SecurityIcon sx={{ fontSize: 36, color: "#37474F" }} />,
    path: "/profile/alerts",
    accent: "#eceff1",
    border: "#37474F"
  },
  {
    title: "Customer Support",
    description: "Get help with your account.",
    icon: <SupportAgentIcon sx={{ fontSize: 36, color: "#880E4F" }} />,
    path: "/profile",
    accent: "#fce4ec",
    border: "#880E4F"
  }
];

function Home() {

  const navigate = useNavigate();
  const { accounts, loading: loadingAccounts } = useAccounts();
  const { debts, loading: loadingDebts } = useDebts();
  const { transactions, loading: loadingTx } = useTransactions();

  const loading = loadingAccounts || loadingDebts || loadingTx;

  const stored = JSON.parse(localStorage.getItem("user") || "{}");
  const firstName = stored?.firstName || "there";

  const totalBalance = accounts.reduce((s, a) => s + (a.balance || 0), 0);
  const totalDebt = debts.reduce((s, d) => s + (d.balance || 0), 0);
  const recentCount = transactions.length;

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: 400 }}>
        <CircularProgress sx={{ color: "#14684D" }} />
      </Box>
    );
  }

  return (

    <Box>

      {/* HERO */}

      <Box
        sx={{
          borderRadius: 4,
          background: "linear-gradient(135deg, #0d3d2e 0%, #14684D 60%, #1a8a65 100%)",
          color: "white",
          p: 5,
          mb: 4,
          position: "relative",
          overflow: "hidden"
        }}
      >
        <Box
          sx={{
            position: "absolute",
            top: -40,
            right: -40,
            width: 200,
            height: 200,
            borderRadius: "50%",
            backgroundColor: "rgba(255,255,255,0.05)"
          }}
        />
        <Box
          sx={{
            position: "absolute",
            bottom: -60,
            right: 80,
            width: 280,
            height: 280,
            borderRadius: "50%",
            backgroundColor: "rgba(255,255,255,0.04)"
          }}
        />
        <Chip
          label="AssetAtlas"
          size="small"
          sx={{ backgroundColor: "rgba(255,255,255,0.15)", color: "white", fontWeight: "bold", mb: 2 }}
        />
        <Typography variant="h3" fontWeight="bold" sx={{ mb: 1.5 }}>
          Welcome back, {firstName}!
        </Typography>
        <Typography variant="h6" sx={{ opacity: 0.85, maxWidth: 580 }}>
          Monitor all your financial accounts in one place — bank accounts, investments, and debts — and gain insights into your overall financial health.
        </Typography>
      </Box>

      {/* QUICK STATS */}

      <Box sx={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 3, mb: 5 }}>

        <Card
          onClick={() => navigate("/accounts")}
          sx={{ borderRadius: 4, cursor: "pointer", transition: "0.2s", "&:hover": { transform: "translateY(-4px)", boxShadow: "0 10px 24px rgba(0,0,0,0.12)" } }}
        >
          <CardContent sx={{ p: 3 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>Total Balance</Typography>
            <Typography variant="h5" fontWeight="bold" color="#14684D">
              ${totalBalance.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </Typography>
            <Typography variant="caption" color="text.secondary">{accounts.length} account{accounts.length !== 1 ? "s" : ""}</Typography>
          </CardContent>
        </Card>

        <Card
          onClick={() => navigate("/debts")}
          sx={{ borderRadius: 4, cursor: "pointer", transition: "0.2s", "&:hover": { transform: "translateY(-4px)", boxShadow: "0 10px 24px rgba(0,0,0,0.12)" } }}
        >
          <CardContent sx={{ p: 3 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>Total Debt</Typography>
            <Typography variant="h5" fontWeight="bold" color="#C62828">
              ${totalDebt.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </Typography>
            <Typography variant="caption" color="text.secondary">{debts.length} liabilit{debts.length !== 1 ? "ies" : "y"}</Typography>
          </CardContent>
        </Card>

        <Card
          onClick={() => navigate("/transactions")}
          sx={{ borderRadius: 4, cursor: "pointer", transition: "0.2s", "&:hover": { transform: "translateY(-4px)", boxShadow: "0 10px 24px rgba(0,0,0,0.12)" } }}
        >
          <CardContent sx={{ p: 3 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>Transactions</Typography>
            <Typography variant="h5" fontWeight="bold" color="#1565C0">
              {recentCount}
            </Typography>
            <Typography variant="caption" color="text.secondary">total recorded</Typography>
          </CardContent>
        </Card>

      </Box>

      {/* QUICK LINKS */}

      <Typography variant="h5" fontWeight="bold" sx={{ mb: 1 }}>
        Services
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        Everything you need to manage your finances
      </Typography>

      <Divider sx={{ mb: 3 }} />

      <Box sx={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 2.5 }}>

        {QUICK_LINKS.map(({ title, description, icon, path, accent, border }) => (
          <Card
            key={title}
            onClick={() => navigate(path)}
            sx={{
              borderRadius: 4,
              cursor: "pointer",
              border: `1px solid #f0f0f0`,
              transition: "all 0.22s",
              "&:hover": {
                transform: "translateY(-6px)",
                boxShadow: `0 10px 28px rgba(0,0,0,0.1)`,
                borderColor: border,
                "& .arrow-icon": { opacity: 1, transform: "translateX(4px)" }
              }
            }}
          >
            <CardContent sx={{ p: 2.5 }}>
              <Box
                sx={{
                  width: 56,
                  height: 56,
                  borderRadius: 3,
                  backgroundColor: accent,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  mb: 2
                }}
              >
                {icon}
              </Box>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <Box>
                  <Typography variant="body1" fontWeight="bold" sx={{ mb: 0.5 }}>
                    {title}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {description}
                  </Typography>
                </Box>
                <ArrowForwardIcon
                  className="arrow-icon"
                  sx={{
                    fontSize: 16,
                    color: border,
                    opacity: 0,
                    transition: "all 0.2s",
                    mt: 0.25,
                    flexShrink: 0
                  }}
                />
              </Box>
            </CardContent>
          </Card>
        ))}

      </Box>

    </Box>

  );

}

export default Home;