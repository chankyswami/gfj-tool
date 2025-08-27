import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  CircularProgress,
  InputAdornment,
  IconButton,
} from "@mui/material";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useDispatch, useSelector } from "react-redux";
import { loginUser } from "../features/user/userSlice";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import logo from '../assets/gfj.png';

const validationSchema = Yup.object({
  username: Yup.string().required("Username is required"),
  password: Yup.string().required("Password is required"),
});

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const user = useSelector((state) => state.user.userDetails);
  const status = useSelector((state) => state.user.status);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Get the last visited dashboard page or the intended destination
  const getRedirectPath = () => {
    // If there's a state.from (user was redirected to login), use that
    if (location.state?.from?.pathname) {
      return location.state.from.pathname;
    }
    // Otherwise, use the saved dashboard page
    const savedPage = localStorage.getItem("dashboard_current_page");
    return savedPage ? `/dashboard/${savedPage}` : "/dashboard";
  };

  // Redirect if user is already logged in
  useEffect(() => {
    if (user && status !== "loading") {
      navigate(getRedirectPath(), { replace: true });
    }
  }, [user, status, navigate, location.state]);

  const formik = useFormik({
    initialValues: {
      username: "",
      password: "",
    },
    validationSchema: validationSchema,
    onSubmit: async (values) => {
      setIsLoading(true);
      try {
        const result = await dispatch(loginUser(values)).unwrap(); // Unwraps asyncThunk
        toast.success(`Welcome, ${result.name}!`);
        navigate(getRedirectPath(), { replace: true });
      } catch (error) {
        console.log("Login Error",error)
        if (error.message === "INVALID_CREDENTIALS") {
          toast.error("Login failed. Please check your credentials.");
        } else if (error.message === "Account Locked Please Contact Admin!") {
          toast.error("Account Locked Please Contact Admin!");
        } else if (error.message === "SERVER_ERROR") {
          toast.error("Error Occurred: Please Contact Support");
        } else {
          toast.error("Login failed. Please check your credentials.");
        }
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    },
  });

  // Don't render login form if user is already logged in
  if (user && status !== "loading") {
    return null;
  }

  return (
    <Box className="min-h-screen relative overflow-hidden">

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Logo/Brand Section */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-full mb-4 shadow-lg transform hover:scale-110 transition-transform duration-300">
              <img src={logo} alt="Logo" />
            </div>
            <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">
              Gems From Jaipur
            </h1>
            <p className="text-purple-200 text-lg">
              Premium Jewelry Management System
            </p>
          </div>

          {/* Login Card */}
          <Paper
            elevation={24}
            sx={{
              padding: 4,
              backgroundColor: "rgba(255, 255, 255, 0.95)",
              backdropFilter: "blur(20px)",
              border: "1px solid rgba(255, 255, 255, 0.2)",
              borderRadius: 4,
              transform: isHovered ? "translateY(-5px)" : "translateY(0)",
              transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
            }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            {/* Card Header */}
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-purple-600 to-purple-700 rounded-full mb-3">
                <span className="text-white text-xl">🔐</span>
              </div>
              <Typography
                variant="h4"
                className="text-gray-800 font-bold mb-2"
                sx={{ fontWeight: 700 }}
              >
                Welcome Back
              </Typography>
              <Typography variant="body2" className="text-gray-600">
                Sign in to your account to continue
              </Typography>
            </div>

            {/* Login Form */}
            <form onSubmit={formik.handleSubmit} className="space-y-4">
              {/* Username Field */}
              <div className="relative">
                <TextField
                  fullWidth
                  id="username"
                  name="username"
                  label="Username"
                  variant="outlined"
                  value={formik.values.username}
                  onChange={formik.handleChange}
                  error={
                    formik.touched.username && Boolean(formik.errors.username)
                  }
                  helperText={formik.touched.username && formik.errors.username}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <span className="text-gray-400">👤</span>
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                      backgroundColor: "rgba(255, 255, 255, 0.8)",
                      "& fieldset": {
                        borderColor: "rgba(156, 163, 175, 0.3)",
                        borderWidth: "2px",
                      },
                      "&:hover fieldset": {
                        borderColor: "var(--brand-gold)",
                        borderWidth: "2px",
                      },
                      "&.Mui-focused fieldset": {
                        borderColor: "var(--brand-purple)",
                        borderWidth: "2px",
                      },
                    },
                    "& .MuiInputLabel-root": {
                      color: "rgba(107, 114, 128, 0.8)",
                      "&.Mui-focused": {
                        color: "var(--brand-purple)",
                      },
                    },
                  }}
                />
              </div>

              {/* Password Field */}
              <div className="relative">
                <TextField
                  fullWidth
                  id="password"
                  name="password"
                  label="Password"
                  type={showPassword ? "text" : "password"}
                  variant="outlined"
                  value={formik.values.password}
                  onChange={formik.handleChange}
                  error={
                    formik.touched.password && Boolean(formik.errors.password)
                  }
                  helperText={formik.touched.password && formik.errors.password}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <span className="text-gray-400">🔒</span>
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword((prev) => !prev)}
                          edge="end"
                          sx={{ color: "rgba(107, 114, 128, 0.6)" }}
                        >
                          {showPassword ? <Visibility /> : <VisibilityOff />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                      backgroundColor: "rgba(255, 255, 255, 0.8)",
                      "& fieldset": {
                        borderColor: "rgba(156, 163, 175, 0.3)",
                        borderWidth: "2px",
                      },
                      "&:hover fieldset": {
                        borderColor: "var(--brand-gold)",
                        borderWidth: "2px",
                      },
                      "&.Mui-focused fieldset": {
                        borderColor: "var(--brand-purple)",
                        borderWidth: "2px",
                      },
                    },
                    "& .MuiInputLabel-root": {
                      color: "rgba(107, 114, 128, 0.8)",
                      "&.Mui-focused": {
                        color: "var(--brand-purple)",
                      },
                    },
                  }}
                />
              </div>

              {/* Submit Button */}
              <Button
                fullWidth
                type="submit"
                variant="contained"
                disabled={isLoading}
                sx={{
                  marginTop: 3,
                  padding: 2,
                  borderRadius: 2,
                  background:
                    "linear-gradient(135deg, var(--brand-purple) 0%, var(--brand-dark-purple) 100%)",
                  boxShadow: "0 10px 25px -5px rgba(139, 92, 246, 0.4)",
                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                  textTransform: "none",
                  fontSize: "1.1rem",
                  fontWeight: 600,
                  "&:hover": {
                    background:
                      "linear-gradient(135deg, var(--brand-dark-purple) 0%, var(--brand-purple) 100%)",
                    transform: "translateY(-2px)",
                    boxShadow: "0 20px 40px -10px rgba(139, 92, 246, 0.6)",
                  },
                  "&:active": {
                    transform: "translateY(0)",
                  },
                  "&:disabled": {
                    background: "rgba(156, 163, 175, 0.5)",
                    transform: "none",
                    boxShadow: "none",
                  },
                }}
              >
                {!isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span>🚀</span>
                    Sign In
                  </span>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    <CircularProgress color="inherit" size={20} thickness={4} />
                    <span>Signing In...</span>
                  </div>
                )}
              </Button>
            </form>

            {/* Footer */}
            <div className="mt-6 text-center">
              <Typography variant="body2" className="text-gray-500">
                Secure access to your jewelry business
              </Typography>
            </div>
          </Paper>

          {/* Bottom Decoration */}
          <div className="text-center mt-8">
            <div className="inline-flex items-center gap-2 text-purple-200 text-sm">
              <span>✨</span>
              <span>Powered by Advanced Technology</span>
              <span>✨</span>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Background Effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-transparent via-transparent to-purple-900/20"></div>
      </div>
    </Box>
  );
};

export default Login;
