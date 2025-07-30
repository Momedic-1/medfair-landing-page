import { useState, useEffect } from "react";
import axios from "axios";
import { baseUrl } from "../env";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
} from "@mui/material";
import { capitalizeFirstLetter, formatDate } from "../utils";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { ColorRing } from "react-loader-spinner";
import { IoMdArrowBack } from "react-icons/io";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  Calendar,
  Pill,
  Clock,
  Eye,
  ChevronDown,
  ChevronUp,
  Trash2,
  Plus,
} from "lucide-react";
import ViewDocuments from "../components/ViewDocuments";

const AddNoteModal = ({ isOpen, onClose, onNoteAdded }) => {
  const [patientFirstName, setPatientFirstName] = useState("");
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
  const [expandedDates, setExpandedDates] = useState(new Set());
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const patientId = localStorage.getItem("patientId");
  const [activeTab, setActiveTab] = useState("SOAP");
  const [isPrescriptionModalOpen, setIsPrescriptionModalOpen] = useState(false);

  // Enhanced prescription form to handle multiple prescriptions
  const [prescriptionForms, setPrescriptionForms] = useState([
    {
      drugName: "",
      dosage: "",
      frequency: "",
      duration: "",
      instructions: "",
    },
  ]);

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
        setPatientFirstName(firstNote.patientFirstName);
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
  };

  const handleAddNote = async (e) => {
    e.preventDefault();

    const validPrescriptions = prescriptionForms.filter(
      (form) =>
        form.drugName &&
        form.dosage &&
        form.frequency &&
        form.duration &&
        form.instructions
    );

    if (validPrescriptions.length === 0) {
      setPrescriptionError(
        "Please fill in at least one complete prescription."
      );
      return;
    }

    const formData = {
      doctorId: userData?.id,
      patientId: Number(patientId),
      visitDate,
      subjective,
      objective,
      assessment,
      plan,
      finalDiagnosis,
      soapComment,
      prescriptions: validPrescriptions.map((form) => ({
        ...form,
        patientId: Number(patientId),
      })),
    };

    try {
      if (isEditMode) {
        await handleUpdatePrescription(e);
      } else {
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

        // Only show success modal if the API call succeeds
        const prescriptionCount = validPrescriptions.length;
        toast.success(
          prescriptionCount === 1
            ? "Prescription created successfully!"
            : `${prescriptionCount} prescriptions created successfully!`
        );

        setShowSuccessModal(true); // ✅ Only show success modal on successful API response

        onNoteAdded(response.data);
        resetForm();
        setLoading(false);
        setIsPrescriptionModalOpen(false);
      }
    } catch (err) {
      setLoading(false);
      toast.error("Failed to add note, please try again.");
      // Don't show success modal on error
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
    setPrescriptionForms([
      {
        drugName: "",
        dosage: "",
        frequency: "",
        duration: "",
        instructions: "",
      },
    ]);
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
      setPrescriptionForms([
        {
          drugName: prescription.drugName,
          dosage: prescription.dosage,
          frequency: prescription.frequency,
          duration: prescription.duration,
          instructions: prescription.instructions,
        },
      ]);
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
          ...prescriptionForms[0],
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
      toast.success("Prescription updated successfully!");
      setShowSuccessModal(true); // ✅ Only show success modal on successful update
    } catch (err) {
      setPrescriptionError(
        err.response?.data?.message || "Failed to update prescription"
      );
      // Don't show success modal on error
    } finally {
      setPrescriptionLoading(false);
    }
  };

  const resetPrescriptionForm = () => {
    setPrescriptionForms([
      {
        drugName: "",
        dosage: "",
        frequency: "",
        duration: "",
        instructions: "",
      },
    ]);
    setIsEditMode(false);
    setCurrentPrescriptionId(null);
  };

  const handleNewPrescription = () => {
    resetPrescriptionForm();
    setIsPrescriptionModalOpen(true);
  };

  const handlePrescriptionChange = (e, index) => {
    const updatedForms = [...prescriptionForms];
    updatedForms[index] = {
      ...updatedForms[index],
      [e.target.name]: e.target.value,
    };
    setPrescriptionForms(updatedForms);
    setPrescriptionError("");
  };

  const handleAddMorePrescription = () => {
    setPrescriptionForms([
      ...prescriptionForms,
      {
        drugName: "",
        dosage: "",
        frequency: "",
        duration: "",
        instructions: "",
      },
    ]);
  };

  const handleRemovePrescription = (index) => {
    if (prescriptionForms.length > 1) {
      const updatedForms = prescriptionForms.filter((_, i) => i !== index);
      setPrescriptionForms(updatedForms);
    }
  };

  if (!isOpen) return null;

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const groupPrescriptionsByDate = (prescriptions) => {
    const grouped = prescriptions.reduce((acc, prescription) => {
      const date = new Date(prescription.createdAt).toDateString();
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(prescription);
      return acc;
    }, {});
    const sortedDates = Object.keys(grouped).sort(
      (a, b) => new Date(b) - new Date(a)
    );
    return sortedDates.map((date) => ({
      date,
      prescriptions: grouped[date],
    }));
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDateLabel = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    }
  };

  const toggleDateExpansion = (date) => {
    const newExpanded = new Set(expandedDates);
    if (newExpanded.has(date)) {
      newExpanded.delete(date);
    } else {
      newExpanded.add(date);
    }
    setExpandedDates(newExpanded);
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
          <button
            className={`px-4 py-2 ${
              activeTab === "ViewDocuments"
                ? "border-b-2 border-blue-500 text-blue-500"
                : "text-gray-500"
            }`}
            onClick={() => setActiveTab("ViewDocuments")}
          >
            View Documents
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
                                {note.objective || "N/A"}
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
                                Final Diagnosis
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
                    onClick={moveToMedication}
                  >
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
                  <div className="space-y-4">
                    {groupPrescriptionsByDate(prescriptions).map(
                      ({ date, prescriptions }) => {
                        const isExpanded = expandedDates.has(date);
                        const displayDate = formatDateLabel(
                          prescriptions[0].createdAt
                        );

                        return (
                          <div
                            key={date}
                            className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
                          >
                            <div
                              className="bg-gradient-to-r from-blue-50 to-indigo-50 px-4 py-3 border-b border-gray-200 cursor-pointer hover:from-blue-100 hover:to-indigo-100 transition-colors"
                              onClick={() => toggleDateExpansion(date)}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                  <Calendar className="h-4 w-4 text-blue-600" />
                                  <div>
                                    <h3 className="text-sm font-semibold text-gray-900">
                                      {displayDate}
                                    </h3>
                                    <p className="text-xs text-gray-500">
                                      {prescriptions.length} prescription
                                      {prescriptions.length !== 1 ? "s" : ""}
                                    </p>
                                  </div>
                                </div>
                                {isExpanded ? (
                                  <ChevronUp className="h-4 w-4 text-gray-400" />
                                ) : (
                                  <ChevronDown className="h-4 w-4 text-gray-400" />
                                )}
                              </div>
                            </div>

                            {isExpanded && (
                              <div className="divide-y divide-gray-100">
                                {prescriptions.map((prescription) => (
                                  <div
                                    key={prescription.id}
                                    className="p-4 hover:bg-gray-50 transition-colors"
                                  >
                                    <div className="flex items-center justify-between">
                                      <div className="flex-1">
                                        <div className="flex items-start space-x-3">
                                          <div className="flex-shrink-0">
                                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                              <Pill className="h-4 w-4 text-blue-600" />
                                            </div>
                                          </div>

                                          <div className="flex-1 min-w-0">
                                            <div className="flex items-center space-x-2 mb-1">
                                              <h4 className="text-sm font-semibold text-gray-900">
                                                {prescription.drugName}
                                              </h4>
                                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                Active
                                              </span>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-2">
                                              <div className="flex items-center space-x-1">
                                                <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
                                                <span className="text-xs text-gray-600">
                                                  Dosage:
                                                </span>
                                                <span className="text-xs font-medium text-gray-900">
                                                  {prescription.dosage}
                                                </span>
                                              </div>

                                              <div className="flex items-center space-x-1">
                                                <div className="flex items-center space-x-1">
                                                  <Clock className="h-3 w-3 text-gray-400" />
                                                  <span className="text-xs text-gray-600">
                                                    Frequency:
                                                  </span>{" "}
                                                </div>
                                                <span className="text-xs font-medium text-gray-900">
                                                  {prescription.frequency}
                                                </span>
                                              </div>
                                            </div>

                                            <div className="flex items-center space-x-1">
                                              <span className="text-xs text-gray-500">
                                                Prescribed at{" "}
                                                {formatTime(
                                                  prescription.createdAt
                                                )}
                                              </span>
                                            </div>
                                          </div>
                                        </div>
                                      </div>

                                      <div className="flex-shrink-0 ml-3">
                                        <button
                                          onClick={() =>
                                            handleViewPrescription(
                                              prescription.id
                                            )
                                          }
                                          className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                        >
                                          <Eye className="h-3 w-3 mr-1" />
                                          View
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      }
                    )}

                    {prescriptions.length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        <Pill className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                        <p>No prescriptions found for this patient.</p>
                      </div>
                    )}
                  </div>
                )}

                <div className="flex justify-between mt-6">
                  <button
                    type="button"
                    onClick={() => setActiveTab("SOAP")}
                    className="bg-white text-blue-600 px-4 py-2 rounded-md flex items-center gap-2"
                  >
                    <IoMdArrowBack />
                    Back
                  </button>
                  <button
                    type="submit"
                    className="bg-blue-500 text-white px-6 py-2 rounded-md w-[160px] h-10 flex justify-center items-center"
                    onClick={handleAddNote}
                    disabled={loading}
                  >
                    {loading ? (
                      <ColorRing
                        visible={true}
                        height="20"
                        width="20"
                        ariaLabel="loading"
                        wrapperClass="color-ring-wrapper"
                        colors={["white", "white", "white", "white", "white"]}
                      />
                    ) : (
                      "Submit"
                    )}
                  </button>
                </div>
              </div>
            )}

            {activeTab === "ViewDocuments" && (
            <ViewDocuments />
            )}
          </>
        )}

        {isPrescriptionModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white w-[90%] max-w-2xl rounded-lg shadow-lg p-6 max-h-[80vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  {isEditMode ? "Edit Prescription" : "New Prescription"}
                </h3>
                <button
                  onClick={() => {
                    setIsPrescriptionModalOpen(false);
                    resetPrescriptionForm();
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>

              {prescriptionError && (
                <Alert severity="error" className="mb-4">
                  {prescriptionError}
                </Alert>
              )}

              <form onSubmit={handleAddNote} className="space-y-4">
                {prescriptionForms.map((form, index) => (
                  <div key={index} className="border rounded-lg p-4 space-y-4">
                    {prescriptionForms.length > 1 && (
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-gray-900">
                          Prescription {index + 1}
                        </h4>
                        <button
                          type="button"
                          onClick={() => handleRemovePrescription(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Drug Name *
                        </label>
                        <input
                          type="text"
                          name="drugName"
                          value={form.drugName}
                          onChange={(e) => handlePrescriptionChange(e, index)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Dosage *
                        </label>
                        <input
                          type="text"
                          name="dosage"
                          value={form.dosage}
                          onChange={(e) => handlePrescriptionChange(e, index)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="e.g., 500mg"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Frequency *
                        </label>
                        <select
                          name="frequency"
                          value={form.frequency}
                          onChange={(e) => handlePrescriptionChange(e, index)}
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

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Duration *
                        </label>
                        <input
                          type="text"
                          name="duration"
                          value={form.duration}
                          onChange={(e) => handlePrescriptionChange(e, index)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="e.g., 7 days"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Instructions *
                      </label>
                      <textarea
                        name="instructions"
                        value={form.instructions}
                        onChange={(e) => handlePrescriptionChange(e, index)}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g., Take with food after meals"
                        required
                      />
                    </div>
                  </div>
                ))}

                {!isEditMode && (
                  <button
                    type="button"
                    onClick={handleAddMorePrescription}
                    className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-blue-300 hover:text-blue-500 transition-colors flex items-center justify-center gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Add Another Prescription
                  </button>
                )}

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setIsPrescriptionModalOpen(false);
                      resetPrescriptionForm();
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={prescriptionLoading}
                    className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 flex items-center gap-2"
                  >
                    {prescriptionLoading ? (
                      <ColorRing
                        visible={true}
                        height="16"
                        width="16"
                        ariaLabel="loading"
                        wrapperClass="color-ring-wrapper"
                        colors={["white", "white", "white", "white", "white"]}
                      />
                    ) : null}
                    {isEditMode ? "Update" : "Save"} Prescription
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
        {showSuccessModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white w-[60%] max-w-2xl rounded-lg shadow-lg p-6 max-h-[40vh] overflow-y-auto relative">
              <button
                onClick={() => {
                  setShowSuccessModal(false);
                  resetForm();
                  setIsPrescriptionModalOpen(false);
                }}
                className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
                aria-label="Close"
              >
                &times;
              </button>
              <div className="text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                  <svg
                    className="h-6 w-6 text-green-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Prescription Saved
                </h3>
                <p className="text-sm text-gray-500">
                  Your prescription has been saved successfully.
                </p>
                <button
                  onClick={() => {
                    setShowSuccessModal(false);
                    resetForm();
                    setIsPrescriptionModalOpen(false);
                  }}
                  className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
          style={{ zIndex: 9999 }}
        />
      </div>
    </div>
  );
};

export default AddNoteModal;
