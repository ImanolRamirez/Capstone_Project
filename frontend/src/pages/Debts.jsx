import {
  Box,
  Typography,
  Card,
  CardContent,
  Chip,
  Divider,
  LinearProgress,
  CircularProgress,
  Alert,
  Button
} from "@mui/material";

import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { useNavigate } from "react-router-dom";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";

import CreditCardIcon from "@mui/icons-material/CreditCard";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import HomeIcon from "@mui/icons-material/Home";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";

import useDebts from "../hooks/useDebts";
import { useLanguage } from "../context/LanguageContext";

const COLORS = ["#D32F2F", "#FF5722", "#FF9800", "#C62828", "#B71C1C"];

const DEBT_STYLES = {
  "Credit Card": {
    gradient: "linear-gradient(135deg, #C62828 0%, #D32F2F 100%)",
    icon: <CreditCardIcon sx={{ fontSize: 34, color: "rgba(255,255,255,0.9)" }} />
  },
  "Loan": {
    gradient: "linear-gradient(135deg, #E65100 0%, #FF5722 100%)",
    icon: <AccountBalanceIcon sx={{ fontSize: 34, color: "rgba(255,255,255,0.9)" }} />
  },
  "Auto Loan": {
    gradient: "linear-gradient(135deg, #BF360C 0%, #E64A19 100%)",
    icon: <DirectionsCarIcon sx={{ fontSize: 34, color: "rgba(255,255,255,0.9)" }} />
  },
  "Mortgage": {
    gradient: "linear-gradient(135deg, #880E4F 0%, #AD1457 100%)",
    icon: <HomeIcon sx={{ fontSize: 34, color: "rgba(255,255,255,0.9)" }} />
  }
};

const DEFAULT_DEBT_STYLE = {
  gradient: "linear-gradient(135deg, #C62828 0%, #D32F2F 100%)",
  icon: <AccountBalanceIcon sx={{ fontSize: 34, color: "rgba(255,255,255,0.9)" }} />
};

function maskAccountNumber(id) {
  const base = String(id * 4937 + 10000).padStart(4, "0");
  return `•••• •••• •••• ${base.slice(-4)}`;
}

