// import React from "react";
// import { ActiveSlide } from "./constants";
// import { getToken, getUserData } from "../utils";
// import { baseUrl } from "../env";
// import { Hourglass } from "react-loader-spinner";
// import {
//   Button,
//   Dialog,
//   DialogActions,
//   DialogContent,
//   Slide,
//   Box,
//   Typography,
//   CircularProgress,
// } from "@mui/material";
// import axios from "axios";
// import { Link } from "react-router-dom";
// import CheckCircleIcon from "@mui/icons-material/CheckCircle";
// import LockIcon from "@mui/icons-material/Lock";

// const Transition = React.forwardRef(function Transition(props, ref) {
//   return <Slide direction="up" ref={ref} {...props} />;
// });

// const Subscription = () => {
//   const [paymentLink, setPaymentLink] = React.useState(null);
//   const [open, setOpen] = React.useState(false);
//   const [isLoading, setIsLoading] = React.useState(false);
//   const token = getToken();
//   const user = getUserData();

//   const handleClose = () => {
//     setOpen(false);
//   };

//   const formatPrice = (price) => {
//     return price.toFixed(2);
//   };

//   const handleSubscription = async (e, amount) => {
//     e.preventDefault();
//     setIsLoading(true);
//     const dataToSend = {
//       amount,
//       email: user?.emailAddress,
//     };

//     try {
//       const response = await axios.post(
//         `${baseUrl}/api/payment/initialize`,
//         dataToSend,
//         {
//           headers: {
//             "Content-Type": "application/json",
//             Authorization: `Bearer ${token}`,
//           },
//         }
//       );

//       const result = response.data;

//       if (result) {
//         console.log("Payment link response:", result);
//         setPaymentLink(result.authorizationUrl); // 👈 set only the URL string
//         setOpen(true);
//       } else {
//         console.error("Payment URL not found in response:", result);
//       }
//     } catch (error) {
//       console.error("Error initializing payment:", error);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <div className="w-full px-4 h-screen overflow-auto">
//       {isLoading && (
//         <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-50 backdrop-blur-sm z-50">
//           <Hourglass
//             visible={true}
//             height="40"
//             width="40"
//             ariaLabel="hourglass-loading"
//             colors={["#306cce", "#72a1ed"]}
//           />
//         </div>
//       )}
//       <h1 className="text-3xl text-[#020E7C] font-extrabold mt-5 text-center">
//         Choose a Subscription Plan
//       </h1>
//       <p className="text-gray-600 text-center mt-2">
//         Select the plan that best suits your needs and enjoy premium features.
//       </p>
//       <div className="mt-8 mb-12 grid grid-cols-1 md:grid-cols-2 gap-6">
//         {ActiveSlide.map((swipe, index) => (
//           <div
//             key={index}
//             className="flex flex-col w-full min-h-[300px] bg-gradient-to-br from-white to-gray-100 p-6 border border-gray-200 rounded-lg shadow-lg hover:shadow-2xl transition-shadow duration-300 transform hover:-translate-y-2"
//           >
//             <span className="text-blue-600 text-2xl font-bold">
//               {swipe.title}
//             </span>
//             <div className="text-4xl font-extrabold text-[#020E7C] mt-2">
//               ₦{formatPrice(swipe.subTitle)}
//             </div>
//             <button
//               className="mt-7 w-36 border text-white bg-gradient-to-r from-blue-500 to-blue-700 py-2 px-4 rounded-full hover:from-blue-600 hover:to-blue-800 transition-all duration-300"
//               onClick={(e) => handleSubscription(e, swipe.subTitle)}
//             >
//               Subscribe
//             </button>
//             <div className="border-y-2 mt-4" />
//             <div className="py-4">
//               <ul className="text-gray-700 w-full text-lg mb-5 space-y-3">
//                 {swipe.content.map((content, idx) => (
//                   <li key={idx} className="flex items-start">
//                     <CheckCircleIcon className="text-green-500 mr-2" />
//                     {content}
//                   </li>
//                 ))}
//               </ul>
//             </div>
//           </div>
//         ))}
//       </div>
//       <Dialog
//         open={open}
//         TransitionComponent={Transition}
//         keepMounted
//         onClose={handleClose}
//         aria-describedby="payment-dialog"
//         sx={{
//           "& .MuiDialog-paper": {
//             background: "linear-gradient(145deg, #f8f9ff, #ffffff)",
//             borderRadius: "16px",
//             padding: "24px",
//             minWidth: "400px",
//           },
//         }}
//       >
//         <Box sx={{ textAlign: "center", mb: 3 }}>
//           <CheckCircleIcon sx={{ fontSize: 48, color: "#4CAF50", mb: 2 }} />
//           <Typography
//             variant="h5"
//             component="div"
//             sx={{ fontWeight: 600, color: "#1a237e" }}
//           >
//             Secure Payment Gateway
//           </Typography>
//         </Box>

