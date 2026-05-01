import {
  Box,
  Typography,
  Card,
  CardContent,
  MenuItem,
  TextField,
  Button,
  Alert
} from "@mui/material";

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import { SUPPORTED_LANGUAGES } from "../translations";

function LanguageSettings() {

  const navigate = useNavigate();
  const { language, setLanguage, t } = useLanguage();
  const [selected, setSelected] = useState(language);
  const [msg, setMsg] = useState({ type: "", text: "" });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setMsg({ type: "", text: "" });
    setSaving(true);
    try {
      await setLanguage(selected); // saves to DB + localStorage + updates context
      setMsg({ type: "success", text: `Language updated to ${selected}.` });
    } catch (err) {
      setMsg({ type: "error", text: err.message });
    } finally {
      setSaving(false);
    }
  };

  return (

    <Box>

      <Button
        onClick={() => navigate("/profile")}
        sx={{ mb: 2, color: "#14684D", textTransform: "none" }}
      >
        ← {t("common.back")}
      </Button>

      <Typography variant="h4" fontWeight="bold" sx={{ mb: 4 }}>
        {t("profile.language")}
      </Typography>

      <Card sx={{ borderRadius: 4, maxWidth: 560 }}>
        <CardContent sx={{ p: 4 }}>

          <Typography color="text.secondary" sx={{ mb: 3 }}>
            Select your preferred language. The interface will update immediately.
          </Typography>

          {msg.text && (
            <Alert severity={msg.type} sx={{ mb: 2, borderRadius: 2 }}>
              {msg.text}
            </Alert>
          )}

          <TextField
            select
            label="Language"
            fullWidth
            value={selected}
            onChange={(e) => setSelected(e.target.value)}
            size="small"
          >
            {SUPPORTED_LANGUAGES.map((lang) => (
              <MenuItem key={lang} value={lang}>{lang}</MenuItem>
            ))}
          </TextField>

          <Button
            variant="contained"
            fullWidth
            disabled={saving || selected === language}
            sx={{
              mt: 3,
              py: 1.4,
              borderRadius: 3,
              backgroundColor: "#14684D",
              "&:hover": { backgroundColor: "#0f4f3a" },
              textTransform: "none",
              fontWeight: "bold"
            }}
            onClick={handleSave}
          >
            {saving ? "Saving..." : t("common.save") + " Language"}
          </Button>

          {selected !== language && (
            <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 1.5, textAlign: "center" }}>
              Preview: navigation will show in <strong>{selected}</strong> after saving.
            </Typography>
          )}

        </CardContent>
      </Card>

    </Box>

  );
}

export default LanguageSettings;
