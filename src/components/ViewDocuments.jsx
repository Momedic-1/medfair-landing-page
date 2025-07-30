import { useEffect, useState } from "react";
import { Download, FileText } from "lucide-react";
import { baseUrl } from "../env"; // Make sure this is correct
import axios from "axios";

const ViewDocuments = ({ userId }) => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const response = await axios.get(
          `${baseUrl}/api/patient/documents/upload/${userId}`
        );
        setDocuments(response.data);
      } catch (error) {
        console.error("Error fetching documents:", error);
      } finally {
        setLoading(false);
      }
    };

    if (userId) fetchDocuments();
  }, [userId]);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        Submitted Documents
      </h2>

      {loading ? (
        <p className="text-gray-600">Loading documents...</p>
      ) : documents.length === 0 ? (
        <p className="text-gray-500">No documents found.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {documents.map((doc) => (
            <div
              key={doc.id}
              className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow p-5 border border-gray-100"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="bg-blue-100 text-blue-600 p-3 rounded-full">
                  <FileText className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-gray-700">
                    {doc.fileName}
                  </h4>
                  <p className="text-sm text-gray-500">
                    Uploaded: {doc.uploadedDate}
                  </p>
                </div>
              </div>
              <a
                href={doc.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition"
              >
                <Download className="w-4 h-4 mr-2" />
                View / Download
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ViewDocuments;