function Debts() {

  const navigate = useNavigate();
  const { t } = useLanguage();
  const { debts, loading, error } = useDebts();

  const totalDebt = debts.reduce((sum, d) => sum + (d.balance || 0), 0);
  const chartData = debts.map(d => ({ name: d.type, value: parseFloat(d.balance.toFixed(2)) }));

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: 400 }}>
        <CircularProgress sx={{ color: "#C62828" }} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box>
        <Typography variant="h4" fontWeight="bold" sx={{ mb: 2 }}>{t("debts.title")}</Typography>
        <Alert severity="error" sx={{ borderRadius: 2 }}>Failed to load debts: {error}</Alert>
      </Box>
    );
  }

  if (debts.length === 0) {
    return (
      <Box>
        <Typography variant="h4" fontWeight="bold" sx={{ mb: 2 }}>{t("debts.title")}</Typography>
        <Typography color="text.secondary">No debts found.</Typography>
      </Box>
    );
  }

  return (

    <Box>

      <Typography variant="h4" fontWeight="bold" sx={{ mb: 1 }}>
        {t("debts.title")}
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 4 }}>
        {debts.length} active {debts.length === 1 ? "liability" : "liabilities"}
      </Typography>


      {/* TOTAL DEBT BANNER */}

      <Card
        sx={{
          borderRadius: 4,
          background: "linear-gradient(135deg, #7f0000 0%, #C62828 100%)",
          color: "white",
          mb: 4
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Typography variant="body2" sx={{ opacity: 0.8, mb: 0.5 }}>
            {t("debts.total")}
          </Typography>
          <Typography variant="h3" fontWeight="bold">
            ${totalDebt.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </Typography>
        </CardContent>
      </Card>

      {/* DEBT CARDS + CHART */}

      <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4, mb: 4 }}>

        {/* DEBT CARDS */}

        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>

          {debts.map((d) => {
            const style = DEBT_STYLES[d.type] || DEFAULT_DEBT_STYLE;
            const pct = totalDebt > 0 ? (d.balance / totalDebt) * 100 : 0;

            return (
              <Card key={d.id} sx={{ borderRadius: 4, overflow: "hidden", boxShadow: "0 4px 16px rgba(0,0,0,0.08)" }}>

                <Box sx={{ background: style.gradient, p: 2.5, color: "white" }}>
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 1 }}>
                    <Box>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
                        <Chip
                          label={d.type}
                          size="small"
                          sx={{ backgroundColor: "rgba(255,255,255,0.2)", color: "white", fontWeight: "bold", fontSize: "0.7rem" }}
                        />
                        {d.paidThisMonth && (
                          <Chip
                            icon={<CheckCircleIcon sx={{ fontSize: "14px !important", color: "white !important" }} />}
                            label="Paid this month"
                            size="small"
                            sx={{ backgroundColor: "rgba(255,255,255,0.25)", color: "white", fontWeight: "bold", fontSize: "0.7rem" }}
                          />
                        )}
                      </Box>
                      <Typography variant="h6" fontWeight="bold" sx={{ mb: 0.25 }}>
                        {d.name || d.type}
                      </Typography>
                      <Typography variant="h5" fontWeight="bold">
                        ${d.balance.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </Typography>
                      <Typography variant="caption" sx={{ opacity: 0.7 }}>
                        {maskAccountNumber(d.id)}
                      </Typography>
                    </Box>
                    {style.icon}
                  </Box>
                </Box>

                <CardContent sx={{ pt: 2, pb: "16px !important" }}>
                  {d.lender && (
                    <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                      <Typography variant="body2" color="text.secondary">{t("debts.lender")}</Typography>
                      <Typography variant="body2" fontWeight="bold">{d.lender}</Typography>
                    </Box>
                  )}
                  <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                    <Typography variant="body2" color="text.secondary">{t("debts.apr")}</Typography>
                    <Typography variant="body2" fontWeight="bold">{d.apr}%</Typography>
                  </Box>
                  {d.monthlyPayment != null && (
                    <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                      <Typography variant="body2" color="text.secondary">{t("debts.monthly_payment")}</Typography>
                      <Typography variant="body2" fontWeight="bold">
                        ${d.monthlyPayment.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </Typography>
                    </Box>
                  )}
                  {d.paymentsRemaining != null && (
                    <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                      <Typography variant="body2" color="text.secondary">{t("debts.payments_remaining")}</Typography>
                      <Typography variant="body2" fontWeight="bold">{d.paymentsRemaining} months</Typography>
                    </Box>
                  )}

                  {/* Payment due this month */}
                  {d.nextPaymentDue != null && (
                    <Box
                      sx={{
                        mt: 1.5,
                        mb: 1.5,
                        p: 1.5,
                        borderRadius: 2,
                        backgroundColor: d.paidThisMonth ? "#e8f5e9" : "#fff3e0",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between"
                      }}
                    >
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          {d.paidThisMonth ? t("debts.paid_this_month") : t("debts.due_this_month")}
                        </Typography>
                        <Typography variant="body1" fontWeight="bold" color={d.paidThisMonth ? "#14684D" : "#E65100"}>
                          {d.paidThisMonth
                            ? t("debts.paid")
                            : `$${d.nextPaymentDue.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                          }
                        </Typography>
                      </Box>
                      {d.paidThisMonth
                        ? <CheckCircleIcon sx={{ color: "#14684D", fontSize: 24 }} />
                        : (
                          <Button
                            size="small"
                            variant="contained"
                            onClick={() => navigate("/transfer", { state: { mode: "payment", debtId: d.id } })}
                            sx={{
                              backgroundColor: "#E65100",
                              "&:hover": { backgroundColor: "#bf360c" },
                              textTransform: "none",
                              fontWeight: "bold",
                              borderRadius: 2,
                              fontSize: "0.75rem"
                            }}
                          >
                            {t("debts.pay_now")}
                          </Button>
                        )
                      }
                    </Box>
                  )}

                  <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                    <Typography variant="body2" color="text.secondary">% of Total Debt</Typography>
                    <Typography variant="body2" fontWeight="bold">{pct.toFixed(1)}%</Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={pct}
                    sx={{
                      mt: 0.5,
                      borderRadius: 2,
                      height: 6,
                      backgroundColor: "#ffebee",
                      "& .MuiLinearProgress-bar": { backgroundColor: "#D32F2F" }
                    }}
                  />
                </CardContent>

              </Card>
            );
          })}

        </Box>

        {/* PIE CHART */}

        <Card sx={{ borderRadius: 4, p: 1 }}>
          <CardContent>
            <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
              Debt Distribution
            </Typography>
            <ResponsiveContainer width="100%" height={320}>
              <PieChart>
                <Pie
                  data={chartData}
                  dataKey="value"
                  nameKey="name"
                  outerRadius={120}
                  innerRadius={50}
                >
                  {chartData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => `$${v.toLocaleString()}`} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

      </Box>

    </Box>

  );

}

export default Debts;
