import { useState, useEffect } from "react";
import { formatDate, getId, getToken } from "../utils";
import { Hourglass } from "react-loader-spinner";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { baseUrl } from "../env";

const Investigations = () => {
  const patientId = getId();
  
  // State for displaying investigations
  const [allInvestigationOrders, setAllInvestigationOrders] = useState([]);
  const [investigationsLoading, setInvestigationsLoading] = useState(true);

  // Function to fetch all investigations on component mount
  const fetchInvestigations = async () => {
    setInvestigationsLoading(true);

    try {
      const token = getToken();
      if (!patientId) {
        throw new Error("Patient ID not provided");
      }

      const response = await fetch(
        `${baseUrl}/api/investigations/orders/patient/${patientId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch investigation orders");
      }

      const orders = await response.json();

      // Sort orders by date (most recent first)
      const sortedOrders = orders.sort(
        (a, b) => new Date(b.createdDate) - new Date(a.createdDate)
      );

      setAllInvestigationOrders(sortedOrders);
    } catch (error) {
      toast.error(`Failed to fetch investigation orders: ${error.message}`);
      setAllInvestigationOrders([]);
    } finally {
      setInvestigationsLoading(false);
    }
  };

  // Fetch investigations when component mounts
  useEffect(() => {
    fetchInvestigations();
  }, [patientId]);

  return (
    <div className="investigations-component max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-500 to-green-700 px-6 py-6 rounded-t-2xl mb-6">
        <h1 className="text-2xl font-bold text-white flex items-center gap-3">
          <svg
            className="w-8 h-8"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
            />
          </svg>
          Lab Investigation Orders
        </h1>
        {!investigationsLoading && (
          <p className="text-green-100 mt-2">
            {allInvestigationOrders.length} orders found
          </p>
        )}
      </div>

      {/* Content */}
      {investigationsLoading ? (
        <div className="flex items-center justify-center py-12 bg-white rounded-b-2xl">
          <Hourglass
            visible={true}
            height="60"
            width="60"
            ariaLabel="hourglass-loading"
            colors={["#10b981", "#34d399"]}
          />
        </div>
      ) : allInvestigationOrders.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-b-2xl">
          <svg
            className="w-16 h-16 mx-auto text-gray-300 mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <p className="text-gray-500 text-lg">No investigations found for this patient</p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Investigation Orders */}
          {allInvestigationOrders.map((order) => (
            <div
              key={order.orderId}
              className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow"
            >
              {/* Order Header */}
              <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 rounded-t-xl">
                <div className="flex justify-between items-start flex-wrap gap-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">
                      Order #{order.orderId}
                    </h3>
                    <p className="text-sm text-gray-600">
                      Doctor: {order.doctorName}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">
                      {formatDate(order.createdDate)}
                    </p>
                    <span className={`inline-block px-3 py-1 text-xs font-medium rounded-full mt-1 ${
                      order.status === 'pending' 
                        ? 'bg-yellow-100 text-yellow-800' 
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div className="p-6">
                <div className="space-y-3">
                  {order.items?.map((item, itemIndex) => (
                    <div
                      key={itemIndex}
                      className="flex items-center justify-between p-4 bg-gray-50 border border-gray-200 rounded-lg"
                    >
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-800 mb-1">
                          {item.testName}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {item.instruction}
                        </p>
                      </div>
                      <div className="text-right ml-4">
                        <span className="text-lg font-semibold text-green-600">
                          ₦{item.price?.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Order Total */}
                <div className="mt-6 pt-4 border-t border-gray-200">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-medium text-gray-700">
                      Total Cost:
                    </span>
                    <span className="text-xl font-bold text-green-600">
                      ₦{order.totalCost?.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Summary Stats */}
          <div className="mt-8 bg-white rounded-xl p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {allInvestigationOrders.length}
                </div>
                <div className="text-sm text-gray-600">Total Orders</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {allInvestigationOrders.reduce((acc, order) => acc + (order.items?.length || 0), 0)}
                </div>
                <div className="text-sm text-gray-600">Total Tests</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  ₦{allInvestigationOrders.reduce((acc, order) => acc + (order.totalCost || 0), 0).toLocaleString()}
                </div>
                <div className="text-sm text-gray-600">Total Value</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Investigations;