import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { CssBaseline } from "@mui/material";
import { ThemeProvider } from "./context/ThemeContext";
import OnlineUsersProvider from "./context/OnlineUsersContext";
import "./index.css";
import { Provider } from "react-redux";
import { store } from "./store";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Provider store={store}>
      <ThemeProvider>
        <OnlineUsersProvider>
          <CssBaseline />
          <App />
        </OnlineUsersProvider>
      </ThemeProvider>
    </Provider>
  </React.StrictMode>
);
