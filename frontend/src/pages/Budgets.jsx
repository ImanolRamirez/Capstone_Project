import {
  Box,
  Typography,
  Card,
  CardContent,
  LinearProgress,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  IconButton,
  Chip,
  CircularProgress,
  Alert,
  Divider
} from "@mui/material";

import AddIcon from "@mui/icons-material/Add";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";

import { useState, useEffect, useCallback } from "react";
import { getBudgets, createBudget, updateBudget, deleteBudget } from "../services/budgetService";

const CATEGORIES = [
  { id: null, name: "Food" },
  { id: null, name: "Shopping" },
  { id: null, name: "Utilities" },
  { id: null, name: "Transportation" },
  { id: null, name: "Bills" },
  { id: null, name: "Subscriptions" },
  { id: null, name: "Memberships" }
];

const MONTH_NAMES = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December"
];

// Category colors matching Transactions page
const CATEGORY_COLORS = {
  Food:           { bg: "#fff3e0", color: "#E65100" },
  Shopping:       { bg: "#e3f2fd", color: "#1565C0" },
  Utilities:      { bg: "#f3e5f5", color: "#6A1B9A" },
  Transportation: { bg: "#e0f7fa", color: "#006064" },
  Bills:          { bg: "#fce4ec", color: "#880E4F" },
  Subscriptions:  { bg: "#e8eaf6", color: "#283593" },
  Memberships:    { bg: "#fff8e1", color: "#F57F17" }
};

