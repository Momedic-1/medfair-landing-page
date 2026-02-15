// import React from 'react'
import { Routes, Route } from "react-router-dom";
// import Sidebar from './components/Sidebar'
import Dashboard from "./components/Dashboard";
import Search from "./pages/Search";
import Finances from "./pages/Finances";
import ContactUs from "./pages/ContactUs";
import DoctorProfile from "./components/DoctorProfile";
import ViewProfile from "./components/ViewProfile";

const DashboardLayout = () => {
  return (
    <div className="">
      {/* <Sidebar /> */}
      <div className="flex-1 overflow-auto p-0 lg:ml-8 bg-gray-100">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="view-profile" element={<DoctorProfile />} />
          <Route path="edit-profile" element={<ViewProfile />} />
          <Route path="/notes" element={<Search />} />
          <Route path="/contact-us" element={<ContactUs />} />
          <Route path="/finances" element={<Finances />} />
          <Route path="/doctor-profile" element={<DoctorProfile />} />
        </Routes>
      </div>
    </div>
  );
};

export default DashboardLayout;
