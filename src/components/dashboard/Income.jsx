import axios from "axios";
import { useState, useEffect } from "react";
import { baseUrl } from "../../env.jsx";
import { formatNumber, getId, getToken } from "../../utils.jsx";

function Income() {
  const [incomeData, setIncomeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const fetchIncome = async () => {
      try {
        const id = getId();
        const token = getToken();

        if (!id || !token) {
          setError("No ID or token found, unable to fetch earnings.");
          setLoading(false);
          return;
        }

        const response = await axios.get(
          `${baseUrl}/api/earnings/summary/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setIncomeData(response.data.currentBalance);
        setLoading(false);
      } catch (error) {
        setError("Failed to fetch earnings data.");
        setLoading(false);
      }
    };

    fetchIncome();
  }, []);

  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <div className="w-full bg-white p-6 rounded-lg h-62 mb-8 bg-gradient-to-br from-blue-50 via-white to-blue-100 shadow-md">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold text-[#020e7c] text-lg">
          Current Balance
        </h3>
      </div>
      <p className="text-sm text-gray-600 my-2">
        This is the remaining amount available in your wallet for withdrawal.
      </p>

      <div className="flex justify-between mb-8">
        <div>
          <p className="text-xl font-bold text-[#020e7c]">
            ₦{incomeData ? formatNumber(incomeData) : 0}
          </p>
        </div>
      </div>

      <button
        onClick={() => setShowModal(true)}
        className="w-56 h-10 bg-[#020e7c] text-white py-2 rounded-lg"
      >
        Request for Withdrawal
      </button>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 text-center flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h2 className="text-lg font-semibold text-[#020e7c] mb-4">
              Withdrawal Request
            </h2>
            <p className="text-gray-700 mb-6">
              Please send your withdrawal request with your email address and the amount to:
              <span className="font-bold text-[#020e7c] block mt-2">
                medfairfinance@gmail.com
              </span>
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-gray-200 rounded-lg"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Income;
