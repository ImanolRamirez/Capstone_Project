import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    mode: "light",

    primary: {
      main: "#2E7D32", // deep green
    },

    secondary: {
      main: "#66BB6A", // lighter green
    },

    background: {
      default: "#F4F7F5",
      paper: "#FFFFFF"
    },

    text: {
      primary: "#1B1B1B"
    }
  },

  typography: {
    fontFamily:
      "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto",
  },

  shape: {
    borderRadius: 12
  }
});

export default theme;