//         <DialogContent>
//           <Box
//             sx={{
//               bgcolor: "#f5f5f5",
//               borderRadius: "8px",
//               p: 2,
//               mb: 3,
//               display: "flex",
//               alignItems: "center",
//               gap: 1,
//             }}
//           >
//             <LockIcon color="success" />
//             <Typography variant="body2" sx={{ color: "#616161" }}>
//               SSL encrypted connection - Your payment is secure
//             </Typography>
//           </Box>

//           {/* {paymentLink ? (
//             <Box sx={{ textAlign: 'center' }}>
//               <CircularProgress sx={{ mb: 2 }} />
//               <Typography variant="body1" sx={{ mb: 3, color: '#424242' }}>
//                 Redirecting to secure payment portal...
//               </Typography>
//               {setTimeout(() => {
//                 window.location.href = paymentLink;
//               }, 3000)}
//             </Box>
//           ) : (
//             <Typography variant="body1" sx={{ color: '#d32f2f', textAlign: 'center' }}>
//               Payment link not available. Please try again.
//             </Typography>
//           )} */}
//         </DialogContent>

//         <DialogActions sx={{ justifyContent: "center", gap: 2, pb: 3 }}>
//           <Button
//             onClick={handleClose}
//             variant="outlined"
//             color="secondary"
//             sx={{
//               px: 4,
//               borderRadius: "8px",
//               "&:hover": { bgcolor: "#f5f5f5" },
//             }}
//           >
//             Cancel
//           </Button>
//           <Button
//             variant="contained"
//             color="primary"
//             component={paymentLink ? Link : "button"}
//             to={paymentLink}
//             disabled={!paymentLink}
//             sx={{
//               px: 4,
//               borderRadius: "8px",
//               bgcolor: "#1a237e",
//               "&:hover": { bgcolor: "#303f9f" },
//               "&.Mui-disabled": { bgcolor: "#e0e0e0" },
//             }}
//           >
//             {paymentLink ? "Proceed to Payment" : "Loading Payment Gateway..."}
//           </Button>
//         </DialogActions>
//       </Dialog>
//     </div>
//   );
// };

// export default Subscription;

// import React, { useEffect, useState } from "react";
// import { ActiveSlide } from "./constants";
// import { getToken, getUserData } from "../utils";
// import { baseUrl } from "../env";
// import { Hourglass } from "react-loader-spinner";
// import {
//   Button,
//   Dialog,
//   DialogActions,
//   DialogContent,
//   Slide,
//   Box,
//   Typography,
//   CircularProgress,
// } from "@mui/material";
// import axios from "axios";
// import { useLocation } from "react-router-dom";
// import CheckCircleIcon from "@mui/icons-material/CheckCircle";
// import LockIcon from "@mui/icons-material/Lock";
// import CancelIcon from "@mui/icons-material/Cancel";

// const Transition = React.forwardRef(function Transition(props, ref) {
//   return <Slide direction="up" ref={ref} {...props} />;
// });

// const Subscription = () => {
//   const [paymentLink, setPaymentLink] = useState(null);
//   const [open, setOpen] = useState(false);
//   const [isLoading, setIsLoading] = useState(false);
//   const [verifyStatus, setVerifyStatus] = useState(null); // success | failed | pending
//   const [verifyMessage, setVerifyMessage] = useState("");

//   const token = getToken();
//   const user = getUserData();
//   const location = useLocation();

//   const handleClose = () => {
//     setOpen(false);
//   };

//   const formatPrice = (price) => {
//     return price.toFixed(2);
//   };

//   // 🔹 Initialize Payment
//   const handleSubscription = async (e, amount) => {
//     e.preventDefault();
//     setIsLoading(true);
//     const dataToSend = {
//       amount,
//       email: user?.emailAddress,
//     };

