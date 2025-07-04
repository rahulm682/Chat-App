import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { CssBaseline } from "@mui/material";
import { AuthProvider } from "./context/AuthContext";
import { OnlineUsersProvider } from "./context/OnlineUsersContext";
import { ThemeProvider } from "./context/ThemeContext";
import { NotificationProvider } from "./context/NotificationContext";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ThemeProvider>
      <AuthProvider>
        <OnlineUsersProvider>
          <NotificationProvider>
            <CssBaseline />
            <App />
          </NotificationProvider>
        </OnlineUsersProvider>
      </AuthProvider>
    </ThemeProvider>
  </React.StrictMode>
);
