import React, { useState } from "react";
import { Edit, Trash2 } from "lucide-react";
import { formatDate } from "../../utils";
import axios from "axios";
import { baseUrl } from "../../env";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Modal, Box } from "@mui/material";
// import { Modal, Box } from "@mui/material";

const modalStyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "90%",
  maxWidth: "700px",
  bgcolor: "background.paper",
  boxShadow: 24,
  p: 4,
  borderRadius: "8px",
  overflowY: "auto",
  maxHeight: "90vh",
};

const PatientTableSkeleton = () => (
  <tr className="border-b border-gray-200">
    {Array(11)
      .fill(0)
      .map((_, i) => (
        <td key={i} className="border border-gray-200 px-4 py-2">
          <div className="h-4 bg-gray-200 rounded animate-pulse" />
        </td>
      ))}
  </tr>
);

const PatientTable = ({ data = [], isLoading = false, emptyMessage }) => {
  const token = JSON.parse(localStorage.getItem("authToken"))?.token;
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [medications, setMedications] = useState([]);

  const getDrugs = async (patientId) => {
    console.log("Patient ID:", patientId);
    try {
      const response = await axios.get(
        `${baseUrl}/api/prescriptions/patient/${patientId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log("Drugs data:", response.data);

      if (response.data.length === 0) {
        toast.info("No prescribed medication");
      } else {
        setMedications(response.data);
        setModalIsOpen(true);
      }
    } catch (err) {
      console.error("Failed", err);
      toast.error("Failed to fetch medications");
    }
  };

  return (
    <div className="w-full border rounded-lg flex flex-col h-[400px]">
      <div className="w-full overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-gray-50 sticky top-0 z-10">
            <tr className="border-b border-gray-300">
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                Patient First Name
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                Patient Last Name
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                Visit Date
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap min-w-[200px]">
                Subjective
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap min-w-[200px]">
                Objective
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap min-w-[200px]">
                Assessment
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap min-w-[200px]">
                Plan
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap min-w-[200px]">
                Final Diagnosis
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap min-w-[200px]">
                SOAP Comment
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap min-w-[150px]">
                Medications
              </th>
              {/* <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                Actions
              </th> */}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200 overflow-y-auto">
            {isLoading ? (
              <>
                {Array(8)
                  .fill(0)
                  .map((_, index) => (
                    <PatientTableSkeleton key={index} />
                  ))}
              </>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={11} className="h-[520px]">
                  {" "}
                  {/* Adjusted height to account for header */}
                  <div className="flex flex-col items-center justify-center h-full space-y-2">
                    <p className="text-lg font-medium text-gray-600">
                      {emptyMessage}
                    </p>
                    <p className="text-sm text-gray-400">
                      Patient records will appear here once added
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              data.map((patient, index) => (
                <tr
                  key={index}
                  className="border-b border-gray-200 hover:bg-gray-50"
                >
                  <td className="px-4 py-4 whitespace-nowrap font-medium text-gray-900">
                    {patient.patientFirstName}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-gray-700">
                    {patient.patientLastName}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-gray-700">
                    {formatDate(patient.visitDate)}
                  </td>
                  <td className="px-4 py-4 text-gray-700">
                    {patient.subjective}
                  </td>
                  <td className="px-4 py-4 text-gray-700">
                    {patient.objective}
                  </td>
                  <td className="px-4 py-4 text-gray-700">
                    {patient.assessment}
                  </td>
                  <td className="px-4 py-4 text-gray-700">{patient.plan}</td>
                  <td className="px-4 py-4 text-gray-700">
                    {patient.finalDiagnosis}
                  </td>
                  <td className="px-4 py-4 text-gray-700">
                    {patient.soapComment}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <button
                      className="p-4 hover:bg-gray-100 rounded-lg border"
                      onClick={() => getDrugs(patient.id)}
                    >
                      View
                    </button>
                    {/* <div className="flex space-x-2">
                      <button className="p-1 hover:bg-gray-100 rounded-full">
                        <Edit className="h-4 w-4 text-gray-600" />
                      </button>
                      <button className="p-1 hover:bg-red-50 rounded-full">
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </button>
                    </div> */}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Modal
        open={modalIsOpen}
        onClose={() => setModalIsOpen(false)}
        aria-labelledby="medications-modal-title"
        aria-describedby="medications-modal-description"
      >
        <Box sx={modalStyle}>
          <h2 id="medications-modal-title" className="text-lg font-bold mb-4">
            Prescribed Medications
          </h2>
          {medications.length > 0 ? (
            <table className="min-w-full border">
              <thead>
                <tr>
                  <th className="border px-4 py-2">Drug Name</th>
                  <th className="border px-4 py-2">Dosage</th>
                  <th className="border px-4 py-2">Frequency</th>
                  <th className="border px-4 py-2">Duration</th>
                  <th className="border px-4 py-2">Instructions</th>
                </tr>
              </thead>
              <tbody>
                {medications.map((medication) => (
                  <tr key={medication.id}>
                    <td className="border px-4 py-2">{medication.drugName}</td>
                    <td className="border px-4 py-2">{medication.dosage}</td>
                    <td className="border px-4 py-2">{medication.frequency}</td>
                    <td className="border px-4 py-2">{medication.duration}</td>
                    <td className="border px-4 py-2">
                      {medication.instructions}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p id="medications-modal-description" className="text-gray-600">
              No medications available.
            </p>
          )}
          <button
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
            onClick={() => setModalIsOpen(false)}
          >
            Close
          </button>
        </Box>
      </Modal>
    </div>
  );
};

export default PatientTable;
