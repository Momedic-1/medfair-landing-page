

import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const userData = localStorage.getItem('userData');

  const parsedUserData = JSON.parse(userData); 
  const { role } = parsedUserData;

  console.log("The role type: ", role)

 
  if (!userData) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;


