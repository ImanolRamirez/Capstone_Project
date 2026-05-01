import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Grid
} from "@mui/material";

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { apiRequest } from "../services/apiClient";

function Address() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState({ type: "", text: "" });
  const [existingId, setExistingId] = useState(null);
  const [editing, setEditing] = useState(false);

  const [form, setForm] = useState({
    address_line1: "",
    address_line2: "",
    city: "",
    state: "",
    zip_code: "",
    country: "United States"
  });

  useEffect(() => {
    apiRequest("/api/addresses")
      .then((data) => {
        if (data && data.length > 0) {
          const addr = data[0];
          setExistingId(addr.id);
          setForm({
            address_line1: addr.address_line1 || "",
            address_line2: addr.address_line2 || "",
            city: addr.city || "",
            state: addr.state || "",
            zip_code: addr.zip_code || "",
            country: addr.country || "United States"
          });
        } else {
          setEditing(true);
        }
      })
      .catch(() => setEditing(true))
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSave = async () => {
    if (!form.address_line1.trim() || !form.city.trim() || !form.state.trim() || !form.zip_code.trim()) {
      setMsg({ type: "error", text: "Street address, city, state, and ZIP are required." });
      return;
    }
    setSaving(true);
    setMsg({ type: "", text: "" });
    try {
      if (existingId) {
        await apiRequest(`/api/addresses/${existingId}`, {
          method: "PUT",
          body: JSON.stringify(form)
        });
      } else {
        const result = await apiRequest("/api/addresses", {
          method: "POST",
          body: JSON.stringify(form)
        });
        setExistingId(result.id);
      }
      setEditing(false);
      setMsg({ type: "success", text: "Address saved successfully." });
    } catch (err) {
      setMsg({ type: "error", text: err.message || "Failed to save address." });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: 300 }}>
        <CircularProgress sx={{ color: "#14684D" }} />
      </Box>
    );
  }

  return (
    <Box>
      <Button onClick={() => navigate("/profile")} sx={{ mb: 2, color: "#14684D" }}>
        ← Back to Profile
      </Button>

      <Typography variant="h4" fontWeight="bold" sx={{ mb: 4 }}>
        Address
      </Typography>

      {msg.text && (
        <Alert severity={msg.type} sx={{ mb: 3, maxWidth: 560 }}>
          {msg.text}
        </Alert>
      )}

      <Card sx={{ borderRadius: 4, maxWidth: 560 }}>
        <CardContent sx={{ p: 4 }}>

          {!editing ? (
            <>
              <Typography variant="body1" fontWeight="bold" sx={{ mb: 0.5 }}>
                {form.address_line1}
              </Typography>
              {form.address_line2 && (
                <Typography variant="body1">{form.address_line2}</Typography>
              )}
              <Typography variant="body1">
                {form.city}, {form.state} {form.zip_code}
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                {form.country}
              </Typography>
              <Button
                variant="outlined"
                onClick={() => { setEditing(true); setMsg({ type: "", text: "" }); }}
                sx={{ borderColor: "#14684D", color: "#14684D" }}
              >
                Edit Address
              </Button>
            </>
          ) : (
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  label="Street Address"
                  fullWidth
                  value={form.address_line1}
                  onChange={handleChange("address_line1")}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Apt, Suite, Unit (optional)"
                  fullWidth
                  value={form.address_line2}
                  onChange={handleChange("address_line2")}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="City"
                  fullWidth
                  value={form.city}
                  onChange={handleChange("city")}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="State"
                  fullWidth
                  value={form.state}
                  onChange={handleChange("state")}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="ZIP Code"
                  fullWidth
                  value={form.zip_code}
                  onChange={handleChange("zip_code")}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="Country"
                  fullWidth
                  value={form.country}
                  onChange={handleChange("country")}
                />
              </Grid>
              <Grid item xs={12} sx={{ display: "flex", gap: 2, mt: 1 }}>
                <Button
                  variant="contained"
                  disabled={saving}
                  onClick={handleSave}
                  sx={{ backgroundColor: "#14684D", "&:hover": { backgroundColor: "#0f4f3a" } }}
                >
                  {saving ? "Saving..." : "Save Address"}
                </Button>
                {existingId && (
                  <Button
                    variant="outlined"
                    disabled={saving}
                    onClick={() => { setEditing(false); setMsg({ type: "", text: "" }); }}
                  >
                    Cancel
                  </Button>
                )}
              </Grid>
            </Grid>
          )}

        </CardContent>
      </Card>
    </Box>
  );
}

export default Address;
