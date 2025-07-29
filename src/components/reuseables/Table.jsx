import { useState, useEffect, useRef } from "react";
import { formatDate } from "../../utils";
import { Hourglass } from "react-loader-spinner";
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
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [medications, setMedications] = useState([]);
  const [showPharmacyDropdown, setShowPharmacyDropdown] = useState(null);

  const dropdownRef = useRef(null);

  const partnerPharmacies = [
    "HealthPlus",
    "MedPlus",
    "Alpha Pharmacy",
    "NetPharm",
  ];

  const viewMedications = (prescriptions) => {
    if (!prescriptions || prescriptions.length === 0) {
      toast.info("No prescribed medication");
      return;
    }
    setMedications(prescriptions);
    setModalIsOpen(true);
  };

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setShowPharmacyDropdown(null);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="relative w-full h-screen overflow-x-auto">
      <div className="min-w-full bg-white shadow-md rounded-lg overflow-auto">
        <table className="min-w-full leading-normal text-center">
          <thead className="bg-gray-50 sticky top-0 z-10 py-4">
            <tr>
              {[
                "Doctor‘s Full Name",
                "Visit Date",
                "Subjective",
                "Objective",
                "Assessment",
                "Plan",
                "Final diagnosis",
                "SOAP comment",
                "Medications",
                "Actions",
              ].map((header, idx) => (
                <th
                  key={idx}
                  className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="text-center">
            {isLoading ? (
              <tr>
                <td colSpan="10">
                  <div className="w-full h-[400px] flex items-center justify-center">
                    <Hourglass
                      visible={true}
                      height="40"
                      width="40"
                      ariaLabel="hourglass-loading"
                      colors={["#306cce", "#72a1ed"]}
                    />
                  </div>
                </td>
              </tr>
            ) : data?.length === 0 ? (
              <tr>
                <td colSpan="10" className="text-center py-4">
                  {emptyMessage || "No data available"}
                </td>
              </tr>
            ) : (
              data.map((patient, index) => (
                <tr key={index} className="border-b border-gray-200">
                  <td className="px-2 py-2 text-sm text-gray-700">{`${patient?.doctorLastName}, ${patient?.doctorFirstName}`}</td>
                  <td className="px-2 py-2 text-sm text-gray-700">
                    {formatDate(patient?.visitDate)}
                  </td>
                  <td className="px-2 py-2 text-sm text-gray-700">{patient?.subjective}</td>
                  <td className="px-2 py-2 text-sm text-gray-700">{patient?.objective}</td>
                  <td className="px-2 py-2 text-sm text-gray-700">{patient?.assessment}</td>
                  <td className="px-2 py-2 text-sm text-gray-700">{patient?.plan}</td>
                  <td className="px-2 py-2 text-sm text-gray-700">{patient?.finalDiagnosis}</td>
                  <td className="px-2 py-2 text-sm text-gray-700">{patient?.soapComment}</td>

                  {/* View Medications */}
                  <td className="p-4 text-sm">
                    <button
                      className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 hover:text-blue-700 rounded-lg border border-blue-200 transition-all"
                      onClick={() => viewMedications(patient?.prescriptions)}
                      disabled={!patient?.prescriptions?.length}
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                      </svg>
                      View Medications
                    </button>
                  </td>

                  {/* Get Prescription with Dropdown */}
                  <td className="px-3 py-3 text-sm relative">
                    <div className="relative" ref={dropdownRef}>
                      <button
                        className="group relative inline-flex items-center gap-3 px-5 py-3 text-sm font-semibold text-white bg-gradient-to-r from-orange-500 via-orange-600 to-red-500 hover:from-orange-600 hover:via-orange-700 hover:to-red-600 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
                        onClick={() =>
                          setShowPharmacyDropdown(
                            showPharmacyDropdown === index ? null : index
                          )
                        }
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                          />
                        </svg>
                        Get Prescription
                      </button>

                      {showPharmacyDropdown === index && (
                        <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-md shadow-lg z-50">
                          <ul className="divide-y divide-gray-100">
                            {partnerPharmacies.map((pharmacy, idx) => (
                              <li
                                key={idx}
                                className="px-4 py-2 hover:bg-orange-100 cursor-pointer text-sm text-gray-700"
                                onClick={() => {
                                  toast.success(`Redirecting to ${pharmacy}`);
                                  setShowPharmacyDropdown(null);
                                }}
                              >
                                {pharmacy}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Medications Modal */}
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
                  <tr key={medication?.id}>
                    <td className="border px-4 py-2">{medication?.drugName}</td>
                    <td className="border px-4 py-2">{medication?.dosage}</td>
                    <td className="border px-4 py-2">{medication?.frequency}</td>
                    <td className="border px-4 py-2">{medication?.duration}</td>
                    <td className="border px-4 py-2">{medication?.instructions}</td>
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
