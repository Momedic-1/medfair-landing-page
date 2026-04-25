import { Hourglass } from "react-loader-spinner";

const SubscriptionLoadingOverlay = ({ isLoading }) => {
  if (!isLoading) return null;

  return (
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
  );
};

export default SubscriptionLoadingOverlay;
