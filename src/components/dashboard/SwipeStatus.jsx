import React, { useState } from 'react'
import { useSwipeable } from 'react-swipeable'

const SwipeStatus = () => {
  const [status, setStatus] = useState('Offline')

  const handlers = useSwipeable({
    onSwipedLeft: () => setStatus('Offline'),
    onSwipedRight: () => setStatus('Online'),
    preventDefaultTouchmoveEvent: true,
    trackMouse: true
  })

  return (
    <div
      {...handlers}
      className={`w-full max-w-full p-4 rounded-lg shadow-lg flex justify-between items-center text-xl font-semibold ${
        status === 'Online'
          ? 'bg-blue-600 text-white'
          : 'bg-gray-500 text-gray-200'
      }`}
    >
      {status === 'Online' ? (
        <>
          <span>Online</span>
          <span>{'<<'} swipe to go Offline</span>
        </>
      ) : (
        <>
          <span>swipe to go Online {'>>'}</span>
          <span>Offline</span>
        </>
      )}
    </div>
  )
}

export default SwipeStatus
