import axios from "axios";
import { useState, useEffect } from "react";
import { formatNumber, getId, getToken } from "../utils";
import { baseUrl } from "../env";

const CurrentBalance = () => {
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBalance = async () => {
      try {
        const id = getId();
        const token = getToken();

        if (!id || !token) {
          setError("No ID or token found, unable to fetch balance.");
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

        setBalance(response.data.currentBalance);
        setLoading(false);
      } catch (error) {
        setError("Failed to fetch balance data.");
        setLoading(false);
      }
    };

    fetchBalance();
  }, []);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="w-full p-6 rounded-xl mb-8 bg-gradient-to-br from-blue-50 via-white to-blue-100 shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-[#020e7c] text-lg">
          Current Balance
        </h3>
      </div>
      <p className="text-sm text-gray-600 mb-2">
        This is the remaining amount available in your wallet for withdrawal.
      </p>

      <div className="flex justify-between mb-8">
        <p className="text-3xl font-bold text-[#020e7c]">
          ₦{formatNumber(balance)}
        </p>
      </div>

      {/* 
      <button className='w-56 h-10 bg-[#020e7c] text-white py-2 rounded-lg'>
        Withdraw Funds
      </button> 
      */}
    </div>
  );
};

export default CurrentBalance;
