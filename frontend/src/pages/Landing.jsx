import { Box, Typography, Button, Card, CardContent, Chip } from "@mui/material";

import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import SecurityIcon from "@mui/icons-material/Security";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import PieChartIcon from "@mui/icons-material/PieChart";
import SavingsIcon from "@mui/icons-material/Savings";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";

import { useNavigate } from "react-router-dom";
import assetAtlasLogo from "../assets/AssetAtlas.png";

const FEATURES = [
  {
    icon: <AccountBalanceIcon sx={{ fontSize: 32, color: "#14684D" }} />,
    bg: "#e8f5e9",
    title: "Account Tracking",
    description: "Monitor checking, savings, and HYSA balances in one place."
  },
  {
    icon: <PieChartIcon sx={{ fontSize: 32, color: "#1565C0" }} />,
    bg: "#e3f2fd",
    title: "Financial Insights",
    description: "Visualize spending patterns and asset distribution instantly."
  },
  {
    icon: <SavingsIcon sx={{ fontSize: 32, color: "#6A1B9A" }} />,
    bg: "#f3e5f5",
    title: "Budget Management",
    description: "Set monthly spending targets and track progress in real time."
  },
  {
    icon: <TrendingUpIcon sx={{ fontSize: 32, color: "#E65100" }} />,
    bg: "#fff3e0",
    title: "Net Worth",
    description: "Understand your total financial picture — assets minus debts."
  },
  {
    icon: <SwapHorizIcon sx={{ fontSize: 32, color: "#006064" }} />,
    bg: "#e0f7fa",
    title: "Easy Transfers",
    description: "Move money between your accounts with just a few clicks."
  },
  {
    icon: <SecurityIcon sx={{ fontSize: 32, color: "#880E4F" }} />,
    bg: "#fce4ec",
    title: "Secure & Private",
    description: "Your data is protected with hashed credentials and JWT auth."
  }
];

const STATS = [
  { value: "100%", label: "Secure" },
  { value: "Real-time", label: "Data" },
  { value: "All-in-one", label: "Dashboard" }
];

