import React from 'react';

const Table = ({ data = [], isLoading = false, emptyMessage }) => {
  return (
    <div className="w-full flex flex-col">
      <div className="flex-grow overflow-auto bg-white h-[700px]">
        <table className="min-w-full h-full">
          <thead className="bg-gray-50 sticky top-0 z-10">
            <tr className="border-b border-gray-300">
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                Patient First Name
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                Patient Last Name
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                Visit Date
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap min-w-[200px]">
                Subjective
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap min-w-[200px]">
                Objective
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap min-w-[200px]">
                Assessment
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap min-w-[200px]">
                Plan
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap min-w-[200px]">
                Final Diagnosis
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap min-w-[200px]">
                SOAP Comment
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap min-w-[150px]">
                Drugs
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan="7" className="text-center py-4">
                  Loading...
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan="7" className="text-center py-4">
                  {emptyMessage || 'No data available'}
                </td>
              </tr>
            ) : (
              data.map((patient, index) => (
                <tr key={index} className="border-b border-gray-200">
                  <td className="px-4 py-3 text-sm text-gray-700">{patient.firstName}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{patient.lastName}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{patient.visitDate}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{patient.subjective}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{patient.objective}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{patient.assessment}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{patient.plan}</td>
                  {/* Add more table cells as needed */}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Table;