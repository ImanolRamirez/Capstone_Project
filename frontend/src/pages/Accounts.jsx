import {
  Box,
  Typography,
  Card,
  CardContent,
  Chip,
  Divider,
  Collapse,
  IconButton,
  CircularProgress,
  Alert
} from "@mui/material";

import { useState } from "react";
import useAccounts from "../hooks/useAccounts";
import useTransactions from "../hooks/useTransactions";
import { useLanguage } from "../context/LanguageContext";

import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import SavingsIcon from "@mui/icons-material/Savings";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";

const ACCOUNT_STYLES = {
  Checking: {
    gradient: "linear-gradient(135deg, #14684D 0%, #1a8a65 100%)",
    icon: <AccountBalanceIcon sx={{ fontSize: 36, color: "rgba(255,255,255,0.9)" }} />
  },
  Savings: {
    gradient: "linear-gradient(135deg, #1565C0 0%, #1976D2 100%)",
    icon: <SavingsIcon sx={{ fontSize: 36, color: "rgba(255,255,255,0.9)" }} />
  },
  HYSA: {
    gradient: "linear-gradient(135deg, #6A1B9A 0%, #8E24AA 100%)",
    icon: <TrendingUpIcon sx={{ fontSize: 36, color: "rgba(255,255,255,0.9)" }} />
  }
};

const DEFAULT_STYLE = {
  gradient: "linear-gradient(135deg, #37474F 0%, #546E7A 100%)",
  icon: <AccountBalanceIcon sx={{ fontSize: 36, color: "rgba(255,255,255,0.9)" }} />
};

function maskAccountNumber(id) {
  const base = String(id * 7391 + 10000).padStart(4, "0");
  return `•••• •••• •••• ${base.slice(-4)}`;
}

function Accounts() {

  const { accounts, loading: loadingAccounts, error: errorAccounts } = useAccounts();
  const { transactions, loading: loadingTx, error: errorTx } = useTransactions();
  const { t } = useLanguage();
  const [expanded, setExpanded] = useState(null);

  const loading = loadingAccounts || loadingTx;
  const error = errorAccounts || errorTx;

  const toggle = (id) => setExpanded(expanded === id ? null : id);

  const totalBalance = accounts.reduce((sum, a) => sum + (a.balance || 0), 0);

  const getRecentForAccount = (accountId) =>
    transactions
      .filter((t) => Number(t.account_id) === Number(accountId))
      .slice(0, 3);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: 400 }}>
        <CircularProgress sx={{ color: "#14684D" }} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box>
        <Typography variant="h4" fontWeight="bold" sx={{ mb: 2 }}>{t("accounts.title")}</Typography>
        <Alert severity="error" sx={{ borderRadius: 2 }}>Failed to load accounts: {error}</Alert>
      </Box>
    );
  }

  if (accounts.length === 0) {
    return (
      <Box>
        <Typography variant="h4" fontWeight="bold" sx={{ mb: 2 }}>
          {t("accounts.title")}
        </Typography>
        <Typography color="text.secondary">No accounts found.</Typography>
      </Box>
    );
  }

  return (

    <Box>

      {/* HEADER */}

      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="bold">
          {t("accounts.title")}
        </Typography>
        <Typography color="text.secondary" sx={{ mt: 0.5 }}>
          {accounts.length} account{accounts.length !== 1 ? "s" : ""}
        </Typography>
      </Box>

      {/* TOTAL BALANCE BANNER */}

      <Card
        sx={{
          borderRadius: 4,
          background: "linear-gradient(135deg, #0d3d2e 0%, #14684D 100%)",
          color: "white",
          mb: 4,
          p: 1
        }}
      >
        <CardContent>
          <Typography variant="body2" sx={{ opacity: 0.8, mb: 0.5 }}>
            Total Balance Across All Accounts
          </Typography>
          <Typography variant="h3" fontWeight="bold">
            ${totalBalance.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </Typography>
        </CardContent>
      </Card>

      {/* ACCOUNT CARDS */}

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))",
          gap: 3
        }}
      >

        {accounts.map((account) => {

          const style = ACCOUNT_STYLES[account.type] || DEFAULT_STYLE;
          const recentTx = getRecentForAccount(account.id);
          const isOpen = expanded === account.id;

          return (

            <Card
              key={account.id}
              sx={{
                borderRadius: 4,
                overflow: "hidden",
                boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                transition: "0.25s",
                "&:hover": {
                  transform: "translateY(-4px)",
                  boxShadow: "0 12px 30px rgba(0,0,0,0.15)"
                }
              }}
            >

              {/* COLORED HEADER */}

              <Box
                sx={{
                  background: style.gradient,
                  p: 3,
                  color: "white"
                }}
              >

                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2 }}>

                  <Box>
                    <Typography variant="body2" sx={{ opacity: 0.8 }}>
                      {account.name}
                    </Typography>
                    <Chip
                      label={account.type}
                      size="small"
                      sx={{
                        mt: 0.5,
                        backgroundColor: "rgba(255,255,255,0.2)",
                        color: "white",
                        fontWeight: "bold",
                        fontSize: "0.7rem"
                      }}
                    />
                  </Box>

                  {style.icon}

                </Box>

                <Typography variant="h4" fontWeight="bold">
                  ${account.balance.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </Typography>

                <Typography variant="body2" sx={{ opacity: 0.7, mt: 0.5 }}>
                  {maskAccountNumber(account.id)}
                </Typography>

              </Box>

              {/* CARD BODY */}

              <CardContent sx={{ pb: 1 }}>

                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>

                  <Box>
                    {account.apy > 0 && (
                      <Chip
                        label={`${account.apy}% APY`}
                        size="small"
                        sx={{
                          backgroundColor: "#e8f5e9",
                          color: "#14684D",
                          fontWeight: "bold"
                        }}
                      />
                    )}
                  </Box>

                  <IconButton size="small" onClick={() => toggle(account.id)}>
                    {isOpen
                      ? <KeyboardArrowUpIcon />
                      : <KeyboardArrowDownIcon />
                    }
                  </IconButton>

                </Box>

                {/* RECENT TRANSACTIONS EXPAND */}

                <Collapse in={isOpen}>

                  <Divider sx={{ my: 2 }} />

                  <Typography variant="body2" fontWeight="bold" sx={{ mb: 1 }}>
                    Recent Transactions
                  </Typography>

                  {recentTx.length === 0 ? (
                    <Typography variant="body2" color="text.secondary">
                      No transactions yet.
                    </Typography>
                  ) : (
                    recentTx.map((t) => (
                      <Box
                        key={t.id}
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          py: 0.75,
                          borderBottom: "1px solid #f0f0f0"
                        }}
                      >
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          {t.amount > 0
                            ? <ArrowUpwardIcon sx={{ fontSize: 16, color: "#14684D" }} />
                            : <ArrowDownwardIcon sx={{ fontSize: 16, color: "#D32F2F" }} />
                          }
                          <Box>
                            <Typography variant="body2" fontWeight="bold">
                              {t.description || t.category}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {t.date} • {t.category}
                            </Typography>
                          </Box>
                        </Box>
                        <Typography
                          variant="body2"
                          fontWeight="bold"
                          sx={{ color: t.amount > 0 ? "#14684D" : "#D32F2F" }}
                        >
                          {t.amount > 0 ? "+" : ""}${Math.abs(t.amount).toFixed(2)}
                        </Typography>
                      </Box>
                    ))
                  )}

                </Collapse>

              </CardContent>

            </Card>

          );

        })}

      </Box>

    </Box>

  );

}

export default Accounts;
