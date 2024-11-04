
import { RiFileAddFill } from 'react-icons/ri';
import { IoLaptopOutline } from 'react-icons/io5';
import { IoIosCash } from "react-icons/io";
import { MdDeliveryDining } from "react-icons/md";
import { FaRegClock } from "react-icons/fa";

export const services = [
  {
    title: "Virtual Consultations",
    description: "Speak with doctors online for expert medical advice.",
    icon: RiFileAddFill
  },
  {
    title: "Specialist Appointments",
    description: "Easily consult with specialists for specific health concerns.",
    icon: IoLaptopOutline
  },
  {
    title: "Lab Test Bookings",
    description: "Schedule lab tests and receive results on our platform.",
    icon: IoIosCash
  },
  {
    title: "Prescription Delivery",
    description: "Order prescribed medications and have them delivered to you.",
    icon: MdDeliveryDining
  },
  {
    title: "User-Friendly Interface",
    description: "Easily navigate our platform for a seamless experience.",
    icon: RiFileAddFill
  },
  {
    title: "Trusted Medical Professionals",
    description: "Connect with certified doctors and healthcare experts.",
    icon: FaRegClock
  }
];

export default services; 
