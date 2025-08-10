import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import DashboardLayout from "./DashboardLayout";
import PatientSignup from "./PatientSignup";
import LoginPage from "./Login";
import Dashboard from "./PatientDashboard/dashboard";
import Profile from "./PatientDashboard/profile";
import PaymentPage from "./PatientDashboard/payment";
import VerificationInput from "./DoctorSignup/VerificationInput.jsx";
import CheckEmail from "./DoctorSignup/CheckEmail.jsx";
import VerificationSuccessful from "./DoctorSignup/VerificationSuccessful.jsx";
import DoctorSignupForm from "./DoctorSignup/DoctorSignupForm.jsx";
import HomePage from "./components/Home/HomePage.jsx/HomePage.jsx";
import ProtectedRoute from "./ProtectedRoute.jsx";
import IncomingCalls from "./components/dashboard/WelcomeBack/IncomingCall.jsx";
import PatientNotes from "./PatientDashboard/patientNotes.jsx";
import VerifyPayment from "./VerifyPayment.jsx";
import VideoCall from "./components/VideoCall.jsx";
import Subscription from "./PatientDashboard/Subscription.jsx";
import ForgotPassword from "./ForgotPassword.jsx";
import OTPVerification from "./OTPVerification.jsx";
import ProfileLayout from "./components/ProfileLayout.jsx";
import ViewProfile from "./components/ViewProfile.jsx";
import DoctorProfile from "./components/DoctorProfile.jsx";
import { ToastContainer } from "react-toastify";

import ContactUs from "./pages/ContactUs.jsx";
import Investigations from "./PatientDashboard/Investigations.jsx";

const App = () => {
  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/doctor_signup/*" element={<DoctorSignupForm />} />
          <Route path="/patient_signup/*" element={<PatientSignup />} />
          <Route path="/verify-email" element={<VerificationInput />} />
          <Route path="/check-email" element={<CheckEmail />} />
          <Route
            path="/verification-success"
            element={<VerificationSuccessful />}
          />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/incoming-call" element={<IncomingCalls />} />
          <Route path="/video-call" element={<VideoCall />} />
          <Route path="/verify-payment" element={<VerifyPayment />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/otp-verification" element={<OTPVerification />} />
          <Route path="/doctorProfile" element={<DoctorProfile />} />
          <Route path="/editProfile" element={<ViewProfile />} />
          {/* <Route path='/search'element={<Search/>}/> */}

          <Route
            path="/patient-dashboard"
            element={<ProtectedRoute role="PATIENT" />}
          >
            <Route path="" element={<Dashboard />} />
            <Route path="profile" element={<Profile />} />
            <Route path="patient-notes" element={<PatientNotes />} />
            <Route path="patient-investigations" element={<Investigations />} />
            <Route path="subscription" element={<Subscription />} />
            <Route path="payment" element={<PaymentPage />} />
            <Route path="contact-us" element={<ContactUs />} />
          </Route>
          <Route element={<ProtectedRoute role="DOCTOR" />}>
            <Route path="/doctor-dashboard/*" element={<DashboardLayout />} />
            <Route path="/view-profile/*" element={<ProfileLayout />} />
          </Route>
        </Routes>
      </Router>
      <ToastContainer position="top-right" autoClose={3000} />
    </>
  );
};

export default App;