//     try {
//       const response = await axios.post(
//         `${baseUrl}/api/payment/initialize`,
//         dataToSend,
//         {
//           headers: {
//             "Content-Type": "application/json",
//             Authorization: `Bearer ${token}`,
//           },
//         }
//       );

//       const result = response.data;

//       if (result?.authorizationUrl) {
//         console.log("Payment link response:", result);
//         setPaymentLink(result.authorizationUrl);
//         setOpen(true); // 👈 show modal
//       } else {
//         console.error("Payment URL not found:", result);
//       }
//     } catch (error) {
//       console.error("Error initializing payment:", error);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   // 🔹 Verify Payment if redirected back
//   useEffect(() => {
//     const query = new URLSearchParams(location.search);
//     const reference = query.get("reference");

//     if (!reference) return;

//     const verifyPayment = async () => {
//       setVerifyStatus("pending");
//       try {
//         const response = await axios.get(
//           `${baseUrl}/api/payment/verify?reference=${reference}`,
//           {
//             headers: {
//               Authorization: `Bearer ${token}`,
//             },
//           }
//         );

//         console.log("Verification response:", response.data); // 👈 console.log verification

//         if (response.data?.status === "success") {
//           setVerifyStatus("success");
//           setVerifyMessage("Payment verified successfully!");
//         } else {
//           setVerifyStatus("failed");
//           setVerifyMessage("Payment verification failed. Please try again.");
//         }
//       } catch (err) {
//         console.error("Verification error:", err);
//         setVerifyStatus("failed");
//         setVerifyMessage("An error occurred while verifying payment.");
//       }
//     };

//     verifyPayment();
//   }, [location.search, token]);

//   return (
//     <div className="w-full px-4 h-screen overflow-auto">
//       {/* 🔹 Loader during subscription init */}
//       {isLoading && (
//         <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-50 backdrop-blur-sm z-50">
//           <Hourglass
//             visible={true}
//             height="40"
//             width="40"
//             ariaLabel="hourglass-loading"
//             colors={["#306cce", "#72a1ed"]}
//           />
//         </div>
//       )}

//       {/* 🔹 Show Verify Status if redirected */}
//       {verifyStatus && (
//         <Box
//           sx={{
//             display: "flex",
//             flexDirection: "column",
//             alignItems: "center",
//             justifyContent: "center",
//             minHeight: "70vh",
//           }}
//         >
//           {verifyStatus === "pending" && <CircularProgress size={60} />}
//           {verifyStatus === "success" && (
//             <>
//               <CheckCircleIcon sx={{ fontSize: 80, color: "green", mb: 2 }} />
//               <Typography variant="h5" sx={{ color: "green" }}>
//                 {verifyMessage}
//               </Typography>
//             </>
//           )}
//           {verifyStatus === "failed" && (
//             <>
//               <CancelIcon sx={{ fontSize: 80, color: "red", mb: 2 }} />
//               <Typography variant="h5" sx={{ color: "red" }}>
//                 {verifyMessage}
//               </Typography>
//             </>
//           )}
//         </Box>
//       )}

//       {/* 🔹 Subscription Plans (only show if not verifying) */}
//       {!verifyStatus && (
//         <>
//           <h1 className="text-3xl text-[#020E7C] font-extrabold mt-5 text-center">
//             Choose a Subscription Plan
//           </h1>
//           <p className="text-gray-600 text-center mt-2">
//             Select the plan that best suits your needs and enjoy premium
//             features.
//           </p>

//           <div className="mt-8 mb-12 grid grid-cols-1 md:grid-cols-2 gap-6">
//             {ActiveSlide.map((swipe, index) => (
//               <div
//                 key={index}
//                 className="flex flex-col w-full min-h-[300px] bg-gradient-to-br from-white to-gray-100 p-6 border border-gray-200 rounded-lg shadow-lg hover:shadow-2xl transition-shadow duration-300 transform hover:-translate-y-2"
//               >
//                 <span className="text-blue-600 text-2xl font-bold">
//                   {swipe.title}
//                 </span>
//                 <div className="text-4xl font-extrabold text-[#020E7C] mt-2">
//                   ₦{formatPrice(swipe.subTitle)}
//                 </div>
//                 <button
//                   className="mt-7 w-36 border text-white bg-gradient-to-r from-blue-500 to-blue-700 py-2 px-4 rounded-full hover:from-blue-600 hover:to-blue-800 transition-all duration-300"
//                   onClick={(e) => handleSubscription(e, swipe.subTitle)}
//                 >
//                   Subscribe
//                 </button>
//                 <div className="border-y-2 mt-4" />
//                 <div className="py-4">
//                   <ul className="text-gray-700 w-full text-lg mb-5 space-y-3">
//                     {swipe.content.map((content, idx) => (
//                       <li key={idx} className="flex items-start">
//                         <CheckCircleIcon className="text-green-500 mr-2" />
//                         {content}
//                       </li>
//                     ))}
//                   </ul>
//                 </div>
//               </div>
//             ))}
//           </div>

