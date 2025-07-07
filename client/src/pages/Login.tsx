import React, { useState } from "react";
import { 
  Container, 
  TextField, 
  Button, 
  Typography, 
  Box, 
  Link, 
  Alert, 
  CircularProgress,
  Paper,
  InputAdornment,
  IconButton
} from "@mui/material";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { useLoginMutation } from '../store/services/chatApi';
import { useAppDispatch } from '../store/hooks';
import { setUser } from '../store/slices/userSlice';
import { connectSocket } from '../socket/socket';

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const [login] = useLoginMutation();
  const dispatch = useAppDispatch();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const result = await login({ email, password }).unwrap();
      dispatch(setUser(result));
      localStorage.setItem("user", JSON.stringify(result));
      
      // Connect socket after successful login
      if (result.token) {
        connectSocket(result.token);
      }
      
      navigate("/chats");
    } catch (err: any) {
      setError(err.response?.data?.message || "Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          py: 4,
        }}
      >
        <Paper
          elevation={3}
          sx={{
            p: 4,
            width: "100%",
            maxWidth: 400,
            borderRadius: 2,
          }}
        >
          <Box sx={{ textAlign: "center", mb: 3 }}>
            <Typography variant="h4" component="h1" gutterBottom fontWeight="bold" color="primary">
              Welcome Back
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Sign in to continue to your chats
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              label="Email"
              type="email"
              fullWidth
              margin="normal"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
              sx={{ mb: 2 }}
            />
            
            <TextField
              label="Password"
              type={showPassword ? "text" : "password"}
              fullWidth
              margin="normal"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={handleTogglePasswordVisibility}
                      edge="end"
                      disabled={loading}
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 3 }}
            />

            <Button
              type="submit"
              variant="contained"
              fullWidth
              size="large"
              disabled={loading || !email || !password}
              sx={{ mb: 3, py: 1.5 }}
            >
              {loading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                "Sign In"
              )}
            </Button>

            <Box sx={{ textAlign: "center" }}>
              <Typography variant="body2" color="text.secondary">
                Don't have an account?{" "}
                <Link
                  component={RouterLink}
                  to="/register"
                  sx={{ 
                    textDecoration: "none",
                    fontWeight: "bold",
                    "&:hover": {
                      textDecoration: "underline"
                    }
                  }}
                >
                  Sign up here
                </Link>
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default Login;
