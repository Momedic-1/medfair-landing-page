import React, { useState } from "react";
import { formatDate } from "../../utils";
import { Hourglass } from "react-loader-spinner";
import axios from "axios";
import { baseUrl } from "../../env";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Modal, Box } from "@mui/material";

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

const Table = ({ data = [], isLoading = false, emptyMessage }) => {
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

      if (response.length === 0) {
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
    <div className="relative w-full h-screen overflow-x-auto">
      <div className="min-w-full bg-white shadow-md rounded-lg overflow-auto">
        <table className="min-w-full leading-normal text-center">
          <thead className="bg-gray-50 sticky top-0 z-10 py-4">
            <tr>
              <th className="px-4 py-2 w-64 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Doctor's Full Name
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Visit Date
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Subjective
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Objective
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Assessment
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Plan
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Final diagnosis
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                SOAP comment
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Medications
              </th>
            </tr>
          </thead>

          <tbody className="text-center">
            {isLoading ? (
              <div className="absolute top-20 w-full h-[400px] flex items-center justify-center">
                <Hourglass
                  visible={true}
                  height="40"
                  width="40"
                  ariaLabel="hourglass-loading"
                  wrapperStyle={{}}
                  wrapperClass=""
                  colors={["#306cce", "#72a1ed"]}
                />
              </div>
            ) : data?.length < 0 ? (
              <tr>
                <td colSpan="7" className="text-center py-4">
                  {emptyMessage || "No data available"}
                </td>
              </tr>
            ) : (
              data.map((patient, index) => (
                <tr key={index} className="border-b border-gray-200">
                  <td className="px-2 py-2 text-sm text-gray-700">{`${patient.doctorLastName}, ${patient.doctorFirstName}`}</td>
                  <td className="px-2 py-2 text-sm text-gray-700">
                    {formatDate(patient.visitDate)}
                  </td>
                  <td className="px-2 py-2 text-sm text-gray-700 ">
                    {patient.subjective}
                  </td>
                  <td className="px-2 py-2 text-sm text-gray-700 ">
                    {patient.objective}
                  </td>
                  <td className="px-2 py-2 text-sm text-gray-700 ">
                    {patient.assessment}
                  </td>
                  <td className="px-2 py-2 text-sm text-gray-700">
                    {patient.plan}
                  </td>
                  <td className="px-2 py-2 text-sm text-gray-700">
                    {patient.finalDiagnosis}
                  </td>
                  <td className="px-2 py-2 text-sm text-gray-700">
                    {patient.soapComment}
                  </td>
                  <td className="px-2 py-2 text-sm text-gray-700">
                  <button
                      className="p-4 hover:bg-gray-100 rounded-lg border"
                      onClick={() => getDrugs(patient.id)}
                    >
                      View
                    </button>
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

export default Table;
