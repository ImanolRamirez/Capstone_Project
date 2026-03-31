import {
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent
} from "@mui/material";

import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import SecurityIcon from "@mui/icons-material/Security";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import SupportAgentIcon from "@mui/icons-material/SupportAgent";
import { CardActionArea } from "@mui/material";

import { Link } from "react-router-dom";

import assetAtlasLogo from "../assets/AssetAtlas.png";

function Landing() {

  const benefits = [
    {
      title: "Unified Financial View",
      description: "Connect and monitor bank accounts, investments, and debts in one place.",
      icon: <AccountBalanceIcon sx={{ fontSize: 40 }} />
    },
    {
      title: "Financial Insights",
      description: "Understand spending patterns and asset distribution instantly.",
      icon: <TrendingUpIcon sx={{ fontSize: 40 }} />
    },
    {
      title: "Secure Data Protection",
      description: "Industry-grade security protecting your financial information.",
      icon: <SecurityIcon sx={{ fontSize: 40 }} />
    },
    {
      title: "Financial Awareness",
      description: "Track your net worth and gain insight into your financial future.",
      icon: <SupportAgentIcon sx={{ fontSize: 40 }} />
    }
  ];

  return (

    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column"
      }}
    >

      {/* HERO */}

      <Box
        sx={{
          textAlign: "center",
          py: 10,
          px: 3
        }}
      >

        <Box
          component="img"
          src={assetAtlasLogo}
          alt="AssetAtlas"
          sx={{
            width: "420px",
            maxWidth: "90%",
            mb: 4
          }}
        />

        <Typography variant="h6" color="text.secondary" sx={{ mb: 4 }}>
          A unified financial intelligence platform that helps you monitor
          all financial accounts — including banking, investments, and debt —
          in one powerful dashboard.
        </Typography>

        <Button
          component={Link}
          to="/register"
          variant="contained"
          size="large"
          sx={{ mr: 2 }}
        >
          Create Account
        </Button>

        <Button
          component={Link}
          to="/login"
          variant="outlined"
          size="large"
        >
          Login
        </Button>

      </Box>

      {/* BENEFITS GRID */}

      <Box
        sx={{
          width: "100%",
          maxWidth: "1100px",
          margin: "0 auto",
          pb: 10
        }}
      >

        <Grid container spacing={4}>

          {benefits.map((benefit, index) => (

            <Grid
              item
              xs={12}
              md={6}
              key={index}
              sx={{ display: "flex" }}
            >

              <Card
                elevation={2}
                sx={{
                  flex: 1,
                  height: 240,
                  textAlign: "center",
                  borderRadius: 3,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "all 0.3s ease",
                  cursor: "pointer",
                  "&:hover": {
                    transform: "translateY(-8px)",
                    boxShadow: "0 12px 30px rgba(0,0,0,0.15)",
                    border: "1px solid #14684D"
                  }
                }}
              >

                <CardActionArea sx={{ height: "100%" }}>

                  <CardContent sx={{ p: 4 }}>

                    <Box sx={{ mb: 2, color: "#14684D" }}>
                      {benefit.icon}
                    </Box>

                    <Typography variant="h6" sx={{ mb: 1 }}>
                      {benefit.title}
                    </Typography>

                    <Typography variant="body2" color="text.secondary">
                      {benefit.description}
                    </Typography>

                  </CardContent>

                </CardActionArea>

              </Card>

            </Grid>

          ))}

        </Grid>

      </Box>

      {/* FOOTER */}

      <Box
        sx={{
          backgroundColor: "#14684D",
          color: "white",
          textAlign: "center",
          py: 2,
          mt: "auto"
        }}
      >

        <Typography variant="body2">
          © {new Date().getFullYear()} AssetAtlas
        </Typography>

      </Box>

    </Box>
  );
}

export default Landing;