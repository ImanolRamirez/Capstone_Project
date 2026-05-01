import {
  Box,
  Typography,
  Card,
  CardContent,
  Switch,
  FormControlLabel,
  Button,
  Alert,
  Divider
} from "@mui/material";

import { useState } from "react";
import { useNavigate } from "react-router-dom";

function AlertsNotifications() {

  const navigate = useNavigate();
  const [msg, setMsg] = useState({ type: "", text: "" });

  const [alerts, setAlerts] = useState({
    emailTransactions: true,
    emailSecurity: true,
    emailPromotions: false,
    pushTransactions: true,
    pushSecurity: true,
    pushPromotions: false,
    smsTransactions: false,
    smsSecurity: true
  });

  const toggle = (key) => {
    setAlerts((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = () => {
    setMsg({ type: "success", text: "Notification preferences saved." });
  };

  const renderToggle = (label, key) => (
    <FormControlLabel
      key={key}
      control={
        <Switch
          checked={alerts[key]}
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

          {renderToggle("Transaction alerts", "emailTransactions")}
          {renderToggle("Security alerts", "emailSecurity")}
          {renderToggle("Promotions & offers", "emailPromotions")}

          <Divider sx={{ my: 3 }} />

          <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
            Push Notifications
          </Typography>

          {renderToggle("Transaction alerts", "pushTransactions")}
          {renderToggle("Security alerts", "pushSecurity")}
          {renderToggle("Promotions & offers", "pushPromotions")}

          <Divider sx={{ my: 3 }} />

          <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
            SMS Notifications
          </Typography>

          {renderToggle("Transaction alerts", "smsTransactions")}
          {renderToggle("Security alerts", "smsSecurity")}

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
            Save Preferences
          </Button>

        </CardContent>
      </Card>

    </Box>

  );
}

export default AlertsNotifications;
