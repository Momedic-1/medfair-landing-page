import { useState, useEffect, useRef } from "react";
import { formatDate, getToken } from "../../utils";
import { Hourglass } from "react-loader-spinner";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Modal, Box } from "@mui/material";
import { baseUrl } from "../../env";

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

const Table = ({ data = [], isLoading = false, emptyMessage, patientId }) => {
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [medications, setMedications] = useState([]);
  const [showPharmacyDropdown, setShowPharmacyDropdown] = useState(null);

  const partnerPharmacies = [
    {
      id: "smartpharm",
      name: "SmartPharm",
      partner: "SMARTPHARM",
    },
    {
      id: "degree_360",
      name: "Degree 360 Pharmacy",
      partner: "DEGREE_360",
    },
  ];

  const labPartners = [
    {
      id: "smartlab",
      name: "SmartLab",
      partner: "SMARTLAB",
    },
    {
      id: "degree_360_lab",
      name: "Degree 360 Lab",
      partner: "DEGREE_360",
    },
  ];

  const [orderModalOpen, setOrderModalOpen] = useState(false);
  const [selectedPharmacy, setSelectedPharmacy] = useState(null);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [orderLoading, setOrderLoading] = useState(false);

  const [labModalOpen, setLabModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [labLoading, setLabLoading] = useState(false);
  const [selectedLabPartner, setSelectedLabPartner] = useState(null);
  const [labOrderSending, setLabOrderSending] = useState(false);
  
  // Payment state
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [paymentCompleted, setPaymentCompleted] = useState(false); // New state to track payment
  const [paymentReference, setPaymentReference] = useState(''); // Store payment reference

  const dropdownRef = useRef(null);

  const viewMedications = (prescriptions) => {
    if (!prescriptions || prescriptions.length === 0) {
      toast.info("No prescribed medication");
      return;
    }
    setMedications(prescriptions);
    setModalIsOpen(true);
  };

  const handlePharmacySelect = (pharmacy, patientData) => {
    setSelectedPharmacy(pharmacy);
    setSelectedPatient(patientData);
    setOrderModalOpen(true);
    setShowPharmacyDropdown(null);

    if (!patientData?.prescriptions || patientData.prescriptions.length === 0) {
      toast.warning("No medications prescribed for this patient");
    }
  };

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

      const result = await response.text();
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

  const handleViewLabs = async (patientData) => {
    setLabLoading(true);
    setLabModalOpen(true);
    setSelectedPatient(patientData);
    setSelectedLabPartner(null);
    setUserEmail('');
    setPaymentCompleted(false); // Reset payment status
    setPaymentReference(''); // Reset payment reference
    
    try {
      const token = getToken();
      if (!patientId) {
        throw new Error("Patient ID not provided");
      }
      const response = await fetch(
        `${baseUrl}/api/investigations/orders/patient/${patientId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!response.ok) {
        throw new Error("Failed to fetch lab orders");
      }
      const orders = await response.json();
      setSelectedOrder(orders[0] || null);
    } catch (error) {
      toast.error(`Failed to fetch lab orders: ${error.message}`);
      setSelectedOrder(null);
    } finally {
      setLabLoading(false);
    }
  };

  const handleSendLabOrder = async () => {
    if (!paymentCompleted) {
      toast.warning("Please complete payment before sending lab order");
      return;
    }
    
    if (!selectedOrder?.orderId || !selectedLabPartner) {
      toast.warning("Please select a lab partner");
      return;
    }
    
    setLabOrderSending(true);
    try {
      const token = getToken();
      const response = await fetch(
        `${baseUrl}/api/investigations/investigations/select-lab?orderId=${selectedOrder.orderId}&labPartner=${selectedLabPartner.partner}`,
        {
          method: "POST",
          headers: {
            Accept: "*/*",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
      toast.success(`Lab order sent to ${selectedLabPartner.name} successfully!`);
      setLabModalOpen(false);
    } catch (error) {
      toast.error(`Failed to send lab order: ${error.message}`);
    } finally {
      setLabOrderSending(false);
    }
  };

  // Modified payment function
  const handleInitiatePayment = async () => {
    if (!selectedOrder?.orderId || !userEmail.trim()) {
      toast.warning("Please provide your email address");
      return;
    }

    setPaymentLoading(true);
    try {
      const token = getToken();
      const response = await fetch(
        `${baseUrl}/api/investigations/initiate-payment`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            orderId: selectedOrder.orderId,
            email: userEmail.trim(),
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const paymentData = await response.json();
      
      // Assuming the API returns a Paystack authorization URL
      if (paymentData.authorizationUrl || paymentData.authorization_url) {
        // Redirect to Paystack payment page
        window.location.href = paymentData.authorizationUrl || paymentData.authorization_url;
      } else if (paymentData.access_code) {
        // Alternative: Use Paystack Popup (if you have Paystack SDK loaded)
        if (window.PaystackPop) {
          const handler = window.PaystackPop.setup({
            key: paymentData.publicKey || 'pk_test_your_paystack_public_key', // Use your Paystack public key
            email: userEmail,
            amount: selectedOrder.totalCost * 100, // Paystack expects amount in kobo
            currency: 'NGN',
            ref: paymentData.reference || paymentData.access_code,
            callback: function(response) {
              toast.success(`Payment successful! Reference: ${response.reference}`);
              setPaymentCompleted(true);
              setPaymentReference(response.reference);
              // Don't close modal, allow user to proceed with lab order
            },
            onClose: function() {
              toast.info('Payment cancelled');
            }
          });
          handler.openIframe();
        } else {
          toast.error('Payment gateway not available. Please refresh the page.');
        }
      } else {
        // If payment was successful (mock success for demo)
        toast.success('Payment completed successfully!');
        setPaymentCompleted(true);
        setPaymentReference(paymentData.reference || 'MOCK_REF_' + Date.now());
      }
    } catch (error) {
      toast.error(`Failed to initiate payment: ${error.message}`);
    } finally {
      setPaymentLoading(false);
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

  return (
    <div className="relative w-full h-screen overflow-x-auto">
      <div className="min-w-full bg-white shadow-md rounded-lg overflow-auto">
        <table className="min-w-full leading-normal text-center">
          <thead className="bg-gray-50 sticky top-0 z-10 py-4">
            <tr>
              {[
                "Doctor's Full Name",
                "Visit Date",
                "Medications",
                "Get Prescription",
                "Lab Tests",
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

                  {/* Get Prescription with Static Dropdown */}
                  <td className="px-3 py-3 text-sm relative">
                    <div className="relative" ref={dropdownRef}>
                      <button
                        className="group relative inline-flex items-center gap-3 px-5 py-3 text-sm font-semibold text-white bg-gradient-to-r from-orange-500 via-orange-600 to-red-500 hover:from-orange-600 hover:via-orange-700 hover:to-red-600 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setShowPharmacyDropdown(
                            showPharmacyDropdown === index ? null : index
                          );
                        }}
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
                          <div className="bg-gradient-to-r from-orange-500 to-red-500 px-6 py-4 text-white rounded-t-2xl">
                            Available Pharmacies
                          </div>
                          <ul className="divide-y divide-gray-100">
                            {partnerPharmacies.map((pharmacy, idx) => (
                              <li
                                key={idx}
                                className="px-4 py-2 hover:bg-orange-100 cursor-pointer text-sm text-gray-700 transition-colors"
                                onClick={() =>
                                  handlePharmacySelect(pharmacy, patient)
                                }
                                onMouseDown={(e) => e.stopPropagation()}
                              >
                                <div className="flex items-center gap-2">
                                  <svg
                                    className="w-4 h-4 text-orange-500"
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
                                  {pharmacy.name}
                                </div>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </td>

                  {/* Lab test */}
                  <td className="px-3 py-3 text-sm relative">
                    <div className="relative" ref={dropdownRef}>
                      <button
                        className="group relative inline-flex items-center gap-3 px-5 py-3 text-sm font-semibold text-white bg-gradient-to-r from-orange-500 via-orange-600 to-red-500 hover:from-orange-600 hover:via-orange-700 hover:to-red-600 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
                        onClick={() => handleViewLabs(patient)}
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
                        Lab Test
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* View Medications Modal */}
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
                    <td className="border px-4 py-2">
                      {medication?.frequency}
                    </td>
                    <td className="border px-4 py-2">{medication?.duration}</td>
                    <td className="border px-4 py-2">
                      {medication?.instructions}
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
                {selectedPatient?.prescriptions?.length || 0})
              </h3>

              <div className="max-h-64 overflow-y-auto">
                {selectedPatient?.prescriptions?.length > 0 ? (
                  <div className="space-y-3">
                    {selectedPatient.prescriptions.map((medication, index) => (
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

      {/* Lab Order Modal - Modified to enforce payment first */}
      <Modal
        open={labModalOpen}
        onClose={() => !labOrderSending && !paymentLoading && setLabModalOpen(false)}
        aria-labelledby="lab-modal-title"
        aria-describedby="lab-modal-description"
      >
        <Box sx={orderModalStyle}>
          {/* Modal Header */}
          <div className="bg-gradient-to-r from-orange-500 to-red-500 px-6 py-4 rounded-t-2xl">
            <div className="flex items-center justify-between">
              <h2
                id="lab-modal-title"
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
                Lab Investigations
              </h2>
              {!labOrderSending && !paymentLoading && (
                <button
                  onClick={() => setLabModalOpen(false)}
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
            {labLoading ? (
              <div className="w-full h-[400px] flex items-center justify-center">
                <Hourglass
                  visible={true}
                  height="40"
                  width="40"
                  ariaLabel="hourglass-loading"
                  colors={["#306cce", "#72a1ed"]}
                />
              </div>
            ) : !selectedOrder ? (
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
                <p>No lab requests available</p>
              </div>
            ) : (
              <>
                {/* Payment Status Indicator */}
                {paymentCompleted && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                    <div className="flex items-center gap-3">
                      <div className="bg-green-500 p-2 rounded-full">
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
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-green-800">Payment Completed</h3>
                        <p className="text-sm text-green-600">
                          Reference: {paymentReference}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Email Input for Payment */}
                {!paymentCompleted && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                    <h3 className="text-lg font-semibold text-green-800 mb-2">
                      Payment Required
                    </h3>
                    <p className="text-sm text-green-700 mb-3">
                      Payment must be completed before sending lab order to partner lab.
                    </p>
                    <div className="flex items-center gap-3">
                      <div className="bg-green-500 p-2 rounded-full">
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
                            d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                          />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <label className="block text-sm font-medium text-green-800 mb-1">
                          Email for Payment Receipt
                        </label>
                        <input
                          type="email"
                          value={userEmail}
                          onChange={(e) => setUserEmail(e.target.value)}
                          placeholder="Enter your email address"
                          className="w-full p-2 border border-green-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          required
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Select Lab Partner - Only shown after payment */}
                {paymentCompleted && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                    <h3 className="text-lg font-semibold text-blue-800 mb-2">
                      Select Lab Partner
                    </h3>
                    <select
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      onChange={(e) =>
                        setSelectedLabPartner(
                          labPartners.find((p) => p.id === e.target.value)
                        )
                      }
                      value={selectedLabPartner?.id || ""}
                    >
                      <option value="">Choose a lab...</option>
                      {labPartners.map((lab) => (
                        <option key={lab.id} value={lab.id}>
                          {lab.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Patient Info */}
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">
                    Visit Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-600">Doctor:</span>
                      <span className="ml-2 text-gray-800">
                        {selectedPatient?.doctorFirstName} {selectedPatient?.doctorLastName}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Date:</span>
                      <span className="ml-2 text-gray-800">
                        {formatDate(selectedPatient?.visitDate)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Investigations List */}
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
                    Requested Investigations ({selectedOrder.items?.length || 0})
                  </h3>
                  <div className="max-h-64 overflow-y-auto">
                    {selectedOrder.items?.length > 0 ? (
                      <div className="space-y-3">
                        {selectedOrder.items.map((item, index) => (
                          <div
                            key={index}
                            className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm"
                          >
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                              <div>
                                <span className="font-medium text-gray-600">
                                  Test Name:
                                </span>
                                <p className="text-gray-800 font-semibold">
                                  {item.testName}
                                </p>
                              </div>
                              <div>
                                <span className="font-medium text-gray-600">
                                  Instruction:
                                </span>
                                <p className="text-gray-800">
                                  {item.instruction || "None"}
                                </p>
                              </div>
                              <div>
                                <span className="font-medium text-gray-600">
                                  Price:
                                </span>
                                <p className="text-gray-800">
                                  ₦{item.price?.toLocaleString()}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <p>No investigations requested</p>
                      </div>
                    )}
                  </div>
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold text-gray-700">Total Cost:</span>
                      <span className="text-xl font-bold text-green-600">
                        ₦{selectedOrder.totalCost?.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons - Modified to enforce payment first */}
                <div className="flex gap-4 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => setLabModalOpen(false)}
                    disabled={labOrderSending || paymentLoading}
                    className="flex-1 px-4 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Cancel
                  </button>
                  
                  {/* Payment Button - Only shown if payment not completed */}
                  {!paymentCompleted && (
                    <button
                      onClick={handleInitiatePayment}
                      disabled={
                        paymentLoading ||
                        labOrderSending ||
                        !userEmail.trim() ||
                        selectedOrder.items?.length === 0
                      }
                      className="flex-1 px-4 py-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {paymentLoading ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Processing...
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
                              d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                            />
                          </svg>
                          Pay ₦{selectedOrder.totalCost?.toLocaleString()}
                        </>
                      )}
                    </button>
                  )}

                  {/* Send to Lab Button - Only shown after payment is completed */}
                  {paymentCompleted && (
                    <button
                      onClick={handleSendLabOrder}
                      disabled={
                        labOrderSending ||
                        !selectedLabPartner ||
                        selectedOrder.items?.length === 0
                      }
                      className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {labOrderSending ? (
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
                          Send to {selectedLabPartner?.name || 'Lab'}
                        </>
                      )}
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        </Box>
      </Modal>
    </div>
  );
};

export default Table;