import React, { useEffect } from "react";
import { ActiveSlide } from "./constants";
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
  const token = getToken();
  const user = getUserData();

  const handleClose = () => {
    setOpen(false);
  };

  const formatPrice = (price) => {
    return price.toFixed(2);
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

  return (
    <div className="w-full px-4 h-screen overflow-auto">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-50 backdrop-blur-sm z-50">
          <Hourglass
            visible={true}
            height="40"
            width="40"
            ariaLabel="hourglass-loading"
            colors={["#306cce", "#72a1ed"]}
          />
        </div>
      )}

      {/* Active Subscription Info Card */}
      {subscriptionLoading ? (
        <div className="w-full max-w-6xl mx-auto mt-6 mb-6 p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl shadow-lg border border-blue-200">
          <div className="flex items-center justify-center">
            <Hourglass
              visible={true}
              height="30"
              width="30"
              ariaLabel="hourglass-loading"
              colors={["#306cce", "#72a1ed"]}
            />
            <span className="ml-3 text-gray-600">
              Loading subscription details...
            </span>
          </div>
        </div>
      ) : subscriptionData && subscriptionData.length > 0 ? (
        <div className="w-full max-w-6xl mx-auto mt-6 mb-6 p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl shadow-lg border border-blue-200">
          <div className="flex items-center mb-4">
            <CardMembershipIcon
              sx={{ fontSize: 32, color: "#020E7C", mr: 2 }}
            />
            <h2 className="text-2xl font-bold text-[#020E7C]">
              Your Active Subscriptions{" "}
              {subscriptionData.length > 1 && `(${subscriptionData.length})`}
            </h2>
          </div>

          {/* Total Consultations Summary */}
          {subscriptionData.length > 1 && (
            <div className="mb-4 p-4 bg-white rounded-lg shadow-md border-2 border-blue-300">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <AccountBalanceWalletIcon
                    sx={{ fontSize: 24, color: "#FF9800", mr: 2 }}
                  />
                  <span className="text-lg font-semibold text-gray-700">
                    Total Consultations Available:
                  </span>
                </div>
                <span className="text-2xl font-bold text-[#020E7C]">
                  {subscriptionData.reduce(
                    (total, sub) => total + (sub.consultationsLeft || 0),
                    0
                  )}
                </span>
              </div>
            </div>
          )}

          {/* Individual Subscription Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {subscriptionData.map((subscription, index) => (
              <div
                key={index}
                className="bg-white rounded-lg p-5 shadow-md border border-gray-200 hover:shadow-lg transition-shadow"
              >
                <div className="mb-4 pb-3 border-b border-gray-200">
                  <div className="flex items-center mb-2">
                    <CardMembershipIcon
                      sx={{ fontSize: 20, color: "#4CAF50", mr: 1 }}
                    />
                    <span className="text-sm text-gray-600 font-medium">
                      Plan
                    </span>
                  </div>
                  <p className="text-xl font-bold text-[#020E7C]">
                    {subscription.planName}
                  </p>
                </div>

                <div className="space-y-3">
                  <div>
                    <div className="flex items-center mb-1">
                      <AccountBalanceWalletIcon
                        sx={{ fontSize: 18, color: "#FF9800", mr: 1 }}
                      />
                      <span className="text-xs text-gray-600 font-medium">
                        Consultations Left
                      </span>
                    </div>
                    <p className="text-lg font-bold text-[#020E7C] ml-7">
                      {subscription.consultationsLeft}
                    </p>
                  </div>

                  <div>
                    <div className="flex items-center mb-1">
                      <CalendarTodayIcon
                        sx={{ fontSize: 18, color: "#2196F3", mr: 1 }}
                      />
                      <span className="text-xs text-gray-600 font-medium">
                        Expiry Date
                      </span>
                    </div>
                    <p className="text-sm font-semibold text-[#020E7C] ml-7">
                      {formatDate(subscription.expirationDate)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      <h1 className="text-3xl text-[#020E7C] font-extrabold mt-5 text-center">
        Choose a Subscription Plan
      </h1>
      <p className="text-gray-600 text-center mt-2">
        Select the plan that best suits your needs and enjoy premium features.
      </p>
      <div className="mt-8 mb-12 grid grid-cols-1 md:grid-cols-2 gap-6">
        {ActiveSlide.map((swipe, index) => (
          <div
            key={index}
            className="flex flex-col w-full min-h-[300px] bg-gradient-to-br from-white to-gray-100 p-6 border border-gray-200 rounded-lg shadow-lg hover:shadow-2xl transition-shadow duration-300 transform hover:-translate-y-2"
          >
            <span className="text-blue-600 text-2xl font-bold">
              {swipe.title}
            </span>
            <div className="text-4xl font-extrabold text-[#020E7C] mt-2">
              ₦{formatPrice(swipe.subTitle)}
            </div>
            <button
              className="mt-7 w-36 border text-white bg-gradient-to-r from-blue-500 to-blue-700 py-2 px-4 rounded-full hover:from-blue-600 hover:to-blue-800 transition-all duration-300"
              onClick={(e) => handleSubscription(e, swipe.subTitle)}
            >
              Subscribe
            </button>
            <div className="border-y-2 mt-4" />
            <div className="py-4">
              <ul className="text-gray-700 w-full text-lg mb-5 space-y-3">
                {swipe.content.map((content, idx) => (
                  <li key={idx} className="flex items-start">
                    <CheckCircleIcon className="text-green-500 mr-2" />
                    {content}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
      <Dialog
        open={open}
        TransitionComponent={Transition}
        keepMounted
        onClose={handleClose}
        aria-describedby="payment-dialog"
        sx={{
          "& .MuiDialog-paper": {
            background: "linear-gradient(145deg, #f8f9ff, #ffffff)",
            borderRadius: "16px",
            padding: "24px",
            minWidth: "400px",
          },
        }}
      >
        <Box sx={{ textAlign: "center", mb: 3 }}>
          <CheckCircleIcon sx={{ fontSize: 48, color: "#4CAF50", mb: 2 }} />
          <Typography
            variant="h5"
            component="div"
            sx={{ fontWeight: 600, color: "#1a237e" }}
          >
            Secure Payment Gateway
          </Typography>
        </Box>

        <DialogContent>
          <Box
            sx={{
              bgcolor: "#f5f5f5",
              borderRadius: "8px",
              p: 2,
              mb: 3,
              display: "flex",
              alignItems: "center",
              gap: 1,
            }}
          >
            <LockIcon color="success" />
            <Typography variant="body2" sx={{ color: "#616161" }}>
              SSL encrypted connection - Your payment is secure
            </Typography>
          </Box>

          {/* {paymentLink ? (
            <Box sx={{ textAlign: 'center' }}>
              <CircularProgress sx={{ mb: 2 }} />
              <Typography variant="body1" sx={{ mb: 3, color: '#424242' }}>
                Redirecting to secure payment portal...
              </Typography>
              {setTimeout(() => {
                window.location.href = paymentLink;
              }, 3000)}
            </Box>
          ) : (
            <Typography variant="body1" sx={{ color: '#d32f2f', textAlign: 'center' }}>
              Payment link not available. Please try again.
            </Typography>
          )} */}
        </DialogContent>

        <DialogActions sx={{ justifyContent: "center", gap: 2, pb: 3 }}>
          <Button
            onClick={handleClose}
            variant="outlined"
            color="secondary"
            sx={{
              px: 4,
              borderRadius: "8px",
              "&:hover": { bgcolor: "#f5f5f5" },
            }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            color="primary"
            component={paymentLink ? Link : "button"}
            to={paymentLink}
            disabled={!paymentLink}
            sx={{
              px: 4,
              borderRadius: "8px",
              bgcolor: "#1a237e",
              "&:hover": { bgcolor: "#303f9f" },
              "&.Mui-disabled": { bgcolor: "#e0e0e0" },
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
