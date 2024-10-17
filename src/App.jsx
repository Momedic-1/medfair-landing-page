import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import DashboardLayout from './DashboardLayout'
import PatientSignup from './PatientSignup'
import LoginPage from './Login'
import Dashboard from './PatientDashboard/dashboard'
import Profile from './PatientDashboard/profile'
import PaymentPage from './PatientDashboard/payment'
import VerificationInput from "./DoctorSignup/VerificationInput.jsx";
import CheckEmail from "./DoctorSignup/CheckEmail.jsx";
import VerificationSuccessful from "./DoctorSignup/VerificationSuccessful.jsx";
import DoctorSignupForm from "./DoctorSignup/DoctorSignupForm.jsx";


const App = () => {
  return (
    <Router>
      <Routes>
        <Route path='/' element={<DoctorSignupForm />} />
        <Route path='/doctor-dashboard' element={<DashboardLayout />} />
        <Route path ='/patient_signup/*' element = {<PatientSignup/>}/>
        <Route path ='/verify-email' element = { <VerificationInput />}/>
        <Route path ='/check-email' element = { <CheckEmail />}/>
        <Route path ='/verification-success' element = { <VerificationSuccessful />}/>
        <Route path = '/login' element = {<LoginPage/>}/>
        <Route path = '/patient-dashboard/' element ={<Dashboard/>}/>
        <Route path = '/patient_profile/' element = {<Profile/>}/>
        <Route path = '/payment' element={<PaymentPage/>}></Route>
      </Routes>
    </Router>
  )
}

export default App;
