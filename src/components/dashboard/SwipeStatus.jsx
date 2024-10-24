
import React, { useState } from 'react';
import { useSwipeable } from 'react-swipeable';

const SwipeStatus = () => {
  const [status, setStatus] = useState('Offline');

  const handlers = useSwipeable({
    onSwipedLeft: () => setStatus('Offline'),
    onSwipedRight: () => setStatus('Online'),
    preventDefaultTouchmoveEvent: true,
    trackMouse: true,
  });

  return (
    <div
      {...handlers}
      className={`w-full p-2 rounded-lg shadow-lg flex justify-between items-center text-lg font-semibold ${
        status === 'Online'
          ? 'bg-[#020e7c] text-white'
          : 'bg-gray-500 text-gray-200'
      }`}
    >
      {status === 'Online' ? (
        <>
          <span>Online</span>
          <span className='hidden sm:inline'>{'<<'} swipe to go Offline</span>
        </>
      ) : (
        <>
          <span className='hidden sm:inline'>swipe to go Online {'>>'}</span>
          <span>Offline</span>
        </>
      )}
    </div>
  );
};

export default SwipeStatus;
