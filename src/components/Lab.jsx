import { useEffect, useState, useRef } from "react";
import { AlertCircle, Search, X } from "lucide-react";
import axios from "axios";
import { baseUrl } from "../env";

const Lab = ({ doctorId }) => {
  const [investigations, setInvestigations] = useState([]);
  const [selectedInvestigations, setSelectedInvestigations] = useState([]);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(null);
  const dropdownRef = useRef(null);
  const debounceTimeout = useRef(null);

  const [customName, setCustomName] = useState("");

  const token = JSON.parse(localStorage.getItem("authToken"))?.token;
  const patientId = localStorage.getItem("patientId");

  // Log initial props and localStorage values for debugging
  // useEffect(() => {
  //   console.log("Doctor ID:", doctorId);
  //   console.log("Patient ID:", patientId);
  //   console.log("Token:", token);
  // }, [doctorId, patientId, token]);

  // Debounce search input
  useEffect(() => {
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }
    debounceTimeout.current = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);

    return () => clearTimeout(debounceTimeout.current);
  }, [search]);

  // Fetch investigation names from the API
  useEffect(() => {
    const fetchInvestigations = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await axios.get(
          `${baseUrl}/api/investigations/names`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            params: {
              search: debouncedSearch || undefined,
              page: 0,
              size: 10,
            },
          }
        );

        // Log API response for debugging
        // console.log("Investigations API Response:", response.data);

        // Handle different possible response formats
        const investigationsData = response.data.content || response.data || [];
        const formattedInvestigations = investigationsData.map(
          (item, index) =>
            typeof item === "string"
              ? { id: index + 1, name: item } // Fallback: use index as ID if API returns strings
              : { id: item.id, name: item.name || item.title || "Unknown" } // Handle object with id/name or id/title
        );

        setInvestigations(formattedInvestigations);
        setLoading(false);
      } catch (error) {
        setError(
          `Failed to load investigations: ${
            error.response?.data?.message || error.message
          }`
        );
        setLoading(false);
      }
    };

    if (token && debouncedSearch) {
      fetchInvestigations();
    } else if (!token) {
      setError("Missing authentication token");
      setLoading(false);
    } else {
      setInvestigations([]);
      setLoading(false);
    }
  }, [token, debouncedSearch]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setIsDropdownOpen(true);
  };

  // Handle investigation selection
  const handleSelectInvestigation = (investigation) => {
    setSelectedInvestigations((prev) =>
      prev.some((item) => item.id === investigation.id)
        ? prev.filter((item) => item.id !== investigation.id)
        : [...prev, investigation]
    );
    setSearch("");
    setIsDropdownOpen(false);
  };

  // Handle removing selected investigation
  const handleRemoveInvestigation = (investigationId) => {
    setSelectedInvestigations((prev) =>
      prev.filter((item) => item.id !== investigationId)
    );
  };

  const handleAddCustomInvestigation = () => {
    const name = customName.trim();
    if (!name) {
      setError("Enter a custom investigation name");
      return;
    }
    const already = selectedInvestigations.some(
      (item) =>
        String(item.name).toLowerCase() === name.toLowerCase() ||
        (item.custom && String(item.customName).toLowerCase() === name.toLowerCase())
    );
    if (already) {
      setError("That investigation is already selected");
      return;
    }
    setSelectedInvestigations((prev) => [
      ...prev,
      {
        id: `custom-${Date.now()}`,
        name,
        custom: true,
        customName: name,
      },
    ]);
    setCustomName("");
    setError(null);
  };

  // Handle order submission
  const handleSubmitOrder = async () => {
    // Validate inputs
    if (!doctorId) {
      setError("Doctor ID is missing");
      return;
    }
    if (!patientId) {
      setError("Patient ID is missing");
      return;
    }
    if (selectedInvestigations.length === 0) {
      setError("Please select at least one investigation");
      return;
    }
    if (!token) {
      setError("Authentication token is missing");
      return;
    }

    setSubmitLoading(true);
    setError(null);
    setSubmitSuccess(null);

    const requestBody = selectedInvestigations.map((item) =>
      item.custom
        ? {
            customName: item.customName || item.name,
            instruction: "Perform as per protocol",
          }
        : {
            investigationId: item.id,
            instruction: "Perform as per protocol",
          }
    );

    try {
      const response = await axios.post(
        `${baseUrl}/api/investigations/create-order`,
        requestBody,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          params: {
            doctorId: Number(doctorId),
            patientId: Number(patientId),
          },
        }
      );

      setSubmitSuccess(
        `Order created successfully! Order ID: ${response.data.orderId}`
      );
      setSelectedInvestigations([]);
      setTimeout(() => setSubmitSuccess(null), 3000);
    } catch (error) {
      setError(
        `Failed to create order: ${
          error.response?.data?.message || error.message
        }`
      );
    } finally {
      setSubmitLoading(false);
    }
  };

  // Error state (fatal load errors only)
  if (error && !submitSuccess && investigations.length === 0 && !debouncedSearch && !customName && selectedInvestigations.length === 0) {
    return (
      <div className="p-0 md:p-6 max-w-6xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          Investigation Names
        </h2>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-0 md:p-6 max-w-6xl mx-auto">
      <h2 className="text-lg md:text-2xl font-bold text-gray-800 mb-6">
        Select Investigations
      </h2>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Search Dropdown */}
      <div className="mb-6 relative" ref={dropdownRef}>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            value={search}
            onChange={handleSearchChange}
            onFocus={() => setIsDropdownOpen(true)}
            placeholder="Search investigations..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Dropdown Menu */}
        {isDropdownOpen && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center p-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                <span className="ml-2 text-gray-600 text-sm">Loading...</span>
              </div>
            ) : investigations.length === 0 && debouncedSearch ? (
              <div className="p-4 text-center">
                <AlertCircle className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                <p className="text-gray-500 text-sm">No investigations found</p>
                <p className="mt-1 text-xs text-gray-400">
                  Use “Add custom investigation” below if the test is not listed.
                </p>
              </div>
            ) : (
              investigations.map((investigation, index) => (
                <div
                  key={index}
                  className="flex items-center p-3 hover:bg-gray-100 cursor-pointer"
                  onClick={() => handleSelectInvestigation(investigation)}
                >
                  <input
                    type="checkbox"
                    checked={selectedInvestigations.some(
                      (item) => item.id === investigation.id
                    )}
                    readOnly
                    className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="ml-3 text-gray-800">
                    {investigation.name || "Unnamed Investigation"}
                  </span>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      <div className="mb-6 rounded-lg border border-dashed border-slate-300 bg-slate-50 p-4">
        <p className="mb-2 text-sm font-medium text-slate-800">
          Test not in the list? Add a custom investigation
        </p>
        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            type="text"
            value={customName}
            onChange={(e) => setCustomName(e.target.value)}
            placeholder="e.g. Serum Zinc, Custom panel…"
            className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            maxLength={255}
          />
          <button
            type="button"
            onClick={handleAddCustomInvestigation}
            className="rounded-lg bg-slate-800 px-4 py-2 text-sm font-medium text-white hover:bg-slate-900"
          >
            Add custom
          </button>
        </div>
      </div>

      {/* Selected Investigations */}
      {selectedInvestigations.length > 0 && (
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            Selected Investigations
          </h3>
          <div className="flex flex-wrap gap-2">
            {selectedInvestigations.map((investigation, index) => (
              <div
                key={index}
                className="flex items-center bg-white rounded-full px-3 py-1 text-sm text-gray-800 border border-gray-200"
              >
                <span>
                  {investigation.name || "Unnamed Investigation"}
                  {investigation.custom ? (
                    <span className="ml-1 text-xs text-slate-500">(custom)</span>
                  ) : null}
                </span>
                <X
                  className="ml-2 h-4 w-4 text-gray-500 cursor-pointer hover:text-red-500"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveInvestigation(investigation.id);
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Submit Button */}
      {selectedInvestigations.length > 0 && (
        <div className="mt-4">
          <button
            onClick={handleSubmitOrder}
            disabled={submitLoading}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              submitLoading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 text-white hover:bg-blue-700"
            } transition`}
          >
            {submitLoading ? (
              <span className="flex items-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Submitting...
              </span>
            ) : (
              "Submit Order"
            )}
          </button>
        </div>
      )}

      {/* Success Message */}
      {submitSuccess && (
        <div className="mt-4 p-4 bg-green-50 rounded-lg text-green-700">
          {submitSuccess}
        </div>
      )}
    </div>
  );
};

export default Lab;
