import React, { useEffect } from "react";
import { getToken, getUserData, getId, getPatientPartnerSlug } from "../utils";
import { baseUrl } from "../env";
import axios from "axios";
import { CreditCard, Sparkles } from "lucide-react";
import SubscriptionLoadingOverlay from "./components/SubscriptionLoadingOverlay";
import ActiveSubscriptionsSection from "./components/ActiveSubscriptionsSection";
import PlansSectionHeader from "./components/PlansSectionHeader";
import SubscriptionPlansSection from "./components/SubscriptionPlansSection";
import PaymentGatewayDialog from "./components/PaymentGatewayDialog";
import {
  formatSubscriptionPrice,
  mapPlanForDisplay,
  sortPlansForDisplay,
} from "./utils/subscriptionPlanDisplay";

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

  const handleClose = () => setOpen(false);

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const adjustPartnerPrice = (planName, originalPrice) => {
    if (!isFirstCareHospitalPartner) return originalPrice;
    const normalized = String(planName || "").toLowerCase();
    if (normalized.includes("ent") || normalized.includes("ear nose throat")) {
      return 30000;
    }
    if (normalized.includes("specialist")) return 30000;
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
        { headers: { Authorization: `Bearer ${currentToken}` } }
      );
      if (response.data && Array.isArray(response.data)) {
        setPlans(
          sortPlansForDisplay(
            response.data.map((plan) =>
              mapPlanForDisplay({
                id: plan.id,
                name: plan.name,
                price: plan.price,
                consultationCount: plan.consultationCount,
                adjustPrice: adjustPartnerPrice,
              })
            )
          )
        );
      } else {
        setPlans([]);
      }
    } catch {
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
        { headers: { Authorization: `Bearer ${currentToken}` } }
      );
      if (response.data && Array.isArray(response.data)) {
        setSubscriptionData(response.data.filter((sub) => sub.active === true));
      } else {
        setSubscriptionData([]);
      }
    } catch {
      setSubscriptionData([]);
    } finally {
      setSubscriptionLoading(false);
    }
  };

  useEffect(() => {
    fetchActiveSubscription();
    fetchPlans();
  }, []);

  const handleSubscription = async (e, amount) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await axios.post(
        `${baseUrl}/api/payment/initialize`,
        { amount, email: user?.emailAddress },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.data) {
        setPaymentLink(response.data.authorizationUrl);
        setOpen(true);
      }
    } catch {
      // toast handled by overlay context if needed
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-full bg-gradient-to-b from-slate-50 via-blue-50/30 to-gray-50">
      <SubscriptionLoadingOverlay isLoading={isLoading} />

      <div className="mx-auto max-w-6xl px-3 py-6 sm:px-6 sm:py-10">
        <header className="mb-8 overflow-hidden rounded-2xl bg-gradient-to-br from-[#020e7c] via-[#0c1d8f] to-[#1e40af] p-6 text-white shadow-lg sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-blue-200/90">
                Membership
              </p>
              <h1 className="mt-1 flex items-center gap-2 text-2xl font-bold sm:text-3xl">
                <CreditCard className="h-7 w-7" />
                Subscriptions
              </h1>
              <p className="mt-2 max-w-xl text-sm text-blue-100/90">
                Choose a plan for GP calls, specialist visits, and ongoing care.
                Active plans show consultations remaining.
              </p>
            </div>
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-sm">
              <Sparkles className="h-7 w-7" />
            </div>
          </div>
        </header>

        <ActiveSubscriptionsSection
          subscriptionLoading={subscriptionLoading}
          subscriptionData={subscriptionData}
          formatDate={formatDate}
        />
        <PlansSectionHeader />
        <SubscriptionPlansSection
          plansLoading={plansLoading}
          plans={plans}
          formatPriceWithCommas={formatSubscriptionPrice}
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
