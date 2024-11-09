

import React, {useEffect, useState} from 'react';
import { useSwipeable } from 'react-swipeable';

const SwipeStatus = ({status, setStatus}) => {
  const onlineStatus = "onlineStatus"
  useEffect(()=>{
    saveToStore()
  }, [status])

  const handlers = useSwipeable({
    onSwipedLeft: () => {setStatus('Offline')},
    onSwipedRight: () => setStatus('Online'),
    preventDefaultTouchmoveEvent: true,
    trackMouse: true,
   
  });
  const saveToStore = () =>{
    localStorage.setItem(onlineStatus, status);
  }
  return (
    <div
      {...handlers}
      className={`w-full p-2 rounded-lg shadow-lg flex justify-between items-center text-lg font-semibold transition-colors duration-300 ${
        status === 'Online'
          ? 'bg-[#020e7c] text-white'
          : 'bg-gray-500 text-gray-200'
      }`}
    >
      {status === 'Online' ? (
        <>
          <span className='text-center'>Online</span>
          <span className='hidden sm:inline'>{'<<'} swipe  to go Offline</span>
        </>
      ) : (
        <>
        <span className='hidden sm:inline'>swipe to go Online {'>>'}</span>
          <span className='text-center'>Offline</span>
        </>
      )}
    
      <button
        onClick={() => setStatus(status === 'Online' ? 'Offline' : 'Online')}
        className="ml-4 px-3 py-1 bg-white text-black rounded-lg sm:hidden"
      >
        Toggle Status
      </button>
    </div>
  );
};

export default SwipeStatus;
