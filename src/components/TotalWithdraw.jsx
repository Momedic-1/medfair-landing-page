import axios from "axios";
import { useState, useEffect } from "react";

import { baseUrl } from "../env.jsx";
import { formatNumber, getId, getToken } from "../utils.jsx";

const TotalWithdraw = () => {
  const [withdrawAmount, setWithdrawAmount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchWithdrawals = async () => {
      try {
        const id = getId();
        const token = getToken();

        if (!id || !token) {
          setError("No ID or token found, unable to fetch withdrawals.");
          setLoading(false);
          return;
        }

        const response = await axios.get(
          `${baseUrl}/api/earnings/${id}/earnings`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setWithdrawAmount(response.data.totalWithdrawals || 0);
        setLoading(false);
      } catch (error) {
        setError("Failed to fetch withdrawal data.");
        setLoading(false);
      }
    };

    fetchWithdrawals();
  }, []);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="w-full p-6 rounded-xl mb-8 bg-gradient-to-br from-blue-50 via-white to-blue-100 shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-[#020e7c] text-lg">
          Total Withdrawals
        </h3>
      </div>

      <p className="text-sm text-gray-600 mb-2">
        This shows the total amount you’ve withdrawn from your earnings.
      </p>

      <div className="flex justify-between mb-8">
        <p className="text-3xl font-bold text-[#020e7c]">
          ₦{formatNumber(withdrawAmount)}
        </p>
      </div>

      {/* 
      <button className='w-56 h-10 bg-[#020e7c] text-white py-2 rounded-lg'>
        View Withdrawal History
      </button> 
      */}
    </div>
  );
};

export default TotalWithdraw;
