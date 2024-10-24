
import React, { useState } from 'react';

const Modal = ({ isOpen, onClose, onConfirm }) => {
  const [time, setTime] = useState({ hours: '02', minutes: '30', amPm: 'PM' });

  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm(time);
    onClose();
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
      <div className="bg-blue-200 rounded-lg p-6 w-[70%] sm:w-[70%] md:w-[50%] lg:w-[26%]">
        <h3 className="text-center text-lg font-semibold mb-6 text-blue-900">
          Set Time for Appointment
        </h3>
        
        <div className="flex justify-center items-center mb-4 space-x-4">
          <div className="flex flex-col items-center">
            <label className="text-sm font-medium text-blue-900 mb-1">Hour</label>
            <input
              type="number"
              value={time.hours}
              onChange={(e) => setTime({ ...time, hours: e.target.value })}
              className="border rounded-md text-center w-16 p-2 text-xl bg-white"
              min="1"
              max="12"
              placeholder="HH"
            />
          </div>
          <span className="text-2xl font-semibold">:</span>

          <div className="flex flex-col items-center">
            <label className="text-sm font-medium text-blue-900 mb-1">Minutes</label>
            <input
              type="number"
              value={time.minutes}
              onChange={(e) => setTime({ ...time, minutes: e.target.value })}
              className="border rounded-md text-center w-16 p-2 text-xl bg-white"
              min="0"
              max="59"
              placeholder="MM"
            />
          </div>
  
          <div className="flex flex-col items-center space-x-1">
            <label className="text-sm font-medium text-blue-900 mb-1">AM/PM</label>
            <div className="flex">
              <button
                className={`px-2 py-1 border rounded-l-md ${
                  time.amPm === 'AM' ? 'bg-blue-900 text-white' : 'bg-white text-blue-900'
                }`}
                onClick={() => setTime({ ...time, amPm: 'AM' })}
              >
               PM
              </button>
              <button
                className={`px-2 py-1 border rounded-r-md ${
                  time.amPm === 'PM' ? 'bg-blue-900 text-white' : 'bg-white text-blue-900'
                }`}
                onClick={() => setTime({ ...time, amPm: 'PM' })}
              >
                
                AM
              </button>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-center mt-4">
          
          <button
            onClick={handleConfirm}
            className="px-6 py-2 bg-blue-900 text-white rounded-lg font-semibold"
          >
            Set Time
          </button>
        </div>
      </div>
    </div>
  );
};

export default Modal;
