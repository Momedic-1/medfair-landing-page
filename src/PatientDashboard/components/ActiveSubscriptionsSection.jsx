import { Hourglass } from "react-loader-spinner";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import CardMembershipIcon from "@mui/icons-material/CardMembership";

const ActiveSubscriptionsSection = ({
  subscriptionLoading,
  subscriptionData,
  formatDate,
}) => {
  if (subscriptionLoading) {
    return (
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
    );
  }

  if (!(subscriptionData && subscriptionData.length > 0)) return null;

  return (
    <div className="w-full mb-8 sm:mb-12">
      <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 rounded-2xl shadow-xl p-6 sm:p-8 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <div className="flex items-center mb-4 sm:mb-0">
            <div className="bg-white/20 p-3 rounded-xl mr-4">
              <CardMembershipIcon sx={{ fontSize: 32, color: "#ffffff" }} />
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

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        {subscriptionData.map((subscription, index) => (
          <div
            key={index}
            className="bg-white rounded-xl p-5 sm:p-6 shadow-md border border-gray-200 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
          >
            <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-200">
              <div className="flex items-center">
                <div className="bg-green-100 p-2 rounded-lg mr-3">
                  <CardMembershipIcon sx={{ fontSize: 24, color: "#4CAF50" }} />
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
  );
};

export default ActiveSubscriptionsSection;
