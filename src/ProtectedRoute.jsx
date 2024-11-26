
import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';

const ProtectedRoute = ({ role }) => {
  const userData = localStorage.getItem('userData');

  if (!userData) {
    return <Navigate to="/login" replace />;
  }

  const parsedUserData = JSON.parse(userData);
  const userRole = parsedUserData.role;

  if (userRole !== role) {
    return <Navigate to={`/${userRole.toLowerCase()}-dashboard`} replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
