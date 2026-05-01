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
  Alert,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  LinearProgress,
  Tooltip
} from "@mui/material";

import { useState } from "react";
import useAccounts from "../hooks/useAccounts";
import useTransactions from "../hooks/useTransactions";
import { useLanguage } from "../context/LanguageContext";
import { useFinance } from "../context/FinanceContext";
import { createAccount, deleteAccount } from "../services/accountService";

import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import SavingsIcon from "@mui/icons-material/Savings";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import AddIcon from "@mui/icons-material/Add";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";

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

function maskNumber(num) {
  if (!num) return "•••• ••••••";
  return "•••• " + String(num).slice(-4);
}

function Accounts() {
  const { accounts, loading: loadingAccounts, error: errorAccounts } = useAccounts();
  const { transactions, loading: loadingTx, error: errorTx } = useTransactions();
  const { t } = useLanguage();
  const { triggerRefresh } = useFinance();
  const [expanded, setExpanded] = useState(null);

  // Add account dialog
  const [addOpen, setAddOpen] = useState(false);
  const [addForm, setAddForm] = useState({
    account_name: "",
    account_type: "Checking",
    savings_goal_label: "",
    savings_goal_amount: ""
  });
  const [addError, setAddError] = useState("");
  const [addLoading, setAddLoading] = useState(false);

  // Delete confirmation dialog
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const loading = loadingAccounts || loadingTx;
  const error = errorAccounts || errorTx;

  const toggle = (id) => setExpanded(expanded === id ? null : id);

  const totalBalance = accounts.reduce((sum, a) => sum + (a.balance || 0), 0);

  const getRecentForAccount = (accountId) =>
    transactions
      .filter((tx) => Number(tx.account_id) === Number(accountId))
      .slice(0, 3);

  const handleAddOpen = () => {
    setAddForm({ account_name: "", account_type: "Checking", savings_goal_label: "", savings_goal_amount: "" });
    setAddError("");
    setAddOpen(true);
  };

  const handleAddSubmit = async () => {
    if (!addForm.account_name.trim()) {
      setAddError("Account name is required.");
      return;
    }
    setAddLoading(true);
    setAddError("");
    try {
      const payload = {
        account_name: addForm.account_name.trim(),
        account_type: addForm.account_type
      };
      if (addForm.savings_goal_label.trim()) {
        payload.savings_goal_label = addForm.savings_goal_label.trim();
      }
      if (addForm.savings_goal_amount) {
        payload.savings_goal_amount = parseFloat(addForm.savings_goal_amount);
      }
      await createAccount(payload);
      setAddOpen(false);
      triggerRefresh();
    } catch (err) {
      setAddError(err.message || "Failed to create account.");
    } finally {
      setAddLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await deleteAccount(deleteTarget.id);
      setDeleteTarget(null);
      triggerRefresh();
    } catch {
      setDeleteTarget(null);
    } finally {
      setDeleteLoading(false);
    }
  };

  const showGoal = (account) =>
    account.savings_goal_label && account.savings_goal_amount > 0;

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

  return (
    <Box>

      {/* HEADER */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 4 }}>
        <Box>
          <Typography variant="h4" fontWeight="bold">
            {t("accounts.title")}
          </Typography>
          <Typography color="text.secondary" sx={{ mt: 0.5 }}>
            {accounts.length} account{accounts.length !== 1 ? "s" : ""}
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddOpen}
          sx={{ backgroundColor: "#14684D", "&:hover": { backgroundColor: "#0f4f3a" }, borderRadius: 2 }}
        >
          Add Account
        </Button>
      </Box>

      {/* TOTAL BALANCE BANNER */}
      {accounts.length > 0 && (
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
      )}

      {accounts.length === 0 && (
        <Typography color="text.secondary" sx={{ mb: 2 }}>No accounts yet. Add your first account above.</Typography>
      )}

      {/* ACCOUNT CARDS */}
      <Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: 3 }}>

        {accounts.map((account) => {
          const style = ACCOUNT_STYLES[account.type] || DEFAULT_STYLE;
          const recentTx = getRecentForAccount(account.id);
          const isOpen = expanded === account.id;
          const goalPct = showGoal(account)
            ? Math.min(100, (account.balance / account.savings_goal_amount) * 100)
            : 0;

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
              <Box sx={{ background: style.gradient, p: 3, color: "white" }}>

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
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    {style.icon}
                    <Tooltip title="Delete account">
                      <IconButton
                        size="small"
                        onClick={() => setDeleteTarget(account)}
                        sx={{ color: "rgba(255,255,255,0.7)", "&:hover": { color: "white" } }}
                      >
                        <DeleteOutlineIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Box>

                <Typography variant="h4" fontWeight="bold">
                  ${account.balance.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </Typography>

                {/* Masked account/routing numbers */}
                <Box sx={{ mt: 1 }}>
                  <Typography variant="caption" sx={{ opacity: 0.7 }}>
                    Acct: {maskNumber(account.account_number)}
                  </Typography>
                  <Typography variant="caption" sx={{ opacity: 0.7, ml: 2 }}>
                    Routing: {maskNumber(account.routing_number)}
                  </Typography>
                </Box>

              </Box>

              {/* CARD BODY */}
              <CardContent sx={{ pb: 1 }}>

                {/* Savings goal progress bar */}
                {showGoal(account) && (
                  <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                      <Typography variant="body2" fontWeight="bold">
                        Goal: {account.savings_goal_label}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        ${account.balance.toLocaleString("en-US", { maximumFractionDigits: 0 })} / ${account.savings_goal_amount.toLocaleString("en-US", { maximumFractionDigits: 0 })}
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={goalPct}
                      sx={{
                        height: 8,
                        borderRadius: 4,
                        backgroundColor: "#e0e0e0",
                        "& .MuiLinearProgress-bar": { backgroundColor: "#14684D", borderRadius: 4 }
                      }}
                    />
                    <Typography variant="caption" color="text.secondary">
                      {goalPct.toFixed(0)}% of goal reached
                    </Typography>
                  </Box>
                )}

                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <Box>
                    {account.apy > 0 && (
                      <Chip
                        label={`${account.apy}% APY`}
                        size="small"
                        sx={{ backgroundColor: "#e8f5e9", color: "#14684D", fontWeight: "bold" }}
                      />
                    )}
                  </Box>
                  <IconButton size="small" onClick={() => toggle(account.id)}>
                    {isOpen ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                  </IconButton>
                </Box>

                {/* RECENT TRANSACTIONS EXPAND */}
                <Collapse in={isOpen}>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="body2" fontWeight="bold" sx={{ mb: 1 }}>
                    Recent Transactions
                  </Typography>
                  {recentTx.length === 0 ? (
                    <Typography variant="body2" color="text.secondary">No transactions yet.</Typography>
                  ) : (
                    recentTx.map((tx) => (
                      <Box
                        key={tx.id}
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          py: 0.75,
                          borderBottom: "1px solid #f0f0f0"
                        }}
                      >
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          {tx.amount > 0
                            ? <ArrowUpwardIcon sx={{ fontSize: 16, color: "#14684D" }} />
                            : <ArrowDownwardIcon sx={{ fontSize: 16, color: "#D32F2F" }} />
                          }
                          <Box>
                            <Typography variant="body2" fontWeight="bold">
                              {tx.description || tx.category}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {tx.date} • {tx.category}
                            </Typography>
                          </Box>
                        </Box>
                        <Typography
                          variant="body2"
                          fontWeight="bold"
                          sx={{ color: tx.amount > 0 ? "#14684D" : "#D32F2F" }}
                        >
                          {tx.amount > 0 ? "+" : ""}${Math.abs(tx.amount).toFixed(2)}
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

      {/* ADD ACCOUNT DIALOG */}
      <Dialog open={addOpen} onClose={() => setAddOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle fontWeight="bold">Add New Account</DialogTitle>
        <DialogContent>
          {addError && <Alert severity="error" sx={{ mb: 2 }}>{addError}</Alert>}
          <TextField
            label="Account Name"
            fullWidth
            value={addForm.account_name}
            onChange={(e) => setAddForm({ ...addForm, account_name: e.target.value })}
            sx={{ mt: 1, mb: 2 }}
          />
          <TextField
            select
            label="Account Type"
            fullWidth
            value={addForm.account_type}
            onChange={(e) => setAddForm({ ...addForm, account_type: e.target.value })}
            sx={{ mb: 2 }}
          >
            <MenuItem value="Checking">Checking</MenuItem>
            <MenuItem value="Savings">Savings</MenuItem>
            <MenuItem value="HYSA">HYSA (High-Yield Savings)</MenuItem>
          </TextField>

          {(addForm.account_type === "Savings" || addForm.account_type === "HYSA") && (
            <>
              <Divider sx={{ my: 1 }} />
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                Optional: Set a savings goal
              </Typography>
              <TextField
                label="Goal Label (e.g. Vacation, Emergency Fund)"
                fullWidth
                value={addForm.savings_goal_label}
                onChange={(e) => setAddForm({ ...addForm, savings_goal_label: e.target.value })}
                sx={{ mb: 2 }}
              />
              <TextField
                label="Goal Amount ($)"
                type="number"
                fullWidth
                value={addForm.savings_goal_amount}
                onChange={(e) => setAddForm({ ...addForm, savings_goal_amount: e.target.value })}
                inputProps={{ min: 0 }}
              />
            </>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setAddOpen(false)} disabled={addLoading}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleAddSubmit}
            disabled={addLoading}
            sx={{ backgroundColor: "#14684D", "&:hover": { backgroundColor: "#0f4f3a" } }}
          >
            {addLoading ? "Creating..." : "Create Account"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* DELETE CONFIRMATION DIALOG */}
      <Dialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)}>
        <DialogTitle fontWeight="bold">Delete Account</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete <strong>{deleteTarget?.name}</strong>? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDeleteTarget(null)} disabled={deleteLoading}>Cancel</Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleDeleteConfirm}
            disabled={deleteLoading}
          >
            {deleteLoading ? "Deleting..." : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>

    </Box>
  );
}

export default Accounts;
