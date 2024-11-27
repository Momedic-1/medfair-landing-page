

import axios from "axios";
import React, { useState, useEffect } from "react";
import { baseUrl } from "../../env.jsx";

function Income() {
  const [income, setIncome] = useState(0);
  const [previousIncome, setPreviousIncome] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState("");

  const getMonthNames = () => {
    const months = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    const currentMonth = new Date().getMonth();
    const nextMonth = (currentMonth + 1) % 12;
    return [months[currentMonth], months[nextMonth]];
  };

  const calculatePercentageChange = (current, previous) => {
    if (previous === 0) return 0;
    return ((current - previous) / previous) * 100;
  };

  useEffect(() => {
    const fetchIncome = async () => {
      try {
        const id = sessionStorage.getItem("id");
        const token = JSON.parse(localStorage.getItem('authToken'))?.token;
        
        if (!id || !token) {
          setError("No ID or token found, unable to fetch earnings.");
          setLoading(false);
          return;
        }

        const response = await axios.get(`${baseUrl}/api/earnings/${id}/earnings`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        console.log("API Response:", response.data);

        const fetchedAmount = response.data.amount;
        const fetchedPreviousAmount = response.data.previousAmount;
        setIncome(fetchedAmount != null ? fetchedAmount : 0);
        setPreviousIncome(fetchedPreviousAmount != null ? fetchedPreviousAmount : 0);
        setLoading(false);
      } catch (error) {
        console.error("API Error:", error.response || error.message);
        setError("Failed to fetch earnings data.");
        setLoading(false);
      }
    };

    fetchIncome();
  }, []);

  if (loading) {
    return <p>Loading...</p>;
  }

  const [currentMonth, nextMonth] = getMonthNames();
  const percentageChange = calculatePercentageChange(income, previousIncome);

  return (
    <div className='space-y-4 bg-white p-6 rounded-lg'>
      <div className='flex justify-between items-center'>
        <h3 className='font-semibold text-[#020e7c]'>Income</h3>
        <select
          className='rounded p-1 text-[#020e7c]'
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
        >
          <option value={currentMonth}>{currentMonth}</option>
          <option value={nextMonth}>{nextMonth}</option>
        </select>
      </div>
      <div className='flex justify-between'>
        <div>
          <p className='text-xl font-bold text-[#020e7c]'>{income.toLocaleString()}</p>
          <p className='text-sm text-[#020e7c] mt-8 mb-12'>Total income</p>
        </div>
        <div className=''>
          <p className={`text-md font-bold ${percentageChange >= 0 ? 'text-white bg-[#020e7c]' : 'text-red-600 bg-gray-200'} w-20 px-4 py-1 rounded-sm`}>
            {percentageChange >= 0 ? `+${percentageChange.toFixed(2)}%` : `${percentageChange.toFixed(2)}%`}
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
