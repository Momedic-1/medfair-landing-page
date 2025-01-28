import React, { useEffect, useState } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import PatientLayout from './PatientDashboard/PatientLayout';
import {jwtDecode} from "jwt-decode"

const ProtectedRoute = ({ role }) => {
  const [isTokenValid, setIsTokenValid] = useState(true);
  const userData = localStorage.getItem('userData');
  const authToken = localStorage.getItem('authToken');

  useEffect(() => {
    
    if (authToken) {
      const isExpired = checkTokenExpiration(authToken);
      if (isExpired) {
        setIsTokenValid(false);
        localStorage.removeItem('authToken');
        localStorage.removeItem('userData'); 
      }
    } else {
      setIsTokenValid(false); 
    }
  }, [authToken]);

  
  const checkTokenExpiration = (token) => {
    try {
      const decodedToken = jwtDecode(token);
      const currentTime = Date.now() / 1000; 
      return decodedToken.exp < currentTime; 
    } catch (error) {
      console.error('Error decoding token:', error);
      return true; 
    }
  };

  
  if (!isTokenValid) {
    return <Navigate to="/login" replace />;
  }

  
  if (!userData) {
    return <Navigate to="/login" replace />;
  }

  const parsedUserData = JSON.parse(userData);
  const userRole = parsedUserData.role;

  
  if (userRole !== role) {
    return <Navigate to={`/${userRole.toLowerCase()}-dashboard`} replace />;
  }

  return (
    <PatientLayout>
      <Outlet />
    </PatientLayout>
  );
};

export default ProtectedRoute;