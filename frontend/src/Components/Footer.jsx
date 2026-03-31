import { Box, Typography } from "@mui/material";

function Footer() {
  return (
    <Box
      sx={{
        width: "100%",
        padding: 2,
        textAlign: "center",
        borderTop: "1px solid #E0E0E0",
        background: "#FFFFFF"
      }}
    >
      <Typography variant="body2">
        © 2026 AssetAtlas — Unified Financial Insights Platform
      </Typography>
    </Box>
  );
}

export default Footer;