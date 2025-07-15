import axios from "axios";
import { useState, useEffect } from "react";
import { baseUrl } from "../../env.jsx";
import { formatNumber, getId, getToken } from "../../utils.jsx";

function Income() {
  const [incomeData, setIncomeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
    <div className="w-full bg-white p-6 rounded-lg h-52 mb-8 bg-gradient-to-br from-blue-50 via-white to-blue-100 shadow-md">
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

      <button className="w-56 h-10 bg-[#020e7c] text-white py-2 rounded-lg">
        Request for Withdrawal
      </button>
    </div>
  );
}

export default Income;
