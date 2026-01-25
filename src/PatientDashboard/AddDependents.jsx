import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";
import { baseUrl } from "../env";
import { getToken, getId } from "../utils";
import { ColorRing } from "react-loader-spinner";
import { User, Mail, Phone, Users } from "lucide-react";

const AddDependents = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        emailAddress: "",
        relationship: "SPOUSE",
        phone: "",
        sex: "",
    });

    const [errors, setErrors] = useState({});

    const relationshipOptions = [
        { value: "SPOUSE", label: "Spouse" },
        { value: "CHILD", label: "Child" },
        { value: "PARENT", label: "Parent" },
        { value: "SIBLING", label: "Sibling" },
        { value: "OTHER", label: "Other" },
    ];

    const sexOptions = [
        { value: "MALE", label: "Male" },
        { value: "FEMALE", label: "Female" },
    ];

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
        // Clear error for this field when user starts typing
        if (errors[name]) {
            setErrors({
                ...errors,
                [name]: "",
            });
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.firstName.trim()) {
            newErrors.firstName = "First name is required";
        }

        if (!formData.lastName.trim()) {
            newErrors.lastName = "Last name is required";
        }

        if (!formData.emailAddress.trim()) {
            newErrors.emailAddress = "Email address is required";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.emailAddress)) {
            newErrors.emailAddress = "Please enter a valid email address";
        }

        if (!formData.phone.trim()) {
            newErrors.phone = "Phone number is required";
        }

        if (!formData.sex) {
            newErrors.sex = "Sex is required";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            toast.error("Please fill in all required fields correctly");
            return;
        }

        const token = getToken();
        const primaryUserId = getId();

        if (!token || !primaryUserId) {
            toast.error("Authentication required. Please log in again.");
            navigate("/login");
            return;
        }

        setLoading(true);

        try {
            const response = await axios.post(
                `${baseUrl}/api/dependents/add/${primaryUserId}`,
                {
                    firstName: formData.firstName.trim(),
                    lastName: formData.lastName.trim(),
                    emailAddress: formData.emailAddress.trim(),
                    relationship: formData.relationship,
                    phone: formData.phone.trim(),
                    sex: formData.sex,
                },
                {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            toast.success("Dependent added successfully!");

            // Reset form
            setFormData({
                firstName: "",
                lastName: "",
                emailAddress: "",
                relationship: "SPOUSE",
                phone: "",
                sex: "",
            });
        } catch (error) {
            console.error("Error adding dependent:", error);
            const errorMessage =
                error?.response?.data?.message ||
                error?.response?.data?.error ||
                error?.message ||
                "Failed to add dependent. Please try again.";
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4">
            <div className="max-w-3xl mx-auto">
                {/* Header */}
                {/* <div className="mb-8">
                    <button
                        onClick={() => navigate("/patient-dashboard/profile")}
                        className="text-blue-600 hover:text-blue-800 mb-4 flex items-center gap-2"
                    >
                        <span>←</span> Back to Profile
                    </button>
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                        <Users className="w-8 h-8 text-blue-600" />
                        Add Dependent
                    </h1>
                    <p className="text-gray-600 mt-2">
                        Add a family member or dependent to your account
                    </p>
                </div> */}

                {/* Form Card */}
                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                    <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6">
                        <h2 className="text-xl font-semibold text-white flex items-center space-x-2">
                            <User className="w-6 h-6" />
                            <span>Dependent Information</span>
                        </h2>
                    </div>

                    <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6">
                        {/* Name Fields */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-700 flex items-center space-x-2">
                                    <User className="w-4 h-4 text-blue-600" />
                                    <span>First Name *</span>
                                </label>
                                <input
                                    type="text"
                                    name="firstName"
                                    value={formData.firstName}
                                    onChange={handleChange}
                                    placeholder="Enter first name"
                                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white ${errors.firstName ? "border-red-500" : "border-gray-300"
                                        }`}
                                />
                                {errors.firstName && (
                                    <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-700 flex items-center space-x-2">
                                    <User className="w-4 h-4 text-blue-600" />
                                    <span>Last Name *</span>
                                </label>
                                <input
                                    type="text"
                                    name="lastName"
                                    value={formData.lastName}
                                    onChange={handleChange}
                                    placeholder="Enter last name"
                                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white ${errors.lastName ? "border-red-500" : "border-gray-300"
                                        }`}
                                />
                                {errors.lastName && (
                                    <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>
                                )}
                            </div>
                        </div>

                        {/* Email and Phone */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-700 flex items-center space-x-2">
                                    <Mail className="w-4 h-4 text-blue-600" />
                                    <span>Email Address *</span>
                                </label>
                                <input
                                    type="email"
                                    name="emailAddress"
                                    value={formData.emailAddress}
                                    onChange={handleChange}
                                    placeholder="your.email@example.com"
                                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white ${errors.emailAddress ? "border-red-500" : "border-gray-300"
                                        }`}
                                />
                                {errors.emailAddress && (
                                    <p className="text-red-500 text-xs mt-1">
                                        {errors.emailAddress}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-700 flex items-center space-x-2">
                                    <Phone className="w-4 h-4 text-blue-600" />
                                    <span>Phone Number *</span>
                                </label>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    placeholder="+234 xxx xxx xxxx"
                                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white ${errors.phone ? "border-red-500" : "border-gray-300"
                                        }`}
                                />
                                {errors.phone && (
                                    <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
                                )}
                            </div>
                        </div>

                        {/* Relationship and Sex */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-700 flex items-center space-x-2">
                                    <Users className="w-4 h-4 text-blue-600" />
                                    <span>Relationship *</span>
                                </label>
                                <select
                                    name="relationship"
                                    value={formData.relationship}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
                                >
                                    {relationshipOptions.map((option) => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-700 flex items-center space-x-2">
                                    <User className="w-4 h-4 text-blue-600" />
                                    <span>Sex *</span>
                                </label>
                                <div className="flex gap-6 mt-2">
                                    {sexOptions.map((option) => (
                                        <label
                                            key={option.value}
                                            className="flex items-center space-x-2 cursor-pointer"
                                        >
                                            <input
                                                type="radio"
                                                name="sex"
                                                value={option.value}
                                                checked={formData.sex === option.value}
                                                onChange={handleChange}
                                                className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                                            />
                                            <span className="text-gray-700">{option.label}</span>
                                        </label>
                                    ))}
                                </div>
                                {errors.sex && (
                                    <p className="text-red-500 text-xs mt-1">{errors.sex}</p>
                                )}
                            </div>
                        </div>

                        {/* Submit Button */}
                        <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
                            <button
                                type="button"
                                onClick={() => navigate("/patient-dashboard/profile")}
                                className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                                disabled={loading}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <ColorRing
                                            height="20"
                                            width="20"
                                            ariaLabel="loading"
                                            colors={["white", "white", "white", "white", "white"]}
                                        />
                                        <span>Adding...</span>
                                    </>
                                ) : (
                                    "Add Dependent"
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AddDependents;
