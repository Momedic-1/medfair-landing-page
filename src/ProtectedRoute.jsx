import React, { useEffect, useState } from "react";

import { Outlet, Navigate } from "react-router-dom";

import PatientLayout from "./PatientDashboard/PatientLayout";

import {

  getToken,

  getRefreshToken,

  refreshAccessTokenIfNeeded,

  getTokenExpiryMs,

  getUserRole,

} from "./utils";



const ProtectedRoute = ({ role }) => {

  const [checking, setChecking] = useState(true);

  const [isTokenValid, setIsTokenValid] = useState(true);



  useEffect(() => {

    const validate = async () => {

      let token = getToken();

      const refresh = getRefreshToken();



      if (!token && refresh) {

        token = await refreshAccessTokenIfNeeded({ force: true });

      } else if (token) {

        const exp = getTokenExpiryMs(token);

        if (exp && exp <= Date.now() + 60_000) {

          token = await refreshAccessTokenIfNeeded({ force: true });

        }

      }



      setIsTokenValid(Boolean(token));

      setChecking(false);

    };



    validate();

  }, []);



  if (checking) {

    return (

      <div className="flex min-h-screen items-center justify-center text-[#020e7c]">

        Loading…

      </div>

    );

  }



  if (!isTokenValid) {

    return <Navigate to="/login" replace />;

  }



  const userRole = getUserRole();

  if (!userRole) {

    return <Navigate to="/login" replace />;

  }



  const expectedRole = String(role).toUpperCase();



  if (userRole !== expectedRole) {

    const redirect =

      userRole === "DOCTOR" ? "/doctor-dashboard" : "/patient-dashboard";

    return <Navigate to={redirect} replace />;

  }



  if (expectedRole === "PATIENT") {

    return (

      <PatientLayout>

        <Outlet />

      </PatientLayout>

    );

  }



  return <Outlet />;

};



export default ProtectedRoute;

