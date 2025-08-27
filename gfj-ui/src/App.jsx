import React, { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { rehydrateUser } from "./features/user/userSlice"; // Import the rehydration action
// import { CircularProgress } from "@mui/material";
import DynamicDashboard from "./components/DynamicDashboard";
import PrivateRoute from "./routes/PrivateRoute";
import Login from "./components/Login";
import { ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import '../src/App.css'
import CreateQuotation from "./components/dashboard/calculator/CreateQuotation";
import TitleManager from "./components/TitleManager"
import GemLoader from "./components/loader/GemLoader";

function App() {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user.userDetails);
  const userStatus = useSelector((state) => state.user.status);

  // Rehydrate user state from localStorage on app initialization
  useEffect(() => {
    dispatch(rehydrateUser());
  }, [dispatch]);

  // Get the last visited dashboard page
  const getLastVisitedPage = () => {
    if (!user) return '/login';
    const savedPage = localStorage.getItem('dashboard_current_page');
    return savedPage ? `/dashboard/${savedPage}` : '/dashboard';
  };

  // Show loading while checking authentication status
  if (userStatus === 'loading') {
    return (
      <div className="flex justify-center items-center h-screen">
        <GemLoader />
      </div>
    );
  }

  return (
    <div className="flex flex-col pt-16 h-full bg-gradient-background min-h-screen">
      <TitleManager />
      <Routes>
        <Route path="/" element={<Navigate to={getLastVisitedPage()} replace />} />
        <Route path="/login" element={<Login />} />
        <Route element={<PrivateRoute />}>
          <Route path="/dashboard" element={<DynamicDashboard />} />
          <Route path="/dashboard/calculator" element={<DynamicDashboard />} />
          <Route path="/dashboard/quotation" element={<DynamicDashboard />} />
          <Route path="/dashboard/client" element={<DynamicDashboard />} />
          <Route path="/dashboard/admin" element={<DynamicDashboard />} />
          <Route path="/dashboard/agent" element={<DynamicDashboard />} />
          <Route path="/dashboard/shipping" element={<DynamicDashboard />} />
          <Route path="/dashboard/ledger" element={<DynamicDashboard />} />
          <Route path="/dashboard/chat" element={<DynamicDashboard />} />
        </Route>
      </Routes>
      <ToastContainer 
        position="bottom-right"
        toastClassName="bg-glass border border-white/20 backdrop-blur-lg"
        progressClassName="bg-gradient-primary"
      />
    </div>
  );
}

export default App;