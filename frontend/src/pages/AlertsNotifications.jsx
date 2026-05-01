import {
  Box,
  Typography,
  Card,
  CardContent,
  Switch,
  FormControlLabel,
  Button,
  Alert,
  Divider,
  CircularProgress
} from "@mui/material";

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getNotifications, updateNotifications } from "../services/userService";

const DEFAULT_PREFS = {
  notif_email_transactions: true,
  notif_email_security: true,
  notif_email_promotions: false,
  notif_push_transactions: true,
  notif_push_security: true,
  notif_push_promotions: false,
  notif_sms_transactions: false,
  notif_sms_security: true
};

function AlertsNotifications() {
  const navigate = useNavigate();
  const [msg, setMsg] = useState({ type: "", text: "" });
  const [alerts, setAlerts] = useState(DEFAULT_PREFS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getNotifications()
      .then((data) => setAlerts(data))
      .catch(() => {/* keep defaults on error */})
      .finally(() => setLoading(false));
  }, []);

  const toggle = (key) => {
    setAlerts((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = async () => {
    setSaving(true);
    setMsg({ type: "", text: "" });
    try {
      await updateNotifications(alerts);
      setMsg({ type: "success", text: "Notification preferences saved." });
    } catch {
      setMsg({ type: "error", text: "Failed to save preferences." });
    } finally {
      setSaving(false);
    }
  };

  const renderToggle = (label, key) => (
    <FormControlLabel
      key={key}
      control={
        <Switch
          checked={!!alerts[key]}
          onChange={() => toggle(key)}
          sx={{
            "& .MuiSwitch-switchBase.Mui-checked": { color: "#14684D" },
            "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": { backgroundColor: "#14684D" }
          }}
        />
      }
      label={label}
      sx={{ display: "flex", justifyContent: "space-between", ml: 0, mb: 1 }}
      labelPlacement="start"
    />
  );

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: 300 }}>
        <CircularProgress sx={{ color: "#14684D" }} />
      </Box>
    );
  }

  return (
    <Box>

      <Button
        onClick={() => navigate("/profile")}
        sx={{ mb: 2, color: "#14684D" }}
      >
        ← Back to Profile
      </Button>

      <Typography variant="h4" fontWeight="bold" sx={{ mb: 4 }}>
        Alerts & Notifications
      </Typography>

      {msg.text && (
        <Alert severity={msg.type} sx={{ mb: 3, maxWidth: 560 }}>
          {msg.text}
        </Alert>
      )}

      <Card sx={{ borderRadius: 4, maxWidth: 560, mb: 3 }}>
        <CardContent sx={{ p: 4 }}>

          <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
            Email Notifications
          </Typography>

          {renderToggle("Transaction alerts", "notif_email_transactions")}
          {renderToggle("Security alerts", "notif_email_security")}
          {renderToggle("Promotions & offers", "notif_email_promotions")}

          <Divider sx={{ my: 3 }} />

          <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
            Push Notifications
          </Typography>

          {renderToggle("Transaction alerts", "notif_push_transactions")}
          {renderToggle("Security alerts", "notif_push_security")}
          {renderToggle("Promotions & offers", "notif_push_promotions")}

          <Divider sx={{ my: 3 }} />

          <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
            SMS Notifications
          </Typography>

          {renderToggle("Transaction alerts", "notif_sms_transactions")}
          {renderToggle("Security alerts", "notif_sms_security")}

          <Button
            variant="contained"
            fullWidth
            disabled={saving}
            sx={{
              mt: 3,
              backgroundColor: "#14684D",
              "&:hover": { backgroundColor: "#0f4f3a" }
            }}
            onClick={handleSave}
          >
            {saving ? "Saving..." : "Save Preferences"}
          </Button>

        </CardContent>
      </Card>

    </Box>
  );
}

export default AlertsNotifications;
