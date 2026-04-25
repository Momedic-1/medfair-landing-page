import React, { useEffect } from "react";
import { getToken, getUserData, getId, getPatientPartnerSlug } from "../utils";
import { baseUrl } from "../env";
import axios from "axios";
import SubscriptionLoadingOverlay from "./components/SubscriptionLoadingOverlay";
import ActiveSubscriptionsSection from "./components/ActiveSubscriptionsSection";
import PlansSectionHeader from "./components/PlansSectionHeader";
import SubscriptionPlansSection from "./components/SubscriptionPlansSection";
import PaymentGatewayDialog from "./components/PaymentGatewayDialog";

const FIRST_CARE_HOSPITAL_SLUG = "first-care-hospital";

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
  const isFirstCareHospitalPartner =
    String(getPatientPartnerSlug() || "").toLowerCase().trim() ===
    FIRST_CARE_HOSPITAL_SLUG;

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

  const getPartnerAdjustedPrice = (planName, originalPrice) => {
    if (!isFirstCareHospitalPartner) return originalPrice;

    const normalized = String(planName || "").toLowerCase();
    if (normalized.includes("ent") || normalized.includes("ear nose throat")) {
      return 30000;
    }
    if (normalized.includes("specialist")) {
      return 5000;
    }
    if (
      normalized.includes("gp") ||
      normalized.includes("general practitioner") ||
      normalized.includes("instant")
    ) {
      return 2000;
    }
    return originalPrice;
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
          subTitle: getPartnerAdjustedPrice(plan.name, plan.price),
          content: getPlanContent(plan.name, plan.consultationCount),
          buttonText: "Subscribe",
          buttonLink: "/payment",
          consultationCount: plan.consultationCount,
        }));
        const sortedPlans = [...mappedPlans].sort(
          (a, b) => Number(a.subTitle || 0) - Number(b.subTitle || 0)
        );
        setPlans(sortedPlans);
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
    return new Intl.NumberFormat("en-NG", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(price);
  };

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 overflow-x-hidden">
      <SubscriptionLoadingOverlay isLoading={isLoading} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <ActiveSubscriptionsSection
          subscriptionLoading={subscriptionLoading}
          subscriptionData={subscriptionData}
          formatDate={formatDate}
        />
        <PlansSectionHeader />
        <SubscriptionPlansSection
          plansLoading={plansLoading}
          plans={plans}
          formatPriceWithCommas={formatPriceWithCommas}
          handleSubscription={handleSubscription}
        />
      </div>
      <PaymentGatewayDialog
        open={open}
        handleClose={handleClose}
        paymentLink={paymentLink}
      />
    </div>
  );
};

export default Subscription;
