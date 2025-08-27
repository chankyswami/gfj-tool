import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';

const PrivateRoute = () => {
  const user = useSelector((state) => state.user.userDetails);
  const userStatus = useSelector((state) => state.user.status);
  const location = useLocation();

  // // Show loading while checking authentication
  // if (userStatus === 'idle') {
  //   console.log("userStatus", userStatus);
  //   return (
  //     <div className="flex justify-center items-center h-screen">
  //       <div className="text-lg">Authenticating...</div>
  //     </div>
  //   );
  // }

  // If user is not authenticated, redirect to login
  if (!user || userStatus === 'idle') {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // User is authenticated, render the protected route
  return <Outlet />;
};

export default PrivateRoute;