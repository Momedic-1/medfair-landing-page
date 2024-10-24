
import React from 'react';
import HomePage from './dashboard/HomePage';
import SwipeStatus from './dashboard/SwipeStatus';

const Dashboard = () => {
  return (
    <div className='lg:ml-[15rem] relative '>
      <HomePage />
      
      <div className='absolute bottom-2 w-[400px] md:w-[65%] sm:w-[80%]'>
        <SwipeStatus />
      </div>
    
    </div>
  );
};

export default Dashboard;
