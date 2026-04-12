import { useState, useEffect } from "react";
import {
  formatDate,
  getId,
  getToken,
  getUserData,
  getPatientPartnerSlug,
} from "../utils";
import { usePartnerLocations } from "../context/PartnerLocationsContext";
import { Hourglass } from "react-loader-spinner";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { baseUrl } from "../env";

const FIRST_CARE_HOSPITAL_SLUG = "first-care-hospital";

const Investigations = () => {
  const patientId = getId();
  const user = getUserData();
  const {
    labPartners,
    apiLabs,
    locationsLoading: partnerLocationsLoading,
    labsError,
    networkError: partnerLocationsNetworkError,
    setSelectedLabCode,
  } = usePartnerLocations();

  /** Slug from signup/login storage + user object; API may omit partnerSlug on user. */
  const partnerSlugNorm = String(getPatientPartnerSlug() || "")
    .toLowerCase()
    .trim();
  /** Backend returns FIRST_CARE_* lab codes for this partner — use as fallback when slug missing on user. */
  const firstCareLabsFromPartnerApi =
    Array.isArray(apiLabs) &&
    apiLabs.length > 0 &&
    apiLabs.some((row) =>
      String(row?.code ?? "")
        .toUpperCase()
        .startsWith("FIRST_CARE_")
    );
  const isFirstCareHospitalPartner =
    partnerSlugNorm === FIRST_CARE_HOSPITAL_SLUG || firstCareLabsFromPartnerApi;

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
  const [sentToLabOrders, setSentToLabOrders] = useState(new Set());

  // 🔹 Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const ordersPerPage = 10;

  const getSuccessfulOrders = () => {
    return allInvestigationOrders.filter((order) => order.status === "success");
  };

  const getSuccessfulOrdersCount = () => {
    return getSuccessfulOrders().length;
  };

  const getUnsentSuccessfulOrders = () => {
    return getSuccessfulOrders().filter(
      (order) => !sentToLabOrders.has(order.orderId.toString())
    );
  };

  const getUnsentSuccessfulOrdersCount = () => {
    return getUnsentSuccessfulOrders().length;
  };

  useEffect(() => {
    if (user?.emailAddress && !userEmail) {
      setUserEmail(user.emailAddress);
    }
  }, [user, userEmail]);

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

      const savedSentOrders = new Set();
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

  const toggleOrderSelection = (orderId) => {
    const idStr = orderId.toString();
    const order = allInvestigationOrders.find(
      (o) => o.orderId.toString() === idStr
    );
    if (!order) return;

    if (order.status === "success" && sentToLabOrders.has(idStr)) {
      toast.info(
        `Order #${order.orderId} has already been sent to the lab partner.`
      );
      return;
    }

    if (order.status !== "success") {
      const blockedItems = [];
      for (let i = 0; i < (order.items?.length || 0); i++) {
        const itemKey = `${order.orderId}-${i}`;
        if (paidInvestigations.has(itemKey) || order.status === "completed") {
          blockedItems.push(order.items[i].testName);
        }
      }

      if (blockedItems.length > 0) {
        const names = blockedItems.join(", ");
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

  const getSelectedOrdersForPayment = () => {
    const ordersForPayment = new Set();
    if (isFirstCareHospitalPartner) return ordersForPayment;
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

  /** Orders selected that are allowed to be sent to a lab (paid success for others; First Care = any non-completed, not yet sent). */
  const getSelectedLabReadyOrders = () => {
    const list = [];
    selectedOrders.forEach((idStr) => {
      const order = allInvestigationOrders.find(
        (o) => o.orderId.toString() === idStr
      );
      if (!order || sentToLabOrders.has(idStr)) return;
      if (isFirstCareHospitalPartner) {
        if (order.status !== "completed" && !order.sentToLab) {
          list.push(order);
        }
      } else if (order.status === "success") {
        list.push(order);
      }
    });
    return list;
  };

  const getUnsentLabReadyOrdersCount = () => {
    if (isFirstCareHospitalPartner) {
      return allInvestigationOrders.filter(
        (order) =>
          order.status !== "completed" &&
          !order.sentToLab &&
          !sentToLabOrders.has(order.orderId.toString())
      ).length;
    }
    return getUnsentSuccessfulOrdersCount();
  };

  // Add this state to your component

  const verifyPayment = async (reference) => {
    try {
      setVerifyingPayment(true);
      const token = getToken();

      const cleanBaseUrl = baseUrl.replace(/\/+$/, "");
      const encodedReference = encodeURIComponent(reference);
      const verificationUrl = `${cleanBaseUrl}/api/investigations/verify-payment?reference=${encodedReference}`;

      const response = await fetch(verificationUrl, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      // Check if the response URL indicates success
      // This handles the case where backend redirects successful payments
      if (
        response.url.includes("paymentStatus=success") &&
        response.url.includes(reference)
      ) {

        // Mark orders as paid
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
        setSelectedOrders(new Set());
        setPendingPaidOrders(new Set());

        await fetchInvestigations();

        toast.success(
          "Payment verified successfully! Please select a lab partner."
        );
        return true;
      }

      // Try to get response text/JSON
      const responseText = await response.text();

      // If response is HTML, it means we got redirected to frontend
      if (responseText.includes("<!DOCTYPE html>")) {
        return false;
      }

      // Try to parse as JSON
      try {
        const verificationResult = JSON.parse(responseText);

        if (
          verificationResult.status === "success" ||
          verificationResult.verified === true ||
          verificationResult.data?.status === "success"
        ) {
          // Mark orders as paid
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
          setSelectedOrders(new Set());
          setPendingPaidOrders(new Set());

          await fetchInvestigations();

          toast.success(
            "Payment verified successfully! Please select a lab partner."
          );
          return true;
        } else {
          toast.error(
            `Payment verification failed: ${
              verificationResult.message || "Payment not successful"
            }`
          );
          return false;
        }
      } catch (parseError) {
        toast.error("Payment verification failed - invalid response format");
        return false;
      }
    } catch (error) {
      toast.error(`Failed to verify payment: ${error.message}`);
      return false;
    } finally {
      setVerifyingPayment(false);
    }
  };

  const handleInitiatePayment = async (orderId) => {
    const idStr = orderId.toString();
    const order = allInvestigationOrders.find(
      (o) => o.orderId.toString() === idStr
    );
    if (!order) {
      toast.warning("Invalid order selected");
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

    for (let i = 0; i < (order.items?.length || 0); i++) {
      const itemKey = `${order.orderId}-${i}`;
      if (paidInvestigations.has(itemKey) || order.status === "completed") {
        toast.error(
          `Order #${order.orderId} contains ${order.items[i].testName} which is already paid.`,
          { autoClose: 7000 }
        );
        return;
      }
    }

    setPaymentLoading(true);
    try {
      const token = getToken();
      const paymentRequest = {
        orderId: order.orderId,
        email: userEmail.trim(),
      };

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
        } catch (parseError) {
          // console.error("Failed to parse error response:", parseError);
        }
        throw new Error(errorMessage);
      }

      const paymentData = await response.json();
      setPendingPaidOrders(new Set([idStr]));

      if (paymentData.authorizationUrl || paymentData.authorization_url) {
        // Redirect to payment page in the same window
        const paymentUrl =
          paymentData.authorizationUrl || paymentData.authorization_url;

        // Store the reference for verification when user returns
        const reference = paymentData.reference || paymentData.access_code;
        if (reference) {
          // Store reference in sessionStorage to verify payment when user returns
          sessionStorage.setItem("pendingPaymentReference", reference);
          sessionStorage.setItem("pendingOrderId", idStr);
        }

        // Redirect to payment page
        window.location.href = paymentUrl;
      } else {
        // Handle mock payment or direct verification
        const mockRef = paymentData.reference || "MOCK_REF_" + Date.now();
        const verified = await verifyPayment(mockRef);
        if (verified) toast.success("Payment completed successfully!");
      }
    } catch (error) {
      toast.error(`Failed to initiate payment: ${error.message}`);
    } finally {
      setPaymentLoading(false);
    }
  };

  // Check for returning payment verification on component mount
  useEffect(() => {
    const checkPaymentReturn = async () => {
      const reference = sessionStorage.getItem("pendingPaymentReference");
      const orderIdStr = sessionStorage.getItem("pendingOrderId");

      if (reference && orderIdStr) {
        // Clear stored values
        sessionStorage.removeItem("pendingPaymentReference");
        sessionStorage.removeItem("pendingOrderId");

        // Set pending order for verification
        setPendingPaidOrders(new Set([orderIdStr]));

        // Verify payment
        toast.info("Verifying your payment...");
        await verifyPayment(reference);
      }
    };

    // Only check on initial load, not on every patientId change
    if (patientId && !investigationsLoading) {
      checkPaymentReturn();
    }
  }, [patientId, investigationsLoading]);

  const handleSendLabOrder = async (orderId) => {
    if (!selectedLabPartner) {
      toast.warning("Please select a lab partner");
      return;
    }

    const order = allInvestigationOrders.find(
      (o) => o.orderId.toString() === orderId.toString()
    );
    const idKey = orderId.toString();
    if (!order || sentToLabOrders.has(idKey)) {
      toast.warning(
        "Please select an order that hasn't been sent to the lab yet"
      );
      return;
    }
    if (isFirstCareHospitalPartner) {
      if (order.status === "completed" || order.sentToLab) {
        toast.warning(
          "This order cannot be sent to the lab in its current state"
        );
        return;
      }
    } else if (order.status !== "success") {
      toast.warning(
        "Please select a valid paid order that hasn't been sent to lab yet"
      );
      return;
    }

    setLabOrderSending(true);
    try {
      const token = getToken();
      // Must match OpenAPI: POST /api/investigations/select-lab?orderId=&labPartner= (not .../investigations/investigations/...)
      const queryParams = new URLSearchParams({
        orderId: order.orderId.toString(),
        labPartner: selectedLabPartner.partner,
      });

      const response = await fetch(
        `${baseUrl}/api/investigations/select-lab?${queryParams}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "*/*",
          },
        }
      );

      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}`;
        try {
          const errorText = await response.text();
          if (errorText) {
            try {
              const j = JSON.parse(errorText);
              errorMessage =
                j.message ||
                j.error ||
                j.exceptionMessage ||
                j.detail ||
                (typeof j === "string" ? j : errorText);
            } catch {
              errorMessage = errorText.slice(0, 400);
            }
          }
        } catch {
          /* keep status message */
        }
        throw new Error(
          `Failed to send order ${order.orderId}: ${errorMessage}`
        );
      }

      const responseText = await response.text();
      console.log(`Order ${order.orderId} response:`, responseText);

      const newSentToLab = new Set(sentToLabOrders);
      newSentToLab.add(order.orderId.toString());
      setSentToLabOrders(newSentToLab);

      const newSelectedOrders = new Set(selectedOrders);
      newSelectedOrders.delete(order.orderId.toString());
      setSelectedOrders(newSelectedOrders);

      toast.success(
        `Order #${order.orderId} sent to ${selectedLabPartner.name} successfully!`
      );

      setSelectedLabPartner(null);
      await fetchInvestigations();
    } catch (error) {
      toast.error(`Failed to send lab order: ${error.message}`);
    } finally {
      setLabOrderSending(false);
    }
  };

  const getOrdersSentToLabCount = () => {
    return allInvestigationOrders.filter((order) => order.sentToLab).length;
  };

  // Get paginated slice
  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = allInvestigationOrders.slice(
    indexOfFirstOrder,
    indexOfLastOrder
  );

  const totalPages = Math.ceil(allInvestigationOrders.length / ordersPerPage);

  // Reset to page 1 whenever new data arrives
  useEffect(() => {
    setCurrentPage(1);
  }, [allInvestigationOrders]);

  return (
    <div className="investigations-component max-w-6xl mx-auto md:p-6">
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

      <div className="mt-8 bg-white rounded-xl p-6 border border-gray-200 mb-4">
        <h3 className="text-lg text-center lg:text-start font-semibold text-gray-800 mb-4">
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
              {getOrdersSentToLabCount()}
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

      {(selectedOrders.size > 0 ||
        paidInvestigations.size > 0 ||
        verifyingPayment ||
        getUnsentLabReadyOrdersCount() > 0) && (
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

          {!isFirstCareHospitalPartner &&
            getSelectedOrdersForPayment().size > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-blue-800">
                    Selected Orders for Payment
                  </h3>
                  <p className="text-sm text-blue-600">
                    {getSelectedOrdersForPayment().size} unpaid order(s)
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

          {getSelectedLabReadyOrders().length > 0 && (
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
                    {getSelectedLabReadyOrders().length} order(s) selected to
                    send to lab
                    {isFirstCareHospitalPartner
                      ? " (no upfront payment required)"
                      : " — paid order(s)"}
                  </p>
                </div>
              </div>
            </div>
          )}

          {!investigationsLoading && getUnsentLabReadyOrdersCount() > 0 && (
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
                    {getUnsentLabReadyOrdersCount()}{" "}
                    {isFirstCareHospitalPartner
                      ? "order(s) available to send to lab partners (no upfront payment)"
                      : "paid order(s) available to send to lab partners"}
                  </p>
                </div>
              </div>
            </div>
          )}

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
                    {sentToLabOrders.size} order(s) have been sent to lab
                    partners for processing
                  </p>
                </div>
              </div>
            </div>
          )}

          {!isFirstCareHospitalPartner &&
            getSelectedOrdersForPayment().size > 0 &&
            !verifyingPayment && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-orange-800 mb-2">
                Payment Information
              </h3>
              <p className="text-sm text-orange-700 mb-3">
                Payment receipt will be sent to your email address.
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
        </div>
      )}

      {investigationsLoading ? (
        <div className="flex items-center justify-center py-12 bg-white rounded-b-2xl">
          <Hourglass
            visible={true}
            height="30"
            width="30"
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
          {currentOrders.map((order) => {
            const idStr = order.orderId.toString();
            const isOrderSentToLab = sentToLabOrders.has(idStr);

            let orderHasPaidItem = false;
            const blockedItemNames = [];

            for (let i = 0; i < (order.items?.length || 0); i++) {
              const itemKey = `${order.orderId}-${i}`;
              if (paidInvestigations.has(itemKey)) {
                orderHasPaidItem = true;
                blockedItemNames.push(order.items[i].testName);
              }
            }

            const disabledSelect =
              (orderHasPaidItem && order.status !== "success") ||
              order.status === "completed" ||
              (order.status === "success" &&
                (isOrderSentToLab || order.sentToLab)) ||
              (isFirstCareHospitalPartner &&
                (order.sentToLab || isOrderSentToLab));

            const isSelected = selectedOrders.has(idStr);
            const canPay =
              !isFirstCareHospitalPartner &&
              isSelected &&
              order.status !== "success" &&
              !orderHasPaidItem &&
              !paymentLoading &&
              !verifyingPayment;
            const canSendToLab =
              isSelected &&
              !isOrderSentToLab &&
              !verifyingPayment &&
              (isFirstCareHospitalPartner
                ? order.status !== "completed" && !order.sentToLab
                : order.status === "success");

            return (
              <div
                key={order.orderId}
                className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="bg-gray-50 px-4 md:px-6 py-4 border-b border-gray-200 rounded-t-xl">
                  <div className="flex justify-between items-start flex-wrap gap-4">
                    <div className="flex w-[200px] md:w-full items-center gap-4">
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
                      <div className=" flex flex-col gap-1 mt-1">
                        <span
                          className={`inline-block px-3 py-1 text-xs text-center font-medium rounded-full ${
                            order.status === "pending"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-green-100 text-green-800"
                          }`}
                        >
                          {order.status.charAt(0).toUpperCase() +
                            order.status.slice(1)}
                        </span>
                        <span
                          className={`w-full inline-flex items-center px-2 py-1 text-xs font-medium rounded-full 
            ${
              order.sentToLab
                ? "bg-green-100 text-green-700"
                : "bg-yellow-100 text-yellow-700"
            }`}
                        >
                          {order.sentToLab
                            ? "Order Sent to Lab"
                            : "Order Not Sent Yet"}
                        </span>
                        {isOrderSentToLab && (
                          <span className="inline-block px-1 py-1 text-xs font-medium rounded-full bg-indigo-100 text-indigo-800">
                            Sent to Lab
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  {order.status === "success" &&
                    !isOrderSentToLab &&
                    !isFirstCareHospitalPartner && (
                      <p className="text-xs text-green-600 mt-2">
                        ✓ This order has been paid for successfully and is ready
                        to be sent to a lab partner
                      </p>
                    )}
                  {isFirstCareHospitalPartner &&
                    order.status !== "completed" &&
                    !order.sentToLab &&
                    !isOrderSentToLab && (
                      <p className="text-xs text-teal-700 mt-2">
                        ✓ No upfront payment — select a lab partner and send
                        this order when you are ready.
                      </p>
                    )}
                  {order.status === "success" && isOrderSentToLab && (
                    <p className="text-xs text-indigo-600 mt-2">
                      ✓ This order has been sent to a lab partner for processing
                    </p>
                  )}
                  {disabledSelect &&
                    orderHasPaidItem &&
                    order.status !== "success" && (
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
                      const firstCareSentToLab =
                        isFirstCareHospitalPartner &&
                        (isOrderSentToLab || order.sentToLab);
                      const showPaidBadge =
                        !isFirstCareHospitalPartner &&
                        (isPaid || isOrderSuccessful);
                      const rowCompleteStyling =
                        (!isFirstCareHospitalPartner &&
                          (isPaid || isOrderSuccessful)) ||
                        firstCareSentToLab;
                      const titleSuccessStyling =
                        (!isFirstCareHospitalPartner && isOrderSuccessful) ||
                        firstCareSentToLab;

                      return (
                        <div
                          key={itemIndex}
                          className={`flex items-center justify-between p-4 border-2 rounded-lg transition-all ${
                            rowCompleteStyling
                              ? "bg-green-50 border-green-200"
                              : "bg-gray-50 border-gray-200 hover:border-gray-300"
                          }`}
                        >
                          <div>
                            <h4
                              className={`font-medium mb-1 ${
                                titleSuccessStyling
                                  ? "text-green-700"
                                  : "text-gray-800"
                              }`}
                            >
                              {item.testName}
                            </h4>
                            <p
                              className={`text-sm ${
                                titleSuccessStyling
                                  ? "text-green-600"
                                  : "text-gray-600"
                              }`}
                            >
                              {item.instruction}
                            </p>
                          </div>

                          <div className="flex items-center gap-3 ml-4">
                            <span className="text-lg font-semibold text-green-600">
                              ₦{item.price?.toLocaleString()}
                            </span>
                            {showPaidBadge && (
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
                            {firstCareSentToLab && (
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
                                SENT
                              </div>
                            )}
                            {isOrderSentToLab && !isFirstCareHospitalPartner && (
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

                    {isSelected && (canPay || canSendToLab) && (
                      <div className="mt-4 space-y-4">
                        {canSendToLab && (
                          <div>
                            <h3 className="text-sm font-medium text-blue-800 mb-2">
                              Select Lab Partner
                            </h3>
                            <select
                              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              disabled={partnerLocationsLoading}
                              onChange={(e) => {
                                const lab = labPartners.find(
                                  (p) => p.id === e.target.value
                                );
                                setSelectedLabPartner(lab || null);
                                setSelectedLabCode(lab?.partner ?? null);
                              }}
                              value={selectedLabPartner?.id || ""}
                            >
                              <option value="">
                                {partnerLocationsLoading
                                  ? "Loading labs…"
                                  : "Choose a lab..."}
                              </option>
                              {labPartners.map((lab) => (
                                <option key={lab.id} value={lab.id}>
                                  {lab.name}
                                </option>
                              ))}
                            </select>
                            {labsError && labPartners.length === 0 && (
                              <p className="mt-2 text-sm text-red-600">
                                {labsError}
                              </p>
                            )}
                            {partnerLocationsNetworkError &&
                              !partnerLocationsLoading &&
                              labPartners.length > 0 && (
                                <p className="mt-2 text-xs text-amber-700">
                                  Partner lab list could not be refreshed;
                                  showing default options.
                                </p>
                              )}
                          </div>
                        )}

                        <div className="flex gap-4">
                          {canPay && (
                            <button
                              onClick={() =>
                                handleInitiatePayment(order.orderId)
                              }
                              disabled={
                                paymentLoading ||
                                labOrderSending ||
                                !userEmail.trim()
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
                                  Pay ₦{order.totalCost?.toLocaleString()}
                                </>
                              )}
                            </button>
                          )}

                          {canSendToLab && (
                            <button
                              onClick={() => handleSendLabOrder(order.orderId)}
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
                                  Send Order to{" "}
                                  {selectedLabPartner?.name || "Lab"}
                                </>
                              )}
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* --- PAGINATION CONTROLS --- */}
      <div className="flex justify-center items-center gap-3 mt-6">
        <button
          onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
          disabled={currentPage === 1}
          className="px-4 py-2 bg-gray-100 rounded-lg disabled:opacity-50"
        >
          Prev
        </button>
        <span className="text-gray-700">
          Page {currentPage} of {totalPages}
        </span>
        <button
          onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
          disabled={currentPage === totalPages}
          className="px-4 py-2 bg-gray-100 rounded-lg disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default Investigations;
