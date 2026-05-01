import {
  Box,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  Divider,
  MenuItem,
  Alert
} from "@mui/material";

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { changePassword, updateSecurity, getMe } from "../services/userService";

const SECURITY_QUESTIONS = [
  "What city were you born in?",
  "What is the name of your favorite pet?",
  "Who is your favorite artist?",
  "What is the name of your best friend?"
];

function LoginPreferences() {

  const navigate = useNavigate();

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  const [securityForm, setSecurityForm] = useState({
    security_question: "",
    security_answer: ""
  });

  const [passwordMsg, setPasswordMsg] = useState({ type: "", text: "" });
  const [securityMsg, setSecurityMsg] = useState({ type: "", text: "" });

  useEffect(() => {
    getMe().then((user) => {
      setSecurityForm({
        security_question: user.security_question || "",
        security_answer: ""
      });
    });
  }, []);

  const handlePasswordChange = async () => {
    setPasswordMsg({ type: "", text: "" });

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordMsg({ type: "error", text: "New passwords do not match." });
      return;
    }

    try {
      await changePassword(passwordForm.currentPassword, passwordForm.newPassword);
      setPasswordMsg({ type: "success", text: "Password updated successfully." });
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      setPasswordMsg({ type: "error", text: err.message });
    }
  };

  const handleSecuritySave = async () => {
    setSecurityMsg({ type: "", text: "" });
    try {
      await updateSecurity(securityForm.security_question, securityForm.security_answer);
      setSecurityMsg({ type: "success", text: "Security question updated." });
    } catch (err) {
      setSecurityMsg({ type: "error", text: err.message });
    }
  };

  return (

    <Box>

      <Button
        onClick={() => navigate("/profile")}
        sx={{ mb: 2, color: "#14684D" }}
      >
        ← Back to Profile
      </Button>

      <Typography variant="h4" fontWeight="bold" sx={{ mb: 4 }}>
        Login Preferences
      </Typography>

      {/* CHANGE PASSWORD */}

      <Card sx={{ borderRadius: 4, maxWidth: 560, mb: 4 }}>
        <CardContent sx={{ p: 4 }}>

          <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
            Change Password
          </Typography>

          {passwordMsg.text && (
            <Alert severity={passwordMsg.type} sx={{ mb: 2 }}>
              {passwordMsg.text}
            </Alert>
          )}

          <TextField
            label="Current Password"
            type="password"
            fullWidth
            margin="normal"
            value={passwordForm.currentPassword}
            onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
          />

          <TextField
            label="New Password"
            type="password"
            fullWidth
            margin="normal"
            value={passwordForm.newPassword}
            onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
            helperText="Min 8 characters, must include a number and a symbol"
          />

          <TextField
            label="Confirm New Password"
            type="password"
            fullWidth
            margin="normal"
            value={passwordForm.confirmPassword}
            onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
          />

          <Button
            variant="contained"
            fullWidth
            sx={{
              mt: 3,
              backgroundColor: "#14684D",
              "&:hover": { backgroundColor: "#0f4f3a" }
            }}
            onClick={handlePasswordChange}
          >
            Update Password
          </Button>

        </CardContent>
      </Card>

      {/* SECURITY QUESTION */}

      <Card sx={{ borderRadius: 4, maxWidth: 560 }}>
        <CardContent sx={{ p: 4 }}>

          <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
            Security Question
          </Typography>

          {securityMsg.text && (
            <Alert severity={securityMsg.type} sx={{ mb: 2 }}>
              {securityMsg.text}
            </Alert>
          )}

          <TextField
            select
            label="Security Question"
            fullWidth
            margin="normal"
            value={securityForm.security_question}
            onChange={(e) => setSecurityForm({ ...securityForm, security_question: e.target.value })}
          >
            {SECURITY_QUESTIONS.map((q) => (
              <MenuItem key={q} value={q}>{q}</MenuItem>
            ))}
          </TextField>

          <TextField
            label="Security Answer"
            fullWidth
            margin="normal"
            value={securityForm.security_answer}
            onChange={(e) => setSecurityForm({ ...securityForm, security_answer: e.target.value })}
          />

          <Button
            variant="contained"
            fullWidth
            sx={{
              mt: 3,
              backgroundColor: "#14684D",
              "&:hover": { backgroundColor: "#0f4f3a" }
            }}
            onClick={handleSecuritySave}
          >
            Save Security Question
          </Button>

        </CardContent>
      </Card>

    </Box>

  );
}

export default LoginPreferences;
