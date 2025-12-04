import React, { useEffect } from "react";
import { getToken, getUserData, getId } from "../utils";
import { baseUrl } from "../env";
import { Hourglass } from "react-loader-spinner";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  Slide,
  Box,
  Typography,
} from "@mui/material";
import axios from "axios";
import { Link } from "react-router-dom";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import LockIcon from "@mui/icons-material/Lock";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import CardMembershipIcon from "@mui/icons-material/CardMembership";

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const Subscription = () => {
  const [paymentLink, setPaymentLink] = React.useState(null);
  const [open, setOpen] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [subscriptionData, setSubscriptionData] = React.useState([]);
  const [subscriptionLoading, setSubscriptionLoading] = React.useState(true);
  const [plans, setPlans] = React.useState([]);
  const [plansLoading, setPlansLoading] = React.useState(true);
  const token = getToken();
  const user = getUserData();

  const handleClose = () => {
    setOpen(false);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Helper function to generate content descriptions based on plan
  const getPlanContent = (planName, consultationCount) => {
    const name = planName.toLowerCase();

    if (name.includes("instant")) {
      return [
        "One-time consultation for immediate advice",
        "Access to certified doctors",
        "Available 24/7",
      ];
    } else if (name.includes("monthly")) {
      return [
        `Up to ${consultationCount} consultations per month`,
        "Ongoing health support",
        "Available 24/7",
      ];
    } else if (name.includes("yearly")) {
      return [
        `Up to ${consultationCount} consultations per year`,
        "Expert care anytime",
        "Priority support",
      ];
    } else if (name.includes("specialist") && name.includes("single")) {
      return [
        "Video call with a licensed professional",
        "One-time consultation",
        "Fast and easy booking",
        "Confidential and secure sessions",
      ];
    } else if (name.includes("ent") || name.includes("ear nose throat")) {
      return [
        "One-off consultation with an ENT doctor.",
        "Video consultation with experienced specialists.",
        "Diagnosis and management of ear, nose, and throat conditions.",
        "Personalized treatment plans for your specific needs.",
        "Follow-up reviews to track recovery and progress.",
        "Referral support for advanced care or surgery if needed.",
      ];
    } else {
      return [
        `${consultationCount} consultation${
          consultationCount > 1 ? "s" : ""
        } included`,
        "Access to certified doctors",
        "Available 24/7",
      ];
    }
  };

  const fetchPlans = async () => {
    const currentToken = getToken();
    const currentUserId = getId();

    if (!currentToken || !currentUserId) {
      setPlansLoading(false);
      return;
    }

    try {
      const response = await axios.get(
        `${baseUrl}/api/subscription/get-plans-for-user?userId=${currentUserId}`,
        {
          headers: {
            Authorization: `Bearer ${currentToken}`,
          },
        }
      );

      if (response.data && Array.isArray(response.data)) {
        // Map API response to component format
        const mappedPlans = response.data.map((plan) => ({
          id: plan.id,
          title: plan.name,
          subTitle: plan.price,
          content: getPlanContent(plan.name, plan.consultationCount),
          buttonText: "Subscribe",
          buttonLink: "/payment",
          consultationCount: plan.consultationCount,
        }));
        setPlans(mappedPlans);
      } else {
        setPlans([]);
      }
    } catch (error) {
      console.error("Error fetching subscription plans:", error);
      setPlans([]);
    } finally {
      setPlansLoading(false);
    }
  };

  const fetchActiveSubscription = async () => {
    const currentUserId = getId();
    const currentToken = getToken();

    if (!currentUserId || !currentToken) {
      setSubscriptionLoading(false);
      return;
    }

    try {
      const response = await axios.get(
        `${baseUrl}/api/subscription/active/${currentUserId}`,
        {
          headers: {
            Authorization: `Bearer ${currentToken}`,
          },
        }
      );

      if (response.data && Array.isArray(response.data)) {
        // Filter only active subscriptions
        const activeSubscriptions = response.data.filter(
          (sub) => sub.active === true
        );
        setSubscriptionData(activeSubscriptions);
      } else {
        setSubscriptionData([]);
      }
    } catch (error) {
      console.error("Error fetching active subscription:", error);
      setSubscriptionData([]);
    } finally {
      setSubscriptionLoading(false);
    }
  };

  useEffect(() => {
    fetchActiveSubscription();
    fetchPlans();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubscription = async (e, amount) => {
    e.preventDefault();
    setIsLoading(true);
    const dataToSend = {
      amount,
      email: user?.emailAddress,
    };

    try {
      const response = await axios.post(
        `${baseUrl}/api/payment/initialize`,
        dataToSend,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const result = response.data;

      if (result) {
        console.log("Payment link response:", result);
        setPaymentLink(result.authorizationUrl); // 👈 set only the URL string
        setOpen(true);
      } else {
        console.error("Payment URL not found in response:", result);
      }
    } catch (error) {
      console.error("Error initializing payment:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatPriceWithCommas = (price) => {
    return new Intl.NumberFormat('en-NG', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(price);
  };

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 overflow-x-hidden">
      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 flex items-center justify-center bg-white bg-opacity-75 backdrop-blur-sm z-50">
          <div className="flex flex-col items-center">
            <Hourglass
              visible={true}
              height="50"
              width="50"
              ariaLabel="hourglass-loading"
              colors={["#306cce", "#72a1ed"]}
            />
            <p className="mt-4 text-gray-600 font-medium">Processing...</p>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Active Subscription Section */}
        {subscriptionLoading ? (
          <div className="w-full mb-8 sm:mb-12 p-6 sm:p-8 bg-white rounded-2xl shadow-lg border border-gray-100">
            <div className="flex items-center justify-center py-8">
              <Hourglass
                visible={true}
                height="30"
                width="30"
                ariaLabel="hourglass-loading"
                colors={["#306cce", "#72a1ed"]}
              />
              <span className="ml-3 text-gray-600 font-medium">
                Loading subscription details...
              </span>
            </div>
          </div>
        ) : subscriptionData && subscriptionData.length > 0 ? (
          <div className="w-full mb-8 sm:mb-12">
            <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 rounded-2xl shadow-xl p-6 sm:p-8 mb-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
                <div className="flex items-center mb-4 sm:mb-0">
                  <div className="bg-white/20 p-3 rounded-xl mr-4">
                    <CardMembershipIcon
                      sx={{ fontSize: 32, color: "#ffffff" }}
                    />
                  </div>
                  <div>
                    <h2 className="text-2xl sm:text-3xl font-bold text-white">
                      Your Active Subscriptions
                    </h2>
                    {subscriptionData.length > 1 && (
                      <p className="text-blue-100 text-sm sm:text-base mt-1">
                        {subscriptionData.length} active plans
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Total Consultations Summary */}
              {subscriptionData.length > 1 && (
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-white/20">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center mb-3 sm:mb-0">
                      <AccountBalanceWalletIcon
                        sx={{ fontSize: 28, color: "#FFD700", mr: 2 }}
                      />
                      <span className="text-lg sm:text-xl font-semibold text-white">
                        Total Consultations Available
                      </span>
                    </div>
                    <div className="bg-white rounded-lg px-6 py-3">
                      <span className="text-3xl sm:text-4xl font-bold text-blue-700">
                        {subscriptionData.reduce(
                          (total, sub) => total + (sub.consultationsLeft || 0),
                          0
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Individual Subscription Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              {subscriptionData.map((subscription, index) => (
                <div
                  key={index}
                  className="bg-white rounded-xl p-5 sm:p-6 shadow-md border border-gray-200 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                >
                  <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-200">
                    <div className="flex items-center">
                      <div className="bg-green-100 p-2 rounded-lg mr-3">
                        <CardMembershipIcon
                          sx={{ fontSize: 24, color: "#4CAF50" }}
                        />
                      </div>
                      <div>
                        <span className="text-xs text-gray-500 font-medium uppercase tracking-wide">
                          Plan
                        </span>
                        <p className="text-lg sm:text-xl font-bold text-gray-900 mt-1">
                          {subscription.planName}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="bg-orange-50 rounded-lg p-3">
                      <div className="flex items-center mb-2">
                        <AccountBalanceWalletIcon
                          sx={{ fontSize: 20, color: "#FF9800", mr: 1.5 }}
                        />
                        <span className="text-xs text-gray-600 font-semibold uppercase tracking-wide">
                          Consultations Left
                        </span>
                      </div>
                      <p className="text-2xl font-bold text-gray-900 ml-8">
                        {subscription.consultationsLeft}
                      </p>
                    </div>

                    <div className="bg-blue-50 rounded-lg p-3">
                      <div className="flex items-center mb-2">
                        <CalendarTodayIcon
                          sx={{ fontSize: 20, color: "#2196F3", mr: 1.5 }}
                        />
                        <span className="text-xs text-gray-600 font-semibold uppercase tracking-wide">
                          Expiry Date
                        </span>
                      </div>
                      <p className="text-sm font-semibold text-gray-700 ml-8">
                        {formatDate(subscription.expirationDate)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {/* Plans Section Header */}
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 mb-3 sm:mb-4">
            Choose Your Plan
          </h1>
          <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto px-4">
            Select the subscription plan that best fits your healthcare needs. 
            All plans include access to certified medical professionals.
          </p>
        </div>

        {/* Plans Loading State */}
        {plansLoading ? (
          <div className="w-full flex items-center justify-center py-16 sm:py-20">
            <div className="flex flex-col items-center">
              <Hourglass
                visible={true}
                height="50"
                width="50"
                ariaLabel="hourglass-loading"
                colors={["#306cce", "#72a1ed"]}
              />
              <span className="ml-0 mt-4 text-gray-600 font-medium">
                Loading subscription plans...
              </span>
            </div>
          </div>
        ) : plans.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 sm:gap-8 mb-12">
            {plans.map((plan, index) => {
              const isPopular = plan.title.toLowerCase().includes('monthly') || 
                               plan.title.toLowerCase().includes('yearly');
              return (
                <div
                  key={plan.id || index}
                  className={`relative flex flex-col bg-white rounded-2xl shadow-lg border-2 transition-all duration-300 transform hover:-translate-y-2 hover:shadow-2xl ${
                    isPopular 
                      ? 'border-blue-500 scale-105 md:scale-100' 
                      : 'border-gray-200 hover:border-blue-300'
                  }`}
                >
                  {isPopular && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <span className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-lg">
                        POPULAR
                      </span>
                    </div>
                  )}
                  
                  <div className="p-6 sm:p-8">
                    {/* Plan Header */}
                    <div className="mb-6">
                      <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                        {plan.title}
                      </h3>
                      <div className="flex items-baseline">
                        <span className="text-4xl sm:text-5xl font-extrabold text-[#020E7C]">
                          ₦{formatPriceWithCommas(plan.subTitle)}
                        </span>
                      </div>
                      {plan.consultationCount && (
                        <p className="text-sm text-gray-500 mt-2">
                          {plan.consultationCount} consultation{plan.consultationCount > 1 ? 's' : ''} included
                        </p>
                      )}
                    </div>

                    {/* Subscribe Button */}
                    <button
                      className={`w-full py-3.5 px-6 rounded-xl font-semibold text-white transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 ${
                        isPopular
                          ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700'
                          : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700'
                      }`}
                      onClick={(e) => handleSubscription(e, plan.subTitle)}
                    >
                      Subscribe Now
                    </button>

                    {/* Divider */}
                    <div className="my-6 border-t border-gray-200"></div>

                    {/* Features List */}
                    <div className="space-y-4">
                      <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">
                        What&apos;s Included
                      </h4>
                      <ul className="space-y-3">
                        {plan.content.map((content, idx) => (
                          <li key={idx} className="flex items-start">
                            <CheckCircleIcon 
                              className="text-green-500 mr-3 mt-0.5 flex-shrink-0" 
                              sx={{ fontSize: 20 }}
                            />
                            <span className="text-sm sm:text-base text-gray-700 leading-relaxed">
                              {content}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="w-full bg-white rounded-2xl shadow-lg p-12 text-center">
            <CardMembershipIcon sx={{ fontSize: 64, color: "#9CA3AF", mb: 3 }} />
            <p className="text-lg text-gray-600 font-medium">
              No subscription plans available at the moment.
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Please check back later or contact support.
            </p>
          </div>
        )}
      </div>
      <Dialog
        open={open}
        TransitionComponent={Transition}
        keepMounted
        onClose={handleClose}
        aria-describedby="payment-dialog"
        maxWidth="sm"
        fullWidth
        sx={{
          "& .MuiDialog-paper": {
            background: "linear-gradient(145deg, #f8f9ff, #ffffff)",
            borderRadius: "24px",
            padding: 0,
            overflow: "hidden",
            boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
          },
        }}
      >
        <Box
          sx={{
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            padding: "32px 24px",
            textAlign: "center",
            color: "white",
          }}
        >
          <Box
            sx={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: 80,
              height: 80,
              borderRadius: "50%",
              bgcolor: "rgba(255, 255, 255, 0.2)",
              backdropFilter: "blur(10px)",
              mb: 2,
            }}
          >
            <LockIcon sx={{ fontSize: 40, color: "#ffffff" }} />
          </Box>
          <Typography
            variant="h5"
            component="div"
            sx={{
              fontWeight: 700,
              color: "#ffffff",
              mb: 1,
            }}
          >
            Secure Payment Gateway
          </Typography>
          <Typography
            variant="body2"
            sx={{
              color: "rgba(255, 255, 255, 0.9)",
              fontSize: "0.875rem",
            }}
          >
            Your payment is protected with bank-level security
          </Typography>
        </Box>

        <DialogContent sx={{ padding: "32px 24px" }}>
          <Box
            sx={{
              bgcolor: "#f0f4ff",
              borderRadius: "12px",
              p: 3,
              mb: 3,
              display: "flex",
              alignItems: "center",
              gap: 2,
              border: "1px solid #e0e7ff",
            }}
          >
            <CheckCircleIcon sx={{ color: "#10b981", fontSize: 28 }} />
            <Box>
              <Typography
                variant="body2"
                sx={{
                  color: "#1e40af",
                  fontWeight: 600,
                  fontSize: "0.875rem",
                }}
              >
                SSL Encrypted Connection
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: "#64748b",
                  fontSize: "0.75rem",
                  mt: 0.5,
                }}
              >
                Your payment information is secure and encrypted
              </Typography>
            </Box>
          </Box>

          <Box
            sx={{
              textAlign: "center",
              py: 2,
            }}
          >
            <Typography
              variant="body1"
              sx={{
                color: "#475569",
                fontSize: "0.9375rem",
                lineHeight: 1.6,
              }}
            >
              You will be redirected to our secure payment processor to complete your transaction.
            </Typography>
          </Box>
        </DialogContent>

        <DialogActions
          sx={{
            justifyContent: "center",
            gap: 2,
            padding: "24px",
            bgcolor: "#f8fafc",
            borderTop: "1px solid #e2e8f0",
          }}
        >
          <Button
            onClick={handleClose}
            variant="outlined"
            sx={{
              px: 4,
              py: 1.5,
              borderRadius: "12px",
              borderColor: "#cbd5e1",
              color: "#64748b",
              fontWeight: 600,
              textTransform: "none",
              "&:hover": {
                bgcolor: "#f1f5f9",
                borderColor: "#94a3b8",
              },
            }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            component={paymentLink ? Link : "button"}
            to={paymentLink}
            disabled={!paymentLink}
            sx={{
              px: 5,
              py: 1.5,
              borderRadius: "12px",
              bgcolor: paymentLink
                ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                : "#cbd5e1",
              color: "#ffffff",
              fontWeight: 600,
              textTransform: "none",
              boxShadow: paymentLink
                ? "0 4px 14px rgba(102, 126, 234, 0.4)"
                : "none",
              "&:hover": {
                bgcolor: paymentLink
                  ? "linear-gradient(135deg, #5568d3 0%, #6a3f8f 100%)"
                  : "#cbd5e1",
                boxShadow: paymentLink
                  ? "0 6px 20px rgba(102, 126, 234, 0.5)"
                  : "none",
              },
              "&.Mui-disabled": {
                bgcolor: "#e2e8f0",
                color: "#94a3b8",
              },
            }}
          >
            {paymentLink ? "Proceed to Payment" : "Loading Payment Gateway..."}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default Subscription;
