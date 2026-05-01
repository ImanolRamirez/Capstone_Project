import { useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  InputAdornment,
  IconButton
} from "@mui/material";

import LockResetIcon from "@mui/icons-material/LockReset";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";

import assetAtlasLogo from "../assets/AssetAtlas.png";
import { getSecurityQuestion, resetPasswordViaSecurity } from "../services/authService";

const STEPS = ["Enter Email", "Security Question", "New Password"];

function ForgotPassword() {

  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [securityQuestion, setSecurityQuestion] = useState("");
  const [securityAnswer, setSecurityAnswer] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // STEP 1 — look up email, get security question
  const handleEmailSubmit = async () => {
    setError("");
    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }
    setLoading(true);
    try {
      const data = await getSecurityQuestion(email.trim());
      setSecurityQuestion(data.security_question);
      setStep(2);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // STEP 2 — verify security answer, move to password reset
  const handleAnswerSubmit = async () => {
    setError("");
    if (!securityAnswer.trim()) {
      setError("Please enter your security answer.");
      return;
    }
    // We verify the answer on the final step (with the new password) to avoid
    // exposing a separate "answer correct" endpoint. Move to step 3.
    setStep(3);
  };

  // STEP 3 — submit new password with answer verification
  const handlePasswordReset = async () => {
    setError("");
    if (!newPassword) {
      setError("Please enter a new password.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    setLoading(true);
    try {
      await resetPasswordViaSecurity(email.trim(), securityAnswer.trim(), newPassword);
      setStep(4);
    } catch (err) {
      // Wrong answer — send them back to step 2
      if (err.message.toLowerCase().includes("incorrect")) {
        setError("Incorrect security answer. Please try again.");
        setSecurityAnswer("");
        setStep(2);
      } else {
        setError(err.message);
      }
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
        backgroundColor: "#F4F7F5"
      }}
    >
      <Card sx={{ width: 440, borderRadius: 4, boxShadow: "0 12px 30px rgba(0,0,0,0.12)" }}>
        <CardContent sx={{ p: 5 }}>

          {/* LOGO */}
          <Box
            component="img"
            src={assetAtlasLogo}
            alt="AssetAtlas"
            onClick={() => navigate("/")}
            sx={{ width: 160, display: "block", mx: "auto", mb: 3, cursor: "pointer" }}
          />

          {/* STEP INDICATOR */}
          {step < 4 && (
            <Box sx={{ display: "flex", justifyContent: "center", gap: 1, mb: 3 }}>
              {STEPS.map((label, i) => (
                <Box
                  key={i}
                  sx={{
                    height: 4,
                    flex: 1,
                    borderRadius: 2,
                    backgroundColor: i < step ? "#14684D" : "#e0e0e0",
                    transition: "background-color 0.3s"
                  }}
                />
              ))}
            </Box>
          )}

          {error && (
            <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
              {error}
            </Alert>
          )}

          {/* ── STEP 1: EMAIL ── */}
          {step === 1 && (
            <>
              <Box sx={{ textAlign: "center", mb: 3 }}>
                <LockResetIcon sx={{ fontSize: 44, color: "#14684D", mb: 1 }} />
                <Typography variant="h5" fontWeight="bold">Forgot Password?</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  Enter the email associated with your account.
                </Typography>
              </Box>

              <TextField
                label="Email Address"
                fullWidth
                margin="normal"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleEmailSubmit()}
              />

              <Button
                variant="contained"
                fullWidth
                onClick={handleEmailSubmit}
                disabled={loading}
                sx={{
                  mt: 2, py: 1.4, borderRadius: 3,
                  backgroundColor: "#14684D",
                  "&:hover": { backgroundColor: "#0d5040" },
                  textTransform: "none", fontWeight: "bold"
                }}
              >
                {loading ? <CircularProgress size={22} sx={{ color: "white" }} /> : "Continue"}
              </Button>

              <Typography
                variant="body2"
                align="center"
                sx={{ mt: 2, color: "#14684D", cursor: "pointer" }}
                onClick={() => navigate("/login")}
              >
                ← Back to Login
              </Typography>
            </>
          )}

          {/* ── STEP 2: SECURITY QUESTION ── */}
          {step === 2 && (
            <>
              <Box sx={{ textAlign: "center", mb: 3 }}>
                <LockResetIcon sx={{ fontSize: 44, color: "#14684D", mb: 1 }} />
                <Typography variant="h5" fontWeight="bold">Security Question</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  Answer your security question to continue.
                </Typography>
              </Box>

              <Box
                sx={{
                  backgroundColor: "#e8f5e9",
                  borderRadius: 3,
                  p: 2,
                  mb: 2,
                  textAlign: "center"
                }}
              >
                <Typography variant="body1" fontWeight="bold" color="#14684D">
                  {securityQuestion}
                </Typography>
              </Box>

              <TextField
                label="Your Answer"
                fullWidth
                margin="normal"
                value={securityAnswer}
                onChange={(e) => setSecurityAnswer(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAnswerSubmit()}
              />

              <Button
                variant="contained"
                fullWidth
                onClick={handleAnswerSubmit}
                sx={{
                  mt: 2, py: 1.4, borderRadius: 3,
                  backgroundColor: "#14684D",
                  "&:hover": { backgroundColor: "#0d5040" },
                  textTransform: "none", fontWeight: "bold"
                }}
              >
                Verify Answer
              </Button>

              <Typography
                variant="body2"
                align="center"
                sx={{ mt: 2, color: "#14684D", cursor: "pointer" }}
                onClick={() => { setStep(1); setError(""); }}
              >
                ← Back
              </Typography>
            </>
          )}

          {/* ── STEP 3: NEW PASSWORD ── */}
          {step === 3 && (
            <>
              <Box sx={{ textAlign: "center", mb: 3 }}>
                <LockResetIcon sx={{ fontSize: 44, color: "#14684D", mb: 1 }} />
                <Typography variant="h5" fontWeight="bold">Reset Password</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  Choose a new password for your account.
                </Typography>
              </Box>

              <TextField
                label="New Password"
                type={showPassword ? "text" : "password"}
                fullWidth
                margin="normal"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowPassword(s => !s)} edge="end">
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />

              <TextField
                label="Confirm New Password"
                type={showPassword ? "text" : "password"}
                fullWidth
                margin="normal"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handlePasswordReset()}
              />

              <Button
                variant="contained"
                fullWidth
                onClick={handlePasswordReset}
                disabled={loading}
                sx={{
                  mt: 2, py: 1.4, borderRadius: 3,
                  backgroundColor: "#14684D",
                  "&:hover": { backgroundColor: "#0d5040" },
                  textTransform: "none", fontWeight: "bold"
                }}
              >
                {loading ? <CircularProgress size={22} sx={{ color: "white" }} /> : "Reset Password"}
              </Button>

              <Typography
                variant="body2"
                align="center"
                sx={{ mt: 2, color: "#14684D", cursor: "pointer" }}
                onClick={() => { setStep(2); setError(""); }}
              >
                ← Back
              </Typography>
            </>
          )}

          {/* ── STEP 4: SUCCESS ── */}
          {step === 4 && (
            <Box sx={{ textAlign: "center" }}>
              <CheckCircleIcon sx={{ fontSize: 72, color: "#14684D", mb: 2 }} />
              <Typography variant="h5" fontWeight="bold" sx={{ mb: 1 }}>
                Password Reset!
              </Typography>
              <Typography color="text.secondary" sx={{ mb: 4 }}>
                Your password has been updated. You can now log in with your new password.
              </Typography>
              <Button
                variant="contained"
                fullWidth
                onClick={() => navigate("/login")}
                sx={{
                  py: 1.4, borderRadius: 3,
                  backgroundColor: "#14684D",
                  "&:hover": { backgroundColor: "#0d5040" },
                  textTransform: "none", fontWeight: "bold"
                }}
              >
                Go to Login
              </Button>
            </Box>
          )}

        </CardContent>
      </Card>
    </Box>
  );
}

export default ForgotPassword;