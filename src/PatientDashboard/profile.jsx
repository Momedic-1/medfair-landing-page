import React, { useState, useEffect } from "react";
import { Tab, Transition, Dialog } from "@headlessui/react";
import { toast } from "react-toastify";
import axios from "axios";
import { baseUrl } from "../env";
import { capitalizeFirstLetter, getToken } from "../utils";
import "../styling/profile.css";

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function Profile() {
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);

  const openModal = (doc) => {
    setSelectedDocument(doc);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setSelectedDocument(null);
    setIsModalOpen(false);
  };

  const [uploadingDocument, setUploadingDocument] = useState(false);
  const [profileData, setProfileData] = useState({
    dateOfBirth: "",
    age: 0,
    weight: 0,
    bloodGroup: "",
    genotype: "",
    imageUrl: "",
    emergencyContact: {
      name: "",
      relationship: "",
      phoneNumber: "",
      email: "",
    },
    medicalHistory: {
      condition: "",
      allergy: "",
      description: "",
      diagnosedDate: "",
    },
    address: {
      street: "",
      city: "",
      state: "",
      country: "",
      postalCode: "",
    },
    documents: [],
    documentCategory: "",
  });

  const userData = JSON.parse(localStorage.getItem("userData") || "{}");
  const token = getToken();
  const userId = userData.id;

  useEffect(() => {
    if (!token) {
      // Assuming navigate is defined elsewhere
      // navigate('/login');
      return;
    }
    fetchProfileData();
    fetchEmergencyContact();
    fetchAddress();
  }, [token]);

  const fetchProfileData = async () => {
    try {
      const response = await axios.get(
        `${baseUrl}/api/patient-profile/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.data) {
        setProfileData((prev) => ({
          ...prev,
          ...response.data,
        }));
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      // toast.error("Failed to fetch profile data")
    }
  };

  const fetchEmergencyContact = async () => {
    try {
      const response = await axios.get(
        `${baseUrl}/api/patient/emergency-contact/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.data) {
        setProfileData((prev) => ({
          ...prev,
          emergencyContact: {
            name: response.data.fullName,
            relationship: response.data.relationship,
            phoneNumber: response.data.phoneNumber,
            email: response.data.email,
          },
        }));
      }
    } catch (error) {
      console.error("Error fetching emergency contact:", error);
      // toast.error("Failed to fetch emergency contact")
    }
  };

  const fetchAddress = async () => {
    try {
      const response = await axios.get(
        `${baseUrl}/api/patient/address/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.data) {
        setProfileData((prev) => ({
          ...prev,
          address: {
            street: response.data.streetAddress,
            city: response.data.city,
            state: response.data.state,
            country: response.data.country,
            postalCode: response.data.zipCode,
          },
        }));
      }
    } catch (error) {
      console.error("Error fetching address:", error);
      // toast.error("Failed to fetch address")
    }
  };

  const bloodGroupOptions = [
    { value: "A_POSITIVE", label: "A+" },
    { value: "A_NEGATIVE", label: "A-" },
    { value: "B_POSITIVE", label: "B+" },
    { value: "B_NEGATIVE", label: "B-" },
    { value: "AB_POSITIVE", label: "AB+" },
    { value: "AB_NEGATIVE", label: "AB-" },
    { value: "O_POSITIVE", label: "O+" },
    { value: "O_NEGATIVE", label: "O-" },
  ];

  const genotypeOptions = [
    { value: "AA", label: "AA" },
    { value: "AS", label: "AS" },
    { value: "SS", label: "SS" },
    { value: "AC", label: "AC" },
    { value: "SC", label: "SC" },
    { value: "CC", label: "CC" },
  ];

  const documentCategoryOptions = [
    { value: "LAB_RESULT", label: "LAB RESULT" },
    { value: "RADIOLOGY_RESULT", label: "RADIOLOGY RESULT" },
    { value: "PRESCRIPTION", label: "PRESCRIPTION" },
    { value: "OTHER", label: "OTHER" },
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes(".")) {
      const [section, field] = name.split(".");
      setProfileData((prev) => ({
        ...prev,
        [section]: {
          ...prev[section],
          [field]: value,
        },
      }));
    } else {
      setProfileData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  console.log();
  useEffect(() => {
    console.log(profileData.imageUrl, " image url");
  }, [profileData]);
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const validTypes = ["image/png", "image/jpeg", "image/jpg"];
    if (!validTypes.includes(file.type)) {
      toast.error("Please upload only PNG, JPEG, or JPG files");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size should be less than 5MB");
      return;
    }

    setUploadingImage(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await axios.post(
        `${baseUrl}/api/v1/registration/upload`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response) {
        setProfileData((prev) => ({
          ...prev,
          imageUrl: response.data,
        }));
        console.log(response, " image response");
        toast.success("Image uploaded successfully");
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error("Failed to upload image");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleDocumentUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const validTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    if (!validTypes.includes(file.type)) {
      toast.error("Please upload only PDF, DOC, or DOCX files");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error("File size should be less than 10MB");
      return;
    }

    if (!profileData.documentCategory) {
      toast.error("Please select a document category");
      return;
    }

    setUploadingDocument(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      // First upload to cloudinary
      const cloudinaryResponse = await axios.post(
        `${baseUrl}/api/patient/documents/upload/${userId}?category=${profileData.documentCategory}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (cloudinaryResponse) {
        setProfileData((prev) => ({
          ...prev,
          documents: [...prev.documents, cloudinaryResponse.data],
        }));

        toast.success("Document uploaded successfully");
      }
      console.log(cloudinaryResponse?.data?.url, " cloudinary response");

      // if (cloudinaryResponse) {
      //   // Then send the URL to the backend
      //   const response = await axios.post(
      //     `${baseUrl}/api/patient/documents/upload/${userId}?category=${profileData.documentCategory}`,
      //     { file: cloudinaryResponse?.data },
      //     {
      //       headers: {
      //         Authorization: `Bearer ${token}`,
      //       },
      //     }
      //   )

      //   console.log(response, " document upload response")

      //   if (response) {
      //     setProfileData((prev) => ({
      //       ...prev,
      //       documents: [...prev.documents, response.data],
      //     }))
      //     toast.success("Document uploaded successfully")
      //   }
      // }
    } catch (error) {
      console.error("Error uploading document:", error);
      toast.error("Failed to upload document");
    } finally {
      setUploadingDocument(false);
    }
  };

  const fullName = userData.lastName + " " + userData.firstName;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let response;
      switch (activeTab) {
        case 0: // Profile
          response = await axios.put(
            `${baseUrl}/api/patient-profile/update/${userId}`,
            {
              weight: profileData.weight,
              bloodGroup: profileData.bloodGroup,
              genotype: profileData.genotype,
              dateOfBirth: profileData.dateOfBirth,
              imageUrl: profileData.imageUrl,
            },
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          break;
        case 1: // Emergency Contact
          response = await axios.put(
            `${baseUrl}/api/patient/emergency-contact/${userId}`,
            {
              fullName: profileData.emergencyContact.name,
              relationship: profileData.emergencyContact.relationship,
              phoneNumber: profileData.emergencyContact.phoneNumber,
              email: profileData.emergencyContact.email,
            },
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          break;
        case 3: // File Upload
          response = await axios.post(
            `${baseUrl}/api/patient/documents/upload/${userId}?category=${profileData.documentCategory}`,
            { file: profileData.documents[0].url },
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          break;
        case 4: // Address
          response = await axios.put(
            `${baseUrl}/api/patient/address/${userId}`,
            {
              country: profileData.address.country,
              state: profileData.address.state,
              city: profileData.address.city,
              streetAddress: profileData.address.street,
              zipCode: profileData.address.postalCode,
            },
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          break;
        case 2: // Medical History
          response = await axios.post(
            `${baseUrl}/api/patient/medical-history/${userId}`,
            {
              condition: profileData.medicalHistory.condition,
              allergy: profileData.medicalHistory.allergy,
              description: profileData.medicalHistory.description,
              diagnosedDate: profileData.medicalHistory.diagnosedDate,
            },
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          break;
        default:
          break;
      }

      if (response) {
        toast.success("Profile updated successfully");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { name: "Patient Profile", current: activeTab === 0 },
    { name: "Emergency Contact", current: activeTab === 1 },
    { name: "Medical History", current: activeTab === 2 },
    { name: "File Upload", current: activeTab === 3 },
    { name: "Address", current: activeTab === 4 },
  ];

  return (
    <div className="flex h-screen">
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col bg-gray-50">
        {/* Page Content */}
        <main className="p-4 md:p-6 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-md border border-gray-100">
            <div className="px-4 py-6 md:px-8 md:py-8">
              <Tab.Group onChange={setActiveTab}>
                <Tab.List className="flex flex-wrap md:flex-nowrap gap-2 rounded-xl bg-gray-50 p-2.5 overflow-x-auto">
                  {tabs.map((tab) => (
                    <Tab
                      key={tab.name}
                      className={({ selected }) =>
                        classNames(
                          "flex-1 min-w-[140px] rounded-lg py-3.5 px-4 text-sm font-medium leading-5 transition-all duration-200",
                          "ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2",
                          selected
                            ? "bg-white shadow-sm text-[#020E7C] border border-gray-100"
                            : "text-gray-600 hover:bg-white/[0.12] hover:text-[#020E7C]"
                        )
                      }
                    >
                      {tab.name}
                    </Tab>
                  ))}
                </Tab.List>

                <Tab.Panels className="mt-8">
                  {/* Patient Profile Tab */}
                  <Tab.Panel>
                    <form onSubmit={handleSubmit} className="space-y-8">
                      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Full name
                          </label>
                          <input
                            type="text"
                            name="fullName"
                            readOnly
                            value={fullName}
                            className="block w-full h-12 rounded-lg border-gray-300 shadow-sm focus:ring-opacity-50 transition-colors duration-200 px-4"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Email address
                          </label>
                          <input
                            type="text"
                            name="email"
                            readOnly
                            value={userData.emailAddress}
                            className="block w-full h-12 rounded-lg border-gray-300 shadow-sm focus:border-[#020E7C] focus:ring-[#020E7C] focus:ring-opacity-50 transition-colors duration-200 px-4"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Date of Birth
                          </label>
                          <input
                            type="date"
                            name="dateOfBirth"
                            value={profileData.dateOfBirth}
                            onChange={handleChange}
                            className="block w-full h-12 rounded-lg border-gray-300 shadow-sm focus:border-[#020E7C] focus:ring-[#020E7C] focus:ring-opacity-50 transition-colors duration-200 px-4"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Weight (kg)
                          </label>
                          <input
                            type="number"
                            name="weight"
                            value={profileData.weight}
                            onChange={handleChange}
                            className="block w-full h-12 rounded-lg border-gray-300 shadow-sm focus:border-[#020E7C] focus:ring-[#020E7C] focus:ring-opacity-50 transition-colors duration-200 px-4"
                            placeholder="Enter your weight"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Blood Group
                          </label>
                          <select
                            name="bloodGroup"
                            value={profileData.bloodGroup}
                            onChange={handleChange}
                            className="block w-full h-12 rounded-lg border-gray-300 shadow-sm focus:border-[#020E7C] focus:ring-[#020E7C] focus:ring-opacity-50 transition-colors duration-200 px-4 appearance-none bg-white"
                          >
                            <option value="">Select Blood Group</option>
                            {bloodGroupOptions.map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Genotype
                          </label>
                          <select
                            name="genotype"
                            value={profileData.genotype}
                            onChange={handleChange}
                            className="block w-full h-12 rounded-lg border-gray-300 shadow-sm focus:border-[#020E7C] focus:ring-[#020E7C] focus:ring-opacity-50 transition-colors duration-200 px-4 appearance-none bg-white"
                          >
                            <option value="">Select Genotype</option>
                            {genotypeOptions.map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="mt-8">
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                          Profile Image
                        </label>
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                          <div className="h-20 w-20 rounded-full overflow-hidden bg-gray-100 border-2 border-gray-200 flex-shrink-0">
                            {profileData.imageUrl ? (
                              <img
                                src={profileData.imageUrl || "/placeholder.svg"}
                                alt="Profile"
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <svg
                                className="h-full w-full text-gray-300"
                                fill="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
                              </svg>
                            )}
                          </div>
                          <div className="w-full">
                            <label
                              htmlFor="profile-image-upload"
                              className="flex items-center justify-center w-full h-12 px-4 transition-colors duration-200 bg-white border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#020E7C] focus:ring-offset-2"
                            >
                              <span className="text-sm font-medium text-gray-700">
                                {uploadingImage
                                  ? "Uploading..."
                                  : "Choose image"}
                              </span>
                              <input
                                id="profile-image-upload"
                                type="file"
                                accept="image/*"
                                onChange={handleImageUpload}
                                className="hidden"
                                disabled={uploadingImage}
                              />
                            </label>
                            <p className="mt-1 text-xs text-gray-500">
                              PNG, JPG, JPEG up to 5MB
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-end pt-4">
                        <button
                          type="submit"
                          disabled={loading}
                          className="inline-flex justify-center items-center rounded-lg border border-transparent bg-[#020E7C] h-12 px-6 text-base font-medium text-white shadow-sm hover:bg-[#1a2a9c] focus:outline-none focus:ring-2 focus:ring-[#020E7C] focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {loading ? "Saving..." : "Save Changes"}
                        </button>
                      </div>
                    </form>
                  </Tab.Panel>

                  {/* Emergency Contact Tab */}
                  <Tab.Panel>
                    <form onSubmit={handleSubmit} className="space-y-8">
                      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Name
                          </label>
                          <input
                            type="text"
                            name="emergencyContact.name"
                            value={profileData.emergencyContact.name}
                            onChange={handleChange}
                            className="block w-full h-12 rounded-lg border-gray-300 shadow-sm focus:border-[#020E7C] focus:ring-[#020E7C] focus:ring-opacity-50 transition-colors duration-200 px-4"
                            placeholder="Enter emergency contact name"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Relationship
                          </label>
                          <input
                            type="text"
                            name="emergencyContact.relationship"
                            value={capitalizeFirstLetter(
                              profileData.emergencyContact.relationship
                            )}
                            onChange={handleChange}
                            className="block w-full h-12 rounded-lg border-gray-300 shadow-sm focus:border-[#020E7C] focus:ring-[#020E7C] focus:ring-opacity-50 transition-colors duration-200 px-4"
                            placeholder="Enter relationship"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Phone Number
                          </label>
                          <input
                            type="tel"
                            name="emergencyContact.phoneNumber"
                            value={profileData.emergencyContact.phoneNumber}
                            onChange={handleChange}
                            className="block w-full h-12 rounded-lg border-gray-300 shadow-sm focus:border-[#020E7C] focus:ring-[#020E7C] focus:ring-opacity-50 transition-colors duration-200 px-4"
                            placeholder="Enter phone number"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Email
                          </label>
                          <input
                            type="email"
                            name="emergencyContact.email"
                            value={profileData.emergencyContact.email}
                            onChange={handleChange}
                            className="block w-full h-12 rounded-lg border-gray-300 shadow-sm focus:border-[#020E7C] focus:ring-[#020E7C] focus:ring-opacity-50 transition-colors duration-200 px-4"
                            placeholder="Enter email"
                          />
                        </div>
                      </div>
                      <div className="flex justify-end pt-4">
                        <button
                          type="submit"
                          disabled={loading}
                          className="inline-flex justify-center items-center rounded-lg border border-transparent bg-[#020E7C] h-12 px-6 text-base font-medium text-white shadow-sm hover:bg-[#1a2a9c] focus:outline-none focus:ring-2 focus:ring-[#020E7C] focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {loading ? "Saving..." : "Save Changes"}
                        </button>
                      </div>
                    </form>
                  </Tab.Panel>

                  {/* Medical History Tab */}
                  <Tab.Panel>
                    <form onSubmit={handleSubmit} className="space-y-8">
                      <div className="space-y-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Allergies
                          </label>
                          <textarea
                            name="medicalHistory.allergy"
                            value={profileData.medicalHistory.allergy}
                            onChange={handleChange}
                            rows={3}
                            className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-[#020E7C] focus:ring-[#020E7C] focus:ring-opacity-50 transition-colors duration-200 px-4 py-3 min-h-[100px] resize-y"
                            placeholder="Enter any allergies"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Chronic Conditions
                          </label>
                          <textarea
                            name="medicalHistory.condition"
                            value={profileData.medicalHistory.condition}
                            onChange={handleChange}
                            rows={3}
                            className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-[#020E7C] focus:ring-[#020E7C] focus:ring-opacity-50 transition-colors duration-200 px-4 py-3 min-h-[100px] resize-y"
                            placeholder="Enter any chronic conditions"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Description
                          </label>
                          <textarea
                            name="medicalHistory.description"
                            value={profileData.medicalHistory.description}
                            onChange={handleChange}
                            rows={3}
                            className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-[#020E7C] focus:ring-[#020E7C] focus:ring-opacity-50 transition-colors duration-200 px-4 py-3 min-h-[100px] resize-y"
                            placeholder="Enter description"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Diagnosed Date
                          </label>
                          <input
                            type="date"
                            name="medicalHistory.diagnosedDate"
                            value={profileData.medicalHistory.diagnosedDate}
                            onChange={handleChange}
                            className="block w-full h-12 rounded-lg border-gray-300 shadow-sm focus:border-[#020E7C] focus:ring-[#020E7C] focus:ring-opacity-50 transition-colors duration-200 px-4"
                            placeholder="Enter diagnosed date"
                          />
                        </div>
                      </div>
                      <div className="flex justify-end pt-4">
                        <button
                          type="submit"
                          disabled={loading}
                          className="inline-flex justify-center items-center rounded-lg border border-transparent bg-[#020E7C] h-12 px-6 text-base font-medium text-white shadow-sm hover:bg-[#1a2a9c] focus:outline-none focus:ring-2 focus:ring-[#020E7C] focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {loading ? "Saving..." : "Save Changes"}
                        </button>
                      </div>
                    </form>
                  </Tab.Panel>

                  {/* File Upload Tab */}
                  <Tab.Panel>
                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Upload Medical Documents
                        </label>
                        <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4">
                          <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Document Category
                            </label>
                            <select
                              name="documentCategory"
                              value={profileData.documentCategory}
                              onChange={handleChange}
                              className="block w-full h-10 rounded-md border-gray-300 shadow-sm focus:border-blue-600 focus:ring-blue-600 focus:ring-opacity-50 transition-colors duration-200 px-3 bg-white"
                            >
                              <option value="">Select Category</option>
                              {documentCategoryOptions.map((option) => (
                                <option key={option.value} value={option.value}>
                                  {capitalizeFirstLetter(option.label)}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div className="flex-1">
                            <div className="mt-1 flex justify-center px-4 py-6 border-2 border-gray-200 border-dashed rounded-md hover:border-blue-600 transition-colors duration-200 cursor-pointer group">
                              <div className="space-y-2 text-center">
                                <svg
                                  className="mx-auto h-12 w-12 text-gray-400 group-hover:text-blue-600 transition-colors duration-200"
                                  stroke="currentColor"
                                  fill="none"
                                  viewBox="0 0 48 48"
                                  aria-hidden="true"
                                >
                                  <path
                                    d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                                    strokeWidth={2}
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  />
                                </svg>
                                <div className="flex text-sm text-gray-600 justify-center">
                                  <label
                                    htmlFor="file-upload"
                                    className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-800 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-600 transition-colors duration-200"
                                  >
                                    <span>
                                      {uploadingDocument
                                        ? "Uploading..."
                                        : "Upload a file"}
                                    </span>
                                    <input
                                      id="file-upload"
                                      name="file-upload"
                                      type="file"
                                      className="sr-only"
                                      onChange={handleDocumentUpload}
                                      disabled={uploadingDocument}
                                    />
                                  </label>
                                  <p className="pl-1">or drag and drop</p>
                                </div>
                                <p className="text-xs text-gray-500">
                                  PDF, DOC, DOCX up to 10MB
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Display uploaded documents */}
                      {/* {profileData.documents && profileData.documents.length > 0 && (
                        <div className="mt-6">
                          <h3 className="text-lg font-medium text-gray-900 mb-4">Uploaded Documents</h3>
                          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {profileData.documents.map((doc, index) => (
                              <div
                                key={index}
                                className="relative flex items-center space-x-3 rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2 hover:border-gray-400"
                              >
                                <div className="flex-shrink-0">
                                  <svg
                                    className="h-10 w-10 text-gray-400"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                    />
                                  </svg>
                                </div>
                                <div className="min-w-0 flex-1">
                                  <a href={doc.file} target="_blank" rel="noopener noreferrer" className="focus:outline-none">
                                    <span className="absolute inset-0" aria-hidden="true" />
                                    <p className="text-sm font-medium text-gray-900">{doc.category}</p>
                                    <p className="truncate text-sm text-gray-500">Click to view</p>
                                  </a>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )} */}
                      {profileData.documents &&
                        profileData.documents.length > 0 && (
                          <div className="mt-6">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">
                              Uploaded Documents
                            </h3>
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                              {profileData.documents.map((doc, index) => (
                                <div
                                  key={index}
                                  className="relative flex items-center space-x-3 rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2 hover:border-gray-400 cursor-pointer"
                                  onClick={() => openModal(doc)}
                                >
                                  <div className="flex-shrink-0">
                                    <svg
                                      className="h-10 w-10 text-gray-400"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                      />
                                    </svg>
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <p className="text-sm font-medium text-gray-900">
                                      {doc.category}
                                    </p>
                                    <p className="text-sm font-medium text-gray-900">
                                      {doc.fileName}
                                    </p>
                                    <p className="truncate text-sm text-gray-500">
                                      Click to view
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                    </div>
                  </Tab.Panel>

                  {/* Address Tab */}
                  <Tab.Panel>
                    <form onSubmit={handleSubmit} className="space-y-8">
                      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Street Address
                          </label>
                          <input
                            type="text"
                            name="address.street"
                            value={profileData.address.street}
                            onChange={handleChange}
                            className="block w-full h-12 rounded-lg border-gray-300 shadow-sm focus:border-[#020E7C] focus:ring-[#020E7C] focus:ring-opacity-50 transition-colors duration-200 px-4"
                            placeholder="Enter street address"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            City
                          </label>
                          <input
                            type="text"
                            name="address.city"
                            value={profileData.address.city}
                            onChange={handleChange}
                            className="block w-full h-12 rounded-lg border-gray-300 shadow-sm focus:border-[#020E7C] focus:ring-[#020E7C] focus:ring-opacity-50 transition-colors duration-200 px-4"
                            placeholder="Enter city"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            State
                          </label>
                          <input
                            type="text"
                            name="address.state"
                            value={profileData.address.state}
                            onChange={handleChange}
                            className="block w-full h-12 rounded-lg border-gray-300 shadow-sm focus:border-[#020E7C] focus:ring-[#020E7C] focus:ring-opacity-50 transition-colors duration-200 px-4"
                            placeholder="Enter state"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Country
                          </label>
                          <input
                            type="text"
                            name="address.country"
                            value={profileData.address.country}
                            onChange={handleChange}
                            className="block w-full h-12 rounded-lg border-gray-300 shadow-sm focus:border-[#020E7C] focus:ring-[#020E7C] focus:ring-opacity-50 transition-colors duration-200 px-4"
                            placeholder="Enter country"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Postal Code
                          </label>
                          <input
                            type="text"
                            name="address.postalCode"
                            value={profileData.address.postalCode}
                            onChange={handleChange}
                            className="block w-full h-12 rounded-lg border-gray-300 shadow-sm focus:border-[#020E7C] focus:ring-[#020E7C] focus:ring-opacity-50 transition-colors duration-200 px-4"
                            placeholder="Enter postal code"
                          />
                        </div>
                      </div>
                      <div className="flex justify-end pt-4">
                        <button
                          type="submit"
                          disabled={loading}
                          className="inline-flex justify-center items-center rounded-lg border border-transparent bg-[#020E7C] h-12 px-6 text-base font-medium text-white shadow-sm hover:bg-[#1a2a9c] focus:outline-none focus:ring-2 focus:ring-[#020E7C] focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {loading ? "Saving..." : "Save Changes"}
                        </button>
                      </div>
                    </form>
                  </Tab.Panel>
                </Tab.Panels>
              </Tab.Group>
              <Transition show={isModalOpen} as={React.Fragment}>
                <Dialog as="div" className="relative z-10" onClose={closeModal}>
                  <Transition.Child
                    as={React.Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                  >
                    <div className="fixed inset-0 bg-black bg-opacity-50" />
                  </Transition.Child>

                  <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex items-center justify-center min-h-full p-4 text-center">
                      <Transition.Child
                        as={React.Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0 scale-95"
                        enterTo="opacity-100 scale-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100 scale-100"
                        leaveTo="opacity-0 scale-95"
                      >
                        <Dialog.Panel className="w-full max-w-4xl transform overflow-hidden rounded-lg bg-white p-6 text-left align-middle shadow-xl transition-all">
                          <Dialog.Title
                            as="h3"
                            className="text-lg font-medium leading-6 text-gray-900"
                          >
                            Document Viewer
                          </Dialog.Title>
                          <div className="mt-4">
                            {selectedDocument && (
                              <iframe
                                src={selectedDocument.url}
                                title="Document Viewer"
                                className="w-full h-[500px] border"
                              />
                            )}
                          </div>
                          <div className="mt-4">
                            <button
                              type="button"
                              className="inline-flex justify-center rounded-md border border-transparent bg-blue-100 px-4 py-2 text-sm font-medium text-blue-900 hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                              onClick={closeModal}
                            >
                              Close
                            </button>
                          </div>
                        </Dialog.Panel>
                      </Transition.Child>
                    </div>
                  </div>
                </Dialog>
              </Transition>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
