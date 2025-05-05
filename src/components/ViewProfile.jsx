import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import Select from "react-select";
import { baseUrl } from "../env";
import { getToken } from "../utils";

const ViewProfile = () => {
  const token = getToken();
  const navigate = useNavigate(); 

  const qualificationOptions = [
    { value: "HLL", label: "HLL" },
    { value: "LN", label: "LN" },
    { value: "LNC", label: "LNC" },
    { value: "MD", label: "MD" },
    { value: "MD(H)", label: "MD(H)" },
    { value: "MFCC", label: "MFCC" },
    { value: "MNNP", label: "MNNP" },
    { value: "MPH", label: "MPH" },
    { value: "MSN", label: "MSN" },
    { value: "MSW", label: "MSW" },
    { value: "NCCA", label: "NCCA" },
    { value: "ND", label: "ND" },
    { value: "NMD", label: "NMD" },
    { value: "NP", label: "NP" },
    { value: "OD", label: "OD" },
    { value: "OMD", label: "OMD" },
    { value: "PA", label: "PA" },
    { value: "PA-C", label: "PA-C" },
    { value: "PhD", label: "PhD" },
    { value: "PT", label: "PT" },
    { value: "RN", label: "RN" },
    { value: "RN-C", label: "RN-C" },
    { value: "RNCS", label: "RNCS" },
    { value: "RN/NP", label: "RN/NP" },
    { value: "RPh", label: "RPh" },
    { value: "RS", label: "RS" },
    { value: "VMD", label: "VMD" },
  ];

  const languageOptions = [
    { value: "English", label: "English" },
    { value: "Spanish", label: "Spanish" },
    { value: "French", label: "French" },
    { value: "Portugese", label: "Portugese" },
    { value: "Yoruba", label: "Yoruba" },
    { value: "Hausa", label: "Hausa" },
    { value: "Igbo", label: "Igbo" },
  ];

  const [profileData, setProfileData] = useState({
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    imageUrl: "",
    medicalSpecialization: null,
    title: "",
    gender: "",
    languages: [],
    practiceName: "",
    licenseLocation: "",
    about: "",
    qualifications: [],
  });

  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    // Fetch existing profile data if available
    fetchProfileData();

    // Check if profileEdit is true and DoctorsProfile exists
    const profileEdit = localStorage.getItem("profileEdit") === "true";
    const doctorsProfile = localStorage.getItem("DoctorsProfile");

    if (profileEdit && doctorsProfile) {
      const parsedDoctorsProfile = JSON.parse(doctorsProfile);

      const formattedDate = parsedDoctorsProfile.dateOfBirth
        ? new Date(parsedDoctorsProfile.dateOfBirth).toISOString().split("T")[0]
        : "";

      const formattedLanguages = Array.isArray(parsedDoctorsProfile.languages)
        ? parsedDoctorsProfile.languages.map((lang) => ({
            value: lang,
            label: lang,
          }))
        : parsedDoctorsProfile.languages
        ? [{ value: parsedDoctorsProfile.languages, label: parsedDoctorsProfile.languages }]
        : [];

      const formattedQualifications = Array.isArray(parsedDoctorsProfile.qualifications)
        ? parsedDoctorsProfile.qualifications.map((qual) => ({
            value: qual,
            label: qual,
          }))
        : parsedDoctorsProfile.qualifications
        ? [{ value: parsedDoctorsProfile.qualifications, label: parsedDoctorsProfile.qualifications }]
        : [];

      setProfileData((prevState) => ({
        ...prevState,
        ...parsedDoctorsProfile,
        dateOfBirth: formattedDate,
        languages: formattedLanguages,
        qualifications: formattedQualifications,
      }));

      // Make all fields optional and remove readOnly
      document.querySelectorAll("input, select, textarea").forEach((field) => {
        field.removeAttribute("required");
        field.removeAttribute("readOnly");
      });
    }
  }, []);

  const fetchProfileData = async () => {
    const profile = localStorage.getItem("doctorProfile");
    const parsedProfile = JSON.parse(profile);

    if (parsedProfile) {
      setProfileData((prevState) => ({
        ...prevState,
        firstName: parsedProfile.firstName || "",
        lastName: parsedProfile.lastName || "",
        medicalSpecialization: parsedProfile.medicalSpecialization,
        // Preserve other fields if they exist in the parsed profile
        dateOfBirth: parsedProfile.dateOfBirth || prevState.dateOfBirth,
        imageUrl: parsedProfile.imageUrl || prevState.imageUrl,
        title: parsedProfile.title || prevState.title,
        gender: parsedProfile.gender || prevState.gender,
        languages: parsedProfile.languages || prevState.languages,
        practiceName: parsedProfile.practiceName || prevState.practiceName,
        licenseLocation:
          parsedProfile.licenseLocation || prevState.licenseLocation,
        about: parsedProfile.about || prevState.about,
        qualifications:
          parsedProfile.qualifications || prevState.qualifications,
      }));
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfileData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleQualificationsChange = (selectedOptions) => {
    setProfileData((prevState) => ({
      ...prevState,
      qualifications: selectedOptions || [],
    }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    const validTypes = ["image/png", "image/jpeg", "image/jpg"];
    if (!validTypes.includes(file.type)) {
      toast.error("Please upload only PNG, JPEG, or JPG files");
      return;
    }

    setUploadingImage(true);
    const formData = new FormData();
    formData.append("file", file);
    console.log(file);

    try {
      const response = await axios.post(
        `${baseUrl}/api/v1/doctor-profile/upload-credentials`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log(response);

      if (response) {
        setProfileData((prevState) => ({
          ...prevState,
          imageUrl: response.data.data,
        }));
        toast.success("Image uploaded successfully");
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error("Failed to upload image");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleLanguagesChange = (selectedOptions) => {
    setProfileData((prevState) => ({
      ...prevState,
      languages: selectedOptions || [],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const submitData = {
        ...profileData,
        qualifications: profileData.qualifications
          .map((q) => q.value)
          .join(", "),
        // medicalSpecialization: profileData.medicalSpecialization?.value || '',
        languages: profileData.languages.map((l) => l.value).join(", "),
      };
      console.log(submitData);
      await axios.put(`${baseUrl}/api/v1/doctor-profile/profile`, submitData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      toast.success("Profile updated successfully");
      navigate("/doctor-dashboard");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-[#020E7C] mb-6">Doctor Profile</h1>
      <p className="font-bold text-[#020E7C] mb-6">
        Please complete your profile
      </p>
      <form onSubmit={handleSubmit} className="space-y-6 p-8 border rounded-lg shadow-md bg-white">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Title
            </label>
            <select
              name="title"
              value={profileData.title}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2 px-3 border"
              required
            >
              <option value="">Select Title</option>
              <option value="Mr.">Mr.</option>
              <option value="Mrs.">Mrs.</option>
              <option value="Dr.">Dr.</option>
              <option value="Ms.">Ms.</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              First Name
            </label>
            <input
              type="text"
              name="firstName"
              value={profileData.firstName}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2 px-3 border"
              required
              readOnly
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Last Name
            </label>
            <input
              type="text"
              name="lastName"
              value={profileData.lastName}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2 px-3 border "
              required
              readOnly
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Date of Birth
            </label>
            <input
              type="date"
              name="dateOfBirth"
              value={profileData.dateOfBirth}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2 px-3 border"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Gender
            </label>
            <input
              type="text"
              name="gender"
              value={profileData.gender}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2 px-3 border "
              required
              readOnly
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Medical Specialization
            </label>
            <input
              type="text"
              name="medicalSpecialization"
              value={profileData.medicalSpecialization}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2 px-3 border "
              required
              readOnly
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Languages
            </label>
            <Select
              isMulti
              name="languages"
              options={languageOptions}
              value={profileData.languages}
              onChange={handleLanguagesChange}
              className="mt-1"
              classNamePrefix="select"
              placeholder="Select languages..."
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Practice Name
            </label>
            <input
              type="text"
              name="practiceName"
              value={profileData.practiceName}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2 px-3 border"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              License Location
            </label>
            <input
              type="text"
              name="licenseLocation"
              value={profileData.licenseLocation}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2 px-3 border"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Qualifications
            </label>
            <Select
              isMulti
              name="qualifications"
              options={qualificationOptions}
              value={profileData.qualifications}
              onChange={handleQualificationsChange}
              className="mt-1"
              classNamePrefix="select"
              placeholder="Select qualifications..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Profile Image
            </label>
            <div className="mt-1 flex items-center gap-4">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageUpload}
                accept=".png,.jpg,.jpeg"
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingImage}
                className="px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                {uploadingImage ? "Uploading..." : "Upload Image"}
              </button>
              {profileData.imageUrl && (
                <div className="relative h-16 w-16">
                  <img
                    src={profileData.imageUrl}
                    alt="Profile"
                    className="h-full w-full object-cover rounded-full"
                  />
                </div>
              )}
            </div>
            <p className="mt-1 text-sm text-gray-500">
              Accepted formats: PNG, JPEG, JPG
            </p>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Tell patients about yourself
          </label>
          <textarea
            name="about"
            value={profileData.about}
            onChange={handleChange}
            rows={4}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2 px-3 border"
            required
          />
        </div>
        <div className="flex justify-between mt-6">
          <button
            type="button"
            onClick={() => {
              navigate("/doctor-dashboard");
              window.location.reload();
            }}
            className="mr-4 border border-[#020E7C] bg-transparent text-[#020E7C] px-6 py-2 rounded-lg hover:bg-[#020E7C] hover:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
          >
            Back
          </button>
          <button
            type="submit"
            disabled={loading}
            className="bg-[#020E7C] text-white px-6 py-2 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {loading ? "Saving..." : "Save Profile"}
          </button>
        </div>
      </form>
      <ToastContainer position="top-right" autoClose={2000} />
    </div>
  );
};

export default ViewProfile;
