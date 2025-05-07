import { useState, useEffect } from "react"
import { Tab } from "@headlessui/react"
import { toast } from "react-toastify"
import axios from "axios"
import { baseUrl } from "../env"
import { getToken } from "../utils"
import "../styling/profile.css"

function classNames(...classes) {
  return classes.filter(Boolean).join(" ")
}

export default function Profile() {
  const [activeTab, setActiveTab] = useState(0)
  const [loading, setLoading] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [profileData, setProfileData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
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
    nextOfKin: {
      name: "",
      relationship: "",
      phoneNumber: "",
      email: "",
    },
    medicalHistory: {
      allergies: "",
      chronicConditions: "",
      previousSurgeries: "",
      medications: "",
    },
    address: {
      street: "",
      city: "",
      state: "",
      country: "",
      postalCode: "",
    },
  })

  // const userData = JSON.parse(localStorage.getItem("userData") || "{}")
  const token = getToken()

  useEffect(() => {
    if (!token) {
      // Assuming navigate is defined elsewhere
      // navigate('/login');
      return
    }
    fetchProfileData()
  }, [token])

  const fetchProfileData = async () => {
    try {
      const response = await axios.get(`${baseUrl}/api/v1/patient-profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      if (response.data) {
        setProfileData(response.data)
      }
    } catch (error) {
      console.error("Error fetching profile:", error)
      toast.error("Failed to fetch profile data")
    }
  }

  const bloodGroupOptions = [
    { value: "A_POSITIVE", label: "A+" },
    { value: "A_NEGATIVE", label: "A-" },
    { value: "B_POSITIVE", label: "B+" },
    { value: "B_NEGATIVE", label: "B-" },
    { value: "AB_POSITIVE", label: "AB+" },
    { value: "AB_NEGATIVE", label: "AB-" },
    { value: "O_POSITIVE", label: "O+" },
    { value: "O_NEGATIVE", label: "O-" },
  ]

  const genotypeOptions = [
    { value: "AA", label: "AA" },
    { value: "AS", label: "AS" },
    { value: "SS", label: "SS" },
    { value: "AC", label: "AC" },
  ]

  const handleChange = (e) => {
    const { name, value } = e.target
    if (name.includes(".")) {
      const [section, field] = name.split(".")
      setProfileData((prev) => ({
        ...prev,
        [section]: {
          ...prev[section],
          [field]: value,
        },
      }))
    } else {
      setProfileData((prev) => ({
        ...prev,
        [name]: value,
      }))
    }
  }

  const handleImageUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    const validTypes = ["image/png", "image/jpeg", "image/jpg"]
    if (!validTypes.includes(file.type)) {
      toast.error("Please upload only PNG, JPEG, or JPG files")
      return
    }

    setUploadingImage(true)
    const formData = new FormData()
    formData.append("file", file)

    try {
      const response = await axios.post(`${baseUrl}/api/v1/patient-profile/upload-image`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response) {
        setProfileData((prev) => ({
          ...prev,
          imageUrl: response.data.data,
        }))
        toast.success("Image uploaded successfully")
      }
    } catch (error) {
      console.error("Error uploading image:", error)
      toast.error("Failed to upload image")
    } finally {
      setUploadingImage(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await axios.put(`${baseUrl}/api/v1/patient-profile`, profileData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response) {
        toast.success("Profile updated successfully")
      }
    } catch (error) {
      console.error("Error updating profile:", error)
      toast.error("Failed to update profile")
    } finally {
      setLoading(false)
    }
  }

  const tabs = [
    { name: "Patient Profile", current: activeTab === 0 },
    { name: "Emergency Contact", current: activeTab === 1 },
    { name: "Next of Kin", current: activeTab === 2 },
    { name: "Medical History", current: activeTab === 3 },
    { name: "File Upload", current: activeTab === 4 },
    { name: "Address", current: activeTab === 5 },
  ]

  return (
    <div className="flex h-screen">
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col bg-gray-50">
        {/* Page Content */}
        <main className="p-4 md:p-6 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-md border border-gray-100">
            <div className="px-4 py-6 md:px-8 md:py-8">
              <h1 className="text-2xl font-semibold text-[#020E7C] mb-6 md:mb-8">Patient Profile</h1>

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
                            : "text-gray-600 hover:bg-white/[0.12] hover:text-[#020E7C]",
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
                          <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                          <input
                            type="text"
                            name="firstName"
                            value={profileData.firstName}
                            onChange={handleChange}
                            className="block w-full h-12 rounded-lg border-gray-300 shadow-sm focus:border-[#020E7C] focus:ring-[#020E7C] focus:ring-opacity-50 transition-colors duration-200 px-4"
                            placeholder="Enter your first name"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                          <input
                            type="text"
                            name="lastName"
                            value={profileData.lastName}
                            onChange={handleChange}
                            className="block w-full h-12 rounded-lg border-gray-300 shadow-sm focus:border-[#020E7C] focus:ring-[#020E7C] focus:ring-opacity-50 transition-colors duration-200 px-4"
                            placeholder="Enter your last name"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                          <input
                            type="email"
                            name="email"
                            value={profileData.email}
                            onChange={handleChange}
                            className="block w-full h-12 rounded-lg border-gray-300 shadow-sm focus:border-[#020E7C] focus:ring-[#020E7C] focus:ring-opacity-50 transition-colors duration-200 px-4"
                            placeholder="Enter your email"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                          <input
                            type="tel"
                            name="phoneNumber"
                            value={profileData.phoneNumber}
                            onChange={handleChange}
                            className="block w-full h-12 rounded-lg border-gray-300 shadow-sm focus:border-[#020E7C] focus:ring-[#020E7C] focus:ring-opacity-50 transition-colors duration-200 px-4"
                            placeholder="Enter your phone number"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth</label>
                          <input
                            type="date"
                            name="dateOfBirth"
                            value={profileData.dateOfBirth}
                            onChange={handleChange}
                            className="block w-full h-12 rounded-lg border-gray-300 shadow-sm focus:border-[#020E7C] focus:ring-[#020E7C] focus:ring-opacity-50 transition-colors duration-200 px-4"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Weight (kg)</label>
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
                          <label className="block text-sm font-medium text-gray-700 mb-2">Blood Group</label>
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
                          <label className="block text-sm font-medium text-gray-700 mb-2">Genotype</label>
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
                        <label className="block text-sm font-medium text-gray-700 mb-3">Profile Image</label>
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                          <div className="h-20 w-20 rounded-full overflow-hidden bg-gray-100 border-2 border-gray-200 flex-shrink-0">
                            {profileData.imageUrl ? (
                              <img
                                src={profileData.imageUrl || "/placeholder.svg"}
                                alt="Profile"
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <svg className="h-full w-full text-gray-300" fill="currentColor" viewBox="0 0 24 24">
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
                                {uploadingImage ? "Uploading..." : "Choose image"}
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
                            <p className="mt-1 text-xs text-gray-500">PNG, JPG, JPEG up to 5MB</p>
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
                          <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
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
                          <label className="block text-sm font-medium text-gray-700 mb-2">Relationship</label>
                          <input
                            type="text"
                            name="emergencyContact.relationship"
                            value={profileData.emergencyContact.relationship}
                            onChange={handleChange}
                            className="block w-full h-12 rounded-lg border-gray-300 shadow-sm focus:border-[#020E7C] focus:ring-[#020E7C] focus:ring-opacity-50 transition-colors duration-200 px-4"
                            placeholder="Enter relationship"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
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
                          <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
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

                  {/* Next of Kin Tab */}
                  <Tab.Panel>
                    <form onSubmit={handleSubmit} className="space-y-8">
                      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                          <input
                            type="text"
                            name="nextOfKin.name"
                            value={profileData.nextOfKin.name}
                            onChange={handleChange}
                            className="block w-full h-12 rounded-lg border-gray-300 shadow-sm focus:border-[#020E7C] focus:ring-[#020E7C] focus:ring-opacity-50 transition-colors duration-200 px-4"
                            placeholder="Enter next of kin name"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Relationship</label>
                          <input
                            type="text"
                            name="nextOfKin.relationship"
                            value={profileData.nextOfKin.relationship}
                            onChange={handleChange}
                            className="block w-full h-12 rounded-lg border-gray-300 shadow-sm focus:border-[#020E7C] focus:ring-[#020E7C] focus:ring-opacity-50 transition-colors duration-200 px-4"
                            placeholder="Enter relationship"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                          <input
                            type="tel"
                            name="nextOfKin.phoneNumber"
                            value={profileData.nextOfKin.phoneNumber}
                            onChange={handleChange}
                            className="block w-full h-12 rounded-lg border-gray-300 shadow-sm focus:border-[#020E7C] focus:ring-[#020E7C] focus:ring-opacity-50 transition-colors duration-200 px-4"
                            placeholder="Enter phone number"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                          <input
                            type="email"
                            name="nextOfKin.email"
                            value={profileData.nextOfKin.email}
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
                          <label className="block text-sm font-medium text-gray-700 mb-2">Allergies</label>
                          <textarea
                            name="medicalHistory.allergies"
                            value={profileData.medicalHistory.allergies}
                            onChange={handleChange}
                            rows={3}
                            className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-[#020E7C] focus:ring-[#020E7C] focus:ring-opacity-50 transition-colors duration-200 px-4 py-3 min-h-[100px] resize-y"
                            placeholder="Enter any allergies"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Chronic Conditions</label>
                          <textarea
                            name="medicalHistory.chronicConditions"
                            value={profileData.medicalHistory.chronicConditions}
                            onChange={handleChange}
                            rows={3}
                            className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-[#020E7C] focus:ring-[#020E7C] focus:ring-opacity-50 transition-colors duration-200 px-4 py-3 min-h-[100px] resize-y"
                            placeholder="Enter any chronic conditions"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Previous Surgeries</label>
                          <textarea
                            name="medicalHistory.previousSurgeries"
                            value={profileData.medicalHistory.previousSurgeries}
                            onChange={handleChange}
                            rows={3}
                            className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-[#020E7C] focus:ring-[#020E7C] focus:ring-opacity-50 transition-colors duration-200 px-4 py-3 min-h-[100px] resize-y"
                            placeholder="Enter previous surgeries"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Current Medications</label>
                          <textarea
                            name="medicalHistory.medications"
                            value={profileData.medicalHistory.medications}
                            onChange={handleChange}
                            rows={3}
                            className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-[#020E7C] focus:ring-[#020E7C] focus:ring-opacity-50 transition-colors duration-200 px-4 py-3 min-h-[100px] resize-y"
                            placeholder="Enter current medications"
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
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">Upload Medical Documents</label>
                        <div className="mt-1 flex justify-center px-6 pt-8 pb-8 border-2 border-gray-200 border-dashed rounded-lg hover:border-[#020E7C] transition-colors duration-200 cursor-pointer group">
                          <div className="space-y-3 text-center">
                            <svg
                              className="mx-auto h-14 w-14 text-gray-400 group-hover:text-[#020E7C] transition-colors duration-200"
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
                                className="relative cursor-pointer bg-white rounded-md font-medium text-[#020E7C] hover:text-[#1a2a9c] focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-[#020E7C] transition-colors duration-200"
                              >
                                <span>Upload a file</span>
                                <input id="file-upload" name="file-upload" type="file" className="sr-only" multiple />
                              </label>
                              <p className="pl-1">or drag and drop</p>
                            </div>
                            <p className="text-xs text-gray-500">PDF, DOC, DOCX up to 10MB</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Tab.Panel>

                  {/* Address Tab */}
                  <Tab.Panel>
                    <form onSubmit={handleSubmit} className="space-y-8">
                      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Street Address</label>
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
                          <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
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
                          <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
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
                          <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
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
                          <label className="block text-sm font-medium text-gray-700 mb-2">Postal Code</label>
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
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
