import { useEffect, useState } from "react";
import { Download, FileText, Calendar, Tag, AlertCircle } from "lucide-react";
import axios from "axios";
import { baseUrl } from "../env";

const ViewDocuments = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const userId = localStorage.getItem("patientId");
  const token = JSON.parse(localStorage.getItem("authToken"))?.token;

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await axios.get(
          `${baseUrl}/api/patient/documents/${userId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        setDocuments(response.data);
        setLoading(false);
      } catch (error) {
        setError(
          `Failed to load documents: ${
            error.response?.data?.message || error.message
          }`
        );
        setLoading(false);
      }
    };

    if (userId && token) {
      fetchDocuments();
    } else {
      const missingItems = [];
      if (!userId) missingItems.push("patient ID");
      if (!token) missingItems.push("authentication token");

      setError(`Missing: ${missingItems.join(" and ")}`);
      setLoading(false);
    }
  }, [userId, token, baseUrl]);

  const getCategoryColor = (category) => {
    const colors = {
      RADIOLOGY_RESULT: "bg-purple-100 text-purple-700 border-purple-200",
      LAB_RESULT: "bg-green-100 text-green-700 border-green-200",
      OTHER: "bg-gray-100 text-gray-700 border-gray-200",
    };
    return colors[category] || colors.OTHER;
  };

  const getCategoryLabel = (category) => {
    const labels = {
      RADIOLOGY_RESULT: "Radiology",
      LAB_RESULT: "Lab Result",
      OTHER: "Other",
    };
    return labels[category] || "Unknown";
  };

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  const handleDownload = (doc) => {
    window.open(doc.url, "_blank", "noopener,noreferrer");
  };

  if (loading) {
    return (
      <div className="md:p-6 max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          Submitted Documents
        </h2>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Loading documents...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-0 md:p-6 max-w-6xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          Submitted Documents
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

  if (!userId) {
    return (
      <div className="p-0 md:p-6 max-w-6xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          Submitted Documents
        </h2>
        <div className="text-center py-12">
          <AlertCircle className="mx-auto h-12 w-12 text-yellow-500 mb-4" />
          <p className="text-gray-600">No patient selected</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-0 md:p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg md:text-2xl font-bold text-gray-800">
          Submitted Documents
        </h2>
        <div className="text-sm text-gray-500">
          {documents.length} document{documents.length !== 1 ? "s" : ""} found
        </div>
      </div>

      {documents.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <p className="text-gray-500 text-lg">No documents found</p>
          <p className="text-gray-400 text-sm mt-2">
            Upload documents to see them here
          </p>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center gap-6">
          {documents.map((doc) => (
            <div
              key={doc.id}
              className="w-full bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-200 p-5 border border-gray-100 group"
            >
              {/* Header */}
              <div className="flex items-start gap-3 mb-4">
                <div className="bg-blue-100 text-blue-600 p-2.5 rounded-lg group-hover:bg-blue-200 transition-colors">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4
                    className="text-sm font-semibold text-gray-800 truncate"
                    title={doc.fileName}
                  >
                    {doc.fileName}
                  </h4>
                  <div className="flex items-center gap-1 mt-1">
                    <Calendar className="w-3 h-3 text-gray-400" />
                    <span className="text-xs text-gray-500">
                      {formatDate(doc.uploadedDate)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Category Badge */}
              <div className="mb-4">
                <span
                  className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getCategoryColor(
                    doc.category
                  )}`}
                >
                  <Tag className="w-3 h-3" />
                  {getCategoryLabel(doc.category)}
                </span>
              </div>

              {/* Download Button */}
              <button
                onClick={() => handleDownload(doc)}
                className="w-full inline-flex items-center justify-center px-4 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200"
              >
                <Download className="w-4 h-4 mr-2" />
                View Document
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ViewDocuments;
