import React from 'react'
import HomePage from './dashboard/HomePage'
import SwipeStatus from './dashboard/SwipeStatus'

const Dashboard = () => {
  return (
    <div className=' lg:ml-[18rem]'>
      <HomePage />
      <div className=' bottom-2  right-6 left-6 lg:right-6 lg:left-[18rem]'>
        <SwipeStatus />
      </div>
    </div>
  )
}

export default Dashboard
