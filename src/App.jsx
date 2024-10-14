import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import LandingPage from './LandingPage'
import DashboardLayout from './DashboardLayout'
import PatientSignup from './PatientSignup'
import LoginPage from './Login'
import Dashboard from './PatientDashboard/dashboard'
import Profile from './PatientDashboard/profile'
import PaymentPage from './PatientDashboard/payment'


const App = () => {
  return (
    <Router>
      <Routes>
        <Route path='/' element={<LandingPage />} />
        <Route path='/dashboard/*' element={<DashboardLayout />} />
        <Route path ='/patient_signup/*' element = {<PatientSignup/>}/>
        <Route path = '/login' element = {<LoginPage/>}/>
        <Route path = '/patient-dashboard/' element ={<Dashboard/>}/>
        <Route path = '/patient_profile/' element = {<Profile/>}/>
        <Route path = '/payment' element={<PaymentPage/>}></Route>
      </Routes>
    </Router>
  )
}

export default App;
