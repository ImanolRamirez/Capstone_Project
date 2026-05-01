import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  MenuItem,
  Button,
  Divider,
  Alert,
  InputAdornment,
  Chip,
  CircularProgress,
  ToggleButtonGroup,
  ToggleButton
} from "@mui/material";

import SwapHorizIcon from "@mui/icons-material/SwapHoriz";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import PaymentIcon from "@mui/icons-material/Payment";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

import { useState } from "react";
import { useLocation } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import useAccounts from "../hooks/useAccounts";
import useDebts from "../hooks/useDebts";
import { makeTransfer } from "../services/transferService";
import { useFinance } from "../context/FinanceContext";

function Transfer() {

  const location = useLocation();
  const { t } = useLanguage();
  const { triggerRefresh } = useFinance();
  const { accounts, loading: loadingAccounts } = useAccounts();
  const { debts, loading: loadingDebts } = useDebts();

  const [mode, setMode] = useState(location.state?.mode || "transfer"); // "transfer" | "payment"

  const [fromId, setFromId] = useState("");
  const [toId, setToId] = useState(location.state?.debtId ? String(location.state.debtId) : "");
  const [amount, setAmount] = useState("");
  const [memo, setMemo] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const isPayment = mode === "payment";

  // Source is always asset accounts
  const sourceAccounts = accounts;
  // Destination depends on mode
  const destinationAccounts = isPayment ? debts : accounts;

  const fromAccount = sourceAccounts.find(a => String(a.id) === String(fromId));
  const toAccount = destinationAccounts.find(a => String(a.id) === String(toId));

  const amountNum = parseFloat(amount) || 0;
  const insufficientFunds = fromAccount != null && amountNum > 0 && amountNum > fromAccount.balance;

  const handleModeChange = (_, newMode) => {
    if (!newMode) return;
    setMode(newMode);
    setFromId("");
    setToId("");
    setAmount("");
    setMemo("");
    setError("");
  };

  const handleTransfer = async () => {
    setError("");

    if (!fromId || !toId) {
      setError("Please select both a source and destination account.");
      return;
    }
    if (!isPayment && String(fromId) === String(toId)) {
      setError("Source and destination accounts must be different.");
      return;
    }
    if (amountNum <= 0) {
      setError("Please enter a valid amount greater than $0.");
      return;
    }
    if (fromAccount && amountNum > fromAccount.balance) {
      setError("Insufficient funds in the selected account.");
      return;
    }

    setSubmitting(true);
    try {
      const data = await makeTransfer({
        from_account_id: fromId,
        to_account_id: toId,
        amount: amountNum,
        memo
      });
      setResult(data);
      triggerRefresh(); // update balances everywhere
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setFromId("");
    setToId("");
    setAmount("");
    setMemo("");
    setResult(null);
    setError("");
  };

  if (result) {
    const isDebt = result.is_debt_payment;
    return (
      <Box>
        <Typography variant="h4" fontWeight="bold" sx={{ mb: 1 }}>
          {isDebt ? t("transfer.payment_title") : t("transfer.title")}
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 4 }}>
          {isDebt ? t("transfer.payment_subtitle") : t("transfer.subtitle")}
        </Typography>

        <Card sx={{ borderRadius: 4, maxWidth: 520, mx: "auto" }}>
          <CardContent sx={{ p: 5, textAlign: "center" }}>
            <CheckCircleIcon sx={{ fontSize: 72, color: "#14684D", mb: 2 }} />
            <Typography variant="h5" fontWeight="bold" sx={{ mb: 1 }}>
              {isDebt ? t("transfer.payment_success") : t("transfer.success")}
            </Typography>
            <Typography color="text.secondary" sx={{ mb: 3 }}>
              ${result.amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {isDebt ? "paid toward" : "transferred from"}{" "}
              <strong>{result.from_account.name}</strong> {isDebt ? "to" : "to"} <strong>{result.to_account.name}</strong>.
            </Typography>

            <Box sx={{ textAlign: "left", backgroundColor: "#f8f9fa", borderRadius: 3, p: 2.5, mb: 3 }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                <Typography variant="body2" color="text.secondary">{result.from_account.name} new balance</Typography>
                <Typography variant="body2" fontWeight="bold" color="#C62828">
                  ${result.from_account.new_balance.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </Typography>
              </Box>
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography variant="body2" color="text.secondary">
                  {isDebt ? `${result.to_account.name} remaining balance` : `${result.to_account.name} new balance`}
                </Typography>
                <Typography variant="body2" fontWeight="bold" color={isDebt ? "#C62828" : "#14684D"}>
                  ${result.to_account.new_balance.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </Typography>
              </Box>
            </Box>

            {memo && (
              <Chip label={`Memo: ${memo}`} sx={{ mb: 3, backgroundColor: "#e8f5e9", color: "#14684D" }} />
            )}
            <Button
              fullWidth
              variant="contained"
              onClick={handleReset}
              sx={{
                borderRadius: 3,
                py: 1.5,
                backgroundColor: "#14684D",
                "&:hover": { backgroundColor: "#0d5040" },
                textTransform: "none",
                fontWeight: "bold",
                fontSize: "1rem"
              }}
            >
              {isDebt ? t("transfer.another_payment") : t("transfer.another")}
            </Button>
          </CardContent>
        </Card>
      </Box>
    );
  }

  if (loadingAccounts || loadingDebts) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: 400 }}>
        <CircularProgress sx={{ color: "#14684D" }} />
      </Box>
    );
  }

  return (

    <Box>

      <Typography variant="h4" fontWeight="bold" sx={{ mb: 1 }}>
        {isPayment ? t("transfer.payment_title") : t("transfer.title")}
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        {isPayment ? t("transfer.payment_subtitle") : t("transfer.subtitle")}
      </Typography>

      {/* MODE TOGGLE */}

      <ToggleButtonGroup
        value={mode}
        exclusive
        onChange={handleModeChange}
        sx={{ mb: 4 }}
      >
        <ToggleButton
          value="transfer"
          sx={{
            textTransform: "none",
            fontWeight: "bold",
            px: 3,
            "&.Mui-selected": { backgroundColor: "#14684D", color: "white", "&:hover": { backgroundColor: "#0d5040" } }
          }}
        >
          <SwapHorizIcon sx={{ mr: 1, fontSize: 18 }} />
          {t("nav.transfer")}
        </ToggleButton>
        <ToggleButton
          value="payment"
          sx={{
            textTransform: "none",
            fontWeight: "bold",
            px: 3,
            "&.Mui-selected": { backgroundColor: "#14684D", color: "white", "&:hover": { backgroundColor: "#0d5040" } }
          }}
        >
          <PaymentIcon sx={{ mr: 1, fontSize: 18 }} />
          {t("transfer.payment_title")}
        </ToggleButton>
      </ToggleButtonGroup>

      <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4, alignItems: "start" }}>

        {/* FORM */}

        <Card sx={{ borderRadius: 4 }}>
          <CardContent sx={{ p: 4 }}>

            <Typography variant="h6" fontWeight="bold" sx={{ mb: 3 }}>
              {isPayment ? t("transfer.payment_preview") : t("transfer.preview")}
            </Typography>

            {error && (
              <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                {error}
              </Alert>
            )}

            {/* FROM */}

            <Typography variant="body2" fontWeight="bold" color="text.secondary" sx={{ mb: 1 }}>
              From Account
            </Typography>
            <TextField
              select
              fullWidth
              value={fromId}
              onChange={(e) => setFromId(e.target.value)}
              size="small"
              sx={{ mb: 3 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <AccountBalanceIcon sx={{ fontSize: 18, color: "#888" }} />
                  </InputAdornment>
                )
              }}
            >
              <MenuItem value="">Select account</MenuItem>
              {sourceAccounts.map(a => (
                <MenuItem key={a.id} value={a.id}>
                  {a.name} — ${a.balance.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </MenuItem>
              ))}
            </TextField>

            {/* SWAP / ARROW ICON */}

            <Box sx={{ display: "flex", justifyContent: "center", mb: 3 }}>
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: "50%",
                  backgroundColor: isPayment ? "#ffebee" : "#e8f5e9",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}
              >
                {isPayment
                  ? <PaymentIcon sx={{ color: "#C62828" }} />
                  : <SwapHorizIcon sx={{ color: "#14684D" }} />
                }
              </Box>
            </Box>

            {/* TO */}

            <Typography variant="body2" fontWeight="bold" color="text.secondary" sx={{ mb: 1 }}>
              {isPayment ? "Pay Toward" : "To Account"}
            </Typography>
            <TextField
              select
              fullWidth
              value={toId}
              onChange={(e) => setToId(e.target.value)}
              size="small"
              sx={{ mb: 3 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <AccountBalanceIcon sx={{ fontSize: 18, color: "#888" }} />
                  </InputAdornment>
                )
              }}
            >
              <MenuItem value="">Select {isPayment ? "debt" : "account"}</MenuItem>
              {destinationAccounts.map(a => (
                <MenuItem key={a.id} value={a.id}>
                  {isPayment
                    ? `${a.name || a.type} — $${a.balance.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} owed`
                    : `${a.name} — $${a.balance.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                  }
                </MenuItem>
              ))}
            </TextField>

            {/* AMOUNT */}

            <Typography variant="body2" fontWeight="bold" color="text.secondary" sx={{ mb: 1 }}>
              Amount
            </Typography>
            <TextField
              fullWidth
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              size="small"
              sx={{ mb: 3 }}
              InputProps={{
                startAdornment: <InputAdornment position="start">$</InputAdornment>
              }}
            />

            {/* MEMO */}

            <Typography variant="body2" fontWeight="bold" color="text.secondary" sx={{ mb: 1 }}>
              Memo <Typography component="span" variant="caption" color="text.secondary">(optional)</Typography>
            </Typography>
            <TextField
              fullWidth
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              placeholder={isPayment ? "e.g. Extra payment, lump sum..." : "e.g. Rent, Savings goal..."}
              size="small"
              sx={{ mb: 4 }}
            />

            {insufficientFunds && (
              <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
                Insufficient funds — available balance is ${fromAccount.balance.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}.
              </Alert>
            )}

            <Button
              fullWidth
              variant="contained"
              onClick={handleTransfer}
              disabled={submitting || insufficientFunds}
              sx={{
                borderRadius: 3,
                py: 1.5,
                backgroundColor: isPayment ? "#C62828" : "#14684D",
                "&:hover": { backgroundColor: isPayment ? "#b71c1c" : "#0d5040" },
                "&.Mui-disabled": { backgroundColor: "#bdbdbd", color: "white" },
                textTransform: "none",
                fontWeight: "bold",
                fontSize: "1rem"
              }}
            >
              {submitting
                ? <CircularProgress size={22} sx={{ color: "white" }} />
                : isPayment ? t("transfer.confirm_payment") : t("transfer.confirm")
              }
            </Button>

          </CardContent>
        </Card>

        {/* SUMMARY PANEL */}

        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>

          {/* PREVIEW */}

          <Card sx={{ borderRadius: 4 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
                {isPayment ? "Payment Preview" : "Transfer Preview"}
              </Typography>
              <Divider sx={{ mb: 2 }} />

              <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1.5 }}>
                <Typography variant="body2" color="text.secondary">From</Typography>
                <Typography variant="body2" fontWeight="bold">
                  {fromAccount ? fromAccount.name : "—"}
                </Typography>
              </Box>

              <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1.5 }}>
                <Typography variant="body2" color="text.secondary">
                  {isPayment ? "Paying Toward" : "To"}
                </Typography>
                <Typography variant="body2" fontWeight="bold">
                  {toAccount ? (toAccount.name || toAccount.type) : "—"}
                </Typography>
              </Box>

              <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1.5 }}>
                <Typography variant="body2" color="text.secondary">Amount</Typography>
                <Typography variant="body2" fontWeight="bold" color={amountNum > 0 ? (isPayment ? "#C62828" : "#14684D") : "text.secondary"}>
                  {amountNum > 0
                    ? `$${amountNum.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                    : "—"
                  }
                </Typography>
              </Box>

              {memo && (
                <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1.5 }}>
                  <Typography variant="body2" color="text.secondary">Memo</Typography>
                  <Typography variant="body2" fontWeight="bold">{memo}</Typography>
                </Box>
              )}

              {fromAccount && amountNum > 0 && (
                <>
                  <Divider sx={{ my: 2 }} />

                  {insufficientFunds ? (
                    <Box sx={{ backgroundColor: "#ffebee", borderRadius: 2, p: 1.5, display: "flex", alignItems: "center", gap: 1 }}>
                      <Typography variant="body2" fontWeight="bold" color="#C62828">
                        ✕ Insufficient funds — only ${fromAccount.balance.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} available
                      </Typography>
                    </Box>
                  ) : (
                    <>
                      <Box sx={{ display: "flex", justifyContent: "space-between", mb: isPayment ? 1 : 0 }}>
                        <Typography variant="body2" color="text.secondary">
                          {isPayment ? "Checking After Payment" : "Remaining Balance"}
                        </Typography>
                        <Typography variant="body2" fontWeight="bold" color="#14684D">
                          ${(fromAccount.balance - amountNum).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </Typography>
                      </Box>
                      {isPayment && toAccount && amountNum > 0 && (
                        <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                          <Typography variant="body2" color="text.secondary">Debt After Payment</Typography>
                          <Typography variant="body2" fontWeight="bold" color="#C62828">
                            ${(toAccount.balance - amountNum).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </Typography>
                        </Box>
                      )}
                    </>
                  )}
                </>
              )}
            </CardContent>
          </Card>

          {/* ACCOUNTS LIST */}

          <Card sx={{ borderRadius: 4 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
                {isPayment ? "Your Debts" : "Your Accounts"}
              </Typography>
              <Divider sx={{ mb: 2 }} />
              {(isPayment ? debts : accounts).length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  {isPayment ? "No debts found." : "No accounts available."}
                </Typography>
              ) : (
                (isPayment ? debts : accounts).map(a => {
                  const dotColor = isPayment ? "#C62828" :
                    a.type === "Checking" ? "#14684D" :
                    a.type === "Savings" ? "#1565C0" :
                    "#6A1B9A";
                  return (
                    <Box key={a.id} sx={{ display: "flex", justifyContent: "space-between", py: 1, borderBottom: "1px solid #f5f5f5" }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <Box sx={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: dotColor }} />
                        <Box>
                          <Typography variant="body2">{a.name || a.type}</Typography>
                          <Typography variant="caption" color="text.secondary">{a.type}</Typography>
                        </Box>
                      </Box>
                      <Typography variant="body2" fontWeight="bold">
                        ${a.balance.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        {isPayment && <Typography component="span" variant="caption" color="text.secondary"> owed</Typography>}
                      </Typography>
                    </Box>
                  );
                })
              )}
            </CardContent>
          </Card>

        </Box>

      </Box>

    </Box>

  );

}

export default Transfer;
