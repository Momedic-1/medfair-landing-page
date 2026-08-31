import { Loader2, Check } from "lucide-react";

const SubscriptionPlansSection = ({
  plansLoading,
  plans,
  formatPriceWithCommas,
  handleSubscription,
}) => {
  if (plansLoading) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-16">
        <Loader2 className="h-8 w-8 animate-spin text-[#020e7c]" />
        <span className="text-sm text-gray-600">Loading plans…</span>
      </div>
    );
  }

  if (plans.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-gray-200 bg-white px-6 py-12 text-center">
        <p className="font-medium text-gray-700">No plans available right now</p>
        <p className="mt-1 text-sm text-gray-500">Please check back later.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
      {plans.map((plan, index) => {
        const isPopular = plan.title.toLowerCase().includes("monthly");

        return (
          <article
            key={plan.id || index}
            className={`relative flex flex-col rounded-2xl border-2 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg ${
              isPopular
                ? "border-[#020e7c] ring-2 ring-[#020e7c]/10"
                : "border-gray-100 hover:border-[#020e7c]/30"
            }`}
          >
            {isPopular && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[#020e7c] px-4 py-1 text-xs font-bold text-white shadow">
                Popular
              </span>
            )}

            <div className="flex flex-1 flex-col p-6 sm:p-7">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-xl font-bold text-gray-900">{plan.title}</h3>
                {plan.category && (
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                      plan.category === "GP"
                        ? "bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200"
                        : "bg-violet-50 text-violet-800 ring-1 ring-violet-200"
                    }`}
                  >
                    {plan.category}
                  </span>
                )}
              </div>
              <div className="mt-3 flex items-baseline gap-1">
                <span className="text-3xl font-extrabold tabular-nums text-[#020e7c] sm:text-4xl">
                  ₦{formatPriceWithCommas(plan.subTitle)}
                </span>
              </div>
              {plan.consultationCount != null && (
                <p className="mt-1 text-sm text-gray-500">
                  {plan.consultationCount} consultation
                  {plan.consultationCount > 1 ? "s" : ""} included
                </p>
              )}

              <ul className="mt-5 flex-1 space-y-2.5">
                {(plan.content || []).map((line, i) => (
                  <li key={i} className="flex gap-2 text-sm text-gray-600">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                    <span>{line}</span>
                  </li>
                ))}
              </ul>

              <button
                type="button"
                className={`mt-6 w-full rounded-xl py-3 text-sm font-semibold text-white transition ${
                  isPopular
                    ? "bg-[#020e7c] hover:bg-[#0a1a8f] shadow-md"
                    : "bg-[#020e7c]/90 hover:bg-[#020e7c]"
                }`}
                onClick={(e) => handleSubscription(e, plan.subTitle)}
              >
                Subscribe now
              </button>
            </div>
          </article>
        );
      })}
    </div>
  );
};

export default SubscriptionPlansSection;
