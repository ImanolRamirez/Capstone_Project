import {
  Box,
  Typography,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  Chip,
  Divider,
  CircularProgress,
  Alert
} from "@mui/material";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";

import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import EqualizerIcon from "@mui/icons-material/Equalizer";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";

import { useNavigate } from "react-router-dom";
import { useState } from "react";

import useAccounts from "../hooks/useAccounts";
import useTransactions from "../hooks/useTransactions";
import useDebts from "../hooks/useDebts";
import { useLanguage } from "../context/LanguageContext";

import { calculateNetWorth } from "../utils/calculations";

const COLORS = ["#14684D","#1976D2","#FF9800","#D32F2F","#9C27B0","#009688","#E91E63"];

function StatCard({ title, value, subtitle, icon, gradient, onClick }) {
  return (
    <Card
      onClick={onClick}
      sx={{
        borderRadius: 4,
        cursor: onClick ? "pointer" : "default",
        overflow: "hidden",
        transition: "0.2s",
        "&:hover": onClick ? {
          transform: "translateY(-4px)",
          boxShadow: "0 12px 28px rgba(0,0,0,0.15)"
        } : {}
      }}
    >
      <Box sx={{ background: gradient, p: 3, color: "white" }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
          <Typography variant="body2" sx={{ opacity: 0.85 }}>{title}</Typography>
          {icon}
        </Box>
        <Typography variant="h4" fontWeight="bold">
          ${value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </Typography>
        {subtitle && (
          <Typography variant="caption" sx={{ opacity: 0.75 }}>{subtitle}</Typography>
        )}
      </Box>
    </Card>
  );
}

function Dashboard() {

  const navigate = useNavigate();
  const { t } = useLanguage();
  const [openNetWorth, setOpenNetWorth] = useState(false);

  const { accounts, loading: loadingAccounts, error: errorAccounts } = useAccounts();
  const { transactions, loading: loadingTx, error: errorTx } = useTransactions();
  const { debts, loading: loadingDebts, error: errorDebts } = useDebts();

  const loading = loadingAccounts || loadingTx || loadingDebts;
  const error = errorAccounts || errorTx || errorDebts;

  const totalBalance = accounts.reduce((sum, a) => sum + (a.balance || 0), 0);
  const totalDebt = debts.reduce((sum, d) => sum + (d.balance || 0), 0);
  const netWorth = calculateNetWorth(accounts, debts);
  const recentTransactions = transactions.slice(0, 6);

  const accountChart = accounts.map(a => ({ name: a.type, value: parseFloat(a.balance.toFixed(2)) }));
  const debtChart = debts.map(d => ({ name: d.type, value: parseFloat(d.balance.toFixed(2)) }));

  const spending = {};
  transactions.forEach(t => {
    if (t.amount < 0) {
      spending[t.category] = (spending[t.category] || 0) + Math.abs(t.amount);
    }
  });
  const spendingChart = Object.keys(spending).map(key => ({
    name: key,
    value: parseFloat(spending[key].toFixed(2))
  }));

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: 400 }}>
        <CircularProgress sx={{ color: "#14684D" }} />
      </Box>
    );
  }

  return (

    <Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
          Failed to load data: {error}
        </Alert>
      )}

      <Typography variant="h4" fontWeight="bold" sx={{ mb: 1 }}>
        {t("dashboard.title")}
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 4 }}>
        {t("dashboard.subtitle")}
      </Typography>

      {/* SUMMARY CARDS */}

      <Box sx={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 3, mb: 5 }}>

        <StatCard
          title="Total Balance"
          value={totalBalance}
          subtitle="Across all accounts"
          icon={<AccountBalanceWalletIcon sx={{ opacity: 0.85 }} />}
          gradient="linear-gradient(135deg, #14684D 0%, #1a8a65 100%)"
          onClick={() => navigate("/accounts")}
        />

        <StatCard
          title="Total Debt"
          value={totalDebt}
          subtitle="Across all liabilities"
          icon={<TrendingDownIcon sx={{ opacity: 0.85 }} />}
          gradient="linear-gradient(135deg, #C62828 0%, #D32F2F 100%)"
          onClick={() => navigate("/debts")}
        />

        <StatCard
          title="Net Worth"
          value={netWorth}
          subtitle="Click for details"
          icon={<EqualizerIcon sx={{ opacity: 0.85 }} />}
          gradient={netWorth >= 0
            ? "linear-gradient(135deg, #1565C0 0%, #1976D2 100%)"
            : "linear-gradient(135deg, #6A1B9A 0%, #8E24AA 100%)"
          }
          onClick={() => setOpenNetWorth(true)}
        />

      </Box>

      {/* CHARTS */}

      <Typography variant="h5" fontWeight="bold" sx={{ mb: 3 }}>
        Financial Insights
      </Typography>

      <Box sx={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 3, mb: 5 }}>

        {[
          { title: "Account Distribution", data: accountChart },
          { title: "Debt Breakdown", data: debtChart },
          { title: "Spending by Category", data: spendingChart }
        ].map(({ title, data }) => (
          <Card key={title} sx={{ borderRadius: 4, p: 1 }}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" sx={{ mb: 1 }}>
                {title}
              </Typography>
              {data.length === 0 ? (
                <Typography color="text.secondary" variant="body2" sx={{ py: 4, textAlign: "center" }}>
                  No data available
                </Typography>
              ) : (
                <ResponsiveContainer width="100%" height={260}>
                  <PieChart>
                    <Pie data={data} dataKey="value" nameKey="name" outerRadius={90} innerRadius={40}>
                      {data.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v) => `$${v.toLocaleString()}`} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        ))}

      </Box>

      {/* RECENT TRANSACTIONS */}

      <Card sx={{ borderRadius: 4 }}>
        <CardContent sx={{ p: 3 }}>

          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
            <Typography variant="h6" fontWeight="bold">Recent Transactions</Typography>
            <Typography
              variant="body2"
              sx={{ color: "#14684D", cursor: "pointer", fontWeight: "bold" }}
              onClick={() => navigate("/transactions")}
            >
              View All →
            </Typography>
          </Box>

          <Divider sx={{ mb: 2 }} />

          {recentTransactions.length === 0 ? (
            <Typography color="text.secondary" variant="body2">No transactions yet.</Typography>
          ) : (
            recentTransactions.map((t) => (
              <Box
                key={t.id}
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  py: 1.25,
                  borderBottom: "1px solid #f5f5f5"
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                  <Box
                    sx={{
                      width: 36,
                      height: 36,
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      backgroundColor: t.amount > 0 ? "#e8f5e9" : "#ffebee"
                    }}
                  >
                    {t.amount > 0
                      ? <ArrowUpwardIcon sx={{ fontSize: 18, color: "#14684D" }} />
                      : <ArrowDownwardIcon sx={{ fontSize: 18, color: "#D32F2F" }} />
                    }
                  </Box>
                  <Box>
                    <Typography variant="body2" fontWeight="bold">
                      {t.description || t.category}
                    </Typography>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Typography variant="caption" color="text.secondary">{t.date}</Typography>
                      <Chip label={t.category} size="small" sx={{ height: 18, fontSize: "0.65rem" }} />
                    </Box>
                  </Box>
                </Box>
                <Typography
                  fontWeight="bold"
                  sx={{ color: t.amount > 0 ? "#14684D" : "#D32F2F" }}
                >
                  {t.amount > 0 ? "+" : ""}${Math.abs(t.amount).toFixed(2)}
                </Typography>
              </Box>
            ))
          )}

        </CardContent>
      </Card>

      {/* NET WORTH DIALOG */}

      <Dialog open={openNetWorth} onClose={() => setOpenNetWorth(false)}>
        <DialogTitle fontWeight="bold">Net Worth Calculation</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Net worth represents the difference between what you own and what you owe.
            <br /><br />
            <b>Net Worth = Total Assets − Total Debt</b>
            <br /><br />
            Total assets include balances across your checking, savings, and other accounts.
            Total debt includes balances from loans, credit cards, and other liabilities.
          </DialogContentText>
        </DialogContent>
      </Dialog>

    </Box>

  );

}

export default Dashboard;
