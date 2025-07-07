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
import { useRegisterMutation } from '../store/services/chatApi';
import { useAppDispatch } from '../store/hooks';
import { setUser } from '../store/slices/userSlice';
import { connectSocket } from '../socket/socket';

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  const navigate = useNavigate();
  const [register] = useRegisterMutation();
  const dispatch = useAppDispatch();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Validate passwords match
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    // Validate password length
    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      setLoading(false);
      return;
    }

    try {
      const result = await register({ name, email, password }).unwrap();
      dispatch(setUser(result));
      localStorage.setItem("user", JSON.stringify(result));
      
      // Connect socket after successful registration
      if (result.token) {
        connectSocket(result.token);
      }
      
      navigate("/chats");
    } catch (err: any) {
      setError(err.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleToggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const isFormValid = name.trim() && email.trim() && password && confirmPassword && password === confirmPassword;

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
              Create Account
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Join us and start chatting with friends
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              label="Full Name"
              fullWidth
              margin="normal"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              disabled={loading}
              sx={{ mb: 2 }}
            />

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
              helperText="Password must be at least 6 characters long"
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
              sx={{ mb: 2 }}
            />

            <TextField
              label="Confirm Password"
              type={showConfirmPassword ? "text" : "password"}
              fullWidth
              margin="normal"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              disabled={loading}
              error={Boolean(confirmPassword && password !== confirmPassword)}
              helperText={confirmPassword && password !== confirmPassword ? "Passwords do not match" : undefined}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={handleToggleConfirmPasswordVisibility}
                      edge="end"
                      disabled={loading}
                    >
                      {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
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
              disabled={loading || !isFormValid}
              sx={{ mb: 3, py: 1.5 }}
            >
              {loading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                "Create Account"
              )}
            </Button>

            <Box sx={{ textAlign: "center" }}>
              <Typography variant="body2" color="text.secondary">
                Already have an account?{" "}
                <Link
                  component={RouterLink}
                  to="/login"
                  sx={{ 
                    textDecoration: "none",
                    fontWeight: "bold",
                    "&:hover": {
                      textDecoration: "underline"
                    }
                  }}
                >
                  Sign in here
                </Link>
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default Register;
