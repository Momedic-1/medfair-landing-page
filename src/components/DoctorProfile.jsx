import { useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { PiStethoscope } from "react-icons/pi";

const DoctorProfile = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const profile = location.state?.profileData;
  const [activeTab, setActiveTab] = useState("Availability");
  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    const storedAppointments = localStorage.getItem("appointments");
    if (storedAppointments) {
      setAppointments(JSON.parse(storedAppointments));
    }
  }, []);

  const formatDate = (date) => {
    const parsedDate = new Date(date);
    return parsedDate.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "2-digit",
    });
  };

  const formatTime = (time) => {
    const [hour, minute] = time.split(":");
    const date = new Date();
    date.setHours(hour, minute);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  console.log(profile);

  return (
    <div className="max-w-5xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      {/* Back Button */}
      <div className="flex justify-end mb-4">
        <button
          onClick={() => navigate("/doctor-dashboard")}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Back
        </button>
      </div>

      <div className="flex flex-col md:flex-column items-center justify-center gap-6 mb-8 border-b pb-6">
        <img
          src={profile.data?.imageUrl || "/default-avatar.png"}
          alt="Doctor"
          className="w-32 h-32 rounded-full object-cover border-4 border-blue-100"
        />
        <div className="text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-2">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              {profile.data?.title} {profile.data?.firstName}{" "}
              {profile.data?.lastName}
            </h1>
            <button
              onClick={() => navigate("/editProfile")}
              {...localStorage.setItem("profileEdit", true)}
              {...localStorage.setItem("DoctorsProfile", JSON.stringify(profile.data))}
              title="Edit your profile"
              className="text-blue-600 hover:text-blue-800"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="#000"
                viewBox="-5.0 -10.0 110.0 135.0"
              >
                <path
                  d="m71.992 6.8398c5.8203-5.8242 15.242-5.75 20.996 0 0.95312 0.95312 1.8164 2.0312 2.5195 3.2383 3.3359 5.7773 2.3984 13.156-2.3359 17.906l-38.973 39.074c-2.6562 2.6641-5.6367 4.3906-9.3398 5.3359l-18.52 4.7305c-2.0078 0.51172-3.9805-1.2969-3.3594-3.5195l4.6523-18.367c0.9375-3.6992 2.6602-6.707 5.3125-9.3594zm22.523 47.086c1.5391 0 2.7891-1.25 2.7891-2.793 0-1.543-1.25-2.7969-2.7891-2.7969-1.5469 0-2.7969 1.25-2.7969 2.7969 0 1.543 1.25 2.793 2.7969 2.793zm-2.6055 6.2578v25.789c0 3.2656-2.668 5.9375-5.9375 5.9375h-71.945c-3.2656 0-5.9375-2.6719-5.9375-5.9375v-71.949c0-3.2656 2.6719-5.9375 5.9375-5.9375h33.555c1.543 0 2.793-1.25 2.793-2.7969 0-1.543-1.25-2.793-2.793-2.793l-33.555 0.003906c-6.3516 0-11.527 5.1758-11.527 11.523v71.949c0 6.3516 5.1758 11.527 11.527 11.527h71.945c6.3555 0 11.527-5.1758 11.527-11.527v-25.789c0-1.543-1.25-2.793-2.7969-2.793-1.5391 0-2.7891 1.25-2.7891 2.793zm-41.996 3.2734c0.10938-0.10547 0.22266-0.21484 0.33594-0.32422l38.965-39.074c3.3164-3.3242 3.5938-8.6602 0.75-12.25-0.21484-0.27344-0.52734-0.60547-0.9375-1.0156-3.5781-3.5742-9.4609-3.6289-13.086 0l-39.047 39.043c-0.10156 0.10156-0.20312 0.20312-0.30078 0.30859l13.316 13.316zm-4.8594 3.043-11.516-11.516c-0.1875 0.51172-0.35156 1.0469-0.49219 1.6055l-3.5352 13.957 13.973-3.5664c0.54688-0.14062 1.0703-0.30078 1.5703-0.48047z"
                  fillRule="evenodd"
                />
              </svg>
            </button>
          </div>
          <p className="text-blue-600 font-medium mb-2">
            {profile?.specialization}
          </p>
          <div className="flex items-center justify-center md:justify-start gap-2 text-gray-600">
            <PiStethoscope style={{ width: "1.3em", height: "1.3em" }} />
            <span>{profile.data?.medicalSpecialization}</span>
            <span>🎓 {profile.data?.qualifications}</span>
          </div>
        </div>
      </div>
      {/* <div className="flex justify-end mb-4">
        <button
          onClick={() => navigate("/doctor-dashboard")}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Edit Profile
        </button>
      </div> */}

      {/* Tabs Section */}
      <div className="border-b mb-6">
        <ul className="flex justify-around text-gray-600 font-medium">
          {["Availability", "About the provider"].map((tab) => (
            <li
              key={tab}
              className={`py-2 px-4 cursor-pointer ${
                activeTab === tab
                  ? "border-b-2 border-blue-600 text-blue-600"
                  : "hover:text-blue-600"
              }`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </li>
          ))}
        </ul>
      </div>

      {activeTab === "Availability" && (
        <div className="space-y-6">
          <h2 className="text-lg font-semibold mb-3">Availability</h2>
          <div className="grid grid-cols-3 gap-4">
            {appointments.map((appointment, index) => (
              <div
                key={index}
                className="bg-blue-50 p-4 rounded-lg text-center"
              >
                <h3 className="text-blue-600 font-medium">
                  {formatDate(appointment.date)}
                </h3>
                <div className="space-y-2 mt-2">
                  <button className="w-full py-2 bg-blue-100 rounded-lg hover:bg-blue-200">
                    {formatTime(appointment.time)}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === "About the provider" && (
        <div className="space-y-6">
          <h2 className="text-lg font-semibold mb-3">About the provider</h2>
          <p className="text-gray-700 leading-relaxed">
            {profile.data?.about ||
              "I have been practicing medicine for 9+ years from neurosurgical intensive care unit to emergency medicine to urgent care. With multi-speciality experience from treating adults to pediatrics, I am confident I can help you get well soon and back to your routine life."}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <div>
              <h3 className="text-gray-800 font-medium">Specialities</h3>
              <p className="text-gray-600">
                {profile.data?.medicalSpecialization}
              </p>
            </div>
            <div>
              <h3 className="text-gray-800 font-medium">
                Licensed to practice
              </h3>
              <p className="text-gray-600">{profile.data?.licenseLocation}</p>
            </div>
            <div>
              <h3 className="text-gray-800 font-medium">Practice name</h3>
              <p className="text-gray-600">{profile.data?.practiceName}</p>
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-gray-800 font-medium">Languages spoken</h3>
            <p className="text-gray-600">
              {profile.data?.languages || "English, Hindi, Gujarati"}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorProfile;
