import {
  Box,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  Alert
} from "@mui/material";

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getMe, updateProfile } from "../services/userService";

function PersonalDetails() {

  const navigate = useNavigate();

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: ""
  });

  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMe()
      .then((user) => {
        setForm({
          firstName: user.firstName || "",
          lastName: user.lastName || "",
          email: user.email || ""
        });
      })
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    setSuccess("");
    setError("");
    try {
      const updated = await updateProfile(form);
      localStorage.setItem("user", JSON.stringify({
        ...JSON.parse(localStorage.getItem("user") || "{}"),
        firstName: updated.firstName,
        lastName: updated.lastName,
        email: updated.email
      }));
      setSuccess("Profile updated successfully.");
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <Typography>Loading...</Typography>;

  return (

    <Box>

      <Button
        onClick={() => navigate("/profile")}
        sx={{ mb: 2, color: "#14684D" }}
      >
        ← Back to Profile
      </Button>

      <Typography variant="h4" fontWeight="bold" sx={{ mb: 4 }}>
        Personal Details
      </Typography>

      <Card sx={{ borderRadius: 4, maxWidth: 560 }}>
        <CardContent sx={{ p: 4 }}>

          {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          <TextField
            label="First Name"
            name="firstName"
            fullWidth
            margin="normal"
            value={form.firstName}
            onChange={handleChange}
          />

          <TextField
            label="Last Name"
            name="lastName"
            fullWidth
            margin="normal"
            value={form.lastName}
            onChange={handleChange}
          />

          <TextField
            label="Email Address"
            name="email"
            fullWidth
            margin="normal"
            value={form.email}
            onChange={handleChange}
          />

          <Button
            variant="contained"
            fullWidth
            sx={{
              mt: 3,
              backgroundColor: "#14684D",
              "&:hover": { backgroundColor: "#0f4f3a" }
            }}
            onClick={handleSave}
          >
            Save Changes
          </Button>

        </CardContent>
      </Card>

    </Box>

  );
}

export default PersonalDetails;
