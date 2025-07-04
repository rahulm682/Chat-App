import { createTheme } from "@mui/material/styles";

// CSS Custom Properties for theme colors
const lightTheme = {
  "--bg-primary": "#ffffff",
  "--bg-secondary": "#f5f5f5",
  "--bg-paper": "#ffffff",
  "--text-primary": "#000000",
  "--text-secondary": "#666666",
  "--border-color": "#e0e0e0",
  "--hover-color": "#f5f5f5",
};

const darkTheme = {
  "--bg-primary": "#121212",
  "--bg-secondary": "#1e1e1e",
  "--bg-paper": "#2d2d2d",
  "--text-primary": "#ffffff",
  "--text-secondary": "#b0b0b0",
  "--border-color": "#404040",
  "--hover-color": "#404040",
};

// Apply theme to document
export const applyTheme = (isDark: boolean) => {
  const root = document.documentElement;
  const theme = isDark ? darkTheme : lightTheme;
  
  Object.entries(theme).forEach(([property, value]) => {
    root.style.setProperty(property, value);
  });
};

// Material-UI theme configuration
export const createAppTheme = (isDark: boolean) => {
  return createTheme({
    palette: {
      mode: isDark ? "dark" : "light",
      primary: {
        main: "#1976d2",
      },
      secondary: {
        main: "#dc004e",
      },
      background: {
        default: isDark ? "#121212" : "#f5f5f5",
        paper: isDark ? "#2d2d2d" : "#ffffff",
      },
      text: {
        primary: isDark ? "#ffffff" : "#000000",
        secondary: isDark ? "#b0b0b0" : "#666666",
      },
    },
    components: {
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundColor: isDark ? "#1e1e1e" : "#ffffff",
            color: isDark ? "#ffffff" : "#000000",
            borderBottom: `1px solid ${isDark ? "#404040" : "#e0e0e0"}`,
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundColor: isDark ? "#2d2d2d" : "#ffffff",
            border: `1px solid ${isDark ? "#404040" : "#e0e0e0"}`,
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            backgroundColor: isDark ? "#2d2d2d" : "#ffffff",
            border: `1px solid ${isDark ? "#404040" : "#e0e0e0"}`,
          },
        },
      },
      MuiListItem: {
        styleOverrides: {
          root: {
            "&:hover": {
              backgroundColor: isDark ? "#404040" : "#f5f5f5",
            },
          },
        },
      },
    },
  });
};
