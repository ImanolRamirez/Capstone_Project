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

import { useState, useMemo } from "react";
import useTransactions from "../hooks/useTransactions";
import { useLanguage } from "../context/LanguageContext";

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
  const [filterMonth, setFilterMonth] = useState("");
  const [filterYear, setFilterYear] = useState("");

  const availableYears = useMemo(() => {
    const years = new Set(
      transactions.map((tx) => tx.date?.split("-")[0]).filter(Boolean)
    );
    return Array.from(years).sort((a, b) => b - a);
  }, [transactions]);

  const filtered = transactions.filter(tx => {
    const matchesSearch = (tx.description || "").toLowerCase().includes(search.toLowerCase());
    const matchesCategory = category === "" || tx.category === category;
    const txDate = tx.date || "";
    const [txYear, txMonth] = txDate.split("-");
    const matchesMonth = filterMonth === "" || parseInt(txMonth) === parseInt(filterMonth);
    const matchesYear = filterYear === "" || txYear === filterYear;
    return matchesSearch && matchesCategory && matchesMonth && matchesYear;
  });

  const totalIncome = filtered.filter(tx => tx.amount > 0).reduce((s, tx) => s + tx.amount, 0);
  const totalExpenses = filtered.filter(tx => tx.amount < 0).reduce((s, tx) => s + Math.abs(tx.amount), 0);

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

      <Box sx={{ display: "flex", gap: 2, mb: 3, flexWrap: "wrap" }}>

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
          sx={{ flex: 1, minWidth: 200 }}
        />

        <TextField
          select
          label="Month"
          value={filterMonth}
          onChange={(e) => setFilterMonth(e.target.value)}
          size="small"
          sx={{ minWidth: 140 }}
        >
          <MenuItem value="">All Months</MenuItem>
          {MONTHS.map((m) => (
            <MenuItem key={m.value} value={m.value}>{m.label}</MenuItem>
          ))}
        </TextField>

        <TextField
          select
          label="Year"
          value={filterYear}
          onChange={(e) => setFilterYear(e.target.value)}
          size="small"
          sx={{ minWidth: 110 }}
        >
          <MenuItem value="">All Years</MenuItem>
          {availableYears.map((y) => (
            <MenuItem key={y} value={y}>{y}</MenuItem>
          ))}
        </TextField>

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
              filtered.map((tx) => (
                <TableRow
                  key={tx.id}
                  hover
                  sx={{ "&:hover": { backgroundColor: "#fafafa" } }}
                >

                  <TableCell sx={{ color: "text.secondary", fontSize: "0.85rem" }}>
                    {tx.date}
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
                          backgroundColor: tx.amount > 0 ? "#e8f5e9" : "#ffebee",
                          flexShrink: 0
                        }}
                      >
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

                  <TableCell>
                    <CategoryChip category={tx.category} />
                  </TableCell>

                  <TableCell align="right">
                    <Typography
                      fontWeight="bold"
                      sx={{ color: tx.amount > 0 ? "#14684D" : "#D32F2F" }}
                    >
                      {tx.amount > 0 ? "+" : ""}${Math.abs(tx.amount).toFixed(2)}
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
