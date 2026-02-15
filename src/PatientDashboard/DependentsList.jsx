import React, { useState, useEffect } from "react";
import axios from "axios";
import { baseUrl } from "../env";
import { getToken, getId } from "../utils";
import { ColorRing } from "react-loader-spinner";
import { Users, User, Mail, Phone } from "lucide-react";

const RELATIONSHIP_LABELS = {
    SPOUSE: "Spouse",
    CHILD: "Child",
    PARENT: "Parent",
    SIBLING: "Sibling",
    OTHER: "Other",
};

const GENDER_LABELS = {
    MALE: "Male",
    FEMALE: "Female",
};

const DependentsList = ({ refreshTrigger } = {}) => {
    const [dependents, setDependents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const primaryUserId = getId();
    const token = getToken();

    const fetchDependents = async () => {
        if (!primaryUserId || !token) {
            setError("Authentication required.");
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const response = await axios.get(
                `${baseUrl}/api/dependents/get-dependents/${primaryUserId}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            setDependents(Array.isArray(response.data) ? response.data : []);
        } catch (err) {
            console.error("Error fetching dependents:", err);
            setError(
                err?.response?.data?.message ||
                    err?.response?.data?.error ||
                    err?.message ||
                    "Failed to load dependents."
            );
            setDependents([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDependents();
    }, [primaryUserId, refreshTrigger]);

    if (loading) {
        return (
            <div className="flex justify-center items-center py-12">
                <ColorRing
                    height="40"
                    width="40"
                    ariaLabel="loading"
                    colors={["#2563eb", "#2563eb", "#2563eb", "#2563eb", "#2563eb"]}
                />
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm">
                {error}
            </div>
        );
    }

    if (dependents.length === 0) {
        return (
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-8 text-center text-gray-500">
                <Users className="w-12 h-12 mx-auto text-gray-400 mb-3" />
                <p className="font-medium">No dependents yet</p>
                <p className="text-sm mt-1">Add a dependent using the form above.</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-600" />
                Your dependents ({dependents.length})
            </h3>
            <div className="grid gap-4 sm:grid-cols-1 lg:grid-cols-2">
                {dependents.map((d) => (
                    <div
                        key={d.id}
                        className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow"
                    >
                        <div className="p-4 space-y-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                                        <User className="w-5 h-5 text-blue-600" />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-gray-900">
                                            {d.firstName} {d.lastName}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            {RELATIONSHIP_LABELS[d.relationship] ?? d.relationship} •{" "}
                                            {GENDER_LABELS[d.gender] ?? d.gender}
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className="flex flex-col gap-1.5 text-sm text-gray-600">
                                <span className="flex items-center gap-2">
                                    <Mail className="w-4 h-4 text-blue-600 shrink-0" />
                                    {d.email}
                                </span>
                                {d.phone && (
                                    <span className="flex items-center gap-2">
                                        <Phone className="w-4 h-4 text-blue-600 shrink-0" />
                                        {d.phone}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default DependentsList;
