import { useEffect, useState, useRef } from "react";
import { AlertCircle, Search, X } from "lucide-react";
import axios from "axios";
import { baseUrl } from "../env";

const Lab = () => {
  const [investigations, setInvestigations] = useState([]);
  const [selectedInvestigations, setSelectedInvestigations] = useState([]);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const dropdownRef = useRef(null);
  const debounceTimeout = useRef(null);

  const token = JSON.parse(localStorage.getItem("authToken"))?.token;

  // Debounce search input
  useEffect(() => {
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }
    debounceTimeout.current = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300); // 300ms debounce delay

    return () => clearTimeout(debounceTimeout.current);
  }, [search]);

  // Fetch investigation names from the API
  useEffect(() => {
    const fetchInvestigations = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await axios.get(`${baseUrl}/api/investigations/names`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          params: {
            search: debouncedSearch || undefined,
            page: 0,
            size: 10,
          },
        });

        setInvestigations(response.data.content || []);
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
      prev.includes(investigation)
        ? prev.filter((item) => item !== investigation)
        : [...prev, investigation]
    );
    setSearch("");
    setIsDropdownOpen(false);
  };

  // Handle removing selected investigation
  const handleRemoveInvestigation = (investigation) => {
    setSelectedInvestigations((prev) =>
      prev.filter((item) => item !== investigation)
    );
  };

  // Error state
  if (error) {
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
                <span className="ml-2 text-gray-600 text-sm">
                  Loading...
                </span>
              </div>
            ) : investigations.length === 0 && debouncedSearch ? (
              <div className="p-4 text-center">
                <AlertCircle className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                <p className="text-gray-500 text-sm">No investigations found</p>
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
                    checked={selectedInvestigations.includes(investigation)}
                    readOnly
                    className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="ml-3 text-gray-800">{investigation}</span>
                </div>
              ))
            )}
          </div>
        )}
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
                <span>{investigation}</span>
                <X
                  className="ml-2 h-4 w-4 text-gray-500 cursor-pointer hover:text-red-500"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveInvestigation(investigation);
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Lab;