//           {/* 🔹 Payment Modal */}
//           <Dialog
//             open={open}
//             TransitionComponent={Transition}
//             keepMounted
//             onClose={handleClose}
//             aria-describedby="payment-dialog"
//             sx={{
//               "& .MuiDialog-paper": {
//                 background: "linear-gradient(145deg, #f8f9ff, #ffffff)",
//                 borderRadius: "16px",
//                 padding: "24px",
//                 minWidth: "400px",
//               },
//             }}
//           >
//             <Box sx={{ textAlign: "center", mb: 3 }}>
//               <CheckCircleIcon sx={{ fontSize: 48, color: "#4CAF50", mb: 2 }} />
//               <Typography
//                 variant="h5"
//                 component="div"
//                 sx={{ fontWeight: 600, color: "#1a237e" }}
//               >
//                 Secure Payment Gateway
//               </Typography>
//             </Box>

//             <DialogContent>
//               <Box
//                 sx={{
//                   bgcolor: "#f5f5f5",
//                   borderRadius: "8px",
//                   p: 2,
//                   mb: 3,
//                   display: "flex",
//                   alignItems: "center",
//                   gap: 1,
//                 }}
//               >
//                 <LockIcon color="success" />
//                 <Typography variant="body2" sx={{ color: "#616161" }}>
//                   SSL encrypted connection - Your payment is secure
//                 </Typography>
//               </Box>
//             </DialogContent>

//             <DialogActions sx={{ justifyContent: "center", gap: 2, pb: 3 }}>
//               <Button
//                 onClick={handleClose}
//                 variant="outlined"
//                 color="secondary"
//                 sx={{
//                   px: 4,
//                   borderRadius: "8px",
//                   "&:hover": { bgcolor: "#f5f5f5" },
//                 }}
//               >
//                 Cancel
//               </Button>
//               <Button
//                 variant="contained"
//                 color="primary"
//                 disabled={!paymentLink}
//                 onClick={() => {
//                   console.log("Redirecting to payment:", paymentLink);
//                   window.location.href = paymentLink; // 👈 redirect to payment same page
//                 }}
//                 sx={{
//                   px: 4,
//                   borderRadius: "8px",
//                   bgcolor: "#1a237e",
//                   "&:hover": { bgcolor: "#303f9f" },
//                   "&.Mui-disabled": { bgcolor: "#e0e0e0" },
//                 }}
//               >
//                 {paymentLink ? "Proceed to Payment" : "Loading..."}
//               </Button>
//             </DialogActions>
//           </Dialog>
//         </>
//       )}
//     </div>
//   );
// };

// export default Subscription;


