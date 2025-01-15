

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
      className={`w-full p-2 rounded-sm shadow-lg flex justify-center items-center text-lg font-semibold transition-colors duration-300 md:rounded-full md:px-4 ${
        status === 'Online'
          ? 'bg-[#020e7c] text-white'
          : 'bg-gray-500 text-gray-200'
      }`}
    >
      {status === 'Online' ? (
        <button onClick={()=>setStatus('Offline')} className='w-full flex justify-between items-center '>
          <span className='text-center'>Online</span>
          <span className='inline'>{'<<'} swipe  to go Offline</span>
        </button>
      ) : (
        <button onClick={()=>setStatus('Online')} className=''>
        <span className='inline'>swipe to go Online {'>>'}</span>
          <span className='text-center'>Offline</span>
        </button>
      )}
    </div>
  );
};

export default SwipeStatus;
