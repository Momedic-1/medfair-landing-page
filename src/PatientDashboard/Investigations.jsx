import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // Add this import
import { formatDate, getId, getToken, getUserData } from "../utils";
import { Hourglass } from "react-loader-spinner";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { baseUrl } from "../env";

const Investigations = () => {
  const patientId = getId();
  const navigate = useNavigate(); // Add this hook
  const user = getUserData(); 
  console.log(user, "User Data in Investigations Component");

  // State for displaying investigations
  const [allInvestigationOrders, setAllInvestigationOrders] = useState([]);
  const [investigationsLoading, setInvestigationsLoading] = useState(true);

  // Payment functionality states from table component
  const [selectedInvestigations, setSelectedInvestigations] = useState(
    new Set()
  );
  const [paidInvestigations, setPaidInvestigations] = useState(new Set());
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [verifyingPayment, setVerifyingPayment] = useState(false);
  const [userEmail, setUserEmail] = useState("");

  // Lab order states
  const [selectedLabPartner, setSelectedLabPartner] = useState(null);
  const [labOrderSending, setLabOrderSending] = useState(false);

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

  // Helper function to check if a test was done within the last 30 days
  const isTestDoneWithinMonth = (
    testName,
    currentOrderId,
    currentItemIndex
  ) => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    for (const order of allInvestigationOrders) {
      const orderDate = new Date(order.createdDate);

      // Skip if order is older than 30 days
      if (orderDate < thirtyDaysAgo) continue;

      // Check each item in the order
      for (
        let itemIndex = 0;
        itemIndex < (order.items?.length || 0);
        itemIndex++
      ) {
        const item = order.items[itemIndex];
        const itemKey = `${order.orderId}-${itemIndex}`;

        // Skip the current item being checked
        if (order.orderId === currentOrderId && itemIndex === currentItemIndex)
          continue;

        // Check if same test name and if it's paid for or completed
        if (
          item.testName === testName &&
          (paidInvestigations.has(itemKey) || order.status === "completed")
        ) {
          return {
            isDuplicate: true,
            lastDoneDate: orderDate,
            orderId: order.orderId,
          };
        }
      }
    }

    return { isDuplicate: false };
  };

  // Function to get all tests done in the last 30 days
  const getRecentTests = () => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentTests = new Map(); // testName -> { date, orderId }

    allInvestigationOrders.forEach((order) => {
      const orderDate = new Date(order.createdDate);
      if (orderDate >= thirtyDaysAgo) {
        order.items?.forEach((item, itemIndex) => {
          const itemKey = `${order.orderId}-${itemIndex}`;
          if (paidInvestigations.has(itemKey) || order.status === "completed") {
            if (
              !recentTests.has(item.testName) ||
              recentTests.get(item.testName).date < orderDate
            ) {
              recentTests.set(item.testName, {
                date: orderDate,
                orderId: order.orderId,
              });
            }
          }
        });
      }
    });

    return recentTests;
  };

  // Function to fetch all investigations on component mount
  const fetchInvestigations = async () => {
    setInvestigationsLoading(true);

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

  // Function to toggle investigation selection with duplicate check
  const toggleInvestigationSelection = (orderId, itemIndex) => {
    const key = `${orderId}-${itemIndex}`;
    const newSelected = new Set(selectedInvestigations);

    // Find the test item
    const order = allInvestigationOrders.find(
      (o) => o.orderId.toString() === orderId.toString()
    );
    if (!order || !order.items[itemIndex]) return;

    const testItem = order.items[itemIndex];

    if (newSelected.has(key)) {
      // Removing selection - always allowed
      newSelected.delete(key);
    } else {
      // Adding selection - check for duplicates
      const duplicateCheck = isTestDoneWithinMonth(
        testItem.testName,
        orderId,
        itemIndex
      );

      if (duplicateCheck.isDuplicate) {
        const daysSince = Math.ceil(
          (new Date() - duplicateCheck.lastDoneDate) / (1000 * 60 * 60 * 24)
        );
        const remainingDays = 30 - daysSince;

        toast.warning(
          `This test (${testItem.testName}) was completed ${daysSince} days ago in Order #${duplicateCheck.orderId}. ` +
            `You can request it again in ${remainingDays} days.`,
          { autoClose: 5000 }
        );
        return;
      }

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

        toast.success("Payment verified successfully! Please select a lab partner to send your order to.");
        
        // Route back to the investigations page after successful payment
        // This ensures the user can see the paid investigations and select a lab partner
        setTimeout(() => {
          navigate("/patient-dashboard/patient-investigations", { replace: true });
        }, 2000);

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

  // Enhanced payment function with final duplicate check
  const handleInitiatePayment = async () => {
    if (selectedInvestigations.size === 0) {
      toast.warning("Please select investigations to pay for");
      return;
    }

    if (!userEmail.trim()) {
      toast.warning("Please provide your email address");
      return;
    }

    // Final duplicate check before payment
    const duplicatesFound = [];
    selectedInvestigations.forEach((key) => {
      const [orderId, itemIndex] = key.split("-");
      const order = allInvestigationOrders.find(
        (o) => o.orderId.toString() === orderId
      );
      if (order && order.items[parseInt(itemIndex)]) {
        const testItem = order.items[parseInt(itemIndex)];
        const duplicateCheck = isTestDoneWithinMonth(
          testItem.testName,
          parseInt(orderId),
          parseInt(itemIndex)
        );

        if (duplicateCheck.isDuplicate) {
          duplicatesFound.push({
            testName: testItem.testName,
            key: key,
            lastDoneDate: duplicateCheck.lastDoneDate,
            orderId: duplicateCheck.orderId,
          });
        }
      }
    });

    if (duplicatesFound.length > 0) {
      // Remove duplicate tests from selection and show warning
      const newSelected = new Set(selectedInvestigations);
      duplicatesFound.forEach((duplicate) => {
        newSelected.delete(duplicate.key);
        const daysSince = Math.ceil(
          (new Date() - duplicate.lastDoneDate) / (1000 * 60 * 60 * 24)
        );
        const remainingDays = 30 - daysSince;

        toast.error(
          `Removed ${duplicate.testName} from payment - completed ${daysSince} days ago in Order #${duplicate.orderId}. ` +
            `Available again in ${remainingDays} days.`,
          { autoClose: 7000 }
        );
      });

      setSelectedInvestigations(newSelected);

      if (newSelected.size === 0) {
        toast.warning("No valid tests remaining for payment");
        return;
      }
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

      // Handle payment
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

      // Clear paid investigations after successful lab order
      setPaidInvestigations(new Set());
      
      // Optionally refetch investigations to get updated status
      await fetchInvestigations();
      
    } catch (error) {
      toast.error(`Failed to send lab order: ${error.message}`);
    } finally {
      setLabOrderSending(false);
    }
  };

  // Fetch investigations when component mounts
  useEffect(() => {
    fetchInvestigations();
  }, [patientId]);

  return (
    <div className="investigations-component max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-500 to-green-700 px-6 py-6 rounded-t-2xl mb-6">
        <h1 className="text-xl md:text-2xl font-bold text-white flex items-center gap-3">
          <svg
            className="w-8 h-8"
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
          Lab Investigation Orders
        </h1>
        {!investigationsLoading && (
          <p className="text-green-100 mt-2">
            {allInvestigationOrders.length} orders found
          </p>
        )}
      </div>

      {/* Recent Tests Warning */}
      {!investigationsLoading &&
        allInvestigationOrders.length > 0 &&
        (() => {
          const recentTests = getRecentTests();
          return recentTests.size > 0 ? (
            <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="bg-yellow-500 p-2 rounded-full">
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
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-yellow-800">
                    Recently Completed Tests
                  </h3>
                  <p className="text-sm text-yellow-700 mb-2">
                    The following tests were completed within the last 30 days
                    and cannot be repeated:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {Array.from(recentTests.entries()).map(
                      ([testName, info]) => {
                        const daysSince = Math.ceil(
                          (new Date() - info.date) / (1000 * 60 * 60 * 24)
                        );
                        const remainingDays = 30 - daysSince;
                        return (
                          <span
                            key={testName}
                            className="inline-flex items-center px-2 py-1 text-xs bg-yellow-200 text-yellow-800 rounded-full"
                            title={`Completed ${daysSince} days ago in Order #${info.orderId}. Available in ${remainingDays} days.`}
                          >
                            {testName}
                            <span className="ml-1 text-yellow-600">
                              ({remainingDays}d)
                            </span>
                          </span>
                        );
                      }
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : null;
        })()}

      {/* Payment Controls Section - Only show when there are selections or paid items */}
      {(selectedInvestigations.size > 0 ||
        paidInvestigations.size > 0 ||
        verifyingPayment) && (
        <div className="mb-6 space-y-4">
          {/* Payment verification in progress */}
          {verifyingPayment && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
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
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-blue-800">
                    Selected for Payment
                  </h3>
                  <p className="text-sm text-blue-600">
                    {selectedInvestigations.size} investigation(s) selected
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
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
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
                    {paidInvestigations.size} investigation(s) paid for - Select a lab partner below
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Email Input for Payment */}
          {selectedInvestigations.size > 0 && !verifyingPayment && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
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

          {/* Select Lab Partner */}
          {paidInvestigations.size > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
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

          {/* Action Buttons */}
          <div className="flex gap-4">
            {/* Payment Button */}
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

            {/* Send to Lab Button */}
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
        </div>
      )}

      {/* Content */}
      {investigationsLoading ? (
        <div className="flex items-center justify-center py-12 bg-white rounded-b-2xl">
          <Hourglass
            visible={true}
            height="60"
            width="60"
            ariaLabel="hourglass-loading"
            colors={["#10b981", "#34d399"]}
          />
        </div>
      ) : allInvestigationOrders.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-b-2xl">
          <svg
            className="w-16 h-16 mx-auto text-gray-300 mb-4"
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
          <p className="text-gray-500 text-lg">
            No investigations found for this patient
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Investigation Orders */}
          {allInvestigationOrders.map((order) => (
            <div
              key={order.orderId}
              className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow"
            >
              {/* Order Header */}
              <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 rounded-t-xl">
                <div className="flex justify-between items-start flex-wrap gap-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">
                      Order #{order.orderId}
                    </h3>
                    <p className="text-sm text-gray-600">
                      Doctor: {order.doctorName}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">
                      {formatDate(order.createdDate)}
                    </p>
                    <span
                      className={`inline-block px-3 py-1 text-xs font-medium rounded-full mt-1 ${
                        order.status === "pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-green-100 text-green-800"
                      }`}
                    >
                      {order.status.charAt(0).toUpperCase() +
                        order.status.slice(1)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div className="p-6">
                <div className="space-y-3">
                  {order.items?.map((item, itemIndex) => {
                    const key = `${order.orderId}-${itemIndex}`;
                    const isSelected = selectedInvestigations.has(key);
                    const isPaid = paidInvestigations.has(key);
                    const duplicateCheck = isTestDoneWithinMonth(
                      item.testName,
                      order.orderId,
                      itemIndex
                    );
                    const isDuplicate = duplicateCheck.isDuplicate;

                    return (
                      <div
                        key={itemIndex}
                        className={`flex items-center justify-between p-4 border-2 rounded-lg transition-all ${
                          isPaid
                            ? "bg-green-50 border-green-200"
                            : isDuplicate
                            ? "bg-red-50 border-red-200 opacity-75"
                            : isSelected
                            ? "bg-blue-50 border-blue-200"
                            : "bg-gray-50 border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            disabled={isPaid || isDuplicate}
                            onChange={() =>
                              toggleInvestigationSelection(
                                order.orderId,
                                itemIndex
                              )
                            }
                            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2 disabled:opacity-50"
                          />
                          <div className="flex-1">
                            <h4
                              className={`font-medium mb-1 ${
                                isDuplicate ? "text-red-700" : "text-gray-800"
                              }`}
                            >
                              {item.testName}
                              {isDuplicate && (
                                <span className="ml-2 text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full">
                                  Recently Done
                                </span>
                              )}
                            </h4>
                            <p
                              className={`text-sm ${
                                isDuplicate ? "text-red-600" : "text-gray-600"
                              }`}
                            >
                              {item.instruction}
                            </p>
                            {isDuplicate && (
                              <p className="text-xs text-red-600 mt-1">
                                Last done:{" "}
                                {Math.ceil(
                                  (new Date() - duplicateCheck.lastDoneDate) /
                                    (1000 * 60 * 60 * 24)
                                )}{" "}
                                days ago (Order #{duplicateCheck.orderId}).
                                Available in{" "}
                                {30 -
                                  Math.ceil(
                                    (new Date() - duplicateCheck.lastDoneDate) /
                                      (1000 * 60 * 60 * 24)
                                  )}{" "}
                                days.
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-3 ml-4">
                          <span
                            className={`text-lg font-semibold ${
                              isDuplicate ? "text-red-600" : "text-green-600"
                            }`}
                          >
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
                          {isDuplicate && (
                            <div className="flex items-center gap-1 text-red-600 bg-red-100 px-2 py-1 rounded-full text-xs font-medium">
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
                                  d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728"
                                />
                              </svg>
                              BLOCKED
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Order Total */}
                <div className="mt-6 pt-4 border-t border-gray-200">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-medium text-gray-700">
                      Total Cost:
                    </span>
                    <span className="text-xl font-bold text-green-600">
                      ₦{order.totalCost?.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Summary Stats */}
          <div className="mt-8 bg-white rounded-xl p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Summary
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {allInvestigationOrders.length}
                </div>
                <div className="text-sm text-gray-600">Total Orders</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {allInvestigationOrders.reduce(
                    (acc, order) => acc + (order.items?.length || 0),
                    0
                  )}
                </div>
                <div className="text-sm text-gray-600">Total Tests</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  ₦
                  {allInvestigationOrders
                    .reduce((acc, order) => acc + (order.totalCost || 0), 0)
                    .toLocaleString()}
                </div>
                <div className="text-sm text-gray-600">Total Value</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Investigations;