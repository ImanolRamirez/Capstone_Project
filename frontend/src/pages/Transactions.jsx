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
  Alert
} from "@mui/material";

import SearchIcon from "@mui/icons-material/Search";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import FilterListIcon from "@mui/icons-material/FilterList";

import { useState } from "react";
import useTransactions from "../hooks/useTransactions";
import { useLanguage } from "../context/LanguageContext";

const CATEGORY_COLORS = {
  Income: { bg: "#e8f5e9", color: "#14684D" },
  Food: { bg: "#fff3e0", color: "#E65100" },
  Shopping: { bg: "#e3f2fd", color: "#1565C0" },
  Utilities: { bg: "#f3e5f5", color: "#6A1B9A" },
  Transportation: { bg: "#e0f7fa", color: "#006064" },
  Bills: { bg: "#fce4ec", color: "#880E4F" },
  Subscriptions: { bg: "#e8eaf6", color: "#283593" },
  Memberships: { bg: "#fff8e1", color: "#F57F17" }
};

function CategoryChip({ category }) {
  const style = CATEGORY_COLORS[category] || { bg: "#f5f5f5", color: "#616161" };
  return (
    <Chip
      label={category}
      size="small"
      sx={{
        backgroundColor: style.bg,
        color: style.color,
        fontWeight: "bold",
        fontSize: "0.72rem"
      }}
    />
  );
}

function Transactions() {

  const { t } = useLanguage();
  const { transactions, loading, error } = useTransactions();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");

  const filtered = transactions.filter(t => {
    const matchesSearch = (t.description || "").toLowerCase().includes(search.toLowerCase());
    const matchesCategory = category === "" || t.category === category;
    return matchesSearch && matchesCategory;
  });

  const totalIncome = filtered.filter(t => t.amount > 0).reduce((s, t) => s + t.amount, 0);
  const totalExpenses = filtered.filter(t => t.amount < 0).reduce((s, t) => s + Math.abs(t.amount), 0);

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

      <Typography variant="h4" fontWeight="bold" sx={{ mb: 1 }}>
        {t("transactions.title")}
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 4 }}>
        {transactions.length} {t("transactions.subtitle").toLowerCase()}
      </Typography>

      {/* SUMMARY STRIP */}

      <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 3, mb: 4 }}>

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

      <Box sx={{ display: "flex", gap: 2, mb: 3 }}>

        <TextField
          label="Search transactions"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          fullWidth
          size="small"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            )
          }}
          sx={{ borderRadius: 2 }}
        />

        <TextField
          select
          label="Category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          size="small"
          sx={{ minWidth: 180 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <FilterListIcon fontSize="small" />
              </InputAdornment>
            )
          }}
        >
          <MenuItem value="">All Categories</MenuItem>
          <MenuItem value="Income">Income</MenuItem>
          <MenuItem value="Food">Food</MenuItem>
          <MenuItem value="Shopping">Shopping</MenuItem>
          <MenuItem value="Utilities">Utilities</MenuItem>
          <MenuItem value="Transportation">Transportation</MenuItem>
          <MenuItem value="Bills">Bills</MenuItem>
          <MenuItem value="Subscriptions">Subscriptions</MenuItem>
          <MenuItem value="Memberships">Memberships</MenuItem>
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
            </TableRow>
          </TableHead>

          <TableBody>

            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} align="center" sx={{ py: 4, color: "text.secondary" }}>
                  No transactions found.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((t) => (
                <TableRow
                  key={t.id}
                  hover
                  sx={{ "&:hover": { backgroundColor: "#fafafa" } }}
                >

                  <TableCell sx={{ color: "text.secondary", fontSize: "0.85rem" }}>
                    {t.date}
                  </TableCell>

                  <TableCell>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Box
                        sx={{
                          width: 30,
                          height: 30,
                          borderRadius: "50%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          backgroundColor: t.amount > 0 ? "#e8f5e9" : "#ffebee",
                          flexShrink: 0
                        }}
                      >
                        {t.amount > 0
                          ? <ArrowUpwardIcon sx={{ fontSize: 14, color: "#14684D" }} />
                          : <ArrowDownwardIcon sx={{ fontSize: 14, color: "#D32F2F" }} />
                        }
                      </Box>
                      <Typography variant="body2" fontWeight="bold">
                        {t.description || "—"}
                      </Typography>
                    </Box>
                  </TableCell>

                  <TableCell>
                    <CategoryChip category={t.category} />
                  </TableCell>

                  <TableCell align="right">
                    <Typography
                      fontWeight="bold"
                      sx={{ color: t.amount > 0 ? "#14684D" : "#D32F2F" }}
                    >
                      {t.amount > 0 ? "+" : ""}${Math.abs(t.amount).toFixed(2)}
                    </Typography>
                  </TableCell>

                </TableRow>
              ))
            )}

          </TableBody>

        </Table>

      </Card>

    </Box>

  );

}

export default Transactions;
