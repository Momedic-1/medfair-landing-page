import { useState, useEffect, useRef, useMemo } from "react";
import { formatDate, getToken } from "../../utils";
import { usePartnerLocations } from "../../context/PartnerLocationsContext";
import { Hourglass } from "react-loader-spinner";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Modal, Box } from "@mui/material";
import { baseUrl } from "../../env";
import SimplePager from "../common/SimplePager";

const PAGE_SIZE = 5;

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

// New modal style for order confirmation
const orderModalStyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "95%",
  maxWidth: "800px",
  bgcolor: "background.paper",
  boxShadow: 24,
  p: 0,
  borderRadius: "16px",
  overflowY: "auto",
  maxHeight: "95vh",
};

const Table = ({ data = [], isLoading = false, emptyMessage }) => {
  const {
    partnerPharmacies,
    locationsLoading,
    pharmaciesError,
    networkError,
    setSelectedPharmacyCode,
  } = usePartnerLocations();

  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [medications, setMedications] = useState([]);
  const [showPharmacyDropdown, setShowPharmacyDropdown] = useState(null);
  const [orderModalOpen, setOrderModalOpen] = useState(false);
  const [selectedPharmacy, setSelectedPharmacy] = useState(null);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [orderLoading, setOrderLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [medPage, setMedPage] = useState(0);
  const [orderMedPage, setOrderMedPage] = useState(0);
  const [pharmacyPage, setPharmacyPage] = useState(0);

  const dropdownRef = useRef(null);

  const viewMedications = (prescriptions) => {
    if (!prescriptions || prescriptions.length === 0) {
      toast.info("No prescribed medication");
      return;
    }
    setMedications(prescriptions);
    setMedPage(0);
    setModalIsOpen(true);
  };

  const handlePharmacySelect = (pharmacy, patientData) => {
    setSelectedPharmacyCode(pharmacy.partner);
    setSelectedPharmacy(pharmacy);
    setSelectedPatient(patientData);
    setOrderMedPage(0);
    setOrderModalOpen(true);
    setShowPharmacyDropdown(null);

    // Show warning if no prescriptions, but still open modal
    if (!patientData?.prescriptions || patientData.prescriptions.length === 0) {
      toast.warning("No medications prescribed for this patient");
    }
  };

  useEffect(() => {
    setCurrentPage(0);
  }, [data]);

  // Order drugs API call
  const handleOrderDrugs = async () => {
    const noteId = selectedPatient?.id;

    if (!noteId) {
      toast.error("Patient ID not found. Cannot place order.");
      return;
    }

    try {
      setOrderLoading(true);
      const token = getToken();

      const response = await fetch(
        `${baseUrl}/api/notes/notes/${noteId}/order-drugs?partner=${selectedPharmacy.partner}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            pharmacyId: selectedPharmacy.id,
            pharmacyName: selectedPharmacy.name,
            prescriptions: selectedPatient.prescriptions,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || `HTTP error! status: ${response.status}`
        );
      }

      const result = await response.text(); // or use try-catch for flexibility
      console.log(result, "results");

      toast.success(
        `Drug order sent to ${selectedPharmacy.name} successfully!`
      );
      setOrderModalOpen(false);
    } catch (error) {
      toast.error(`Failed to order drugs: ${error.message}`);
    } finally {
      setOrderLoading(false);
    }
  };

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowPharmacyDropdown(null);
      }
    }

    const timer = setTimeout(() => {
      document.addEventListener("click", handleClickOutside);
    }, 100);

    return () => {
      clearTimeout(timer);
      document.removeEventListener("click", handleClickOutside);
    };
  }, [showPharmacyDropdown]);

  const totalPages = Math.max(1, Math.ceil((data?.length || 0) / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages - 1);
  const startIndex = safePage * PAGE_SIZE;
  const currentData = (data || []).slice(startIndex, startIndex + PAGE_SIZE);

  const pagedMedications = useMemo(() => {
    const start = medPage * PAGE_SIZE;
    return medications.slice(start, start + PAGE_SIZE);
  }, [medications, medPage]);

  const medTotalPages = Math.max(1, Math.ceil(medications.length / PAGE_SIZE));

  const orderPrescriptions = selectedPatient?.prescriptions;
  const orderPrescriptionList = Array.isArray(orderPrescriptions)
    ? orderPrescriptions
    : [];
  const pagedOrderMeds = useMemo(() => {
    const start = orderMedPage * PAGE_SIZE;
    return orderPrescriptionList.slice(start, start + PAGE_SIZE);
  }, [orderPrescriptionList, orderMedPage]);

  const orderMedTotalPages = Math.max(
    1,
    Math.ceil(orderPrescriptionList.length / PAGE_SIZE)
  );

  const pagedPharmacies = useMemo(() => {
    const start = pharmacyPage * PAGE_SIZE;
    return (partnerPharmacies || []).slice(start, start + PAGE_SIZE);
  }, [partnerPharmacies, pharmacyPage]);

  const pharmacyTotalPages = Math.max(
    1,
    Math.ceil((partnerPharmacies?.length || 0) / PAGE_SIZE)
  );

  const showBlockingLoader = isLoading && !(data && data.length);

  return (
    <div className="relative w-full max-w-4xl mx-auto px-3 py-4 sm:px-0">
      {isLoading && data?.length > 0 ? (
        <p className="mb-2 text-xs text-slate-500">Updating…</p>
      ) : null}
      {showBlockingLoader ? (
        <div className="w-full h-[280px] flex items-center justify-center">
          <Hourglass
            visible={true}
            height="40"
            width="40"
            ariaLabel="hourglass-loading"
            colors={["#306cce", "#72a1ed"]}
          />
        </div>
      ) : currentData.length === 0 ? (
        <p className="rounded-xl border border-dashed px-4 py-12 text-center text-slate-500">
          {emptyMessage || "No data available"}
        </p>
      ) : (
        <ul className="space-y-3">
          {currentData.map((patient, index) => (
            <li
              key={patient?.id ?? index}
              className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="font-semibold text-slate-900">
                    {`${patient?.doctorLastName || ""}, ${patient?.doctorFirstName || ""}`.replace(/^,\s*|,\s*$/g, "") || "Doctor"}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    Visit {formatDate(patient?.visitDate)}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    {(patient?.prescriptions?.length || 0) > 0
                      ? `${patient.prescriptions.length} medication(s)`
                      : "No medications on this visit"}
                  </p>
                </div>
                <div className="flex flex-col gap-2 sm:items-end">
                  <button
                    type="button"
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-4 py-2.5 text-sm font-medium text-blue-700 hover:bg-blue-100 disabled:opacity-50 sm:w-auto"
                    onClick={() => viewMedications(patient?.prescriptions)}
                    disabled={!patient?.prescriptions?.length}
                  >
                    View Medications
                  </button>
                  <div className="relative w-full sm:w-auto" ref={dropdownRef}>
                    <button
                      type="button"
                      className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 via-orange-600 to-red-500 px-4 py-2.5 text-sm font-semibold text-white shadow-md hover:from-orange-600 hover:to-red-600 sm:w-auto"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setPharmacyPage(0);
                        setShowPharmacyDropdown(
                          showPharmacyDropdown === index ? null : index
                        );
                      }}
                    >
                      Get Prescription
                    </button>
                    {showPharmacyDropdown === index && (
                      <div className="absolute left-0 right-0 z-50 mt-2 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg sm:left-auto sm:right-0 sm:w-56">
                        <div className="bg-gradient-to-r from-orange-500 to-red-500 px-4 py-3 text-sm font-semibold text-white">
                          Available Pharmacies
                        </div>
                        {locationsLoading && partnerPharmacies.length === 0 ? (
                          <div className="px-4 py-6 text-center text-sm text-gray-600">
                            Loading pharmacies…
                          </div>
                        ) : partnerPharmacies.length === 0 ? (
                          <div className="px-4 py-4 text-sm text-red-600">
                            {pharmaciesError ||
                              "No pharmacies available for your account."}
                          </div>
                        ) : (
                          <div>
                            <ul className="divide-y divide-gray-100">
                              {pagedPharmacies.map((pharmacy) => (
                                <li
                                  key={pharmacy.id}
                                  className="cursor-pointer px-4 py-2 text-sm text-gray-700 transition-colors hover:bg-orange-50"
                                  onClick={() =>
                                    handlePharmacySelect(pharmacy, patient)
                                  }
                                  onMouseDown={(e) => e.stopPropagation()}
                                >
                                  {pharmacy.name}
                                </li>
                              ))}
                            </ul>
                            {pharmacyTotalPages > 1 ? (
                              <div className="flex items-center justify-between gap-2 border-t px-2 py-2">
                                <button
                                  type="button"
                                  className="rounded-lg px-2 py-1 text-xs text-slate-600 disabled:opacity-40"
                                  disabled={pharmacyPage <= 0}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setPharmacyPage((p) => Math.max(0, p - 1));
                                  }}
                                  onMouseDown={(e) => e.stopPropagation()}
                                >
                                  Prev
                                </button>
                                <span className="text-[10px] text-slate-500">
                                  {pharmacyPage + 1}/{pharmacyTotalPages}
                                </span>
                                <button
                                  type="button"
                                  className="rounded-lg px-2 py-1 text-xs text-slate-600 disabled:opacity-40"
                                  disabled={pharmacyPage >= pharmacyTotalPages - 1}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setPharmacyPage((p) =>
                                      Math.min(pharmacyTotalPages - 1, p + 1)
                                    );
                                  }}
                                  onMouseDown={(e) => e.stopPropagation()}
                                >
                                  Next
                                </button>
                              </div>
                            ) : null}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      <SimplePager
        page={safePage}
        totalPages={totalPages}
        totalElements={data?.length || 0}
        pageSize={PAGE_SIZE}
        onPrev={() => setCurrentPage((p) => Math.max(0, p - 1))}
        onNext={() => setCurrentPage((p) => Math.min(totalPages - 1, p + 1))}
      />

      {/* View Medications Modal */}
      <Modal
        open={modalIsOpen}
        onClose={() => setModalIsOpen(false)}
        aria-labelledby="medications-modal-title"
        aria-describedby="medications-modal-description"
      >
        <Box sx={modalStyle}>
          <h2 id="medications-modal-title" className="mb-4 text-lg font-bold text-slate-900">
            Prescribed Medications
          </h2>
          {medications.length > 0 ? (
            <>
              <ul className="space-y-3">
                {pagedMedications.map((medication) => (
                  <li
                    key={medication?.id}
                    className="rounded-xl border border-slate-200 bg-slate-50 p-3"
                  >
                    <p className="font-semibold text-slate-900">{medication?.drugName}</p>
                    <p className="mt-1 text-sm text-slate-600">
                      {medication?.dosage}
                      {medication?.frequency ? ` · ${medication.frequency}` : ""}
                      {medication?.duration ? ` · ${medication.duration}` : ""}
                    </p>
                    {medication?.instructions ? (
                      <p className="mt-1 text-xs text-slate-500">{medication.instructions}</p>
                    ) : null}
                  </li>
                ))}
              </ul>
              <SimplePager
                page={medPage}
                totalPages={medTotalPages}
                totalElements={medications.length}
                pageSize={PAGE_SIZE}
                onPrev={() => setMedPage((p) => Math.max(0, p - 1))}
                onNext={() =>
                  setMedPage((p) => Math.min(medTotalPages - 1, p + 1))
                }
              />
            </>
          ) : (
            <p id="medications-modal-description" className="text-gray-600">
              No medications available.
            </p>
          )}
          <button
            type="button"
            className="mt-4 rounded-xl bg-[#020e7c] px-4 py-2 text-sm font-semibold text-white"
            onClick={() => setModalIsOpen(false)}
          >
            Close
          </button>
        </Box>
      </Modal>

      {/* Order Drugs Modal */}
      <Modal
        open={orderModalOpen}
        onClose={() => !orderLoading && setOrderModalOpen(false)}
        aria-labelledby="order-modal-title"
        aria-describedby="order-modal-description"
      >
        <Box sx={orderModalStyle}>
          {/* Modal Header */}
          <div className="bg-gradient-to-r from-orange-500 to-red-500 px-6 py-4 rounded-t-2xl">
            <div className="flex items-center justify-between">
              <h2
                id="order-modal-title"
                className="text-xl font-bold text-white flex items-center gap-3"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                  />
                </svg>
                Order Prescription
              </h2>
              {!orderLoading && (
                <button
                  onClick={() => setOrderModalOpen(false)}
                  className="text-white hover:text-gray-200 transition-colors"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              )}
            </div>
          </div>

          {/* Modal Content */}
          <div className="p-4 md:p-6">
            {/* Pharmacy Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <h3 className="text-lg font-semibold text-blue-800 mb-2">
                Selected Pharmacy
              </h3>
              <div className="flex items-center gap-3">
                <div className="bg-blue-500 p-2 rounded-full">
                  <svg
                    className="w-5 h-5 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                    />
                  </svg>
                </div>
                <div>
                  <p className="font-medium text-blue-900">
                    {selectedPharmacy?.name}
                  </p>
                  <p className="text-sm text-blue-600">
                    Partner: {selectedPharmacy?.partner}
                  </p>
                </div>
              </div>
            </div>

            {/* Patient Info */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                Patient Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-600">Doctor:</span>
                  <span className="ml-2 text-gray-800">
                    {selectedPatient?.doctorFirstName}{" "}
                    {selectedPatient?.doctorLastName}
                  </span>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Visit Date:</span>
                  <span className="ml-2 text-gray-800">
                    {formatDate(selectedPatient?.visitDate)}
                  </span>
                </div>
                <div className="md:col-span-2">
                  <span className="font-medium text-gray-600">Diagnosis:</span>
                  <span className="ml-2 text-gray-800">
                    {selectedPatient?.finalDiagnosis || "Not specified"}
                  </span>
                </div>
              </div>
            </div>

            {/* Medications List */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <svg
                  className="w-5 h-5 text-green-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                Prescribed Medications (
                {orderPrescriptionList.length})
              </h3>

              <div className="max-h-64 overflow-y-auto">
                {orderPrescriptionList.length > 0 ? (
                  <div className="space-y-3">
                    {pagedOrderMeds.map((medication, index) => (
                      <div
                        key={medication?.id || index}
                        className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm"
                      >
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-sm">
                          <div>
                            <span className="font-medium text-gray-600">
                              Drug Name:
                            </span>
                            <p className="text-gray-800 font-semibold">
                              {medication?.drugName}
                            </p>
                          </div>
                          <div>
                            <span className="font-medium text-gray-600">
                              Dosage:
                            </span>
                            <p className="text-gray-800">
                              {medication?.dosage}
                            </p>
                          </div>
                          <div>
                            <span className="font-medium text-gray-600">
                              Frequency:
                            </span>
                            <p className="text-gray-800">
                              {medication?.frequency}
                            </p>
                          </div>
                          <div>
                            <span className="font-medium text-gray-600">
                              Duration:
                            </span>
                            <p className="text-gray-800">
                              {medication?.duration}
                            </p>
                          </div>
                          <div className="md:col-span-2">
                            <span className="font-medium text-gray-600">
                              Instructions:
                            </span>
                            <p className="text-gray-800">
                              {medication?.instructions ||
                                "No special instructions"}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                    <SimplePager
                      page={orderMedPage}
                      totalPages={orderMedTotalPages}
                      totalElements={orderPrescriptionList.length}
                      pageSize={PAGE_SIZE}
                      onPrev={() => setOrderMedPage((p) => Math.max(0, p - 1))}
                      onNext={() =>
                        setOrderMedPage((p) =>
                          Math.min(orderMedTotalPages - 1, p + 1)
                        )
                      }
                    />
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <svg
                      className="w-12 h-12 mx-auto mb-3 text-gray-300"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                      />
                    </svg>
                    <p>No medications prescribed</p>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-4 border-t border-gray-200">
              <button
                onClick={() => setOrderModalOpen(false)}
                disabled={orderLoading}
                className="flex-1 px-2 md:px-6 text-sm md:text-base py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={handleOrderDrugs}
                disabled={
                  orderLoading || !selectedPatient?.prescriptions?.length
                }
                className="flex-1 px-2 md:px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text:sm md:text-base text-white rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {orderLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Sending Order...
                  </>
                ) : (
                  <>
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
                        d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                      />
                    </svg>
                    Send Order to Pharmacy
                  </>
                )}
              </button>
            </div>
          </div>
        </Box>
      </Modal>
    </div>
  );
};

export default Table;