import React from "react";
import { ActiveSlide } from "./constants";
import { getToken, getUserData } from "../utils";
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
  CircularProgress,
} from "@mui/material";
import axios from "axios";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import LockIcon from "@mui/icons-material/Lock";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const Subscription = () => {
  const [paymentLink, setPaymentLink] = React.useState(null);
  const [open, setOpen] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [verifyingPayment, setVerifyingPayment] = React.useState(false);
  const [paymentSuccess, setPaymentSuccess] = React.useState(false);
  const token = getToken();
  const user = getUserData();

  const handleClose = () => {
    setOpen(false);
    setPaymentLink(null);
  };

  const formatPrice = (price) => {
    return price.toFixed(2);
  };

  // Payment verification function
  const verifyPayment = async (reference) => {
    try {
      setVerifyingPayment(true);
      console.log("Verifying payment with reference:", reference);

      const response = await axios.get(
        `${baseUrl}/api/payment/verify?reference=${encodeURIComponent(reference)}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const result = response.data;
      console.log("Payment verification result:", result);

      if (result.status === 'success') {
        setPaymentSuccess(true);
        toast.success("Payment verified successfully! Your subscription is now active.");
        
        // Clear stored payment reference
        sessionStorage.removeItem("pendingPaymentReference");
        sessionStorage.removeItem("pendingSubscriptionAmount");
        
        // Close dialog after short delay
        setTimeout(() => {
          handleClose();
          // Optionally redirect to dashboard or refresh user data
          window.location.reload(); // or navigate to dashboard
        }, 3000);
        
        return true;
      } else {
        toast.error(`Payment verification failed: ${result.message}`);
        return false;
      }
    } catch (error) {
      console.error("Payment verification error:", error);
      const errorMessage = error.response?.data?.message || error.message || "Payment verification failed";
      toast.error(`Payment verification error: ${errorMessage}`);
      return false;
    } finally {
      setVerifyingPayment(false);
    }
  };

  // Check for returning payment verification on component mount
  React.useEffect(() => {
    const checkPaymentReturn = async () => {
      const reference = sessionStorage.getItem("pendingPaymentReference");
      const amount = sessionStorage.getItem("pendingSubscriptionAmount");

      if (reference && amount) {
        console.log("Found pending payment reference:", reference);
        toast.info("Verifying your payment...");
        await verifyPayment(reference);
      }
    };

    checkPaymentReturn();
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
        
        // Store payment reference for verification when user returns
        if (result.reference || result.access_code) {
          const reference = result.reference || result.access_code;
          sessionStorage.setItem("pendingPaymentReference", reference);
          sessionStorage.setItem("pendingSubscriptionAmount", amount.toString());
        }
        
        setPaymentLink(result.authorizationUrl);
        setOpen(true);
      } else {
        console.error("Payment URL not found in response:", result);
        toast.error("Failed to initialize payment. Please try again.");
      }
    } catch (error) {
      console.error("Error initializing payment:", error);
      const errorMessage = error.response?.data?.message || error.message || "Payment initialization failed";
      toast.error(`Error: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePaymentRedirect = () => {
    if (paymentLink) {
      // Redirect to payment page
      window.location.href = paymentLink;
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
              className="mt-7 w-36 border text-white bg-gradient-to-r from-blue-500 to-blue-700 py-2 px-4 rounded-full hover:from-blue-600 hover:to-blue-800 transition-all duration-300 disabled:opacity-50"
              onClick={(e) => handleSubscription(e, swipe.subTitle)}
              disabled={isLoading || verifyingPayment}
            >
              {isLoading ? "Processing..." : "Subscribe"}
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
        {verifyingPayment ? (
          <>
            <Box sx={{ textAlign: "center", mb: 3 }}>
              <CircularProgress sx={{ fontSize: 48, color: "#2196F3", mb: 2 }} />
              <Typography
                variant="h5"
                component="div"
                sx={{ fontWeight: 600, color: "#1a237e" }}
              >
                Verifying Payment
              </Typography>
            </Box>
            <DialogContent>
              <Typography variant="body1" sx={{ textAlign: 'center', color: '#424242' }}>
                Please wait while we verify your payment...
              </Typography>
            </DialogContent>
          </>
        ) : paymentSuccess ? (
          <>
            <Box sx={{ textAlign: "center", mb: 3 }}>
              <CheckCircleIcon sx={{ fontSize: 48, color: "#4CAF50", mb: 2 }} />
              <Typography
                variant="h5"
                component="div"
                sx={{ fontWeight: 600, color: "#4CAF50" }}
              >
                Payment Successful!
              </Typography>
            </Box>
            <DialogContent>
              <Typography variant="body1" sx={{ textAlign: 'center', color: '#424242' }}>
                Your subscription has been activated successfully. You will be redirected shortly.
              </Typography>
            </DialogContent>
          </>
        ) : (
          <>
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

              {paymentLink ? (
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="body1" sx={{ mb: 3, color: '#424242' }}>
                    Click the button below to proceed with your secure payment.
                  </Typography>
                </Box>
              ) : (
                <Typography variant="body1" sx={{ color: '#d32f2f', textAlign: 'center' }}>
                  Payment link not available. Please try again.
                </Typography>
              )}
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
                onClick={handlePaymentRedirect}
                variant="contained"
                color="primary"
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
          </>
        )}
      </Dialog>
    </div>
  );
};

export default Subscription;