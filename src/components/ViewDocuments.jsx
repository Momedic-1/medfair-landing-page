import { useCallback, useEffect, useState } from "react";
import { Download, FileText, Calendar, Tag, AlertCircle, RefreshCw } from "lucide-react";
import axios from "axios";
import { baseUrl } from "../env";
import { getStoredPatientId } from "../utils/videoCallDisplayInfo";
import { toViewableDocumentUrl } from "../utils/documentUrl";

function resolveViewerRole() {
  try {
    const userData = JSON.parse(localStorage.getItem("userData") || "{}");
    const role = userData?.role || localStorage.getItem("roleType") || "";
    return String(role).trim().toUpperCase();
  } catch {
    return "";
  }
}

const ViewDocuments = ({ patientId: patientIdProp = null, refreshKey = 0 }) => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openError, setOpenError] = useState(null);

  const userId =
    patientIdProp != null && String(patientIdProp).trim() !== ""
      ? String(patientIdProp)
      : getStoredPatientId();
  const token = JSON.parse(localStorage.getItem("authToken"))?.token;
  const role = resolveViewerRole();
  const isDoctor = role === "DOCTOR";

  const fetchDocuments = useCallback(async () => {
    if (!userId || !token) {
      const missingItems = [];
      if (!userId) missingItems.push("patient ID");
      if (!token) missingItems.push("authentication token");
      setError(`Missing: ${missingItems.join(" and ")}`);
      setDocuments([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Doctors prefer /api/doctor/**; fall back to permitAll patient docs path if role auth mismatches.
      const doctorUrl = `${baseUrl}/api/doctor/patients/${userId}/documents`;
      const patientUrl = `${baseUrl}/api/patient/documents/${userId}`;

      let response;
      try {
        response = await axios.get(isDoctor ? doctorUrl : patientUrl, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
      } catch (firstErr) {
        const status = firstErr.response?.status;
        if (isDoctor && (status === 403 || status === 401 || status === 404)) {
          response = await axios.get(patientUrl, {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          });
        } else {
          throw firstErr;
        }
      }

      const data = response.data;
      const list = Array.isArray(data)
        ? data
        : Array.isArray(data?.documents)
          ? data.documents
          : [];
      setDocuments(list);
    } catch (err) {
      const status = err.response?.status;
      const apiMessage =
        err.response?.data?.message ||
        err.response?.data?.error ||
        (typeof err.response?.data === "string" ? err.response.data : null) ||
        err.message;
      setError(
        status
          ? `Failed to load documents (${status}): ${apiMessage}`
          : `Failed to load documents: ${apiMessage}`,
      );
      setDocuments([]);
    } finally {
      setLoading(false);
    }
  }, [userId, token, isDoctor]);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments, refreshKey]);

  useEffect(() => {
    if (!userId || !token) return undefined;
    const interval = window.setInterval(fetchDocuments, 15000);
    return () => window.clearInterval(interval);
  }, [userId, token, fetchDocuments]);

  const getCategoryColor = (category) => {
    const colors = {
      RADIOLOGY_RESULT: "bg-purple-100 text-purple-700 border-purple-200",
      LAB_RESULT: "bg-green-100 text-green-700 border-green-200",
      PRESCRIPTION: "bg-blue-100 text-blue-700 border-blue-200",
      OTHER: "bg-gray-100 text-gray-700 border-gray-200",
    };
    return colors[category] || colors.OTHER;
  };

  const getCategoryLabel = (category) => {
    const labels = {
      RADIOLOGY_RESULT: "Radiology",
      LAB_RESULT: "Lab Result",
      PRESCRIPTION: "Prescription",
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

  const handleDownload = async (doc) => {
    setOpenError(null);
    if (!doc?.id) {
      setOpenError("This document has no id. Ask the patient to re-upload it.");
      return;
    }
    if (!userId || !token) {
      setOpenError("Missing patient ID or login token.");
      return;
    }

    // Prefer doctor file proxy; fall back to patient path (permitAll) if role auth fails.
    const doctorFileUrl = `${baseUrl}/api/doctor/patients/${userId}/documents/${doc.id}/file`;
    const patientFileUrl = `${baseUrl}/api/patient/documents/${userId}/${doc.id}/file`;
    const tryUrls = isDoctor ? [doctorFileUrl, patientFileUrl] : [patientFileUrl];

    try {
      let response;
      let lastErr;
      for (const fileUrl of tryUrls) {
        try {
          response = await axios.get(fileUrl, {
            headers: { Authorization: `Bearer ${token}` },
            responseType: "blob",
          });
          lastErr = null;
          break;
        } catch (e) {
          lastErr = e;
          const status = e.response?.status;
          if (status !== 401 && status !== 403 && status !== 404) throw e;
        }
      }
      if (!response) throw lastErr || new Error("Could not open document");
      const contentType =
        response.headers["content-type"] ||
        doc.fileType ||
        "application/octet-stream";
      const blob = new Blob([response.data], { type: contentType });
      const objectUrl = URL.createObjectURL(blob);
      const opened = window.open(objectUrl, "_blank", "noopener,noreferrer");
      if (!opened) {
        const a = document.createElement("a");
        a.href = objectUrl;
        a.target = "_blank";
        a.rel = "noopener noreferrer";
        a.download = doc.fileName || "document";
        a.click();
      }
      // Keep blob alive long enough for the tab to load; then revoke.
      window.setTimeout(() => URL.revokeObjectURL(objectUrl), 60_000);
    } catch (err) {
      const status = err.response?.status;
      // Fallback: try direct Cloudinary URL (images often work; PDFs may still 401).
      const direct = toViewableDocumentUrl(doc);
      if (direct && status !== 401 && status !== 403) {
        window.open(direct, "_blank", "noopener,noreferrer");
        return;
      }
      setOpenError(
        status
          ? `Could not open document (${status}). If this is a PDF, enable Cloudinary → Settings → Security → Allow delivery of PDF and ZIP files, or ask the patient to re-upload.`
          : `Could not open document: ${err.message}`,
      );
    }
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
              type="button"
              onClick={fetchDocuments}
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
      <div className="flex items-center justify-between mb-6 gap-3">
        <h2 className="text-lg md:text-2xl font-bold text-gray-800">
          Submitted Documents
        </h2>
        <div className="flex items-center gap-3">
          <div className="text-sm text-gray-500">
            {documents.length} document{documents.length !== 1 ? "s" : ""} found
          </div>
          <button
            type="button"
            onClick={fetchDocuments}
            className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50"
            title="Refresh documents"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Refresh
          </button>
        </div>
      </div>

      {openError && (
        <p className="mb-4 text-sm text-red-600">{openError}</p>
      )}

      {documents.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <p className="text-gray-500 text-lg">No documents found</p>
          <p className="text-gray-400 text-sm mt-2">
            This shows all uploads for this patient (old and new). Ask them to
            upload from Profile → Documents, then tap Refresh.
          </p>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center gap-6">
          {documents.map((doc) => (
            <div
              key={doc.id}
              className="w-full bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-200 p-5 border border-gray-100 group"
            >
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

              <div className="mb-4">
                <span
                  className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getCategoryColor(
                    doc.category,
                  )}`}
                >
                  <Tag className="w-3 h-3" />
                  {getCategoryLabel(doc.category)}
                </span>
              </div>

              <button
                type="button"
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
