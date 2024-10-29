
import React from 'react';
import HomePage from './dashboard/HomePage';
import SwipeStatus from './dashboard/SwipeStatus';

const Dashboard = () => {
  return (
    <div className='lg:ml-[15rem] relative '>
      <HomePage />
      
      <div className='absolute bottom-2 -left-9 w-[121%]  md:-left-8 sm:-left-9  sm:w-[120%]  md:w-[100%] lg:w-[67%] lg:-left-4 '>
        <SwipeStatus />
      </div>
    
    </div>
  );
};

export default Dashboard;
