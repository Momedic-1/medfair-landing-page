
import { RiFileAddFill } from 'react-icons/ri';
import Appointment  from "../assets/medical-appointment.png"
import virtual from "../assets/video_call_24dp_E8EAED_FILL0_wght400_GRAD0_opsz24.png"
import deliverytruk from "../assets/on-time-delivery-icon.png"
import laptest from "../assets/blood-test.png"
import trust from "../assets/Estetoscopio icono en forma de corazón estetoscopio símbolo médico herramienta para escuchar _ Vector Premium.jpeg"
export const services = [
  {
    title: "Virtual Consultations",
    description: "Speak with doctors online for expert medical advice.",
    img:virtual
  },
  {
    title: "Specialist Appointments",
    description: "Easily consult with specialists for specific health concerns.",
    img: Appointment
  },
  {
    title: "Lab Test Bookings",
    description: "Schedule lab tests and receive results on our platform.",
    img:laptest
    
  },
  {
    title: "Prescription Delivery",
    description: "Order prescribed medications and have them delivered to you.",
    img:deliverytruk
  },
  {
    title: "User-Friendly Interface",
    description: "Easily navigate our platform for a seamless experience.",
    icon: RiFileAddFill,
    img:null
  },
  {
    title: "Trusted Medical Professionals",
    description: "Connect with certified doctors and healthcare experts.",
    img:trust
  }
];

export default services; 
