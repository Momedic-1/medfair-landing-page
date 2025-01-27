

import axios from "axios";
import React, { useState, useEffect } from "react";
import { baseUrl } from "../../env.jsx";
import { getToken } from "../../utils.jsx";

function Income() {
  const [incomeData, setIncomeData] = useState(null);  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchIncome = async () => {
      try {
        const id = sessionStorage.getItem("id");
        const token = getToken()

        if (!id || !token) {
          setError("No ID or token found, unable to fetch earnings.");
          setLoading(false);
          return;
        }

        const response = await axios.get(`${baseUrl}/api/earnings/${id}/earnings`, {
          headers: {
          'Authorization': `Bearer ${token}`,
          "Content-Type": "application/json"
          
          }
        });

        
        setIncomeData(response.data);  
        console.log(response.data, "response.data");
        setLoading(false);
      } catch (error) {

        setError("Failed to fetch earnings data.");
        setLoading(false);
      }
    };

    fetchIncome();
  }, []);

  if (loading) {
    return 
    <div className="w-full bg-white p-6 rounded-lg h-52">

    </div>
  }

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <div className='w-full bg-white p-6 rounded-lg h-52'>
      <div className='flex justify-between items-center'>
        <h3 className='font-semibold text-[#020e7c]'>Total Income</h3>
      </div>

      <div className='flex justify-between mb-8'>
        <div>
          <p className='text-xl font-bold text-[#020e7c]'>
            ₦{incomeData ? JSON.stringify(incomeData, null, 2) : "No data available"}
          </p>
         
        </div>
      </div>

      <button className='w-56 h-10 bg-[#020e7c] text-white py-2 rounded-lg'>
        Request for Withdrawal
      </button>
    </div>
  );
}

export default Income;

