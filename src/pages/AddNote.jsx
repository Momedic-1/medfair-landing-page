import { useState, useEffect } from "react";
import axios from "axios";
import { baseUrl } from "../env";
import { IoIosAdd } from "react-icons/io";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Typography,
} from "@mui/material";
import { capitalizeFirstLetter, formatDate } from "../utils";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { ColorRing } from "react-loader-spinner";
import { IoMdArrowBack } from "react-icons/io";
import { ToastContainer, toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';


const AddNoteModal = ({ isOpen, onClose, onNoteAdded }) => {
  const [patientFirstName, setpatientFirstName] = useState("");
  const [patientLastName, setPatientLastName] = useState("");
  const [visitDate, setVisitDate] = useState("");
  const [subjective, setSubjective] = useState("");
  const [objective, setObjective] = useState("");
  const [assessment, setAssessment] = useState("");
  const [plan, setPlan] = useState("");
  const [finalDiagnosis, setFinalDiagnosis] = useState("");
  const [soapComment, setSoapComment] = useState("");
  const [drugs, setDrugs] = useState([{ name: "", dosage: "" }]);
  const [existingNotes, setExistingNotes] = useState([]);
  const [isViewNotesOpen, setIsViewNotesOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const token = JSON.parse(localStorage.getItem("authToken"))?.token;
  const userData = JSON.parse(localStorage.getItem("userData")) || {};

  const patientId = localStorage.getItem("patientId");

  const [activeTab, setActiveTab] = useState("SOAP");

  const [isPrescriptionModalOpen, setIsPrescriptionModalOpen] = useState(false);
  const [prescriptionForm, setPrescriptionForm] = useState({
    drugName: "",
    dosage: "",
    frequency: "",
    duration: "",
    instructions: "",
  });
  const [prescriptionError, setPrescriptionError] = useState("");
  const [prescriptionLoading, setPrescriptionLoading] = useState(false);

  const [prescriptions, setPrescriptions] = useState([]);
  const [fetchingPrescriptions, setFetchingPrescriptions] = useState(false);

  const [isEditMode, setIsEditMode] = useState(false);
  const [currentPrescriptionId, setCurrentPrescriptionId] = useState(null);

  useEffect(() => {
    if (patientId && isOpen && !existingNotes.length) {
      fetchPatientNotes();
    }
  }, [isOpen]);

  useEffect(() => {
    if (activeTab === "Medication" && patientId) {
      fetchPatientPrescriptions();
    }
  }, [activeTab, patientId]);

  const fetchPatientNotes = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${baseUrl}/api/notes/get-all-patient-note/${patientId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      const notesData = response.data;
      if (notesData.length > 0) {
        const firstNote = notesData[0];
        setpatientFirstName(firstNote.patientFirstName);
        setPatientLastName(firstNote.patientLastName);
      }
      setExistingNotes(notesData);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching patient notes:", err);
      setLoading(false);
    }
  };

  const fetchPatientPrescriptions = async () => {
    setFetchingPrescriptions(true);
    try {
      const response = await axios.get(
        `${baseUrl}/api/prescriptions/patient/${patientId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      // Sort prescriptions by createdAt in descending order (newest first)
      const sortedPrescriptions = response.data.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
      setPrescriptions(sortedPrescriptions);
    } catch (err) {
      console.error("Failed to fetch prescriptions:", err);
    } finally {
      setFetchingPrescriptions(false);
    }
  };

  useEffect(() => {
    setError("");
  }, [drugs]);

  const handleViewNotes = async () => {
    if (!isViewNotesOpen) {
      await fetchPatientNotes();
    }
    setIsViewNotesOpen((prev) => !prev);
  };

  const moveToMedication = () => {
    setActiveTab("Medication");
    setIsViewNotesOpen(false);
  }
  const handleAddNote = async (e) => {
    e.preventDefault();

    // for (let drug of drugs) {
    //   if (!drug.name || !drug.dosage) {
    //     setError("Please provide both drug name and dosage.");
    //    return;
    //   }
    // }
    const formData = {
      doctorId: userData?.id,
      patientId: patientId,
      patientFirstName,
      patientLastName,
      visitDate,
      subjective,
      objective,
      assessment,
      plan,
      finalDiagnosis,
      soapComment,
      prescriptions:
    {
      drugName: prescriptionForm.drugName,
      dosage: prescriptionForm.dosage,
      frequency: prescriptionForm.frequency,
      duration: prescriptionForm.duration,
      instructions: prescriptionForm.instructions,
      patientId: patientId
    }
    };

    try {
       if (isEditMode) {
      await handleUpdatePrescription(e);
    }
    else {
      setLoading(true);
      const response = await axios.post(
        `${baseUrl}/api/notes/create`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      alert("Note added successfully!");
      toast.success("Note added successfully!");
      onNoteAdded(response.data);
      resetForm();
      setLoading(false);}
    } catch (err) {
      setLoading(false);
      console.error("Failed to add note:", err);
      toast.error("Failed to add note, please try again.")
      alert("Failed to add note, please try again.");
    }
  };
  const resetForm = () => {
    setVisitDate("");
    setSubjective("");
    setObjective("");
    setAssessment("");
    setPlan("");
    setFinalDiagnosis("");
    setSoapComment("");
    setDrugs([{ name: "", dosage: "" }]);
  };
  const handleDrugChange = (e, index, field) => {
    const updatedDrugs = [...drugs];
    updatedDrugs[index][field] = e.target.value;
    setDrugs(updatedDrugs);
  };

  const handleAddDrug = () => {
    setDrugs([...drugs, { name: "", dosage: "" }]);
  };

  const handleViewPrescription = async (prescriptionId) => {
    setCurrentPrescriptionId(prescriptionId);
    setIsEditMode(true);
    setPrescriptionLoading(true);

    try {
      const response = await axios.get(
        `${baseUrl}/api/prescriptions/${prescriptionId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const prescription = response.data;
      setPrescriptionForm({
        drugName: prescription.drugName,
        dosage: prescription.dosage,
        frequency: prescription.frequency,
        duration: prescription.duration,
        instructions: prescription.instructions,
      });
      setIsPrescriptionModalOpen(true);
    } catch (err) {
      console.error("Failed to fetch prescription details:", err);
    } finally {
      setPrescriptionLoading(false);
    }
  };

  const handleUpdatePrescription = async (e) => {
    e.preventDefault();
    setPrescriptionError("");
    setPrescriptionLoading(true);

    try {
      await axios.put(
        `${baseUrl}/api/prescriptions/${currentPrescriptionId}`,
        {
          ...prescriptionForm,
          patientId,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      setIsPrescriptionModalOpen(false);
      resetPrescriptionForm();
      fetchPatientPrescriptions();
    } catch (err) {
      setPrescriptionError(
        err.response?.data?.message || "Failed to update prescription"
      );
    } finally {
      setPrescriptionLoading(false);
    }
  };

  const resetPrescriptionForm = () => {
    setPrescriptionForm({
      drugName: "",
      dosage: "",
      frequency: "",
      duration: "",
      instructions: "",
    });
    setIsEditMode(false);
    setCurrentPrescriptionId(null);
  };

  const handleNewPrescription = () => {
    resetPrescriptionForm();
    setIsPrescriptionModalOpen(true);
  };

  // const handlePrescriptionSubmit = async (e) => {
  //   e.preventDefault();
  //   if (isEditMode) {
  //     await handleUpdatePrescription(e);
  //   } else {
  //     setPrescriptionError("");
  //     setPrescriptionLoading(true);

  //     try {
  //       await axios.post(
  //         `${baseUrl}/api/prescriptions`,
  //         {
  //           ...prescriptionForm,
  //           patientId,
  //         },
  //         {
  //           headers: {
  //             Authorization: `Bearer ${token}`,
  //             "Content-Type": "application/json",
  //           },
  //         }
  //       );

  //       setIsPrescriptionModalOpen(false);
  //       resetPrescriptionForm();
  //       fetchPatientPrescriptions();
  //     } catch (err) {
  //       setPrescriptionError(
  //         err.response?.data?.message || "Failed to add prescription"
  //       );
  //     } finally {
  //       setPrescriptionLoading(false);
  //     }
  //   }
  // };

  const handlePrescriptionChange = (e) => {
    setPrescriptionForm({
      ...prescriptionForm,
      [e.target.name]: e.target.value,
    });
  };

  if (!isOpen) return null;

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={handleOverlayClick}
    >
      <div
        className="bg-white w-[90%] max-w-lg rounded-lg shadow-lg p-6 max-h-[80vh] overflow-y-scroll"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-blue-600">Add Notes</h2>
          <button
            onClick={handleViewNotes}
            className="bg-blue-500 text-white w-[160px] h-10 px-6 py-2 rounded-md flex items-center justify-center"
          >
            {isViewNotesOpen ? (
              "Hide Notes"
            ) : loading ? (
              <ColorRing
                visible={true}
                height="40"
                width="40"
                ariaLabel="loading"
                wrapperClass="color-ring-wrapper"
                colors={["white", "white", "white", "white", "white"]}
              />
            ) : (
              "View Notes"
            )}
          </button>
        </div>

        <div className="flex border-b mb-4">
          <button
            className={`px-4 py-2 ${
              activeTab === "SOAP"
                ? "border-b-2 border-blue-500 text-blue-500"
                : "text-gray-500"
            }`}
            onClick={() => setActiveTab("SOAP")}
          >
            SOAP
          </button>
          <button
            className={`px-4 py-2 ${
              activeTab === "Medication"
                ? "border-b-2 border-blue-500 text-blue-500"
                : "text-gray-500"
            }`}
            onClick={() => setActiveTab("Medication")}
          >
            Medication
          </button>
        </div>

        {isViewNotesOpen && (
          <div className="border p-4 mb-4">
            {loading ? (
              <p>Loading notes...</p>
            ) : (
              <>
                {existingNotes.length > 0 ? (
                  existingNotes.map((note, index) => (
                    <div key={index} className="border-b mb-2">
                      <Accordion>
                        <AccordionSummary
                          expandIcon={<ExpandMoreIcon />}
                          aria-controls="panel1-content"
                          id="panel1-header"
                        >
                          <div className="w-full flex justify-between items-center">
                            <p className="text-blue-600 font-medium">
                              Note #{note.id}
                            </p>
                            <p className="text-gray-900/60">
                              {formatDate(note.visitDate)}
                            </p>
                          </div>
                        </AccordionSummary>
                        <AccordionDetails>
                          <div className="w-full flex flex-col">
                            <div className="w-full flex flex-col mb-2 gap-y-2">
                              <p className="text-gray-800 text-lg font-semibold">
                                Subjective
                              </p>
                              <p className="text-gray-800/60 text-sm">
                                {note.subjective || "N/A"}
                              </p>
                            </div>
                            <div className="w-full flex flex-col mb-2 gap-y-2">
                              <p className="text-gray-800 text-lg font-semibold">
                                Objective
                              </p>
                              <p className="text-gray-800/60 text-sm">
                                {note.subjective || "N/A"}
                              </p>
                            </div>
                            <div className="w-full flex flex-col mb-2 gap-y-2">
                              <p className="text-gray-800 text-lg font-semibold">
                                Assessment
                              </p>
                              <p className="text-gray-800/60 text-sm">
                                {note.assessment || "N/A"}
                              </p>
                            </div>
                            <div className="w-full flex flex-col mb-2 gap-y-2">
                              <p className="text-gray-800 text-lg font-semibold">
                                Plan
                              </p>
                              <p className="text-gray-800/60 text-sm">
                                {note.plan || "N/A"}
                              </p>
                            </div>
                            <div className="w-full flex flex-col mb-2 gap-y-2">
                              <p className="text-gray-800 text-lg font-semibold">
                                Fina Diagnosis
                              </p>
                              <p className="text-gray-800/60 text-sm">
                                {note.finalDiagnosis || "N/A"}
                              </p>
                            </div>
                            <div className="w-full flex flex-col mb-2 gap-y-2">
                              <p className="text-gray-800 text-lg font-semibold">
                                SOAP Comment
                              </p>
                              <p className="text-gray-800/60 text-sm">
                                {note.soapComment || "N/A"}
                              </p>
                            </div>
                            {/* <ul>
                              <p className="text-gray-800 text-lg font-semibold">
                                Drug Prescription
                              </p>
                              {note.drugs.map((drug, idx) => (
                                <li
                                  key={idx}
                                  className="text-gray-800/60 text-sm"
                                >
                                  {drug.name} - {drug.dosage}
                                </li>
                              ))}
                            </ul> */}
                          </div>
                        </AccordionDetails>
                      </Accordion>
                    </div>
                  ))
                ) : (
                  <p>No notes found.</p>
                )}
              </>
            )}
          </div>
        )}

        {!isViewNotesOpen && (
          <>
            {activeTab === "SOAP" && (
              <>
                <form className="space-y-4">
                  <div className="border rounded p-4">
                    <p className="font-bold text-[#020E7C] text-xl text-left">
                      Patient Name
                    </p>
                    <hr className="mt-1" />
                    <p className="font-bold text-gray-900/50 mt-2 text-xl text-left">
                      {`${capitalizeFirstLetter(
                        patientFirstName
                      )} ${capitalizeFirstLetter(patientLastName)}`}
                    </p>
                  </div>

                  <div className="border rounded p-4">
                    <label
                      htmlFor="visitDate"
                      className="block font-medium mb-1 text-[#020E7C]"
                    >
                      Visit Date:
                    </label>
                    <input
                      type="date"
                      id="visitDate"
                      className="border p-2 w-full outline-none"
                      value={visitDate}
                      onChange={(e) => setVisitDate(e.target.value)}
                      required
                    />
                  </div>

                  <div className="border rounded p-4">
                    <label
                      htmlFor="subjective"
                      className="block text-sm font-medium mb-1 text-[#020E7C]"
                    >
                      Subjective
                    </label>
                    <textarea
                      id="subjective"
                      value={subjective}
                      onChange={(e) => setSubjective(e.target.value)}
                      placeholder="Enter subjective information"
                      className="border rounded p-2 w-full outline-none text-gray-900/60"
                    />
                  </div>

                  <div className="border rounded p-4">
                    <label
                      htmlFor="objective"
                      className="block mb-1 text-[#020E7C] text-sm font-medium"
                    >
                      Objective
                    </label>
                    <textarea
                      id="objective"
                      value={objective}
                      onChange={(e) => setObjective(e.target.value)}
                      placeholder="Enter objective information"
                      className="border rounded p-2 w-full outline-none text-gray-900/60"
                    />
                  </div>

                  <div className="border rounded p-4">
                    <label
                      htmlFor="assessment"
                      className="block mb-1 text-[#020E7C] text-sm font-medium"
                    >
                      Assessment
                    </label>
                    <textarea
                      id="assessment"
                      value={assessment}
                      onChange={(e) => setAssessment(e.target.value)}
                      placeholder="Enter assessment information"
                      className="border rounded p-2 w-full outline-none text-gray-900/60"
                    />
                  </div>

                  <div className="border rounded p-4">
                    <label
                      htmlFor="plan"
                      className="block mb-1 text-[#020E7C] text-sm font-medium"
                    >
                      Plan
                    </label>
                    <textarea
                      id="plan"
                      value={plan}
                      onChange={(e) => setPlan(e.target.value)}
                      placeholder="Enter plan information"
                      className="border rounded p-2 w-full outline-none text-gray-900/60"
                    />
                  </div>

                  <div className="border rounded p-4">
                    <label
                      htmlFor="finalDiagnosis"
                      className="block mb-1 text-[#020E7C] text-sm font-medium"
                    >
                      Final Diagnosis
                    </label>
                    <input
                      id="finalDiagnosis"
                      type="text"
                      value={finalDiagnosis}
                      onChange={(e) => setFinalDiagnosis(e.target.value)}
                      placeholder="Enter final diagnosis"
                      className="border rounded p-2 w-full outline-none text-gray-900/60"
                    />
                  </div>

                  <div className="border rounded p-4">
                    <label
                      htmlFor="soapComment"
                      className="block mb-1 text-[#020E7C] text-sm font-medium"
                    >
                      SOAP Comment
                    </label>
                    <textarea
                      id="soapComment"
                      value={soapComment}
                      onChange={(e) => setSoapComment(e.target.value)}
                      placeholder="Enter SOAP comment"
                      className="border rounded p-2 w-full outline-none text-gray-900/60"
                    />
                  </div>
                </form>
                <div className="flex justify-between mt-6">
                  <button
                    type="button"
                    onClick={onClose}
                    className="bg-white text-blue-600 px-4 py-2 rounded-md"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-blue-500 text-white px-6 py-2 rounded-md w-[160px] h-10 flex justify-center items-center"
                    // onClick={handleAddNote}
                    onClick={moveToMedication}
                  >
                    {/* {loading ? (
                      <ColorRing
                        visible={true}
                        height="40"
                        width="40"
                        ariaLabel="loading"
                        wrapperClass="color-ring-wrapper"
                        colors={["white", "white", "white", "white", "white"]}
                      />
                    ) : (
                      "Add Note"
                    )} */}
                    Next
                  </button>
                </div>
              </>
            )}

            {activeTab === "Medication" && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium text-gray-900">
                    Current Medication
                  </h3>
                  <button
                    className="bg-blue-500 text-white px-4 py-2 rounded-md flex items-center gap-2"
                    onClick={handleNewPrescription}
                  >
                    <span>+ New Prescription</span>
                  </button>
                </div>

                {fetchingPrescriptions ? (
                  <div className="flex justify-center py-8">
                    <ColorRing
                      visible={true}
                      height="50"
                      width="50"
                      ariaLabel="loading"
                      wrapperClass="color-ring-wrapper"
                      colors={[
                        "#3B82F6",
                        "#3B82F6",
                        "#3B82F6",
                        "#3B82F6",
                        "#3B82F6",
                      ]}
                    />
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Drug
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Dosage
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Frequency
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Start Date
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Action
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {prescriptions.map((prescription) => (
                          <tr key={prescription.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {prescription.drugName}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {prescription.dosage}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {prescription.frequency}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {formatDate(prescription.createdAt)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              <button
                                className="bg-blue-500 text-white px-4 py-1 rounded-md"
                                onClick={() =>
                                  handleViewPrescription(prescription.id)
                                }
                              >
                                View
                              </button>
                            </td>
                          </tr>
                        ))}
                        {prescriptions.length === 0 && (
                          <tr>
                            <td
                              colSpan="5"
                              className="px-6 py-4 text-center text-sm text-gray-500"
                            >
                              No prescriptions found
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* Prescription Modal */}
            {isPrescriptionModalOpen && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div
                  className="bg-white w-[90%] max-w-md rounded-lg shadow-lg p-6"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center gap-3 mb-6">
                    <button
                      onClick={() => {
                        setIsPrescriptionModalOpen(false);
                        resetPrescriptionForm();
                      }}
                      className="text-gray-600 hover:text-gray-800"
                    >
                      <IoMdArrowBack size={24} />
                    </button>
                    <h2 className="text-xl font-semibold">
                      {isEditMode ? "Update Prescription" : "New Prescription"}
                    </h2>
                  </div>

                  <form
                    // onSubmit={handlePrescriptionSubmit}
                    onSubmit={handleAddNote}
                    className="space-y-4"
                  >
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Drug Name
                      </label>
                      <input
                        type="text"
                        name="drugName"
                        value={prescriptionForm.drugName}
                        onChange={handlePrescriptionChange}
                        className="w-full p-2 border rounded-md outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Dosage
                        </label>
                        <input
                          type="text"
                          name="dosage"
                          value={prescriptionForm.dosage}
                          onChange={handlePrescriptionChange}
                          className="w-full p-2 border rounded-md outline-none focus:ring-2 focus:ring-blue-500"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Frequency
                        </label>
                        <select
                          name="frequency"
                          value={prescriptionForm.frequency}
                          onChange={handlePrescriptionChange}
                          className="w-full p-2 border rounded-md outline-none focus:ring-2 focus:ring-blue-500"
                          required
                        >
                          <option value="">Select frequency</option>
                          <option value="Once Daily">Once Daily</option>
                          <option value="Twice Daily">Twice Daily</option>
                          <option value="Three Times Daily">
                            Three Times Daily
                          </option>
                          <option value="Four Times Daily">
                            Four Times Daily
                          </option>
                          <option value="As Needed">As Needed</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Duration
                      </label>
                      <input
                        type="text"
                        name="duration"
                        value={prescriptionForm.duration}
                        onChange={handlePrescriptionChange}
                        placeholder="e.g., 7 days, 2 weeks"
                        className="w-full p-2 border rounded-md outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Instructions
                      </label>
                      <textarea
                        name="instructions"
                        value={prescriptionForm.instructions}
                        onChange={handlePrescriptionChange}
                        placeholder="e.g., Take after meals"
                        className="w-full p-2 border rounded-md outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px]"
                        required
                      />
                    </div>

                    {prescriptionError && (
                      <Alert severity="error" className="mt-4">
                        {prescriptionError}
                      </Alert>
                    )}

                    <div className="flex justify-end mt-6">
                      <button
                    
                        type="submit"
                        className="bg-blue-500 text-white px-6 py-2 rounded-md w-full flex items-center justify-center"
                        disabled={loading}
                      >
                      {loading ? (
                      <ColorRing
                        visible={true}
                        height="40"
                        width="40"
                        ariaLabel="loading"
                        wrapperClass="color-ring-wrapper"
                        colors={["white", "white", "white", "white", "white"]}
                      /> 
                        ) : isEditMode ? (
                          "Update Prescription"
                        ) : (
                          "Add Prescription"
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </>
        )}
      </div>
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
};

export default AddNoteModal;
