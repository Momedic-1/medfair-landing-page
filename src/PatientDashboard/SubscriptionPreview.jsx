import { CreditCard, Sparkles } from "lucide-react";
import { ActiveSlide } from "./constants";
import PlansSectionHeader from "./components/PlansSectionHeader";
import SubscriptionPlansSection from "./components/SubscriptionPlansSection";
import {
  formatSubscriptionPrice,
  mapPlanForDisplay,
  sortPlansForDisplay,
} from "./utils/subscriptionPlanDisplay";

/** Local preview — mock plans, no login or API required. */
const SubscriptionPreview = () => {
  const plans = sortPlansForDisplay(
    ActiveSlide.map((plan, index) =>
      mapPlanForDisplay({
        id: index + 1,
        name: plan.title,
        price: plan.subTitle,
        consultationCount: 1,
      })
    )
  );

  return (
    <div className="min-h-full bg-gradient-to-b from-slate-50 via-blue-50/30 to-gray-50">
      <div className="mx-auto max-w-6xl px-3 py-6 sm:px-6 sm:py-10">
        <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          <strong>Local preview</strong> — mock plan data. Subscribe buttons are
          disabled here.
        </div>

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
              </p>
            </div>
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-sm">
              <Sparkles className="h-7 w-7" />
            </div>
          </div>
        </header>

        <PlansSectionHeader />
        <SubscriptionPlansSection
          plansLoading={false}
          plans={plans}
          formatPriceWithCommas={formatSubscriptionPrice}
          handleSubscription={(e) => e.preventDefault()}
        />
      </div>
    </div>
  );
};

export default SubscriptionPreview;
