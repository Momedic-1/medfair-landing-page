
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
import PatientNotes from './PatientDashboard/patientNotes.jsx';
import VerifyPayment from './VerifyPayment.jsx';  
import VideoCall from './components/VideoCall.jsx';
import Subscription from './PatientDashboard/Subscription.jsx';
import DoctorProtectedRoute from './DoctorProtectedRoute.jsx';
import DoctorDashloardLayout from './DoctorDashloardLayout.jsx';



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
        <Route path='/video-call'element={<VideoCall/>}/>
        <Route path="/verify-payment" element={<VerifyPayment />} />
        {/* <Route path='/search'element={<Search/>}/> */}

        <Route path='/patient-dashboard' element={<ProtectedRoute role="PATIENT" />}>
          <Route path='' element={<Dashboard />} />
          <Route path='patient_profile' element={<Profile />} />
          <Route path='patient-notes' element={<PatientNotes />} />
          <Route path='subscription' element={<Subscription />} />
          <Route path='payment' element={<PaymentPage />} />
        </Route>
        <Route path="/doctor-dashboard" element={<DoctorProtectedRoute role="DOCTOR" />}>
          <Route path='' element={<DashboardLayout />} />
        </Route>
      </Routes>
    </Router>
  );
};

export default App;

