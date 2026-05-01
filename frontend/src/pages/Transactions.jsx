import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  MenuItem,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  InputAdornment,
  CircularProgress,
  Alert,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  ToggleButtonGroup,
  ToggleButton,
  Divider,
  IconButton,
  Tooltip
} from "@mui/material";

import SearchIcon from "@mui/icons-material/Search";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import FilterListIcon from "@mui/icons-material/FilterList";
import AddIcon from "@mui/icons-material/Add";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";

import { useState, useMemo, useEffect } from "react";
import useTransactions from "../hooks/useTransactions";
import useAccounts from "../hooks/useAccounts";
import { useLanguage } from "../context/LanguageContext";
import { useFinance } from "../context/FinanceContext";
import { createTransaction, deleteTransaction } from "../services/transactionService";
import { apiRequest } from "../services/apiClient";

const MONTHS = [
  { value: 1, label: "January" }, { value: 2, label: "February" },
  { value: 3, label: "March" }, { value: 4, label: "April" },
  { value: 5, label: "May" }, { value: 6, label: "June" },
  { value: 7, label: "July" }, { value: 8, label: "August" },
  { value: 9, label: "September" }, { value: 10, label: "October" },
  { value: 11, label: "November" }, { value: 12, label: "December" }
];

const CATEGORY_COLORS = {
  Income: { bg: "#e8f5e9", color: "#14684D" },
  Food: { bg: "#fff3e0", color: "#E65100" },
  Shopping: { bg: "#e3f2fd", color: "#1565C0" },
  Utilities: { bg: "#f3e5f5", color: "#6A1B9A" },
  Transportation: { bg: "#e0f7fa", color: "#006064" },
  Bills: { bg: "#fce4ec", color: "#880E4F" },
  Subscriptions: { bg: "#e8eaf6", color: "#283593" },
  Memberships: { bg: "#fff8e1", color: "#F57F17" },
  "Loan Payment": { bg: "#fbe9e7", color: "#BF360C" }
};

function CategoryChip({ category }) {
  const style = CATEGORY_COLORS[category] || { bg: "#f5f5f5", color: "#616161" };
  return (
    <Chip
      label={category}
      size="small"
      sx={{ backgroundColor: style.bg, color: style.color, fontWeight: "bold", fontSize: "0.72rem" }}
    />
  );
}

const EMPTY_FORM = {
  account_id: "",
  type: "expense",
  amount: "",
  category_id: "",
  description: "",
  date: new Date().toISOString().split("T")[0]
};

