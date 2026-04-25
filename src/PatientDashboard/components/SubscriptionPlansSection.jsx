import { Hourglass } from "react-loader-spinner";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CardMembershipIcon from "@mui/icons-material/CardMembership";

const SubscriptionPlansSection = ({
  plansLoading,
  plans,
  formatPriceWithCommas,
  handleSubscription,
}) => {
  if (plansLoading) {
    return (
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
    );
  }

  if (plans.length > 0) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 sm:gap-8 mb-12">
        {plans.map((plan, index) => {
          const isPopular =
            plan.title.toLowerCase().includes("monthly") ||
            plan.title.toLowerCase().includes("yearly");
          return (
            <div
              key={plan.id || index}
              className={`relative flex flex-col bg-white rounded-2xl shadow-lg border-2 transition-all duration-300 transform hover:-translate-y-2 hover:shadow-2xl ${
                isPopular
                  ? "border-blue-500 scale-105 md:scale-100"
                  : "border-gray-200 hover:border-blue-300"
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
                      {plan.consultationCount} consultation
                      {plan.consultationCount > 1 ? "s" : ""} included
                    </p>
                  )}
                </div>

                <button
                  className={`w-full py-3.5 px-6 rounded-xl font-semibold text-white transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 ${
                    isPopular
                      ? "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                      : "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
                  }`}
                  onClick={(e) => handleSubscription(e, plan.subTitle)}
                >
                  Subscribe Now
                </button>

                <div className="my-6 border-t border-gray-200"></div>

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
    );
  }

  return (
    <div className="w-full bg-white rounded-2xl shadow-lg p-12 text-center">
      <CardMembershipIcon sx={{ fontSize: 64, color: "#9CA3AF", mb: 3 }} />
      <p className="text-lg text-gray-600 font-medium">
        No subscription plans available at the moment.
      </p>
      <p className="text-sm text-gray-500 mt-2">
        Please check back later or contact support.
      </p>
    </div>
  );
};

export default SubscriptionPlansSection;
