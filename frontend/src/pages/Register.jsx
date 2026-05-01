import {
  Box,
  Typography,
  TextField,
  Button,
  MenuItem,
  Card,
  CardContent,
  Alert,
  Divider,
  InputAdornment,
  IconButton
} from "@mui/material";

import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";

import { useState } from "react";
import { useNavigate } from "react-router-dom";

import assetAtlasLogo from "../assets/AssetAtlas.png";
import { registerUser } from "../services/authService";

const SECURITY_QUESTIONS = [
  "What city were you born in?",
  "What is the name of your favorite pet?",
  "Who is your favorite artist?",
  "What is the name of your best friend?"
];

function Register() {

  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    securityQuestion: "",
    securityAnswer: ""
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (!formData.securityQuestion) {
      setError("Please select a security question.");
      return;
    }
    if (!formData.securityAnswer.trim()) {
      setError("Please provide a security answer.");
      return;
    }

    setLoading(true);
    try {
      await registerUser({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        securityQuestion: formData.securityQuestion,
        securityAnswer: formData.securityAnswer
      });
      navigate("/login");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (

    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#F4F7F5",
        py: 6,
        px: 2
      }}
    >

      <Card sx={{ width: 500, borderRadius: 4, boxShadow: "0 12px 30px rgba(0,0,0,0.12)" }}>
        <CardContent sx={{ p: 5 }}>

          <Box
            component="img"
            src={assetAtlasLogo}
            alt="AssetAtlas"
            onClick={() => navigate("/")}
            sx={{ width: 160, display: "block", mx: "auto", mb: 3, cursor: "pointer" }}
          />

          <Typography variant="h5" fontWeight="bold" textAlign="center" sx={{ mb: 0.5 }}>
            Create Your Account
          </Typography>
          <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ mb: 3 }}>
            Join AssetAtlas and take control of your finances
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>
          )}

          <form onSubmit={handleRegister}>

            <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
              <TextField
                name="firstName"
                label="First Name"
                fullWidth
                size="small"
                value={formData.firstName}
                onChange={handleChange}
                required
              />
              <TextField
                name="lastName"
                label="Last Name"
                fullWidth
                size="small"
                value={formData.lastName}
                onChange={handleChange}
                required
              />
            </Box>

            <TextField
              name="email"
              label="Email Address"
              type="email"
              fullWidth
              size="small"
              margin="normal"
              value={formData.email}
              onChange={handleChange}
              required
            />

            <TextField
              name="password"
              label="Password"
              type={showPassword ? "text" : "password"}
              fullWidth
              size="small"
              margin="normal"
              value={formData.password}
              onChange={handleChange}
              helperText="Min 8 characters with a number and symbol"
              required
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword(s => !s)} edge="end" size="small">
                      {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />

            <TextField
              name="confirmPassword"
              label="Confirm Password"
              type={showPassword ? "text" : "password"}
              fullWidth
              size="small"
              margin="normal"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />

            <Divider sx={{ my: 2.5 }}>
              <Typography variant="caption" color="text.secondary">Security Question</Typography>
            </Divider>

            <TextField
              select
              name="securityQuestion"
              label="Security Question"
              fullWidth
              size="small"
              sx={{ mb: 2 }}
              value={formData.securityQuestion}
              onChange={handleChange}
              required
            >
              {SECURITY_QUESTIONS.map(q => (
                <MenuItem key={q} value={q}>{q}</MenuItem>
              ))}
            </TextField>

            <TextField
              name="securityAnswer"
              label="Your Answer"
              fullWidth
              size="small"
              value={formData.securityAnswer}
              onChange={handleChange}
              required
            />

            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={loading}
              sx={{
                mt: 3,
                py: 1.4,
                borderRadius: 3,
                backgroundColor: "#14684D",
                "&:hover": { backgroundColor: "#0d5040" },
                textTransform: "none",
                fontWeight: "bold",
                fontSize: "1rem"
              }}
            >
              {loading ? "Creating Account..." : "Create Account"}
            </Button>

            <Typography variant="body2" textAlign="center" sx={{ mt: 2, color: "text.secondary" }}>
              Already have an account?{" "}
              <Typography
                component="span"
                variant="body2"
                sx={{ color: "#14684D", cursor: "pointer", fontWeight: "bold" }}
                onClick={() => navigate("/login")}
              >
                Log in
              </Typography>
            </Typography>

          </form>

        </CardContent>
      </Card>

    </Box>

  );
}

export default Register;