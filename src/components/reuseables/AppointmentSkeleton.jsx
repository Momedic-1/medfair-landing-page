import React from 'react';

const AppointmentsSkeleton = () => {
  return (
    <div className="w-full bg-white rounded-lg h-[480px]">
      <div className="w-full h-full overflow-y-auto px-16 py-8">
        <div className="h-8 w-64 bg-gray-200 rounded animate-pulse" />
    
        <div className="mt-4">
          {[1, 2, 3, 4, 5, 6].map((item) => (
            <div
              key={item}
              className="mb-4 flex items-center justify-between border-b border-gray-200 py-2 mt-4"
            >
              <div className="flex items-center gap-x-4">
          
                <div className="h-6 w-32 bg-gray-200 rounded animate-pulse" />
           
                <div className="h-6 w-20 bg-gray-200 rounded animate-pulse" />
              </div>
              
          
              <div className="h-6 w-6 bg-gray-200 rounded animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AppointmentsSkeleton;