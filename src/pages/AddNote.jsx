import React, { useState, useEffect, useMemo, useCallback } from "react";
import debounce from "lodash/debounce";
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
  TestTube,
  FileText,
  ChevronDown,
  ChevronUp,
  Trash2,
  Plus,
} from "lucide-react";
import ViewDocuments from "../components/ViewDocuments";
import Lab from "../components/Lab";
import { getStoredPatientId } from "../utils/videoCallDisplayInfo";

const AddNoteModal = ({ isOpen, onClose, onNoteAdded, patientId: patientIdProp = null }) => {
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
  const [savedNote, setSavedNote] = useState(null);
  const [savedCount, setSavedCount] = useState(0);
  const patientId =
    patientIdProp != null && String(patientIdProp).trim() !== ""
      ? String(patientIdProp)
      : getStoredPatientId();
  const [activeTab, setActiveTab] = useState("SOAP");
  const [isPrescriptionModalOpen, setIsPrescriptionModalOpen] = useState(false);
  const [documentsRefreshKey, setDocumentsRefreshKey] = useState(0);

  useEffect(() => {
    if (!isOpen || patientId == null) return;
    try {
      localStorage.setItem("patientId", String(patientId));
    } catch {
      // ignore
    }
  }, [isOpen, patientId]);

  useEffect(() => {
    if (isOpen && activeTab === "ViewDocuments") {
      setDocumentsRefreshKey((k) => k + 1);
    }
  }, [isOpen, activeTab]);

  const tabs = [
    { id: "SOAP", label: "SOAP", icon: FileText },
    { id: "Medication", label: "Medication", icon: Pill },
    { id: "ViewDocuments", label: "Documents", icon: Eye },
    { id: "investigations", label: "Lab Tests", icon: TestTube },
  ];

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
  const [editingNoteId, setEditingNoteId] = useState(null);

  const [drugSearchResults, setDrugSearchResults] = useState([]);
  const [drugSearchLoading, setDrugSearchLoading] = useState(false);
  const [showDrugDropdown, setShowDrugDropdown] = useState(false);
  const [activeDrugSearchIndex, setActiveDrugSearchIndex] = useState(null);

  useEffect(() => {
    if (isOpen && !visitDate) {
      const today = new Date();
      const formattedDate = today.toISOString().split("T")[0]; // Format as YYYY-MM-DD
      setVisitDate(formattedDate);
    }
  }, [isOpen, visitDate]);

  useEffect(() => {
    if (patientId && isOpen) {
      fetchPatientNotes();
    }
    if (!isOpen) {
      setEditingNoteId(null);
      setExistingNotes([]);
    }
  }, [isOpen, patientId]);

  useEffect(() => {
    if (activeTab === "Medication" && patientId) {
      fetchPatientPrescriptions();
    }
  }, [activeTab, patientId]);

  const searchDrugs = useMemo(
    () =>
      debounce(async (searchTerm, index) => {
        if (!searchTerm || searchTerm.trim().length < 2) {
          setDrugSearchResults([]);
          setShowDrugDropdown(false);
          return;
        }

        setDrugSearchLoading(true);
        setActiveDrugSearchIndex(index);

        try {
          const response = await axios.get(`${baseUrl}/api/drugs/search`, {
            params: {
              keyword: searchTerm.trim(),
              page: 0,
              size: 25,
            },
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          });

          setDrugSearchResults(response.data.content || []);
          setShowDrugDropdown(true);
        } catch (error) {
          console.error("Error searching drugs:", error);
          setDrugSearchResults([]);
          setShowDrugDropdown(false);
        } finally {
          setDrugSearchLoading(false);
        }
      }, 250),
    [token],
  );

  useEffect(() => () => searchDrugs.cancel(), [searchDrugs]);

  const drugDisplayName = useCallback((drug) => {
    if (!drug) return "";
    return (
      drug.item?.trim() ||
      drug.genericName?.trim() ||
      drug.dosageForm?.trim() ||
      drug.name?.trim() ||
      ""
    );
  }, []);

  const handleDrugSelect = (drug, index) => {
    const updatedForms = [...prescriptionForms];
    updatedForms[index] = {
      ...updatedForms[index],
      drugName: drugDisplayName(drug),
    };
    setPrescriptionForms(updatedForms);
    setShowDrugDropdown(false);
    setDrugSearchResults([]);
    setActiveDrugSearchIndex(null);
  };

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
      const notesData = Array.isArray(response.data) ? response.data : [];
      if (notesData.length > 0) {
        const firstNote = notesData[0];
        setPatientFirstName(firstNote.patientFirstName || "");
        setPatientLastName(firstNote.patientLastName || "");
        setEditingNoteId(firstNote.id || null);
        setSubjective(firstNote.subjective || "");
        setObjective(firstNote.objective || "");
        setAssessment(firstNote.assessment || "");
        setPlan(firstNote.plan || "");
        setFinalDiagnosis(firstNote.finalDiagnosis || "");
        setSoapComment(firstNote.soapComment || "");
        if (firstNote.visitDate) {
          try {
            setVisitDate(new Date(firstNote.visitDate).toISOString().split("T")[0]);
          } catch {
            /* keep default */
          }
        }
      } else {
        setEditingNoteId(null);
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

  const saveSoapNote = async () => {
    if (!patientId) {
      toast.error("Patient is missing for this visit.");
      return;
    }
    setLoading(true);
    try {
      if (editingNoteId) {
        await axios.put(
          `${baseUrl}/api/notes/${editingNoteId}/update`,
          {
            subjective,
            objective,
            assessment,
            plan,
            finalDiagnosis,
            soapComment,
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        toast.success("Note updated");
      } else {
        const response = await axios.post(
          `${baseUrl}/api/notes/create`,
          {
            doctorId: userData?.id,
            patientId: Number(patientId),
            visitDate,
            subjective,
            objective,
            assessment,
            plan,
            finalDiagnosis,
            soapComment,
            prescriptions: [],
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setEditingNoteId(response.data?.id || null);
        toast.success("Note created — you can add medications and lab tests next");
        onNoteAdded?.(response.data);
      }
      await fetchPatientNotes();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Could not save note");
    } finally {
      setLoading(false);
    }
  };

  const handleAddNote = async (e) => {
    e.preventDefault();

    const validPrescriptions = prescriptionForms.filter(
      (form) =>
        form.drugName ||
        form.dosage ||
        form.frequency ||
        form.duration ||
        form.instructions
    );

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

        const prescriptionCount = validPrescriptions.length;
        toast.success(
          prescriptionCount === 1
            ? "Prescription created successfully!"
            : `${prescriptionCount} prescriptions created successfully!`
        );

        setSavedCount(prescriptionCount);
        setSavedNote(response.data);
        setShowSuccessModal(true);
        setLoading(false);
        setIsPrescriptionModalOpen(false);
      }
    } catch (err) {
      setLoading(false);
      toast.error("Failed to add note, please try again.");
      // Don't show success modal on error
    }
  };

  const closeSuccessModal = () => {
    const payload = savedNote;
    setShowSuccessModal(false);
    setSavedNote(null);
    setSavedCount(0);
    resetForm();
    setIsPrescriptionModalOpen(false);
    if (payload) onNoteAdded?.(payload);
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

  // const handleDrugChange = (e, index, field) => {
  //   const updatedDrugs = [...drugs];
  //   updatedDrugs[index][field] = e.target.value;
  //   setDrugs(updatedDrugs);
  // };

  // const handleAddDrug = () => {
  //   setDrugs([...drugs, { name: "", dosage: "" }]);
  // };

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

    // Trigger drug search when drugName field changes
    if (e.target.name === "drugName") {
      searchDrugs(e.target.value, index);
    }
  };

  // Drug select handled above (search + fill product name).

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

  const soapInputClass =
    "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

  const soapFields = [
    {
      id: "subjective",
      label: "Subjective",
      placeholder: "What the patient reports",
      value: subjective,
      onChange: setSubjective,
      multiline: true,
    },
    {
      id: "objective",
      label: "Objective",
      placeholder: "Examination findings and vitals",
      value: objective,
      onChange: setObjective,
      multiline: true,
    },
    {
      id: "assessment",
      label: "Assessment",
      placeholder: "Clinical impression",
      value: assessment,
      onChange: setAssessment,
      multiline: true,
    },
    {
      id: "plan",
      label: "Plan",
      placeholder: "Treatment plan and follow-up",
      value: plan,
      onChange: setPlan,
      multiline: true,
    },
    {
      id: "finalDiagnosis",
      label: "Final diagnosis",
      placeholder: "Enter final diagnosis",
      value: finalDiagnosis,
      onChange: setFinalDiagnosis,
      multiline: false,
    },
    {
      id: "soapComment",
      label: "Additional comment",
      placeholder: "Anything else worth recording",
      value: soapComment,
      onChange: setSoapComment,
      multiline: true,
    },
  ];

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
      className="fixed inset-0 z-50 flex items-stretch justify-center bg-black/50 sm:items-center sm:p-3"
      onClick={handleOverlayClick}
    >
      <div
        className="flex h-[100dvh] w-full max-w-3xl flex-col overflow-hidden bg-white shadow-2xl sm:h-auto sm:max-h-[92vh] sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="shrink-0 border-b border-gray-200 bg-gradient-to-r from-[#020E7C] to-blue-700 px-3 py-3 text-white sm:px-5 sm:py-4">
          <div className="flex items-center justify-between gap-2 sm:gap-3">
            <div className="min-w-0">
              <h2 className="text-base font-semibold sm:text-xl">
                Consultation notes
              </h2>
              <p className="truncate text-xs text-blue-100">
                {`${capitalizeFirstLetter(
                  patientFirstName
                )} ${capitalizeFirstLetter(patientLastName)}`.trim() ||
                  "Patient record"}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
              <button
                onClick={handleViewNotes}
                className="inline-flex h-9 items-center justify-center rounded-lg bg-white/15 px-2.5 text-xs font-medium text-white hover:bg-white/25 sm:px-4 sm:text-sm"
              >
                {isViewNotesOpen ? (
                  "Hide notes"
                ) : loading ? (
                  <ColorRing
                    visible={true}
                    height="24"
                    width="24"
                    ariaLabel="loading"
                    wrapperClass="color-ring-wrapper"
                    colors={["white", "white", "white", "white", "white"]}
                  />
                ) : (
                  "Past notes"
                )}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="rounded-full p-1.5 text-2xl leading-none text-blue-100 hover:bg-white/15 hover:text-white"
                aria-label="Close notes"
              >
                ×
              </button>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto overscroll-contain px-3 py-3 sm:px-5 sm:py-4">

        {/* <div className="flex border-b mb-4">
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
          <button
            className={`px-4 py-2 ${
              activeTab === "investigations"
                ? "border-b-2 border-blue-500 text-blue-500"
                : "text-gray-500"
            }`}
            onClick={() => setActiveTab("investigations")}
          >
            Investigations
          </button>
        </div> */}
        <div className="mb-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`flex flex-col items-center gap-1 rounded-xl border px-3 py-3 transition-all ${
                activeTab === tab.id
                  ? "border-blue-600 bg-blue-600 text-white shadow-sm"
                  : "border-gray-200 bg-white text-gray-600 hover:border-blue-200 hover:bg-blue-50"
              }`}
              onClick={() => setActiveTab(tab.id)}
            >
              {React.createElement(tab.icon, {
                className: `h-5 w-5 ${
                  activeTab === tab.id ? "text-white" : "text-gray-400"
                }`,
              })}
              <span className="text-xs font-semibold">{tab.label}</span>
            </button>
          ))}
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
                  <div className="rounded-xl border border-gray-200 bg-gray-50/60 p-4">
                    <label
                      htmlFor="visitDate"
                      className="mb-1.5 block text-sm font-semibold text-[#020E7C]"
                    >
                      Visit date
                    </label>
                    <input
                      type="date"
                      id="visitDate"
                      className={soapInputClass}
                      value={visitDate}
                      onChange={(e) => setVisitDate(e.target.value)}
                      required
                    />
                  </div>

                  {soapFields.map((field) => (
                    <div
                      key={field.id}
                      className="rounded-xl border border-gray-200 bg-white p-4"
                    >
                      <label
                        htmlFor={field.id}
                        className="mb-1.5 block text-sm font-semibold text-[#020E7C]"
                      >
                        {field.label}
                      </label>
                      {field.multiline ? (
                        <textarea
                          id={field.id}
                          rows={3}
                          value={field.value}
                          onChange={(e) => field.onChange(e.target.value)}
                          placeholder={field.placeholder}
                          className={soapInputClass}
                        />
                      ) : (
                        <input
                          id={field.id}
                          type="text"
                          value={field.value}
                          onChange={(e) => field.onChange(e.target.value)}
                          placeholder={field.placeholder}
                          className={soapInputClass}
                        />
                      )}
                    </div>
                  ))}
                </form>
                <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-between">
                  <button
                    type="button"
                    onClick={onClose}
                    className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <button
                      type="button"
                      disabled={loading}
                      onClick={saveSoapNote}
                      className="rounded-lg border border-[#020e7c] px-4 py-2.5 text-sm font-semibold text-[#020e7c] hover:bg-slate-50 disabled:opacity-50"
                    >
                      {editingNoteId ? "Save note" : "Create note"}
                    </button>
                    <button
                      type="button"
                      className="flex h-10 w-full items-center justify-center rounded-lg bg-blue-600 px-6 text-sm font-semibold text-white hover:bg-blue-700 sm:w-[160px]"
                      onClick={moveToMedication}
                    >
                      Next
                    </button>
                  </div>
                </div>
              </>
            )}

            {activeTab === "Medication" && (
              <div className="space-y-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Current medication
                    </h3>
                    <p className="text-xs text-gray-500">
                      A single prescription can carry several drugs.
                    </p>
                  </div>
                  <button
                    className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 sm:w-auto"
                    onClick={handleNewPrescription}
                  >
                    <Plus className="h-4 w-4" />
                    New prescription
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

                <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-between">
                  <button
                    type="button"
                    onClick={() => setActiveTab("SOAP")}
                    className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    <IoMdArrowBack />
                    Back
                  </button>
                  <button
                    type="submit"
                    className="flex h-10 w-full items-center justify-center rounded-lg bg-blue-600 px-6 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50 sm:w-[160px]"
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
              <ViewDocuments
                patientId={patientId}
                refreshKey={documentsRefreshKey}
              />
            )}
            {activeTab === "investigations" && <Lab doctorId={userData?.id} />}
          </>
        )}
        </div>

        {isPrescriptionModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-stretch justify-center bg-black/60 sm:items-center sm:p-3">
            <div className="flex h-[100dvh] w-full max-w-2xl flex-col overflow-hidden bg-white shadow-2xl sm:h-auto sm:max-h-[90vh] sm:rounded-2xl">
              <div className="flex items-start justify-between gap-2 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-indigo-600 px-3 py-3 text-white sm:gap-3 sm:px-5 sm:py-4">
                <div className="min-w-0">
                  <h3 className="text-base font-semibold sm:text-lg">
                    {isEditMode ? "Edit Prescription" : "New Prescription"}
                  </h3>
                  {!isEditMode && (
                    <p className="mt-0.5 text-xs leading-snug text-blue-100">
                      One prescription can hold several drugs — use “Add another
                      drug” below instead of starting a new prescription.
                    </p>
                  )}
                </div>
                <button
                  onClick={() => {
                    setIsPrescriptionModalOpen(false);
                    resetPrescriptionForm();
                  }}
                  className="shrink-0 rounded-full p-1 text-2xl leading-none text-blue-100 hover:bg-white/15 hover:text-white"
                  aria-label="Close"
                >
                  ×
                </button>
              </div>

              <div className="flex-1 overflow-y-auto overscroll-contain px-3 py-4 sm:px-5 sm:py-5">
              {prescriptionError && (
                <Alert severity="error" className="mb-4">
                  {prescriptionError}
                </Alert>
              )}

              <form id="prescription-form" onSubmit={handleAddNote} className="space-y-4">
                {prescriptionForms.map((form, index) => (
                  <div
                    key={index}
                    className="space-y-4 rounded-xl border border-gray-200 bg-gray-50/60 p-4"
                  >
                    {!isEditMode && (
                      <div className="flex items-center justify-between">
                        <h4 className="inline-flex items-center gap-2 text-sm font-semibold text-gray-900">
                          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
                            {index + 1}
                          </span>
                          Drug {index + 1} of {prescriptionForms.length}
                        </h4>
                        {prescriptionForms.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemovePrescription(index)}
                            className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                            Remove
                          </button>
                        )}
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="relative">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Drug Name *
                        </label>
                        {/* <input
                          type="text"
                          name="drugName"
                          value={form.drugName}
                          onChange={(e) => handlePrescriptionChange(e, index)}
                          onFocus={() => {
                            if (form.drugName && form.drugName.length >= 2) {
                              searchDrugs(form.drugName, index);
                            }
                          }}
                          onBlur={() => {
                            // Delay hiding dropdown to allow for selection
                            setTimeout(() => {
                              setShowDrugDropdown(false);
                              setActiveDrugSearchIndex(null);
                            }, 200);
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Start typing to search drugs..."
                          required
                        /> */}
                        <input
                          type="text"
                          name="drugName"
                          value={form.drugName}
                          onChange={(e) => handlePrescriptionChange(e, index)}
                          onFocus={() => {
                            if (form.drugName && form.drugName.length >= 2) {
                              searchDrugs(form.drugName, index);
                            }
                          }}
                          onBlur={() => {
                            // Keep dropdown briefly so mouse/touch selection can complete.
                            setTimeout(() => {
                              setShowDrugDropdown(false);
                              setActiveDrugSearchIndex(null);
                            }, 250);
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Start typing to search drugs..."
                          required
                          autoComplete="off"
                        />

                        {/* Drug Search Dropdown */}
                        {showDrugDropdown &&
                          activeDrugSearchIndex === index && (
                            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-48 overflow-y-auto">
                              {drugSearchLoading ? (
                                <div className="p-3 text-center">
                                  <div className="inline-flex items-center">
                                    <ColorRing
                                      visible={true}
                                      height="20"
                                      width="20"
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
                                    <span className="ml-2 text-sm text-gray-500">
                                      Searching...
                                    </span>
                                  </div>
                                </div>
                              ) : drugSearchResults.length > 0 ? (
                                drugSearchResults.map((drug, drugIndex) => (
                                  <div
                                    key={`${drug.item || drug.genericName || "drug"}-${drugIndex}`}
                                    className="p-3 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0"
                                    onMouseDown={(e) => {
                                      e.preventDefault();
                                      handleDrugSelect(drug, index);
                                    }}
                                  >
                                    <div className="font-medium text-gray-900">
                                      {drugDisplayName(drug)}
                                    </div>
                                    <div className="text-sm text-gray-500">
                                      {[drug.genericName, drug.dosageForm]
                                        .filter(Boolean)
                                        .join(" · ")}
                                    </div>
                                  </div>
                                ))
                              ) : (
                                <div className="p-3 text-sm text-gray-500 text-center">
                                  No drugs found
                                </div>
                              )}
                            </div>
                          )}
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
                    className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-blue-500 bg-blue-50 px-3 py-3 text-sm font-semibold leading-snug text-blue-700 shadow-sm transition-colors hover:bg-blue-100"
                  >
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white">
                      <Plus className="h-4 w-4" />
                    </span>
                    <span className="text-left">
                      Add another drug to this prescription
                    </span>
                  </button>
                )}
              </form>
              </div>

              <div className="flex flex-col gap-3 border-t border-gray-200 bg-white px-3 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5 sm:py-4">
                <span className="text-xs text-gray-500">
                  {isEditMode
                    ? "Editing existing prescription"
                    : `${prescriptionForms.length} drug${prescriptionForms.length !== 1 ? "s" : ""} on this prescription`}
                </span>
                <div className="grid grid-cols-2 gap-2 sm:flex sm:gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setIsPrescriptionModalOpen(false);
                      resetPrescriptionForm();
                    }}
                    className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    form="prescription-form"
                    disabled={loading || prescriptionLoading}
                    className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50 sm:px-6"
                  >
                    {loading || prescriptionLoading ? (
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
              </div>
            </div>
          </div>
        )}
        {showSuccessModal && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 p-4">
            <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
              <button
                onClick={closeSuccessModal}
                className="absolute right-3 top-3 text-gray-400 hover:text-gray-700"
                aria-label="Close"
              >
                &times;
              </button>
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-100">
                  <svg
                    className="h-7 w-7 text-green-600"
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
                <h3 className="mb-2 text-lg font-semibold text-gray-900">
                  {savedCount > 1
                    ? `${savedCount} drugs saved`
                    : "Prescription saved"}
                </h3>
                <p className="text-sm text-gray-600">
                  The note{savedCount > 0 ? " and prescription" : ""} for this
                  patient {savedCount > 1 ? "have" : "has"} been saved
                  successfully.
                </p>
                <button
                  onClick={closeSuccessModal}
                  className="mt-5 w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
                >
                  Done
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
