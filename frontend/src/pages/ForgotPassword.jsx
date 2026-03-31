import { useState } from "react";

import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  Alert
} from "@mui/material";

import HelpOutlineIcon from "@mui/icons-material/HelpOutline";

function ForgotPassword() {

  const [email, setEmail] = useState("");
  const [securityQuestion, setSecurityQuestion] = useState("");
  const [securityAnswer, setSecurityAnswer] = useState("");

  const [step, setStep] = useState(1);
  const [attemptsLeft, setAttemptsLeft] = useState(3);
  const [message, setMessage] = useState("");

  const handleEmailSubmit = () => {

    const users = JSON.parse(localStorage.getItem("users")) || [];

    const user = users.find(u => u.email === email);

    if (!user) {
      setMessage("No account found with that email.");
      return;
    }

    setSecurityQuestion(user.question);
    setStep(2);
    setMessage("");
  };

  const handleAnswerSubmit = () => {

    const users = JSON.parse(localStorage.getItem("users")) || [];

    const user = users.find(u => u.email === email);

    if (!user) return;

    if (user.answer === securityAnswer) {

      setMessage(`Recovery email sent to: ${email}`);
      setStep(3);
      return;

    }

    const remaining = attemptsLeft - 1;

    setAttemptsLeft(remaining);

    if (remaining === 0) {

      setMessage(`Recovery email sent to: ${email}`);
      setStep(3);

    } else {

      setMessage(`Incorrect answer. You have ${remaining} attempts left.`);
    }
  };

  return (

    <Box display="flex" justifyContent="center" mt={10}>

      <Paper sx={{ padding: 5, width: 420, textAlign: "center" }}>

        {/* Question Mark Icon */}

        <HelpOutlineIcon
          sx={{
            fontSize: 50,
            color: "#14684D",
            mb: 2
          }}
        />

        <Typography variant="h5" mb={2}>
          Account Recovery
        </Typography>

        {message && (
          <Alert sx={{ mb: 2 }}>
            {message}
          </Alert>
        )}

        {/* STEP 1 EMAIL */}

        {step === 1 && (

          <>
            <Typography mb={2}>
              Enter the email associated with your account.
            </Typography>

            <TextField
              fullWidth
              label="Email"
              margin="normal"
              onChange={(e) => setEmail(e.target.value)}
            />

            <Button
              variant="contained"
              fullWidth
              sx={{ mt: 2 }}
              onClick={handleEmailSubmit}
            >
              Continue
            </Button>

          </>

        )}

        {/* STEP 2 SECURITY QUESTION */}

        {step === 2 && (

          <>
            <Typography mb={2}>
              {securityQuestion}
            </Typography>

            <TextField
              fullWidth
              label="Security Answer"
              margin="normal"
              onChange={(e) => setSecurityAnswer(e.target.value)}
            />

            <Button
              variant="contained"
              fullWidth
              sx={{ mt: 2 }}
              onClick={handleAnswerSubmit}
            >
              Submit Answer
            </Button>

            <Typography sx={{ mt: 2, fontSize: "14px", color: "#777" }}>
              Attempts remaining: {attemptsLeft}
            </Typography>

          </>

        )}

        {/* STEP 3 EMAIL SENT */}

        {step === 3 && (

          <Typography sx={{ mt: 2 }}>
            Please check your email for a recovery link.
          </Typography>

        )}

      </Paper>

    </Box>
  );
}

export default ForgotPassword;