import React, { useState } from 'react';
import { Clock } from 'lucide-react';

const TimePickerDemo = ({selectedHour, selectedMinute, setSelectedHour, setSelectedMinute}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isHourView, setIsHourView] = useState(true);
  const [period, setPeriod] = useState('AM');

  const hours = Array.from({ length: 12 }, (_, i) => i + 1);
  const minutes = Array.from({ length: 12 }, (_, i) => i * 5);

  const formatTime = () => {
    const hour = selectedHour
    const minute = selectedMinute.toString().padStart(2, '0');
    return `${hour}:${minute} ${period}`;
  };

  const handleNumberClick = (value) => {
    if (isHourView) {
      let hour = value;
      if (period === 'PM' && hour !== 12) {
        hour += 12;
      } else if (period === 'AM' && hour === 12) {
        hour = 0;
      }
      setSelectedHour(hour);
      setIsHourView(false);
    } else {
      setSelectedMinute(value);
      setIsOpen(false);
    }
  };
  console.log(selectedHour, selectedMinute, period);

  return (
    <div className="p-8">
      <div className="relative inline-block">
        <p className='mb-2 font-semibold'>Pick a time</p>
        <div 
          className="flex items-center gap-2 w-full p-2 border rounded-md cursor-pointer hover:border-gray-400 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-200"
          onClick={() => setIsOpen(true)}
        >
          <Clock className="w-4 h-4 text-gray-500" />
          <input
            type="text"
            value={formatTime()}
            className="outline-none w-full cursor-pointer"
            readOnly
          />
        </div>

        {isOpen && (
          <div className="absolute mt-2 p-4 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
        
            <div className="flex justify-end gap-2 mb-4">
              <button
                onClick={() => setPeriod('AM')}
                className={`px-2 py-1 rounded ${
                  period === 'AM' 
                    ? 'bg-blue-500 text-white' 
                    : 'text-gray-500 hover:bg-gray-100'
                }`}
              >
                AM
              </button>
              <button
                onClick={() => setPeriod('PM')}
                className={`px-2 py-1 rounded ${
                  period === 'PM' 
                    ? 'bg-blue-500 text-white' 
                    : 'text-gray-500 hover:bg-gray-100'
                }`}
              >
                PM
              </button>
            </div>

            <div 
              className="w-64 h-64 rounded-full border-4 border-gray-200 relative"
              onClick={() => setIsHourView(!isHourView)}
            >
      
              <div className="absolute left-1/2 top-1/2 w-2 h-2 bg-blue-500 rounded-full -translate-x-1/2 -translate-y-1/2" />
              
        
             
              
          
              {(isHourView ? hours : minutes).map((num) => {
                const angle = (num * (isHourView ? 30 : 6) - 90) * (Math.PI / 180);
                const radius = 100; // Adjust this value to position numbers
                const x = Math.cos(angle) * radius;
                const y = Math.sin(angle) * radius;
                
                const isSelected = isHourView 
                  ? num === selectedHour 
                  : num === selectedMinute;

                return (
                  <div
                    key={num}
                    onClick={() => handleNumberClick(num)}
                    className={`absolute w-8 h-8 -ml-4 -mt-4 flex items-center justify-center rounded-full cursor-pointer
                      ${isSelected 
                        ? 'bg-blue-500 text-white' 
                        : 'hover:bg-blue-100'
                      }`}
                    style={{
                      left: `${x + 128}px`,
                      top: `${y + 128}px`
                    }}
                  >
                    {isHourView ? num : num.toString().padStart(2, '0')}
                  </div>
                );
              })}
            </div>

      
            <div className="mt-4 text-center mb-4">
              <button
                onClick={() => setIsHourView(!isHourView)}
                className="text-blue-500 hover:text-blue-600"
              >
                {isHourView ? 'Switch to minutes' : 'Switch to hours'}
              </button>
            </div>

            
            <div className="flex justify-between px-2">
              <button 
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-md"
              >
                Cancel
              </button>
              <button 
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 text-sm text-white bg-blue-500 hover:bg-blue-600 rounded-md"
              >
                OK
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TimePickerDemo;