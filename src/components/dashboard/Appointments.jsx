import React, { useState } from 'react'

const Calendar = () => {
  const [currentMonth, setCurrentMonth] = useState('September 2023')
  const [selectedDate, setSelectedDate] = useState('23')

  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const dates = [
    '30',
    '31',
    '01',
    '02',
    '03',
    '04',
    '05',
    '06',
    '07',
    '08',
    '09',
    '10',
    '11',
    '12',
    '13',
    '14',
    '15',
    '16',
    '17',
    '18',
    '19',
    '20',
    '21',
    '22',
    '23',
    '24',
    '25',
    '26',
    '27',
    '28',
    '29',
    '30'
  ]

  return (
    <div className='bg-white rounded-lg mt-4 shadow-lg sm:w-[329px] w-full h-[370px] flex flex-col lg:ml-8'>
      <div className='p-4 flex-grow'>
        <div className='flex justify-between items-center mb-6'>
          <h2 className='text-lg font-bold text-blue-900'>Appointments</h2>
          <select className='text-blue-900 bg-transparent border-none text-sm font-semibold focus:outline-none'>
            <option>Today</option>
          </select>
        </div>
        <div className='flex justify-between items-center mb-6'>
          <button className='text-blue-900 border border-blue-900 rounded-full w-6 h-6 flex items-center justify-center text-xs'>
            &lt;
          </button>
          <span className='text-blue-900 font-semibold text-sm'>
            {currentMonth}
          </span>
          <button className='text-blue-900 border border-blue-900 rounded-full w-6 h-6 flex items-center justify-center text-xs'>
            &gt;
          </button>
        </div>
        <div className='grid grid-cols-7 gap-1 mb-2'>
          {days.map(day => (
            <div
              key={day}
              className='text-center font-semibold text-blue-900 text-xs'
            >
              {day}
            </div>
          ))}
          {dates.map(date => (
            <button
              key={date}
              className={`text-center p-1 rounded-md text-xs ${
                date === '02'
                  ? 'bg-blue-200 text-blue-900'
                  : date === selectedDate
                  ? 'bg-red-500 text-white'
                  : 'text-gray-400 hover:bg-gray-100'
              }`}
              onClick={() => setSelectedDate(date)}
            >
              {date}
            </button>
          ))}
        </div>
        <div className='flex justify-between p-4 mt-auto'>
          <button className='px-4 py-1 border border-gray-300 text-gray-400 rounded-md text-sm'>
            Cancel
          </button>
          <button className='px-4 py-1 bg-blue-900 text-white rounded-md text-sm'>
            Apply
          </button>
        </div>
      </div>
    </div>
  )
}

export default Calendar
