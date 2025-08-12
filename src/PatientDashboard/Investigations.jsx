import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { formatDate, getId, getToken, getUserData } from "../utils";
import { Hourglass } from "react-loader-spinner";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { baseUrl } from "../env";

const Investigations = () => {
  const patientId = getId();
  const navigate = useNavigate();
  const user = getUserData();
  const token = getToken();

  const [allInvestigationOrders, setAllInvestigationOrders] = useState([]);
  const [investigationsLoading, setInvestigationsLoading] = useState(true);
  const [selectedOrders, setSelectedOrders] = useState(new Set());
  const [paidInvestigations, setPaidInvestigations] = useState(new Set());
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [verifyingPayment, setVerifyingPayment] = useState(false);
  const [userEmail, setUserEmail] = useState(user?.emailAddress || "");
  const [pendingPaidOrders, setPendingPaidOrders] = useState(new Set());
  const [selectedLabPartner, setSelectedLabPartner] = useState(null);
  const [labOrderSending, setLabOrderSending] = useState(false);
  const [sentToLabOrders, setSentToLabOrders] = useState(new Set()); // Track orders sent to lab

  const labPartners = [
    { id: "smartlab", name: "SmartLab", partner: "SMARTLAB" },
    { id: "degree_360_lab", name: "Degree 360 Lab", partner: "DEGREE_360" },
  ];

  const getSuccessfulOrders = () => {
    return allInvestigationOrders.filter((order) => order.status === "success");
  };

  const getSuccessfulOrdersCount = () => {
    return getSuccessfulOrders().length;
  };

  const getTotalSuccessfulTests = () => {
    return getSuccessfulOrders().reduce(
      (total, order) => total + (order.items?.length || 0),
      0
    );
  };

  // Get orders that are successful but not yet sent to lab
  const getUnsentSuccessfulOrders = () => {
    return getSuccessfulOrders().filter(order => !sentToLabOrders.has(order.orderId.toString()));
  };

  const getUnsentSuccessfulOrdersCount = () => {
    return getUnsentSuccessfulOrders().length;
  };

  useEffect(() => {
    if (user?.emailAddress && !userEmail) {
      setUserEmail(user.emailAddress);
    }
  }, [user, userEmail]);

  // Helper: check if a test was done within last 30 days (skips comparing to the same item if provided)
  const isTestDoneWithinMonth = (
    testName,
    currentOrderId,
    currentItemIndex
  ) => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    for (const order of allInvestigationOrders) {
      const orderDate = new Date(order.createdDate);
      if (orderDate < thirtyDaysAgo) continue; // older than window

      for (
        let itemIndex = 0;
        itemIndex < (order.items?.length || 0);
        itemIndex++
      ) {
        const item = order.items[itemIndex];
        const itemKey = `${order.orderId}-${itemIndex}`;

        // Skip comparing the same item in the same order
        if (
          order.orderId.toString() === currentOrderId.toString() &&
          itemIndex === currentItemIndex
        )
          continue;

        if (
          item.testName === testName &&
          (paidInvestigations.has(itemKey) || order.status === "completed" || order.status === "success")
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

  // Get tests completed in the last 30 days (used for the yellow warning banner)
  const getRecentTests = () => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentTests = new Map();

    allInvestigationOrders.forEach((order) => {
      const orderDate = new Date(order.createdDate);
      if (orderDate >= thirtyDaysAgo) {
        order.items?.forEach((item, itemIndex) => {
          const itemKey = `${order.orderId}-${itemIndex}`;
          if (paidInvestigations.has(itemKey) || order.status === "completed" || order.status === "success") {
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

  // Fetch orders
  const fetchInvestigations = async () => {
    setInvestigationsLoading(true);
    try {
      const token = getToken();
      if (!patientId) throw new Error("Patient ID not provided");

      const response = await fetch(
        `${baseUrl}/api/investigations/orders/patient/${patientId}`,
        {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!response.ok) throw new Error("Failed to fetch investigation orders");

      const orders = await response.json();
      const sortedOrders = orders.sort(
        (a, b) => new Date(b.createdDate) - new Date(a.createdDate)
      );
      setAllInvestigationOrders(sortedOrders);
      
      // Load sent to lab orders from localStorage (since we can't use browser storage in artifacts)
      // In a real implementation, this would come from the server
      const savedSentOrders = new Set(); // Replace with actual server data
      setSentToLabOrders(savedSentOrders);
    } catch (error) {
      toast.error(`Failed to fetch investigation orders: ${error.message}`);
      setAllInvestigationOrders([]);
    } finally {
      setInvestigationsLoading(false);
    }
  };

  useEffect(() => {
    fetchInvestigations();
  }, [patientId]);

  // Toggle order selection (order-level)
  const toggleOrderSelection = (orderId) => {
    const idStr = orderId.toString();
    const order = allInvestigationOrders.find(
      (o) => o.orderId.toString() === idStr
    );
    if (!order) return;

    // Allow selecting successful orders that haven't been sent to lab
    if (order.status === "success" && sentToLabOrders.has(idStr)) {
      toast.info(`Order #${order.orderId} has already been sent to the lab partner.`);
      return;
    }

    // Only block if order is not paid/successful, and contains duplicates/issues
    if (order.status !== "success") {
      const blockedItems = [];
      for (let i = 0; i < (order.items?.length || 0); i++) {
        const item = order.items[i];
        const dup = isTestDoneWithinMonth(item.testName, order.orderId, i);
        const itemKey = `${order.orderId}-${i}`;
        if (
          dup.isDuplicate ||
          paidInvestigations.has(itemKey) ||
          order.status === "completed"
        ) {
          blockedItems.push({ item, index: i, dup });
        }
      }

      if (blockedItems.length > 0) {
        const names = blockedItems.map((b) => b.item.testName).join(", ");
        toast.warning(
          `Order #${order.orderId} contains blocked tests: ${names}. You must remove or wait before paying for this order.`,
          { autoClose: 7000 }
        );
        return;
      }
    }

    const newSelected = new Set(selectedOrders);
    if (newSelected.has(idStr)) newSelected.delete(idStr);
    else newSelected.add(idStr);

    setSelectedOrders(newSelected);
  };

  const getSelectedTotal = () => {
    let total = 0;
    selectedOrders.forEach((idStr) => {
      const order = allInvestigationOrders.find(
        (o) => o.orderId.toString() === idStr
      );
      if (order && order.status !== "success") {
        total += Number(order.totalCost || 0);
      }
    });
    return total;
  };

  // Get selected orders that need payment (not successful)
  const getSelectedOrdersForPayment = () => {
    const ordersForPayment = new Set();
    selectedOrders.forEach((idStr) => {
      const order = allInvestigationOrders.find(
        (o) => o.orderId.toString() === idStr
      );
      if (order && order.status !== "success") {
        ordersForPayment.add(idStr);
      }
    });
    return ordersForPayment;
  };

  // Get selected orders that are successful (for lab sending)
  const getSelectedSuccessfulOrders = () => {
    const successfulOrders = [];
    selectedOrders.forEach((idStr) => {
      const order = allInvestigationOrders.find(
        (o) => o.orderId.toString() === idStr
      );
      if (order && order.status === "success" && !sentToLabOrders.has(idStr)) {
        successfulOrders.push(order);
      }
    });
    return successfulOrders;
  };

  // Payment verification
  const verifyPayment = async (reference) => {
    try {
      setVerifyingPayment(true);
      const token = getToken();
      const response = await fetch(
        `${baseUrl}/api/investigations/verify-payment?reference=${reference}`,
        {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const contentType = response.headers.get("content-type");
      let verificationResult;

      if (contentType && contentType.includes("application/json")) {
        verificationResult = await response.json();
      } else {
        const text = await response.text();
        throw new Error(
          text || `Unexpected response format (${response.status})`
        );
      }

      if (
        verificationResult.status === "success" ||
        verificationResult.verified === true
      ) {
        const newPaid = new Set(paidInvestigations);
        pendingPaidOrders.forEach((orderIdStr) => {
          const order = allInvestigationOrders.find(
            (o) => o.orderId.toString() === orderIdStr
          );
          if (order) {
            for (let i = 0; i < (order.items?.length || 0); i++) {
              newPaid.add(`${order.orderId}-${i}`);
            }
          }
        });

        setPaidInvestigations(newPaid);
        console.log("Paid investigations:", Array.from(newPaid));
        setSelectedOrders(new Set());
        setPendingPaidOrders(new Set());
        
        // Refresh orders to get updated status from server
        await fetchInvestigations();
        
        toast.success(
          "Payment verified successfully! Please select a lab partner."
        );
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

  useEffect(() => {
    console.log("Paid Investigations:", paidInvestigations);
  }, [paidInvestigations]);

  useEffect(() => {
    console.log("Paid Investigations updated:", paidInvestigations);
  }, [paidInvestigations]);

  // Initiate payment for selected orders
  const handleInitiatePayment = async () => {
    const ordersForPayment = getSelectedOrdersForPayment();
    
    if (ordersForPayment.size === 0) {
      toast.warning("Please select one or more unpaid orders to pay for");
      return;
    }

    if (!userEmail.trim()) {
      toast.warning("Please provide your email address");
      return;
    }

    const pid = getId();
    if (!pid) {
      toast.error("Patient ID is required for payment. Please log in again.");
      return;
    }

    // Final duplicate check at order level for unpaid orders only
    const toRemove = [];
    ordersForPayment.forEach((idStr) => {
      const order = allInvestigationOrders.find(
        (o) => o.orderId.toString() === idStr
      );
      if (!order) {
        toRemove.push(idStr);
        return;
      }

      // Skip payment processing for successful orders (they're selected for lab sending)
      if (order.status === "success") {
        toRemove.push(idStr);
        return;
      }

      for (let i = 0; i < (order.items?.length || 0); i++) {
        const testItem = order.items[i];
        const dup = isTestDoneWithinMonth(testItem.testName, order.orderId, i);
        const itemKey = `${order.orderId}-${i}`;
        if (
          dup.isDuplicate ||
          paidInvestigations.has(itemKey) ||
          order.status === "completed"
        ) {
          toRemove.push(idStr);
          toast.error(
            `Removed Order #${order.orderId} from payment - contains ${testItem.testName} which is recently done or already paid.`,
            { autoClose: 7000 }
          );
          break;
        }
      }
    });

    if (toRemove.length > 0) {
      const newSel = new Set(selectedOrders);
      toRemove.forEach((r) => newSel.delete(r));
      setSelectedOrders(newSel);
      
      // Recalculate orders for payment after removal
      const remainingOrdersForPayment = getSelectedOrdersForPayment();
      if (remainingOrdersForPayment.size === 0) {
        toast.warning("No valid orders remaining for payment");
        return;
      }
    }

    setPaymentLoading(true);
    try {
      const token = getToken();
      const finalOrdersForPayment = getSelectedOrdersForPayment();
      const orderIds = Array.from(finalOrdersForPayment).map((s) => parseInt(s));

      const paymentRequest = {
        orderId: orderIds[0], // first selected order
        email: userEmail.trim(),
      };
      console.log("Payment request payload:", paymentRequest);

      const response = await fetch(
        `${baseUrl}/api/investigations/initiate-payment`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(paymentRequest),
        }
      );

      if (!response.ok) {
        let errorMessage = `HTTP error! status: ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage =
            errorData.message || errorData.exceptionMessage || errorMessage;
          console.error("Payment initiation error:", errorData);
        } catch (parseError) {
          console.error("Failed to parse error response:", parseError);
        }
        throw new Error(errorMessage);
      }

      const paymentData = await response.json();
      console.log("Payment response:", paymentData);

      // Remember which orders are pending payment verification
      setPendingPaidOrders(new Set(finalOrdersForPayment));

      // Open payment if authorization url provided
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
              if (verified) setPaymentLoading(false);
            }
            setPaymentLoading(false);
          }
        }, 1000);
      } else {
        // Fallback/mock flow
        const mockRef = paymentData.reference || "MOCK_REF_" + Date.now();
        const verified = await verifyPayment(mockRef);
        if (verified) toast.success("Payment completed successfully!");
      }
    } catch (error) {
      console.error("Payment initiation failed:", error);
      toast.error(`Failed to initiate payment: ${error.message}`);
    } finally {
      setPaymentLoading(false);
    }
  };

  // Send lab order for selected successful orders
//   const handleSendLabOrder = async () => {
//     if (!selectedLabPartner) {
//       toast.warning("Please select a lab partner");
//       return;
//     }

//     const selectedSuccessfulOrders = getSelectedSuccessfulOrders();
//     if (selectedSuccessfulOrders.length === 0) {
//       toast.warning("Please select paid orders that haven't been sent to lab yet");
//       return;
//     }

//     setLabOrderSending(true);
//     try {
//       const token = getToken();

//       // Send each selected successful order to the lab
//       for (const order of selectedSuccessfulOrders) {
//         await fetch(`${baseUrl}/api/investigations/send-to-lab`, {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//             Authorization: `Bearer ${token}`,
//           },
//           body: JSON.stringify({
//             orderId: order.orderId,
//             labPartner: selectedLabPartner.partner,
//             email: userEmail.trim(),
//           }),
//         });
//       }

//       // Mark orders as sent to lab
//       const newSentToLab = new Set(sentToLabOrders);
//       selectedSuccessfulOrders.forEach(order => {
//         newSentToLab.add(order.orderId.toString());
//       });
//       setSentToLabOrders(newSentToLab);

//       // Remove sent orders from selection
//       const newSelectedOrders = new Set(selectedOrders);
//       selectedSuccessfulOrders.forEach(order => {
//         newSelectedOrders.delete(order.orderId.toString());
//       });
//       setSelectedOrders(newSelectedOrders);

//       toast.success(
//         `${selectedSuccessfulOrders.length} order(s) sent to ${selectedLabPartner.name} successfully!`
//       );

//       // Reset the lab partner selection
//       setSelectedLabPartner(null);

//       // Refresh the orders to get updated status
//       await fetchInvestigations();
//     } catch (error) {
//       toast.error(`Failed to send lab order: ${error.message}`);
//     } finally {
//       setLabOrderSending(false);
//     }
//   };
// Send lab order for selected successful orders
const handleSendLabOrder = async () => {
  if (!selectedLabPartner) {
    toast.warning("Please select a lab partner");
    return;
  }

  const selectedSuccessfulOrders = getSelectedSuccessfulOrders();
  if (selectedSuccessfulOrders.length === 0) {
    toast.warning("Please select paid orders that haven't been sent to lab yet");
    return;
  }

  setLabOrderSending(true);
  try {
    const token = getToken();

    // Send each selected successful order to the lab using the correct endpoint
    for (const order of selectedSuccessfulOrders) {
      // Use query parameters as per API specification
      const queryParams = new URLSearchParams({
        orderId: order.orderId.toString(),
        labPartner: selectedLabPartner.partner
      });

      const response = await fetch(
        `${baseUrl}/api/investigations/investigations/select-lab?${queryParams}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Accept": "*/*"
          },
          // No body needed as per API spec
        }
      );

      if (!response.ok) {
        let errorMessage = `HTTP error! status: ${response.status}`;
        try {
          const errorText = await response.text();
          errorMessage = errorText || errorMessage;
          console.error("Lab order send error:", errorText);
        } catch (parseError) {
          console.error("Failed to parse error response:", parseError);
        }
        throw new Error(`Failed to send order ${order.orderId}: ${errorMessage}`);
      }

      // Log successful response
      const responseText = await response.text();
      console.log(`Order ${order.orderId} response:`, responseText);
    }

    // Mark orders as sent to lab
    const newSentToLab = new Set(sentToLabOrders);
    selectedSuccessfulOrders.forEach(order => {
      newSentToLab.add(order.orderId.toString());
    });
    setSentToLabOrders(newSentToLab);

    // Remove sent orders from selection
    const newSelectedOrders = new Set(selectedOrders);
    selectedSuccessfulOrders.forEach(order => {
      newSelectedOrders.delete(order.orderId.toString());
    });
    setSelectedOrders(newSelectedOrders);

    toast.success(
      `${selectedSuccessfulOrders.length} order(s) sent to ${selectedLabPartner.name} successfully!`
    );

    // Reset the lab partner selection
    setSelectedLabPartner(null);

    // Refresh the orders to get updated status
    await fetchInvestigations();
  } catch (error) {
    console.error("Lab order send failed:", error);
    toast.error(`Failed to send lab order: ${error.message}`);
  } finally {
    setLabOrderSending(false);
  }
};
  // Render
  return (
    <div className="investigations-component max-w-6xl mx-auto p-6">
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

      {/* Payment Controls Section */}
      {(selectedOrders.size > 0 ||
        paidInvestigations.size > 0 ||
        verifyingPayment ||
        getUnsentSuccessfulOrdersCount() > 0) && (
        <div className="mb-6 space-y-4">
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

          {/* Selected Orders for Payment Summary */}
          {getSelectedOrdersForPayment().size > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-blue-800">
                    Selected Orders for Payment
                  </h3>
                  <p className="text-sm text-blue-600">
                    {getSelectedOrdersForPayment().size} unpaid order(s) selected
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

          {/* Selected Orders for Lab Summary */}
          {getSelectedSuccessfulOrders().length > 0 && (
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <div className="bg-purple-500 p-2 rounded-full">
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
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-purple-800">
                    Selected Orders for Lab Partner
                  </h3>
                  <p className="text-sm text-purple-600">
                    {getSelectedSuccessfulOrders().length} paid order(s) selected to send to lab
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* All Successful Orders Summary */}
          {!investigationsLoading && getUnsentSuccessfulOrdersCount() > 0 && (
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
                    Total Orders Ready for Lab
                  </h3>
                  <p className="text-sm text-green-600">
                    {getUnsentSuccessfulOrdersCount()} paid order(s) available to send to lab partners
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Orders Sent to Lab Summary */}
          {!investigationsLoading && sentToLabOrders.size > 0 && (
            <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <div className="bg-indigo-500 p-2 rounded-full">
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
                      d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-indigo-800">
                    Orders Sent to Lab
                  </h3>
                  <p className="text-sm text-indigo-600">
                    {sentToLabOrders.size} order(s) have been sent to lab partners for processing
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Email Input for Payment */}
          {getSelectedOrdersForPayment().size > 0 && !verifyingPayment && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-orange-800 mb-2">
                Payment Information
              </h3>
              <p className="text-sm text-orange-700 mb-3">
                Confirm or update your email address for the payment receipt
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
                    readOnly
                  />
                  {user?.emailAddress && userEmail === user.emailAddress && (
                    <p className="text-xs text-orange-600 mt-1">
                      Using your account email address
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Select Lab Partner */}
          {getSelectedSuccessfulOrders().length > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-blue-800 mb-2">
                Select Lab Partner
              </h3>
              <p className="text-sm text-blue-700 mb-3">
                Choose a lab partner to send your selected successful orders to ({getSelectedSuccessfulOrders().length} orders selected)
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
            {getSelectedOrdersForPayment().size > 0 && !verifyingPayment && (
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

            {getSelectedSuccessfulOrders().length > 0 && !verifyingPayment && (
              <button
                onClick={handleSendLabOrder}
                disabled={labOrderSending || !selectedLabPartner}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
                    Send {getSelectedSuccessfulOrders().length} Selected Order(s) to{" "}
                    {selectedLabPartner?.name || "Lab"}
                  </>
                )}
              </button>
            )}

            {/* Orders Already Sent Button (Disabled) */}
            {!investigationsLoading &&
              sentToLabOrders.size > 0 &&
              getUnsentSuccessfulOrdersCount() === 0 &&
              getSuccessfulOrdersCount() > 0 &&
              getSelectedOrdersForPayment().size === 0 &&
              getSelectedSuccessfulOrders().length === 0 &&
              !verifyingPayment && (
                <button
                  disabled={true}
                  className="flex-1 px-4 py-3 bg-gray-400 text-white rounded-lg font-medium cursor-not-allowed flex items-center justify-center gap-2"
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
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  All Orders Sent to Lab
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
          {allInvestigationOrders.map((order) => {
            const idStr = order.orderId.toString();
            const isOrderSentToLab = sentToLabOrders.has(idStr);

            // Determine if order is blocked (any item duplicate or already paid)
            let orderHasDuplicate = false;
            let orderHasPaidItem = false;
            const blockedItemNames = [];

            for (let i = 0; i < (order.items?.length || 0); i++) {
              const itemKey = `${order.orderId}-${i}`;
              const item = order.items[i];
              const dup = isTestDoneWithinMonth(
                item.testName,
                order.orderId,
                i
              );
              if (dup.isDuplicate) {
                orderHasDuplicate = true;
                blockedItemNames.push(item.testName);
              }
              if (paidInvestigations.has(itemKey)) {
                orderHasPaidItem = true;
              }
            }

            const disabledSelect =
              (orderHasDuplicate && order.status !== "success") ||
              (orderHasPaidItem && order.status !== "success") ||
              order.status === "completed" ||
              (order.status === "success" && sentToLabOrders.has(idStr)); // Only prevent if already sent to lab

            return (
              <div
                key={order.orderId}
                className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 rounded-t-xl">
                  <div className="flex justify-between items-start flex-wrap gap-4">
                    <div className="flex items-center gap-4">
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={selectedOrders.has(idStr)}
                          disabled={
                            disabledSelect || paymentLoading || verifyingPayment
                          }
                          onChange={() => toggleOrderSelection(order.orderId)}
                          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2 disabled:opacity-50"
                        />
                        <div>
                          <h3 className="text-lg font-semibold text-gray-800">
                            Order #{order.orderId}
                          </h3>
                          <p className="text-sm text-gray-600">
                            Doctor: {order.doctorName}
                          </p>
                        </div>
                      </label>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500">
                        {formatDate(order.createdDate)}
                      </p>
                      <div className="w-[70px] flex flex-col gap-1 mt-1">
                        <span
                          className={`inline-block px-3 py-1 text-xs font-medium rounded-full ${
                            order.status === "pending"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-green-100 text-green-800"
                          }`}
                        >
                          {order.status.charAt(0).toUpperCase() +
                            order.status.slice(1)}
                        </span>
                        {isOrderSentToLab && (
                          <span className="inline-block px-1 py-1 text-xs font-medium rounded-full bg-indigo-100 text-indigo-800">
                            Sent to Lab
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  {order.status === "success" && !isOrderSentToLab && (
                    <p className="text-xs text-green-600 mt-2">
                      ✓ This order has been paid for successfully and is ready to be sent to a lab partner
                    </p>
                  )}
                  {order.status === "success" && isOrderSentToLab && (
                    <p className="text-xs text-indigo-600 mt-2">
                      ✓ This order has been sent to a lab partner for processing
                    </p>
                  )}
                  {disabledSelect && orderHasDuplicate && order.status !== "success" && (
                    <p className="text-xs text-red-600 mt-2">
                      Blocked for payment: {blockedItemNames.join(", ")}
                    </p>
                  )}
                </div>

                <div className="p-6">
                  <div className="space-y-3">
                    {order.items?.map((item, itemIndex) => {
                      const key = `${order.orderId}-${itemIndex}`;
                      const isPaid = paidInvestigations.has(key);
                      const isOrderSuccessful = order.status === "success";
                      const dup = isTestDoneWithinMonth(
                        item.testName,
                        order.orderId,
                        itemIndex
                      );

                      return (
                        <div
                          key={itemIndex}
                          className={`flex items-center justify-between p-4 border-2 rounded-lg transition-all ${
                            isPaid || isOrderSuccessful
                              ? "bg-green-50 border-green-200"
                              : dup.isDuplicate
                              ? "bg-red-50 border-red-200 opacity-75"
                              : "bg-gray-50 border-gray-200 hover:border-gray-300"
                          }`}
                        >
                          <div>
                            <h4
                              className={`font-medium mb-1 ${
                                dup.isDuplicate
                                  ? "text-red-700"
                                  : isOrderSuccessful
                                  ? "text-green-700"
                                  : "text-gray-800"
                              }`}
                            >
                              {item.testName}
                              {dup.isDuplicate && (
                                <span className="ml-2 text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full">
                                  Recently Done
                                </span>
                              )}
                            </h4>
                            <p
                              className={`text-sm ${
                                dup.isDuplicate
                                  ? "text-red-600"
                                  : isOrderSuccessful
                                  ? "text-green-600"
                                  : "text-gray-600"
                              }`}
                            >
                              {item.instruction}
                            </p>
                            {dup.isDuplicate && (
                              <p className="text-xs text-red-600 mt-1">
                                Last done:{" "}
                                {Math.ceil(
                                  (new Date() - dup.lastDoneDate) /
                                    (1000 * 60 * 60 * 24)
                                )}{" "}
                                days ago (Order #{dup.orderId}). Available in{" "}
                                {30 -
                                  Math.ceil(
                                    (new Date() - dup.lastDoneDate) /
                                      (1000 * 60 * 60 * 24)
                                  )}{" "}
                                days.
                              </p>
                            )}
                          </div>

                          <div className="flex items-center gap-3 ml-4">
                            <span
                              className={`text-lg font-semibold ${
                                dup.isDuplicate
                                  ? "text-red-600"
                                  : "text-green-600"
                              }`}
                            >
                              ₦{item.price?.toLocaleString()}
                            </span>
                            {(isPaid || isOrderSuccessful) && (
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
                            {dup.isDuplicate && (
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
                            {isOrderSentToLab && (
                              <div className="flex items-center gap-1 text-indigo-600 bg-indigo-100 px-2 py-1 rounded-full text-xs font-medium">
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
                                    d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                                  />
                                </svg>
                                SENT TO LAB
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

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
            );
          })}

          <div className="mt-8 bg-white rounded-xl p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Summary
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {allInvestigationOrders.length}
                </div>
                <div className="text-sm text-gray-600">Total Orders</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {getSuccessfulOrdersCount()}
                </div>
                <div className="text-sm text-gray-600">Successful Orders</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-indigo-600">
                  {sentToLabOrders.size}
                </div>
                <div className="text-sm text-gray-600">Orders Sent to Lab</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
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