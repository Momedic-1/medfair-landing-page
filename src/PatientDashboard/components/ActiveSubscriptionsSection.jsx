import { Loader2, Calendar, Wallet, BadgeCheck } from "lucide-react";

const ActiveSubscriptionsSection = ({
  subscriptionLoading,
  subscriptionData,
  formatDate,
}) => {
  if (subscriptionLoading) {
    return (
      <div className="mb-8 flex items-center justify-center gap-3 rounded-2xl border border-gray-100 bg-white py-12 shadow-sm">
        <Loader2 className="h-6 w-6 animate-spin text-[#020e7c]" />
        <span className="text-sm text-gray-600">Loading your subscriptions…</span>
      </div>
    );
  }

  if (!(subscriptionData && subscriptionData.length > 0)) return null;

  const totalLeft = subscriptionData.reduce(
    (total, sub) => total + (sub.consultationsLeft || 0),
    0
  );

  return (
    <section className="mb-10">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-[#020e7c]">Active plans</h2>
          <p className="text-sm text-gray-500">
            {subscriptionData.length} active subscription
            {subscriptionData.length !== 1 ? "s" : ""}
          </p>
        </div>
        {subscriptionData.length > 1 && (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2">
            <p className="text-xs font-medium text-emerald-800">Total consultations left</p>
            <p className="text-2xl font-bold tabular-nums text-emerald-900">{totalLeft}</p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {subscriptionData.map((subscription, index) => (
          <article
            key={subscription.id ?? index}
            className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition hover:shadow-md"
          >
            <div className="border-b border-gray-50 bg-gradient-to-r from-[#020e7c]/5 to-transparent px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#020e7c]/10 text-[#020e7c]">
                  <BadgeCheck className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Plan
                  </p>
                  <p className="font-bold text-gray-900">{subscription.planName}</p>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 p-5">
              <div className="rounded-xl bg-amber-50 p-3">
                <div className="flex items-center gap-1.5 text-xs font-semibold uppercase text-amber-800">
                  <Wallet className="h-3.5 w-3.5" />
                  Left
                </div>
                <p className="mt-1 text-2xl font-bold text-gray-900">
                  {subscription.consultationsLeft}
                </p>
              </div>
              <div className="rounded-xl bg-blue-50 p-3">
                <div className="flex items-center gap-1.5 text-xs font-semibold uppercase text-blue-800">
                  <Calendar className="h-3.5 w-3.5" />
                  Expires
                </div>
                <p className="mt-1 text-sm font-semibold text-gray-800">
                  {formatDate(subscription.expirationDate)}
                </p>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};

export default ActiveSubscriptionsSection;
