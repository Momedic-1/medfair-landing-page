
import axios from "axios";
import React, { useState, useEffect } from "react";

function Income() {
  const [income, setIncome] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchIncome = async () => {
      try {
        const response = await axios.get("https://momedic.onrender.com/api/doctors/1/total-doctors-amount");
        const fetchedAmount = response.data.amount;
    
        setIncome(fetchedAmount != null ? fetchedAmount : 0);
        setLoading(false);
      } catch (error) {
        setError("Error fetching income");
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
    <div className='space-y-4 bg-white p-6 rounded-lg'>
      <div className='flex justify-between items-center'>
        <h3 className='font-semibold text-[#020e7c]'>Income</h3>
        <select className='rounded p-1 text-[#020e7c]'>
          <option>March</option>
          <option>April</option>
        </select>
      </div>
      <div className='flex justify-between'>
        <div>
          <p className='text-xl font-bold text-[#020e7c]'>{income.toLocaleString()}</p>
          <p className='text-sm text-[#020e7c] mt-8 mb-12'>Total income</p>
        </div>
        <div className=''>
          <p className='text-md font-bold text-white bg-[#020e7c] w-20 px-4 py-1 rounded-sm'>
            +56%
          </p>
          <p className='text-sm text-[#020e7c] mt-8 mb-12'>From last month</p>
        </div>
      </div>

      <button className='w-full bg-[#020e7c] text-white py-2 rounded-lg'>
        Request for Withdrawal
      </button>
    </div>
  );
}

export default Income;
