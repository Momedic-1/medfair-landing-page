
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import DashboardLayout from './DashboardLayout';
import PatientSignup from './PatientSignup';
import LoginPage from './Login';
import Dashboard from './PatientDashboard/dashboard';
import Profile from './PatientDashboard/profile';
import PaymentPage from './PatientDashboard/payment';
import VerificationInput from './DoctorSignup/VerificationInput.jsx';
import CheckEmail from './DoctorSignup/CheckEmail.jsx';
import VerificationSuccessful from './DoctorSignup/VerificationSuccessful.jsx';
import DoctorSignupForm from './DoctorSignup/DoctorSignupForm.jsx';
import HomePage from './components/Home/HomePage.jsx/HomePage.jsx';
import ProtectedRoute from './ProtectedRoute.jsx';
import IncomingCalls from './components/dashboard/WelcomeBack/IncomingCall.jsx';
const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/doctor_signup/*" element={<DoctorSignupForm />} />
        <Route path="/patient_signup/*" element={<PatientSignup />} />
        <Route path="/verify-email" element={<VerificationInput />} />
        <Route path="/check-email" element={<CheckEmail />} />
        <Route path="/verification-success" element={<VerificationSuccessful />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path='/incoming-call'element={<IncomingCalls/>}/>
        <Route element={<ProtectedRoute role="PATIENT" />}>
          <Route path="/patient-dashboard" element={<Dashboard />} />
          <Route path="/patient_profile" element={<Profile />} />
          <Route path="/payment" element={<PaymentPage />} />
        </Route>
        <Route element={<ProtectedRoute role="DOCTOR" />}>
          <Route path="/doctor-dashboard/*" element={<DashboardLayout />} />
        </Route>
      </Routes>
    </Router>
  );
};

export default App;
