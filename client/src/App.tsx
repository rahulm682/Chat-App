import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Box, CircularProgress, Typography } from "@mui/material";
import { ThemeProvider as MuiThemeProvider } from "@mui/material/styles";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Chat from "./pages/Chat";
import { useTheme } from "./context/ThemeContext";
import { createAppTheme } from "./theme";
import { useAppDispatch, useAppSelector } from './store/hooks';
import { selectCurrentUser, setUser } from './store/slices/userSlice';
import { connectSocket } from './socket/socket';

const App = () => {
  console.log('VITE_API_URL in App:', import.meta.env.VITE_API_URL);
  const { isDark } = useTheme();
  const [isLoading, setIsLoading] = useState(true);
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectCurrentUser);
  useEffect(() => {
    // Simulate loading time for better UX
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      dispatch(setUser(parsedUser));
      
      // Connect socket if user has a token
      if (parsedUser.token) {
        connectSocket(parsedUser.token);
      }
    }
  }, [dispatch]);

  if (isLoading) {
    return (
      <Box
        sx={{
          height: "100vh",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          bgcolor: "background.default",
        }}
      >
        <CircularProgress size={60} sx={{ mb: 2 }} />
        <Typography variant="h6" color="text.secondary">
          Loading Chat App...
        </Typography>
      </Box>
    );
  }

  const theme = createAppTheme(isDark);

  return (
    <MuiThemeProvider theme={theme}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to={user ? "/chats" : "/login"} />} />
          <Route 
            path="/login" 
            element={user ? <Navigate to="/chats" /> : <Login />} 
          />
          <Route 
            path="/register" 
            element={user ? <Navigate to="/chats" /> : <Register />} 
          />
          <Route 
            path="/chats" 
            element={user ? <Chat /> : <Navigate to="/login" />} 
          />
        </Routes>
      </BrowserRouter>
    </MuiThemeProvider>
  );
};

export default App;