function Landing() {

  const navigate = useNavigate();

  return (

    <Box sx={{ minHeight: "100vh", display: "flex", flexDirection: "column", backgroundColor: "#fafafa" }}>

      {/* NAV BAR */}

      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", px: 5, py: 2.5, backgroundColor: "white", borderBottom: "1px solid #f0f0f0" }}>
        <Box component="img" src={assetAtlasLogo} alt="AssetAtlas" sx={{ height: 40, cursor: "pointer" }} onClick={() => navigate("/")} />
        <Box sx={{ display: "flex", gap: 1.5 }}>
          <Button
            onClick={() => navigate("/login")}
            sx={{ textTransform: "none", color: "#14684D", fontWeight: "bold" }}
          >
            Log In
          </Button>
          <Button
            variant="contained"
            onClick={() => navigate("/register")}
            sx={{ textTransform: "none", backgroundColor: "#14684D", "&:hover": { backgroundColor: "#0d5040" }, borderRadius: 3, fontWeight: "bold" }}
          >
            Get Started
          </Button>
        </Box>
      </Box>

      {/* HERO */}

      <Box
        sx={{
          background: "linear-gradient(135deg, #0d3d2e 0%, #14684D 60%, #1a8a65 100%)",
          color: "white",
          textAlign: "center",
          py: 12,
          px: 3,
          position: "relative",
          overflow: "hidden"
        }}
      >

        {/* Decorative circles */}
        <Box sx={{ position: "absolute", top: -80, right: -80, width: 320, height: 320, borderRadius: "50%", backgroundColor: "rgba(255,255,255,0.04)" }} />
        <Box sx={{ position: "absolute", bottom: -100, left: -60, width: 400, height: 400, borderRadius: "50%", backgroundColor: "rgba(255,255,255,0.03)" }} />

        <Chip label="Personal Finance Manager" sx={{ backgroundColor: "rgba(255,255,255,0.15)", color: "white", fontWeight: "bold", mb: 3 }} />

        <Typography variant="h2" fontWeight="bold" sx={{ mb: 2, maxWidth: 700, mx: "auto", lineHeight: 1.2 }}>
          Your Complete Financial Picture
        </Typography>

        <Typography variant="h6" sx={{ opacity: 0.85, mb: 5, maxWidth: 560, mx: "auto", fontWeight: "normal" }}>
          Monitor all your accounts, track spending, manage budgets, and understand your net worth — all in one powerful dashboard.
        </Typography>

        <Box sx={{ display: "flex", gap: 2, justifyContent: "center", flexWrap: "wrap" }}>
          <Button
            variant="contained"
            size="large"
            onClick={() => navigate("/register")}
            sx={{
              backgroundColor: "white",
              color: "#14684D",
              fontWeight: "bold",
              textTransform: "none",
              borderRadius: 3,
              px: 4,
              "&:hover": { backgroundColor: "#f0f0f0" }
            }}
          >
            Create Free Account
          </Button>
          <Button
            variant="outlined"
            size="large"
            onClick={() => navigate("/login")}
            sx={{
              borderColor: "rgba(255,255,255,0.6)",
              color: "white",
              fontWeight: "bold",
              textTransform: "none",
              borderRadius: 3,
              px: 4,
              "&:hover": { borderColor: "white", backgroundColor: "rgba(255,255,255,0.08)" }
            }}
          >
            Log In
          </Button>
        </Box>

        {/* STATS ROW */}

        <Box sx={{ display: "flex", justifyContent: "center", gap: 6, mt: 8 }}>
          {STATS.map(s => (
            <Box key={s.label} sx={{ textAlign: "center" }}>
              <Typography variant="h5" fontWeight="bold">{s.value}</Typography>
              <Typography variant="body2" sx={{ opacity: 0.75 }}>{s.label}</Typography>
            </Box>
          ))}
        </Box>

      </Box>

      {/* FEATURES */}

      <Box sx={{ maxWidth: 1100, mx: "auto", px: 3, py: 10, width: "100%" }}>

        <Typography variant="h4" fontWeight="bold" textAlign="center" sx={{ mb: 1 }}>
          Everything you need
        </Typography>
        <Typography variant="body1" color="text.secondary" textAlign="center" sx={{ mb: 6 }}>
          Built for students and professionals who want clarity over their finances
        </Typography>

        <Box sx={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 3 }}>
          {FEATURES.map(f => (
            <Card
              key={f.title}
              sx={{
                borderRadius: 4,
                border: "1px solid #f0f0f0",
                transition: "all 0.22s",
                "&:hover": { transform: "translateY(-6px)", boxShadow: "0 10px 28px rgba(0,0,0,0.1)", borderColor: "#14684D" }
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ width: 56, height: 56, borderRadius: 3, backgroundColor: f.bg, display: "flex", alignItems: "center", justifyContent: "center", mb: 2 }}>
                  {f.icon}
                </Box>
                <Typography variant="h6" fontWeight="bold" sx={{ mb: 0.5 }}>{f.title}</Typography>
                <Typography variant="body2" color="text.secondary">{f.description}</Typography>
              </CardContent>
            </Card>
          ))}
        </Box>

      </Box>

      {/* CTA BANNER */}

      <Box sx={{ backgroundColor: "#14684D", color: "white", textAlign: "center", py: 8, px: 3 }}>
        <Typography variant="h4" fontWeight="bold" sx={{ mb: 1.5 }}>
          Ready to take control of your finances?
        </Typography>
        <Typography variant="body1" sx={{ opacity: 0.85, mb: 4 }}>
          Create your free account in under a minute.
        </Typography>
        <Button
          variant="contained"
          size="large"
          onClick={() => navigate("/register")}
          sx={{
            backgroundColor: "white",
            color: "#14684D",
            fontWeight: "bold",
            textTransform: "none",
            borderRadius: 3,
            px: 5,
            "&:hover": { backgroundColor: "#f0f0f0" }
          }}
        >
          Get Started — It's Free
        </Button>
      </Box>

      {/* FOOTER */}

      <Box sx={{ backgroundColor: "#0d3d2e", color: "rgba(255,255,255,0.6)", textAlign: "center", py: 2.5 }}>
        <Typography variant="body2">
          © {new Date().getFullYear()} AssetAtlas · Built for the Capstone Project
        </Typography>
      </Box>

    </Box>

  );
}

export default Landing;