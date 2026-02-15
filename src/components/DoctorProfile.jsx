import { useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { PiStethoscope } from "react-icons/pi";
import { Pencil } from "lucide-react";
import axios from "axios";
import { baseUrl } from "../env";
import { getToken, getUserData } from "../utils";

const DoctorProfile = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const stateProfile = location.state?.profileData;
  const [profile, setProfile] = useState(stateProfile ?? null);
  const [profileLoading, setProfileLoading] = useState(!stateProfile);
  const [activeTab, setActiveTab] = useState("Availability");
  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    if (stateProfile) {
      setProfile(stateProfile);
      setProfileLoading(false);
      return;
    }
    const userData = getUserData();
    const doctorId = userData?.id;
    const token = getToken();
    if (!doctorId || !token) {
      setProfileLoading(false);
      return;
    }
    let cancelled = false;
    axios
      .get(`${baseUrl}/api/v1/doctor-profile/profile-full/${doctorId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        if (!cancelled && res?.data) setProfile(res.data);
      })
      .catch(() => { if (!cancelled) setProfile(null); })
      .finally(() => { if (!cancelled) setProfileLoading(false); });
    return () => { cancelled = true; };
  }, [stateProfile]);

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

  if (profileLoading) {
    return (
      <div className="max-w-5xl mx-auto p-4 md:p-6 bg-white rounded-lg shadow-lg flex items-center justify-center min-h-[200px]">
        <p className="text-gray-600">Loading profile...</p>
      </div>
    );
  }

  if (!profile?.data) {
    return (
      <div className="max-w-5xl mx-auto p-4 md:p-6 bg-white rounded-lg shadow-lg">
        <div className="flex justify-end mb-4">
          <button
            onClick={() => navigate("/doctor-dashboard")}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back
          </button>
        </div>
        <p className="text-gray-600">No profile data found.</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-6 bg-white rounded-lg shadow-lg">
      {/* Back Button */}
      {/* <div className="flex justify-end mb-4">
        <button
          onClick={() => navigate("/doctor-dashboard")}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Back
        </button>
      </div> */}

      <div className="relative bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 p-8 rounded-2xl border border-blue-100 mb-8 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-600 to-purple-600"></div>
          <div className="absolute top-4 right-4 w-32 h-32 bg-white rounded-full opacity-10"></div>
          <div className="absolute bottom-4 left-4 w-20 h-20 bg-white rounded-full opacity-10"></div>
        </div>

        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8 md:gap-16 md:w-full">
          {/* Profile Image Section */}
          <div className="relative flex-shrink-0">
            <div className="relative w-40 h-40 lg:w-48 lg:h-48">
              {/* Animated Ring */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 p-1 animate-pulse">
                <div className="w-full h-full rounded-full bg-white p-2">
                  <img
                    src={profile.data?.imageUrl || "/default-avatar.png"}
                    alt="Doctor"
                    className="w-full h-full rounded-full object-cover shadow-lg"
                  />
                </div>
              </div>

              {/* Online Status */}
              <div className="absolute bottom-2 right-2 w-6 h-6 bg-green-500 rounded-full border-4 border-white shadow-lg">
                <div className="w-full h-full bg-green-400 rounded-full animate-ping"></div>
              </div>

              {/* Verification Badge */}
              <div className="absolute top-2 right-2 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center shadow-lg">
                <svg
                  className="w-4 h-4 text-white"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* Profile Information */}
          <div className="flex-1 text-start md:text-right lg:text-left">
            {/* Name and Edit Section */}
            <div className="flex items-center justify-center lg:justify-start gap-3 mb-3">
              <div>
                <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-1">
                  {profile.data?.title} {profile.data?.firstName}{" "}
                  {profile.data?.lastName}
                </h1>

                {/* Professional Badge */}
                <div className="inline-flex items-center gap-2 px-4 py-1 bg-blue-600 text-white text-sm font-medium rounded-full shadow-lg">
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Verified Medical Professional
                </div>
              </div>

              {/* Enhanced Edit Button */}
              <button
                onClick={() => {
                  localStorage.setItem("profileEdit", "true");
                  if (profile?.data) {
                    localStorage.setItem("DoctorsProfile", JSON.stringify(profile.data));
                  }
                  navigate("/doctor-dashboard/edit-profile");
                }}
                title="Edit your profile"
                className="group relative p-3 bg-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 border border-gray-200 hover:border-blue-300"
              >
                <Pencil className="w-5 h-5 text-gray-600 group-hover:text-blue-600 transition-colors" />
                {/* Tooltip */}
                <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  Edit Profile
                </div>
              </button>
            </div>

            {/* Specialization */}
            <div className="mb-4">
              <p className="text-2xl font-semibold text-blue-600 mb-2">
                {profile?.specialization}
              </p>
            </div>

            {/* Professional Details */}
            <div className="space-y-3">
              <div className="flex items-center justify-center lg:justify-start gap-3 text-gray-700">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <PiStethoscope className="w-5 h-5 text-blue-600" />
                </div>
                <span className="font-medium text-base md:text-lg">
                  {profile.data?.medicalSpecialization}
                </span>
              </div>

              <div className="flex items-center justify-center lg:justify-start gap-3 text-gray-700">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <svg
                    className="w-5 h-5 text-purple-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 14l9-5-9-5-9 5 9 5z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"
                    />
                  </svg>
                </div>
                <span className="font-medium text-base md:text-lg">
                  {profile.data?.qualifications}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 
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
              {...localStorage.setItem(
                "DoctorsProfile",
                JSON.stringify(profile.data)
              )}
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
      </div> */}
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
        <div className="space-y-8">
          {/* Header Section */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M8 7V3a1 1 0 011-1h6a1 1 0 011 1v4M8 7h8M8 7l-2 9a1 1 0 001 1h10a1 1 0 001-1l-2-9"
                    />
                  </svg>
                </div>
                <div>
                  <h2 className="text-base md:text-2xl font-bold text-gray-800">
                    Available Appointments
                  </h2>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-blue-600">
                  {appointments.length}
                  <span className="text-sm text-gray-500">slots</span>
                </p>
              </div>
            </div>
          </div>

          {/* Appointments Grid */}
          {appointments.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {appointments.map((appointment, index) => (
                <div
                  key={index}
                  className="group relative bg-white p-4 md:p-6 rounded-xl shadow-md border border-gray-100 hover:shadow-xl hover:border-blue-200 transition-all duration-300 transform hover:-translate-y-1"
                >
                  {/* Date Header */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg">
                      <svg
                        className="w-6 h-6 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M8 7V3a1 1 0 011-1h6a1 1 0 011 1v4M8 7h8M8 7l-2 9a1 1 0 001 1h10a1 1 0 001-1l-2-9"
                        />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-800 group-hover:text-blue-600 transition-colors">
                        {formatDate(appointment.date)}
                      </h3>
                      <p className="text-sm text-gray-500">Available slot</p>
                    </div>
                  </div>

                  {/* Time Slot Button */}
                  <div className="space-y-3">
                    <button className="w-full py-4 px-6 bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 rounded-lg border border-blue-200 hover:border-blue-300 transition-all duration-200 group-hover:shadow-md">
                      <div className="flex items-center justify-center gap-2">
                        <svg
                          className="w-4 h-4 text-blue-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        <span className="text-base md:text-lg font-semibold text-blue-600">
                          {formatTime(appointment.time)}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        Click to book
                      </div>
                    </button>
                  </div>

                  {/* Status Indicator */}
                  <div className="absolute top-4 right-4">
                    <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse shadow-sm"></div>
                  </div>

                  {/* Hover Effect Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-indigo-600/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                </div>
              ))}
            </div>
          ) : (
            /* Empty State */
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg
                  className="w-10 h-10 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M8 7V3a1 1 0 011-1h6a1 1 0 011 1v4M8 7h8M8 7l-2 9a1 1 0 001 1h10a1 1 0 001-1l-2-9"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-600 mb-2">
                No Available Appointments
              </h3>
              <p className="text-gray-500 max-w-md mx-auto">
                There are currently no available appointment slots. Please check
                back later or contact the practice directly.
              </p>
              <button className="mt-6 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                Contact Practice
              </button>
            </div>
          )}
        </div>
      )}
      {/* 
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
      )} */}

      {activeTab === "About the provider" && (
        <div className="space-y-8">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 md:p-6 rounded-xl border border-blue-100">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <svg
                  className="w-4 h-4 text-white"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              About the Provider
            </h2>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
              <p className="text-gray-700 leading-relaxed text-base md:text-lg">
                {profile.data?.about ||
                  "I have been practicing medicine for 9+ years from neurosurgical intensive care unit to emergency medicine to urgent care. With multi-speciality experience from treating adults to pediatrics, I am confident I can help you get well soon and back to your routine life."}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Professional Details Card */}
            <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 hover:shadow-lg transition-shadow">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-emerald-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-800">
                  Professional Details
                </h3>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                      Specialities
                    </p>
                    <p className="text-gray-800 font-medium mt-1">
                      {profile.data?.medicalSpecialization}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                      Licensed to Practice
                    </p>
                    <p className="text-gray-800 font-medium mt-1">
                      {profile.data?.licenseLocation}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Practice Information Card */}
            <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 hover:shadow-lg transition-shadow">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-purple-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H9m0 0H5m0 0h2M7 7h10M7 11h4"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-800">
                  Practice Information
                </h3>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-indigo-500 rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                      Practice Name
                    </p>
                    <p className="text-gray-800 font-medium mt-1">
                      {profile.data?.practiceName}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                      Languages Spoken
                    </p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {(profile.data?.languages || "English, Hindi, Gujarati")
                        .split(", ")
                        .map((language, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full"
                          >
                            {language}
                          </span>
                        ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Experience Highlight */}
          <div className="bg-gradient-to-r from-emerald-50 to-teal-50 p-6 rounded-xl border border-emerald-200">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 bg-emerald-600 rounded-full flex items-center justify-center">
                <svg
                  className="w-4 h-4 text-white"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </div>
              <h4 className="text-base md:text-lg font-semibold text-gray-800">
                Experience & Expertise
              </h4>
            </div>
            <p className="text-gray-700 font-medium">
              Over 9+ years of dedicated medical practice across multiple
              specialties
            </p>
          </div>
        </div>
      )}

      {/* {activeTab === "About the provider" && (
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
      )} */}
    </div>
  );
};

export default DoctorProfile;