function Budgets() {

  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());

  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Add/Edit dialog
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null); // budget object if editing
  const [form, setForm] = useState({ category: "", category_id: "", amount: "" });
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  const load = useCallback(() => {
    setLoading(true);
    setError("");
    getBudgets(month, year)
      .then(setBudgets)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [month, year]);

  useEffect(() => { load(); }, [load]);

  const totalBudgeted = budgets.reduce((s, b) => s + b.amount, 0);
  const totalSpent = budgets.reduce((s, b) => s + b.spent, 0);
  const overBudget = budgets.filter(b => b.spent > b.amount).length;

  const openAdd = () => {
    setEditing(null);
    setForm({ category: "", category_id: "", amount: "" });
    setFormError("");
    setDialogOpen(true);
  };

  const openEdit = (b) => {
    setEditing(b);
    setForm({ category: b.category, category_id: b.category_id, amount: String(b.amount) });
    setFormError("");
    setDialogOpen(true);
  };

  const handleSave = async () => {
    setFormError("");
    if (!form.category) { setFormError("Please select a category."); return; }
    if (!form.amount || parseFloat(form.amount) <= 0) { setFormError("Please enter a valid amount."); return; }

    // Check for duplicate category in add mode
    if (!editing && budgets.some(b => b.category === form.category)) {
      setFormError("A budget for this category already exists this month.");
      return;
    }

    setSaving(true);
    try {
      if (editing) {
        await updateBudget(editing.id, parseFloat(form.amount));
      } else {
        await createBudget({
          category_id: form.category_id,
          amount: parseFloat(form.amount),
          month,
          year
        });
      }
      setDialogOpen(false);
      load();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteBudget(id);
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  const years = [year - 1, year, year + 1];

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: 400 }}>
        <CircularProgress sx={{ color: "#14684D" }} />
      </Box>
    );
  }

  return (

    <Box>

      {/* HEADER */}

      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 4 }}>
        <Box>
          <Typography variant="h4" fontWeight="bold" sx={{ mb: 0.5 }}>
            Budgets
          </Typography>
          <Typography color="text.secondary">
            Track your spending against monthly targets
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={openAdd}
          sx={{
            backgroundColor: "#14684D",
            "&:hover": { backgroundColor: "#0d5040" },
            borderRadius: 3,
            textTransform: "none",
            fontWeight: "bold"
          }}
        >
          Add Budget
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>{error}</Alert>}

      {/* MONTH SELECTOR */}

      <Box sx={{ display: "flex", gap: 2, mb: 4 }}>
        <TextField
          select
          label="Month"
          value={month}
          onChange={e => setMonth(Number(e.target.value))}
          size="small"
          sx={{ minWidth: 140 }}
        >
          {MONTH_NAMES.map((m, i) => (
            <MenuItem key={i} value={i + 1}>{m}</MenuItem>
          ))}
        </TextField>
        <TextField
          select
          label="Year"
          value={year}
          onChange={e => setYear(Number(e.target.value))}
          size="small"
          sx={{ minWidth: 100 }}
        >
          {years.map(y => <MenuItem key={y} value={y}>{y}</MenuItem>)}
        </TextField>
      </Box>

      {/* SUMMARY CARDS */}

      <Box sx={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 3, mb: 4 }}>

        <Card sx={{ borderRadius: 4, background: "linear-gradient(135deg, #14684D, #1a8a65)", color: "white" }}>
          <CardContent sx={{ py: 2.5 }}>
            <Typography variant="body2" sx={{ opacity: 0.85 }}>Total Budgeted</Typography>
            <Typography variant="h5" fontWeight="bold">
              ${totalBudgeted.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.75 }}>
              {MONTH_NAMES[month - 1]} {year}
            </Typography>
          </CardContent>
        </Card>

        <Card sx={{ borderRadius: 4, background: "linear-gradient(135deg, #C62828, #D32F2F)", color: "white" }}>
          <CardContent sx={{ py: 2.5 }}>
            <Typography variant="body2" sx={{ opacity: 0.85 }}>Total Spent</Typography>
            <Typography variant="h5" fontWeight="bold">
              ${totalSpent.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.75 }}>
              {totalBudgeted > 0 ? `${((totalSpent / totalBudgeted) * 100).toFixed(0)}% of budget used` : "No budgets set"}
            </Typography>
          </CardContent>
        </Card>

        <Card sx={{ borderRadius: 4, background: overBudget > 0 ? "linear-gradient(135deg, #E65100, #FF5722)" : "linear-gradient(135deg, #1565C0, #1976D2)", color: "white" }}>
          <CardContent sx={{ py: 2.5 }}>
            <Typography variant="body2" sx={{ opacity: 0.85 }}>Status</Typography>
            <Typography variant="h5" fontWeight="bold">
              {overBudget > 0 ? `${overBudget} Over Budget` : "On Track"}
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.75 }}>
              {budgets.length} categor{budgets.length !== 1 ? "ies" : "y"} tracked
            </Typography>
          </CardContent>
        </Card>

      </Box>

      {/* BUDGET LIST */}

      {budgets.length === 0 ? (

        <Card sx={{ borderRadius: 4 }}>
          <CardContent sx={{ py: 8, textAlign: "center" }}>
            <AccountBalanceWalletIcon sx={{ fontSize: 56, color: "#ccc", mb: 2 }} />
            <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
              No budgets for {MONTH_NAMES[month - 1]} {year}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Add a budget to start tracking your spending against targets.
            </Typography>
            <Button
              variant="contained"
              onClick={openAdd}
              startIcon={<AddIcon />}
              sx={{
                backgroundColor: "#14684D",
                "&:hover": { backgroundColor: "#0d5040" },
                borderRadius: 3,
                textTransform: "none"
              }}
            >
              Add Your First Budget
            </Button>
          </CardContent>
        </Card>

      ) : (

        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {budgets.map(b => {
            const pct = b.amount > 0 ? Math.min((b.spent / b.amount) * 100, 100) : 0;
            const over = b.spent > b.amount;
            const style = CATEGORY_COLORS[b.category] || { bg: "#f5f5f5", color: "#616161" };

            return (
              <Card key={b.id} sx={{ borderRadius: 4, boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
                <CardContent sx={{ p: 3 }}>

                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>

                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                      <Chip
                        label={b.category}
                        size="small"
                        sx={{ backgroundColor: style.bg, color: style.color, fontWeight: "bold" }}
                      />
                      {over && (
                        <Chip label="Over Budget" size="small" sx={{ backgroundColor: "#ffebee", color: "#C62828", fontWeight: "bold" }} />
                      )}
                    </Box>

                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                      <IconButton size="small" onClick={() => openEdit(b)} sx={{ color: "#888" }}>
                        <EditOutlinedIcon fontSize="small" />
                      </IconButton>
                      <IconButton size="small" onClick={() => handleDelete(b.id)} sx={{ color: "#C62828" }}>
                        <DeleteOutlineIcon fontSize="small" />
                      </IconButton>
                    </Box>

                  </Box>

                  <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      ${b.spent.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} spent
                    </Typography>
                    <Typography variant="body2" fontWeight="bold">
                      ${b.amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} budget
                    </Typography>
                  </Box>

                  <LinearProgress
                    variant="determinate"
                    value={pct}
                    sx={{
                      height: 8,
                      borderRadius: 4,
                      backgroundColor: "#f0f0f0",
                      "& .MuiLinearProgress-bar": {
                        backgroundColor: over ? "#C62828" : pct > 80 ? "#E65100" : "#14684D",
                        borderRadius: 4
                      }
                    }}
                  />

                  <Box sx={{ display: "flex", justifyContent: "space-between", mt: 0.75 }}>
                    <Typography variant="caption" color="text.secondary">
                      {pct.toFixed(0)}% used
                    </Typography>
                    <Typography variant="caption" color={over ? "#C62828" : "text.secondary"}>
                      {over
                        ? `$${(b.spent - b.amount).toFixed(2)} over`
                        : `$${(b.amount - b.spent).toFixed(2)} remaining`
                      }
                    </Typography>
                  </Box>

                </CardContent>
              </Card>
            );
          })}
        </Box>

      )}

      {/* ADD / EDIT DIALOG */}

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle fontWeight="bold">
          {editing ? "Edit Budget" : "Add Budget"}
        </DialogTitle>
        <DialogContent>

          {formError && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{formError}</Alert>}

          {!editing && (
            <TextField
              select
              label="Category"
              fullWidth
              margin="normal"
              value={form.category}
              onChange={e => {
                const cat = e.target.value;
                // We'll resolve category_id server-side via name lookup; pass name for now
                setForm({ ...form, category: cat, category_id: cat });
              }}
            >
              {CATEGORIES.map(c => (
                <MenuItem key={c.name} value={c.name}>{c.name}</MenuItem>
              ))}
            </TextField>
          )}

          {editing && (
            <Box sx={{ mb: 1, mt: 1 }}>
              <Chip
                label={editing.category}
                sx={{ backgroundColor: (CATEGORY_COLORS[editing.category] || {}).bg, color: (CATEGORY_COLORS[editing.category] || {}).color, fontWeight: "bold" }}
              />
            </Box>
          )}

          <TextField
            label="Budget Amount ($)"
            type="number"
            fullWidth
            margin="normal"
            value={form.amount}
            onChange={e => setForm({ ...form, amount: e.target.value })}
            InputProps={{ inputProps: { min: 0, step: "0.01" } }}
          />

        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={() => setDialogOpen(false)} sx={{ color: "#555", textTransform: "none" }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={saving}
            sx={{
              backgroundColor: "#14684D",
              "&:hover": { backgroundColor: "#0d5040" },
              borderRadius: 2,
              textTransform: "none",
              fontWeight: "bold"
            }}
          >
            {saving ? <CircularProgress size={20} sx={{ color: "white" }} /> : editing ? "Save Changes" : "Add Budget"}
          </Button>
        </DialogActions>
      </Dialog>

    </Box>

  );

}

export default Budgets;