function Transactions() {
  const { t } = useLanguage();
  const { transactions, loading, error } = useTransactions();
  const { accounts } = useAccounts();
  const { triggerRefresh } = useFinance();

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [filterMonth, setFilterMonth] = useState("");
  const [filterYear, setFilterYear] = useState("");

  // Categories from backend
  const [categories, setCategories] = useState([]);
  useEffect(() => {
    apiRequest("/api/categories")
      .then(setCategories)
      .catch(() => {});
  }, []);

  // Add dialog
  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [addError, setAddError] = useState("");
  const [addLoading, setAddLoading] = useState(false);

  // Delete dialog
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const availableYears = useMemo(() => {
    const years = new Set(
      transactions.map((tx) => tx.date?.split("-")[0]).filter(Boolean)
    );
    return Array.from(years).sort((a, b) => b - a);
  }, [transactions]);

  const filtered = transactions.filter(tx => {
    const matchesSearch = (tx.description || "").toLowerCase().includes(search.toLowerCase());
    const matchesCategory = category === "" || tx.category === category;
    const [txYear, txMonth] = (tx.date || "").split("-");
    const matchesMonth = filterMonth === "" || parseInt(txMonth) === parseInt(filterMonth);
    const matchesYear = filterYear === "" || txYear === filterYear;
    return matchesSearch && matchesCategory && matchesMonth && matchesYear;
  });

  const totalIncome = filtered.filter(tx => tx.amount > 0).reduce((s, tx) => s + tx.amount, 0);
  const totalExpenses = filtered.filter(tx => tx.amount < 0).reduce((s, tx) => s + Math.abs(tx.amount), 0);

  const filteredCategories = categories.filter(c =>
    form.type === "income" ? c.type === "Income" : c.type === "Expense"
  );

  const handleOpenAdd = () => {
    setForm(EMPTY_FORM);
    setAddError("");
    setAddOpen(true);
  };

  const handleAddSubmit = async () => {
    if (!form.account_id) { setAddError("Please select an account."); return; }
    if (!form.amount || isNaN(form.amount) || Number(form.amount) <= 0) {
      setAddError("Please enter a valid amount greater than 0."); return;
    }
    if (!form.category_id) { setAddError("Please select a category."); return; }
    if (!form.date) { setAddError("Please select a date."); return; }

    setAddLoading(true);
    setAddError("");
    try {
      const signedAmount = form.type === "expense"
        ? -Math.abs(Number(form.amount))
        : Math.abs(Number(form.amount));

      await createTransaction({
        account_id: Number(form.account_id),
        category_id: Number(form.category_id),
        amount: signedAmount,
        description: form.description.trim() || null,
        transaction_date: form.date
      });

      setAddOpen(false);
      triggerRefresh();
    } catch (err) {
      setAddError(err.message || "Failed to add transaction.");
    } finally {
      setAddLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await deleteTransaction(deleteTarget.id);
      setDeleteTarget(null);
      triggerRefresh();
    } catch {
      setDeleteTarget(null);
    } finally {
      setDeleteLoading(false);
    }
  };

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
          Failed to load transactions: {error}
        </Alert>
      )}

      {/* HEADER */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 1 }}>
        <Box>
          <Typography variant="h4" fontWeight="bold">
            {t("transactions.title")}
          </Typography>
          <Typography color="text.secondary" sx={{ mt: 0.5 }}>
            {transactions.length} {t("transactions.subtitle").toLowerCase()}
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenAdd}
          sx={{ backgroundColor: "#14684D", "&:hover": { backgroundColor: "#0f4f3a" }, borderRadius: 2 }}
        >
          Add Transaction
        </Button>
      </Box>

      {/* SUMMARY STRIP */}
      <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 3, mb: 4, mt: 3 }}>
        <Card sx={{ borderRadius: 4, background: "linear-gradient(135deg, #14684D, #1a8a65)", color: "white" }}>
          <CardContent sx={{ py: 2 }}>
            <Typography variant="body2" sx={{ opacity: 0.8 }}>Total Income</Typography>
            <Typography variant="h5" fontWeight="bold">
              +${totalIncome.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </Typography>
          </CardContent>
        </Card>
        <Card sx={{ borderRadius: 4, background: "linear-gradient(135deg, #C62828, #D32F2F)", color: "white" }}>
          <CardContent sx={{ py: 2 }}>
            <Typography variant="body2" sx={{ opacity: 0.8 }}>Total Expenses</Typography>
            <Typography variant="h5" fontWeight="bold">
              -${totalExpenses.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </Typography>
          </CardContent>
        </Card>
      </Box>

      {/* FILTERS */}
      <Box sx={{ display: "flex", gap: 2, mb: 3, flexWrap: "wrap" }}>
        <TextField
          label="Search transactions"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          size="small"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            )
          }}
          sx={{ flex: 1, minWidth: 200 }}
        />
        <TextField
          select label="Month" value={filterMonth}
          onChange={(e) => setFilterMonth(e.target.value)}
          size="small" sx={{ minWidth: 140 }}
        >
          <MenuItem value="">All Months</MenuItem>
          {MONTHS.map((m) => (
            <MenuItem key={m.value} value={m.value}>{m.label}</MenuItem>
          ))}
        </TextField>
        <TextField
          select label="Year" value={filterYear}
          onChange={(e) => setFilterYear(e.target.value)}
          size="small" sx={{ minWidth: 110 }}
        >
          <MenuItem value="">All Years</MenuItem>
          {availableYears.map((y) => (
            <MenuItem key={y} value={y}>{y}</MenuItem>
          ))}
        </TextField>
        <TextField
          select label="Category" value={category}
          onChange={(e) => setCategory(e.target.value)}
          size="small" sx={{ minWidth: 180 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <FilterListIcon fontSize="small" />
              </InputAdornment>
            )
          }}
        >
          <MenuItem value="">All Categories</MenuItem>
          {categories.map((c) => (
            <MenuItem key={c.id} value={c.name}>{c.name}</MenuItem>
          ))}
        </TextField>
      </Box>

      {/* TABLE */}
      <Card sx={{ borderRadius: 4, overflow: "hidden" }}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: "#f8f9fa" }}>
              <TableCell sx={{ fontWeight: "bold", color: "#555" }}>Date</TableCell>
              <TableCell sx={{ fontWeight: "bold", color: "#555" }}>Description</TableCell>
              <TableCell sx={{ fontWeight: "bold", color: "#555" }}>Category</TableCell>
              <TableCell align="right" sx={{ fontWeight: "bold", color: "#555" }}>Amount</TableCell>
              <TableCell align="center" sx={{ fontWeight: "bold", color: "#555" }}></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 4, color: "text.secondary" }}>
                  No transactions found.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((tx) => (
                <TableRow key={tx.id} hover sx={{ "&:hover": { backgroundColor: "#fafafa" } }}>
                  <TableCell sx={{ color: "text.secondary", fontSize: "0.85rem" }}>{tx.date}</TableCell>
                  <TableCell>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Box sx={{
                        width: 30, height: 30, borderRadius: "50%",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        backgroundColor: tx.amount > 0 ? "#e8f5e9" : "#ffebee", flexShrink: 0
                      }}>
                        {tx.amount > 0
                          ? <ArrowUpwardIcon sx={{ fontSize: 14, color: "#14684D" }} />
                          : <ArrowDownwardIcon sx={{ fontSize: 14, color: "#D32F2F" }} />
                        }
                      </Box>
                      <Typography variant="body2" fontWeight="bold">
                        {tx.description || "—"}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell><CategoryChip category={tx.category} /></TableCell>
                  <TableCell align="right">
                    <Typography fontWeight="bold" sx={{ color: tx.amount > 0 ? "#14684D" : "#D32F2F" }}>
                      {tx.amount > 0 ? "+" : ""}${Math.abs(tx.amount).toFixed(2)}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Tooltip title="Delete transaction">
                      <IconButton
                        size="small"
                        onClick={() => setDeleteTarget(tx)}
                        sx={{ color: "#bbb", "&:hover": { color: "#D32F2F" } }}
                      >
                        <DeleteOutlineIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      {/* ADD TRANSACTION DIALOG */}
      <Dialog open={addOpen} onClose={() => setAddOpen(false)} maxWidth="sm" fullWidth>

        {/* Header banner */}
        <Box sx={{
          background: "linear-gradient(135deg, #0d3d2e 0%, #14684D 100%)",
          px: 3, py: 2.5,
          display: "flex", alignItems: "center", gap: 1.5
        }}>
          <AccountBalanceWalletIcon sx={{ color: "white", fontSize: 28 }} />
          <Typography variant="h6" fontWeight="bold" color="white">
            New Transaction
          </Typography>
        </Box>

        <DialogContent sx={{ pt: 3 }}>

          {addError && <Alert severity="error" sx={{ mb: 2 }}>{addError}</Alert>}

          {/* Transaction type toggle */}
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            Transaction Type
          </Typography>
          <ToggleButtonGroup
            value={form.type}
            exclusive
            onChange={(_, val) => {
              if (val) setForm({ ...form, type: val, category_id: "" });
            }}
            fullWidth
            sx={{ mb: 3 }}
          >
            <ToggleButton
              value="expense"
              sx={{
                fontWeight: "bold",
                "&.Mui-selected": { backgroundColor: "#ffebee", color: "#C62828", borderColor: "#C62828" }
              }}
            >
              <ArrowDownwardIcon sx={{ fontSize: 16, mr: 0.5 }} /> Expense
            </ToggleButton>
            <ToggleButton
              value="income"
              sx={{
                fontWeight: "bold",
                "&.Mui-selected": { backgroundColor: "#e8f5e9", color: "#14684D", borderColor: "#14684D" }
              }}
            >
              <ArrowUpwardIcon sx={{ fontSize: 16, mr: 0.5 }} /> Income
            </ToggleButton>
          </ToggleButtonGroup>

          <Divider sx={{ mb: 3 }} />

          {/* Account */}
          <TextField
            select
            label="Account"
            fullWidth
            value={form.account_id}
            onChange={(e) => setForm({ ...form, account_id: e.target.value })}
            sx={{ mb: 2 }}
          >
            {accounts.length === 0
              ? <MenuItem disabled>No accounts available</MenuItem>
              : accounts.map((a) => (
                <MenuItem key={a.id} value={a.id}>{a.name} ({a.type})</MenuItem>
              ))
            }
          </TextField>

          {/* Amount */}
          <TextField
            label="Amount"
            type="number"
            fullWidth
            value={form.amount}
            onChange={(e) => setForm({ ...form, amount: e.target.value })}
            inputProps={{ min: 0, step: "0.01" }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <AttachMoneyIcon fontSize="small" />
                </InputAdornment>
              )
            }}
            sx={{ mb: 2 }}
          />

          {/* Category */}
          <TextField
            select
            label="Category"
            fullWidth
            value={form.category_id}
            onChange={(e) => setForm({ ...form, category_id: e.target.value })}
            sx={{ mb: 2 }}
          >
            {filteredCategories.length === 0
              ? <MenuItem disabled>No categories available</MenuItem>
              : filteredCategories.map((c) => (
                <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
              ))
            }
          </TextField>

          {/* Description */}
          <TextField
            label="Description (optional)"
            fullWidth
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="e.g. Grocery run, Netflix subscription..."
            sx={{ mb: 2 }}
          />

          {/* Date */}
          <TextField
            label="Date"
            type="date"
            fullWidth
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
            InputLabelProps={{ shrink: true }}
          />

        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={() => setAddOpen(false)} disabled={addLoading}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleAddSubmit}
            disabled={addLoading}
            sx={{ backgroundColor: "#14684D", "&:hover": { backgroundColor: "#0f4f3a" }, px: 3 }}
          >
            {addLoading ? "Saving..." : "Add Transaction"}
          </Button>
        </DialogActions>

      </Dialog>

      {/* DELETE CONFIRMATION DIALOG */}
      <Dialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)}>
        <DialogTitle fontWeight="bold">Delete Transaction</DialogTitle>
        <DialogContent>
          <Typography>
            Delete <strong>{deleteTarget?.description || "this transaction"}</strong> for{" "}
            <strong>${Math.abs(deleteTarget?.amount || 0).toFixed(2)}</strong>?
            This cannot be undone.
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

export default Transactions;
