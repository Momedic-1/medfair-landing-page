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
  maxWidth: "900px",
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

  // Updated investigations modal state
  const [investigationsModalOpen, setInvestigationsModalOpen] = useState(false);
  const [allInvestigationOrders, setAllInvestigationOrders] = useState([]);
  const [investigationsLoading, setInvestigationsLoading] = useState(false);
  const [selectedLabPartner, setSelectedLabPartner] = useState(null);
  const [labOrderSending, setLabOrderSending] = useState(false);

  // Payment state - updated for multiple selections
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [selectedInvestigations, setSelectedInvestigations] = useState(
    new Set()
  );
  const [paidInvestigations, setPaidInvestigations] = useState(new Set());
  const [verifyingPayment, setVerifyingPayment] = useState(false);

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

  // Updated function to handle viewing all investigations
  const handleViewInvestigations = async (patientData) => {
    setInvestigationsLoading(true);
    setInvestigationsModalOpen(true);
    setSelectedPatient(patientData);
    setSelectedLabPartner(null);
    setSelectedInvestigations(new Set());

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
        throw new Error("Failed to fetch investigation orders");
      }

      const orders = await response.json();

      // Sort orders by date (most recent first)
      const sortedOrders = orders.sort(
        (a, b) => new Date(b.createdDate) - new Date(a.createdDate)
      );

      setAllInvestigationOrders(sortedOrders);
    } catch (error) {
      toast.error(`Failed to fetch investigation orders: ${error.message}`);
      setAllInvestigationOrders([]);
    } finally {
      setInvestigationsLoading(false);
    }
  };

  // Function to toggle investigation selection
  const toggleInvestigationSelection = (orderId, itemIndex) => {
    const key = `${orderId}-${itemIndex}`;
    const newSelected = new Set(selectedInvestigations);

    if (newSelected.has(key)) {
      newSelected.delete(key);
    } else {
      newSelected.add(key);
    }

    setSelectedInvestigations(newSelected);
  };

  // Function to calculate total cost of selected investigations
  const getSelectedTotal = () => {
    let total = 0;
    selectedInvestigations.forEach((key) => {
      const [orderId, itemIndex] = key.split("-");
      const order = allInvestigationOrders.find(
        (o) => o.orderId.toString() === orderId
      );
      if (order && order.items[parseInt(itemIndex)]) {
        total += order.items[parseInt(itemIndex)].price;
      }
    });
    return total;
  };

  // Payment verification function
  const verifyPayment = async (reference) => {
    try {
      setVerifyingPayment(true);
      const token = getToken();
      const response = await fetch(
        `${baseUrl}/api/investigations/verify-payment?reference=${reference}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || `HTTP error! status: ${response.status}`
        );
      }

      const verificationResult = await response.json();

      if (
        verificationResult.status === "success" ||
        verificationResult.verified === true
      ) {
        // Mark selected investigations as paid
        const newPaidInvestigations = new Set([
          ...paidInvestigations,
          ...selectedInvestigations,
        ]);
        setPaidInvestigations(newPaidInvestigations);
        setSelectedInvestigations(new Set()); // Clear selections after payment

        toast.success("Payment verified successfully!");
        return true;
      } else {
        toast.error("Payment verification failed. Please try again.");
        return false;
      }
    } catch (error) {
      toast.error(`Failed to verify payment: ${error.message}`);
      return false;
    } finally {
      setVerifyingPayment(false);
    }
  };

  // Modified payment function for selected investigations
  const handleInitiatePayment = async () => {
    if (selectedInvestigations.size === 0) {
      toast.warning("Please select investigations to pay for");
      return;
    }

    if (!userEmail.trim()) {
      toast.warning("Please provide your email address");
      return;
    }

    setPaymentLoading(true);
    try {
      const token = getToken();

      // Prepare payment data for selected investigations
      const selectedItems = [];
      selectedInvestigations.forEach((key) => {
        const [orderId, itemIndex] = key.split("-");
        const order = allInvestigationOrders.find(
          (o) => o.orderId.toString() === orderId
        );
        if (order && order.items[parseInt(itemIndex)]) {
          selectedItems.push({
            orderId: parseInt(orderId),
            itemIndex: parseInt(itemIndex),
            item: order.items[parseInt(itemIndex)],
          });
        }
      });

      const response = await fetch(
        `${baseUrl}/api/investigations/initiate-payment`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            selectedInvestigations: selectedItems,
            email: userEmail.trim(),
            totalAmount: getSelectedTotal(),
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || `HTTP error! status: ${response.status}`
        );
      }

      const paymentData = await response.json();

      // Handle payment similar to original implementation
      if (paymentData.authorizationUrl || paymentData.authorization_url) {
        const reference = paymentData.reference || paymentData.access_code;

        const paymentWindow = window.open(
          paymentData.authorizationUrl || paymentData.authorization_url,
          "paystack-payment",
          "width=500,height=600,scrollbars=yes,resizable=yes"
        );

        const pollPayment = setInterval(async () => {
          if (paymentWindow.closed) {
            clearInterval(pollPayment);
            if (reference) {
              const verified = await verifyPayment(reference);
              if (verified) {
                setPaymentLoading(false);
              }
            }
            setPaymentLoading(false);
          }
        }, 1000);
      } else {
        // Mock success for demo
        const mockRef = paymentData.reference || "MOCK_REF_" + Date.now();
        const verified = await verifyPayment(mockRef);
        if (verified) {
          toast.success("Payment completed successfully!");
        }
      }
    } catch (error) {
      toast.error(`Failed to initiate payment: ${error.message}`);
    } finally {
      setPaymentLoading(false);
    }
  };

  // Function to send lab order for paid investigations
  const handleSendLabOrder = async () => {
    if (!selectedLabPartner) {
      toast.warning("Please select a lab partner");
      return;
    }

    const paidItems = Array.from(paidInvestigations);
    if (paidItems.length === 0) {
      toast.warning("No paid investigations to send");
      return;
    }

    setLabOrderSending(true);
    try {
      const token = getToken();

      // Group paid investigations by orderId for API call
      const orderIds = [...new Set(paidItems.map((key) => key.split("-")[0]))];

      for (const orderId of orderIds) {
        const response = await fetch(
          `${baseUrl}/api/investigations/investigations/select-lab?orderId=${orderId}&labPartner=${selectedLabPartner.partner}`,
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
          throw new Error(
            errorData.message || `HTTP error! status: ${response.status}`
          );
        }
      }

      toast.success(
        `Lab orders sent to ${selectedLabPartner.name} successfully!`
      );
      setInvestigationsModalOpen(false);
    } catch (error) {
      toast.error(`Failed to send lab order: ${error.message}`);
    } finally {
      setLabOrderSending(false);
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
                "Lab Investigations",
              ].map((header, idx) => (
                <th
                  key={idx}
                  className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[150px]"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="text-center">
            {isLoading ? (
              <tr>
                <td colSpan="5">
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
                <td colSpan="5" className="text-center py-4">
                  {emptyMessage || "No data available"}
                </td>
              </tr>
            ) : (
              data.map((patient, index) => (
                <tr key={index} className="border-b border-gray-200">
                  <td className="px-2 py-2 text-sm text-gray-700 min-w-[150px]">{`${patient?.doctorLastName}, ${patient?.doctorFirstName}`}</td>
                  <td className="px-2 py-2 text-sm text-gray-700 min-w-[120px]">
                    {formatDate(patient?.visitDate)}
                  </td>

                  {/* View Medications */}
                  <td className="p-4 text-sm min-w-[160px]">
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
                  <td className="px-3 py-3 text-sm relative min-w-[180px]">
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

                  {/* Lab Investigations - Updated to use new modal */}
                  <td className="px-3 py-3 text-sm relative min-w-[150px]">
                    <button
                      className="group relative inline-flex items-center gap-3 px-5 py-3 text-sm font-semibold text-white bg-gradient-to-r from-green-500 via-green-600 to-green-700 hover:from-green-600 hover:via-green-700 hover:to-green-800 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
                      onClick={() => handleViewInvestigations(patient)}
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
                          d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
                        />
                      </svg>
                      Investigations
                    </button>
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

      {/* New Investigations Modal - Shows all investigations with selection */}
      <Modal
        open={investigationsModalOpen}
        onClose={() =>
          !labOrderSending &&
          !paymentLoading &&
          !verifyingPayment &&
          setInvestigationsModalOpen(false)
        }
        aria-labelledby="investigations-modal-title"
        aria-describedby="investigations-modal-description"
      >
        <Box sx={orderModalStyle}>
          {/* Modal Header */}
          <div className="bg-gradient-to-r from-green-500 to-green-600 px-6 py-4 rounded-t-2xl">
            <div className="flex items-center justify-between">
              <h2
                id="investigations-modal-title"
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
                    d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
                  />
                </svg>
                All Investigations
              </h2>
              {!labOrderSending && !paymentLoading && !verifyingPayment && (
                <button
                  onClick={() => setInvestigationsModalOpen(false)}
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
            {investigationsLoading ? (
              <div className="w-full h-[400px] flex items-center justify-center">
                <Hourglass
                  visible={true}
                  height="40"
                  width="40"
                  ariaLabel="hourglass-loading"
                  colors={["#306cce", "#72a1ed"]}
                />
              </div>
            ) : allInvestigationOrders?.length === 0 ? (
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
                    d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
                  />
                </svg>
                <p>No investigation orders available</p>
                <p className="text-sm mt-2">
                  No investigations have been ordered for this patient
                </p>
              </div>
            ) : (
              <>
                {/* Payment verification in progress */}
                {verifyingPayment && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                    <div className="flex items-center gap-3">
                      <div className="bg-blue-500 p-2 rounded-full">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-blue-800">
                          Verifying Payment
                        </h3>
                        <p className="text-sm text-blue-600">
                          Please wait while we verify your payment...
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Selection Summary */}
                {selectedInvestigations.size > 0 && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-blue-800">
                          Selected for Payment
                        </h3>
                        <p className="text-sm text-blue-600">
                          {selectedInvestigations.size} investigation(s)
                          selected
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-blue-800">
                          ₦{getSelectedTotal().toLocaleString()}
                        </p>
                        <p className="text-sm text-blue-600">Total Amount</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Paid Investigations Summary */}
                {paidInvestigations.size > 0 && (
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
                        <h3 className="text-lg font-semibold text-green-800">
                          Paid Investigations
                        </h3>
                        <p className="text-sm text-green-600">
                          {paidInvestigations.size} investigation(s) paid for
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Email Input for Payment */}
                {selectedInvestigations.size > 0 && !verifyingPayment && (
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
                    <h3 className="text-lg font-semibold text-orange-800 mb-2">
                      Payment Information
                    </h3>
                    <p className="text-sm text-orange-700 mb-3">
                      Enter your email address to proceed with payment
                    </p>
                    <div className="flex items-center gap-3">
                      <div className="bg-orange-500 p-2 rounded-full">
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
                        <label className="block text-sm font-medium text-orange-800 mb-1">
                          Email for Payment Receipt
                        </label>
                        <input
                          type="email"
                          value={userEmail}
                          onChange={(e) => setUserEmail(e.target.value)}
                          placeholder="Enter your email address"
                          className="w-full p-2 border border-orange-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                          required
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Select Lab Partner - Only shown for paid investigations */}
                {paidInvestigations.size > 0 && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                    <h3 className="text-lg font-semibold text-blue-800 mb-2">
                      Select Lab Partner
                    </h3>
                    <p className="text-sm text-blue-700 mb-3">
                      Choose a lab partner to send your paid investigations to
                    </p>
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

                {/* All Investigation Orders List */}
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
                    All Investigation Orders ({allInvestigationOrders.length})
                  </h3>

                  <div className="max-h-96 overflow-y-auto space-y-4">
                    {allInvestigationOrders.map((order, orderIndex) => (
                      <div
                        key={order.orderId}
                        className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm"
                      >
                        {/* Order Header */}
                        <div className="flex items-center justify-between mb-3 pb-3 border-b border-gray-100">
                          <div className="flex items-center gap-3">
                            <div className="bg-blue-500 p-2 rounded-full">
                              <svg
                                className="w-4 h-4 text-white"
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
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-800">
                                Order #{order.orderId}
                              </h4>
                              <div className="text-sm text-gray-600">
                                <span>Dr. {order.doctorName}</span>
                                <span className="mx-2">•</span>
                                <span>{formatDate(order.createdDate)}</span>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-gray-800">
                              ₦{order.totalCost?.toLocaleString()}
                            </p>
                            <p className="text-sm text-gray-600">Total</p>
                          </div>
                        </div>

                        {/* Investigation Items */}
                        <div className="space-y-2">
                          {order.items?.map((item, itemIndex) => {
                            const key = `${order.orderId}-${itemIndex}`;
                            const isSelected = selectedInvestigations.has(key);
                            const isPaid = paidInvestigations.has(key);

                            return (
                              <div
                                key={itemIndex}
                                className={`flex items-center justify-between p-3 rounded-lg border-2 transition-all ${
                                  isPaid
                                    ? "bg-green-50 border-green-200"
                                    : isSelected
                                    ? "bg-blue-50 border-blue-200"
                                    : "bg-gray-50 border-gray-200 hover:border-gray-300"
                                }`}
                              >
                                <div className="flex items-center gap-3">
                                  <input
                                    type="checkbox"
                                    checked={isSelected}
                                    disabled={isPaid}
                                    onChange={() =>
                                      toggleInvestigationSelection(
                                        order.orderId,
                                        itemIndex
                                      )
                                    }
                                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2 disabled:opacity-50"
                                  />
                                  <div>
                                    <p className="font-semibold text-gray-800">
                                      {item.testName}
                                    </p>
                                    <p className="text-sm text-gray-600">
                                      {item.instruction}
                                    </p>
                                  </div>
                                </div>

                                <div className="flex items-center gap-3">
                                  <span className="font-bold text-gray-800">
                                    ₦{item.price?.toLocaleString()}
                                  </span>
                                  {isPaid && (
                                    <div className="flex items-center gap-1 text-green-600 bg-green-100 px-2 py-1 rounded-full text-xs font-medium">
                                      <svg
                                        className="w-3 h-3"
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
                                      PAID
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => setInvestigationsModalOpen(false)}
                    disabled={
                      labOrderSending || paymentLoading || verifyingPayment
                    }
                    className="flex-1 px-4 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Cancel
                  </button>

                  {/* Payment Button - Only shown if selections exist and payment not in progress */}
                  {selectedInvestigations.size > 0 && !verifyingPayment && (
                    <button
                      onClick={handleInitiatePayment}
                      disabled={
                        paymentLoading || labOrderSending || !userEmail.trim()
                      }
                      className="flex-1 px-4 py-3 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
                          Pay ₦{getSelectedTotal().toLocaleString()}
                        </>
                      )}
                    </button>
                  )}

                  {/* Send to Lab Button - Only shown for paid investigations */}
                  {paidInvestigations.size > 0 && !verifyingPayment && (
                    <button
                      onClick={handleSendLabOrder}
                      disabled={labOrderSending || !selectedLabPartner}
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
                          Send to {selectedLabPartner?.name || "Lab"}
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
