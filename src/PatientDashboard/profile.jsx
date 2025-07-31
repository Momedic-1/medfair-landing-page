import React, { useState, useEffect } from "react";
import { Tab, Transition, Dialog } from "@headlessui/react";
import { toast } from "react-toastify";
import axios from "axios";
import { baseUrl } from "../env";
import { capitalizeFirstLetter, getToken } from "../utils";
import "../styling/profile.css";
import { Box, Modal } from "@mui/material";

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function Profile() {
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [showFileModal, setShowFileModal] = useState(false);
  const [uploadingDocument, setUploadingDocument] = useState(false);

  const fileModalStyle = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: "90%",
    maxWidth: "900px",
    bgcolor: "background.paper",
    boxShadow: 24,
    p: 4,
    borderRadius: "8px",
    overflowY: "auto",
    maxHeight: "90vh",
  };

  const openModal = (doc) => {
    setSelectedDocument(doc);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setSelectedDocument(null);
    setIsModalOpen(false);
  };

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
    fetchDocuments(); // Add this to fetch documents on component mount
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

  // Add this new function to fetch documents
  const fetchDocuments = async () => {
    try {
      const response = await axios.get(
        `${baseUrl}/api/patient/documents/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.data) {
        setProfileData((prev) => ({
          ...prev,
          documents: response.data,
        }));
      }
    } catch (error) {
      console.error("Error fetching documents:", error);
      // toast.error("Failed to fetch documents")
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

  // console.log();
  // useEffect(() => {
  //   console.log(profileData.imageUrl, "image url");
  // }, [profileData]);

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
        toast.success("Image uploaded successfully");
      }
    } catch (error) {
      toast.error("Failed to upload image");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleDocumentUpload = async (event) => {
    const file = event.target.files[0];

    if (!file) {
      return;
    }

    // Check if category is selected
    if (!profileData.documentCategory) {
      toast.error("Please select a document category first");
      return;
    }

    // Validate file size (e.g., max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      toast.error("File size must be less than 10MB");
      return;
    }

    // Validate file type
    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "text/plain",
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
    ];

    if (!allowedTypes.includes(file.type)) {
      toast.error(
        "Please upload a valid document (PDF, DOC, DOCX, TXT, or image)"
      );
      return;
    }

    setUploadingDocument(true);

    try {
      // Create FormData with the actual file
      const formData = new FormData();
      formData.append("file", file); // This is the key part - sending the actual file

      // Upload directly to the document endpoint
      const uploadResponse = await axios.post(
        `${baseUrl}/api/patient/documents/upload/${userId}?category=${profileData.documentCategory}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            // Don't set Content-Type header - let axios set it automatically for FormData
          },
        }
      );

      if (uploadResponse && uploadResponse.data) {
        // The response should contain the document information
        const newDocument = {
          id: uploadResponse.data.id || Date.now(),
          fileName: file.name,
          fileUrl: uploadResponse.data.fileUrl || uploadResponse.data.url,
          category: profileData.documentCategory,
          fileSize: file.size,
          fileType: file.type,
          uploadDate: new Date().toISOString(),
          ...uploadResponse.data, // Include any additional data from server
        };

        // Update local state with the new document
        setProfileData((prev) => ({
          ...prev,
          documents: [...prev.documents, newDocument],
          documentCategory: "", // Clear the category selection
        }));

        // Create preview for different file types
        if (file.type.startsWith("image/")) {
          const reader = new FileReader();
          reader.onload = (e) => setFilePreview(e.target.result);
          reader.readAsDataURL(file);
        } else if (file.type === "application/pdf") {
          setFilePreview(URL.createObjectURL(file));
        } else {
          setFilePreview(null);
        }

        setUploadedFile(file);
        toast.success(`Document "${file.name}" uploaded successfully!`);
      }
    } catch (error) {
      // More detailed error handling
      let errorMessage = "Failed to upload document";
      if (error.response?.data?.message) {
        errorMessage += `: ${error.response.data.message}`;
      } else if (error.response?.data?.exceptionMessage) {
        errorMessage += `: ${error.response.data.exceptionMessage}`;
      } else if (error.message) {
        errorMessage += `: ${error.message}`;
      }

      toast.error(errorMessage);

      // Clear the file states on error
      setUploadedFile(null);
      setFilePreview(null);
    } finally {
      setUploadingDocument(false);
    }

    // Clear the input value so the same file can be uploaded again if needed
    event.target.value = "";
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
        case 3: // File Upload - Remove this case since documents are now uploaded immediately
          // Documents are now handled by handleDocumentUpload function
          toast.info("Documents are uploaded immediately when selected");
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

      if (response && activeTab !== 3) {
        toast.success("Profile updated successfully");
      }
    } catch (error) {
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
                            className="block w-full h-12 rounded-lg border-gray-300 shadow-sm focus:ring-opacity-50 transition-colors duration-200"
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
                            className="block w-full h-12 rounded-lg border-gray-300 shadow-sm focus:border-[#020E7C] focus:ring-[#020E7C] focus:ring-opacity-50 transition-colors duration-200"
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
                            className="block w-full h-12 rounded-lg border-gray-300 shadow-sm focus:border-[#020E7C] focus:ring-[#020E7C] focus:ring-opacity-50 transition-colors duration-200"
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
                            className="block w-full h-12 rounded-lg border-gray-300 shadow-sm focus:border-[#020E7C] focus:ring-[#020E7C] focus:ring-opacity-50 transition-colors duration-20"
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
                            className="block w-full h-12 rounded-lg border-gray-300 shadow-sm focus:border-[#020E7C] focus:ring-[#020E7C] focus:ring-opacity-50 transition-colors duration-200 appearance-none bg-white"
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
                            className="block w-full h-12 rounded-lg border-gray-300 shadow-sm focus:border-[#020E7C] focus:ring-[#020E7C] focus:ring-opacity-50 transition-colors duration-200 appearance-none bg-white"
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
                    <div className="space-y-8">
                      {/* Upload Section */}
                      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 md:p-6">
                        <div className="mb-6">
                          <h2 className="text-xl font-semibold text-gray-900 mb-2">
                            Upload Medical Documents
                          </h2>
                          <p className="text-sm text-gray-600">
                            Securely upload your medical records and documents
                            for easy access
                          </p>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          {/* Document Category Selection */}
                          <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-800">
                              Document Category *
                            </label>
                            <div className="relative">
                              <select
                                name="documentCategory"
                                value={profileData.documentCategory}
                                onChange={handleChange}
                                className="w-full h-12 pl-4 pr-10 text-sm bg-white border border-gray-300 rounded-lg shadow-sm hover:border-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 appearance-none cursor-pointer"
                                required
                              >
                                <option value="" className="text-gray-500">
                                  Select Category
                                </option>
                                {documentCategoryOptions.map((option) => (
                                  <option
                                    key={option.value}
                                    value={option.value}
                                  >
                                    {capitalizeFirstLetter(option.label)}
                                  </option>
                                ))}
                              </select>
                              {/* Custom dropdown arrow */}
                              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                <svg
                                  className="w-5 h-5 text-gray-400"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M19 9l-7 7-7-7"
                                  />
                                </svg>
                              </div>
                            </div>
                          </div>

                          {/* File Upload Area */}
                          <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-800">
                              Upload File
                            </label>
                            <div className="relative">
                              <div className="flex justify-center px-6 py-8 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50/50 transition-all duration-300 cursor-pointer group bg-gray-50/50">
                                <div className="text-center space-y-3">
                                  {/* Upload Icon */}
                                  <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center group-hover:bg-blue-200 transition-colors duration-300">
                                    {uploadingDocument ? (
                                      <svg
                                        className="w-6 h-6 text-blue-600 animate-spin"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                      >
                                        <circle
                                          className="opacity-25"
                                          cx="12"
                                          cy="12"
                                          r="10"
                                          stroke="currentColor"
                                          strokeWidth="4"
                                        />
                                        <path
                                          className="opacity-75"
                                          fill="currentColor"
                                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                        />
                                      </svg>
                                    ) : (
                                      <svg
                                        className="w-6 h-6 text-blue-600"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                      >
                                        <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          strokeWidth={2}
                                          d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                                        />
                                      </svg>
                                    )}
                                  </div>

                                  {/* Upload Text */}
                                  <div className="space-y-1">
                                    <label
                                      htmlFor="file-upload"
                                      className="cursor-pointer font-medium text-blue-600 hover:text-blue-700 transition-colors duration-200"
                                    >
                                      {uploadingDocument
                                        ? "Uploading..."
                                        : "Choose file to upload"}
                                      <input
                                        id="file-upload"
                                        name="file-upload"
                                        type="file"
                                        className="sr-only"
                                        onChange={handleDocumentUpload}
                                        disabled={
                                          uploadingDocument ||
                                          !profileData.documentCategory
                                        }
                                      />
                                    </label>
                                    <p className="text-xs text-gray-500">
                                      or drag and drop here
                                    </p>
                                  </div>

                                  {/* File Format Info */}
                                  <div className="flex items-center justify-center space-x-1 text-xs text-gray-500">
                                    <svg
                                      className="w-4 h-4"
                                      fill="currentColor"
                                      viewBox="0 0 20 20"
                                    >
                                      <path
                                        fillRule="evenodd"
                                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                                        clipRule="evenodd"
                                      />
                                    </svg>
                                    <span>
                                      PDF, DOC, DOCX, Images • Max 10MB
                                    </span>
                                  </div>

                                  {/* Category Selection Warning */}
                                  {!profileData.documentCategory && (
                                    <div className="flex items-center justify-center space-x-1 text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded">
                                      <svg
                                        className="w-4 h-4"
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                      >
                                        <path
                                          fillRule="evenodd"
                                          d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                                          clipRule="evenodd"
                                        />
                                      </svg>
                                      <span>
                                        Please select a category first
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Temporary File Preview */}
                      {uploadedFile && (
                        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <svg
                                className="w-5 h-5 text-green-500"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                              </svg>
                              <span className="text-sm font-medium text-green-800">
                                {uploadedFile.name}
                              </span>
                              <span className="text-xs text-green-600">
                                ({(uploadedFile.size / 1024).toFixed(1)} KB)
                              </span>
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => setShowFileModal(true)}
                                className="px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
                                type="button"
                              >
                                View
                              </button>
                              <button
                                onClick={() => {
                                  setUploadedFile(null);
                                  setFilePreview(null);
                                }}
                                className="px-3 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
                                type="button"
                              >
                                Remove
                              </button>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* File Preview Modal */}
                      <Modal
                        open={showFileModal}
                        onClose={() => setShowFileModal(false)}
                        aria-labelledby="file-preview-modal"
                      >
                        <Box sx={fileModalStyle}>
                          <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-bold">
                              Document Preview
                            </h2>
                            <button
                              onClick={() => setShowFileModal(false)}
                              className="text-gray-500 hover:text-gray-700"
                              type="button"
                            >
                              <svg
                                className="w-6 h-6"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M6 18L18 6M6 6l12 12"
                                />
                              </svg>
                            </button>
                          </div>

                          <div className="mb-4">
                            <p className="text-sm text-gray-600">
                              <strong>File:</strong> {uploadedFile?.name}
                            </p>
                            <p className="text-sm text-gray-600">
                              <strong>Size:</strong>{" "}
                              {uploadedFile
                                ? (uploadedFile.size / 1024).toFixed(1)
                                : 0}{" "}
                              KB
                            </p>
                            <p className="text-sm text-gray-600">
                              <strong>Type:</strong> {uploadedFile?.type}
                            </p>
                          </div>

                          <div className="border rounded-lg p-4 bg-gray-50 max-h-96 overflow-auto">
                            {uploadedFile?.type.startsWith("image/") &&
                            filePreview ? (
                              <img
                                src={filePreview}
                                alt="Preview"
                                className="max-w-full h-auto"
                              />
                            ) : uploadedFile?.type === "application/pdf" &&
                              filePreview ? (
                              <iframe
                                src={filePreview}
                                className="w-full h-80"
                                title="PDF Preview"
                              />
                            ) : (
                              <div className="text-center py-8 text-gray-500">
                                <svg
                                  className="w-12 h-12 mx-auto mb-2"
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
                                <p>Preview not available for this file type</p>
                                <p className="text-sm">
                                  File: {uploadedFile?.name}
                                </p>
                              </div>
                            )}
                          </div>
                        </Box>
                      </Modal>

                      {/* Uploaded Documents Section */}
                      {profileData.documents &&
                        profileData.documents.length > 0 && (
                          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 md:p-6">
                            <div className="flex items-center justify-between mb-6">
                              <div>
                                <h3 className="text-lg font-semibold text-gray-900">
                                  Uploaded Documents
                                </h3>
                                <p className="text-sm text-gray-600 mt-1">
                                  {profileData.documents.length} document
                                  {profileData.documents.length !== 1
                                    ? "s"
                                    : ""}{" "}
                                  uploaded
                                </p>
                              </div>
                              <div className="flex items-center text-sm text-gray-500">
                                <svg
                                  className="w-4 h-4 mr-1"
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                                Secure & Encrypted
                              </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                              {profileData.documents.map((doc, index) => (
                                <div
                                  key={index}
                                  className="group relative bg-gray-50 hover:bg-white border border-gray-200 hover:border-blue-300 rounded-lg p-4 transition-all duration-200 cursor-pointer hover:shadow-md"
                                  onClick={() => openModal(doc)}
                                >
                                  {/* Document Icon & Info */}
                                  <div className="flex items-start space-x-3">
                                    <div className="flex-shrink-0">
                                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors duration-200">
                                        <svg
                                          className="w-5 h-5 text-blue-600"
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
                                    </div>

                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center justify-between mb-1">
                                        <p className="text-sm font-medium text-gray-900 truncate">
                                          {capitalizeFirstLetter(
                                            doc.category || doc.documentCategory
                                          )}
                                        </p>
                                        <svg
                                          className="w-4 h-4 text-gray-400 group-hover:text-blue-500 transition-colors duration-200"
                                          fill="none"
                                          stroke="currentColor"
                                          viewBox="0 0 24 24"
                                        >
                                          <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                                          />
                                        </svg>
                                      </div>
                                      <p className="text-sm font-medium text-gray-700 truncate mb-1">
                                        {doc.fileName || doc.name || "Document"}
                                      </p>
                                      <p className="text-xs text-gray-500">
                                        Click to view document
                                      </p>
                                      {doc.uploadDate && (
                                        <p className="text-xs text-gray-400 mt-1">
                                          Uploaded:{" "}
                                          {new Date(
                                            doc.uploadDate
                                          ).toLocaleDateString()}
                                        </p>
                                      )}
                                    </div>
                                  </div>

                                  {/* Hover Effect Overlay */}
                                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none" />
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

              {/* Document Viewer Modal */}
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
                            Document Viewer -{" "}
                            {selectedDocument?.fileName ||
                              selectedDocument?.name}
                          </Dialog.Title>
                          <div className="mt-4">
                            {selectedDocument && (
                              <iframe
                                src={
                                  selectedDocument.fileUrl ||
                                  selectedDocument.url
                                }
                                title="Document Viewer"
                                className="w-full h-[500px] border rounded"
                                onError={() => {
                                  toast.error(
                                    "Unable to load document preview"
                                  );
                                }}
                              />
                            )}
                          </div>
                          <div className="mt-4 flex justify-between">
                            <div className="text-sm text-gray-500">
                              Category:{" "}
                              {capitalizeFirstLetter(
                                selectedDocument?.category ||
                                  selectedDocument?.documentCategory ||
                                  "Unknown"
                              )}
                            </div>
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
