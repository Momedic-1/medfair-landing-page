import React from 'react';
import { formatDate } from '../../utils';

const Table = ({ data = [], isLoading = false, emptyMessage }) => {
  console.log(data)
  return (
    // <div className="w-full flex flex-col">
    //   <div className="flex-grow overflow-auto bg-white h-[700px]">
    //     <table className="min-w-full h-full">
    //       <thead className="bg-gray-50 sticky top-0 z-10">
    //         <tr className="border-b border-gray-300">
    //           <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
    //             Doctor's First Name
    //           </th>
    //           <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
    //             Doctor's Last Name
    //           </th>
    //           <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
    //             Visit Date
    //           </th>
    //           <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap min-w-[200px]">
    //             Subjective
    //           </th>
    //           <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap min-w-[200px]">
    //             Objective
    //           </th>
    //           <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap min-w-[200px]">
    //             Assessment
    //           </th>
    //           <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap min-w-[200px]">
    //             Plan
    //           </th>
    //           <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap min-w-[200px]">
    //             Final Diagnosis
    //           </th>
    //           <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap min-w-[200px]">
    //             SOAP Comment
    //           </th>
    //           <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap min-w-[150px]">
    //             Drugs
    //           </th>
    //           <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
    //             Actions
    //           </th>
    //         </tr>
    //       </thead>
    //       <tbody>
    //         {isLoading ? (
    //           <tr>
    //             <td colSpan="7" className="text-center py-4">
    //               Loading...
    //             </td>
    //           </tr>
    //         ) : data.length === 0 ? (
    //           <tr>
    //             <td colSpan="7" className="text-center py-4">
    //               {emptyMessage || 'No data available'}
    //             </td>
    //           </tr>
    //         ) : (
    //           data.map((patient, index) => (
    //             <tr key={index} className="border-b border-gray-200">
    //               <td className="px-2 py-1 text-sm text-gray-700">{patient.doctorFirstName}</td>
    //               <td className="px-2 py-1 text-sm text-gray-700">{patient.doctorLastName}</td>
    //               <td className="px-2 py-1 text-sm text-gray-700">{formatDate(patient.visitDate)}</td>
    //               <td className="px-2 py-1 text-sm text-gray-700">{patient.subjective}</td>
    //               <td className="px-2 py-1 text-sm text-gray-700">{patient.objective}</td>
    //               <td className="px-2 py-1 text-sm text-gray-700">{patient.assessment}</td>
    //               <td className="px-2 py-1 text-sm text-gray-700">{patient.plan}</td>
    //             </tr>
    //           ))
    //         )}
    //       </tbody>
    //     </table>
    //   </div>
    // </div>
    <div className="w-full overflow-x-auto">
      <div className="min-w-full bg-white shadow-md rounded-lg overflow-auto">
        <table className="min-w-full leading-normal">
          <thead className="bg-gray-50 sticky top-0 z-10 py-4">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Doctor's First Name</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Doctor's Last Name</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Visit Date</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subjective</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Objective</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assessment</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Plan</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Final diagnosis</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SOAP comment</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Drugs</th>
            </tr>
          </thead>

            <tbody>
           {isLoading ? (
              <tr>
                <td colSpan="7" className="text-center py-4">
                  
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
                  <td className="px-2 py-2 text-sm text-gray-700 items-center">{patient.doctorFirstName}</td>
                  <td className="px-2 py-2 text-sm text-gray-700 items-center">{patient.doctorLastName}</td>
                  <td className="px-2 py-2 text-sm text-gray-700 items-center">{formatDate(patient.visitDate)}</td>
                  <td className="px-2 py-2 text-sm text-gray-700 items-center">{patient.subjective}</td>
                  <td className="px-2 py-2 text-sm text-gray-700 items-center">{patient.objective}</td>
                  <td className="px-2 py-2 text-sm text-gray-700 items-center">{patient.assessment}</td>
                  <td className="px-2 py-2 text-sm text-gray-700 items-center">{patient.plan}</td>
                  <td className="px-2 py-2 text-sm text-gray-700 items-center">{patient.finalDiagnosis}</td>
                  <td className="px-2 py-2 text-sm text-gray-700 items-center">{patient.soapComment}</td>
                  <td className="px-2 py-2 text-sm text-gray-700 items-center">{patient.drugs.map((drug)=> {
                    return drug.name + " " + drug.dosage
                  })}</td>
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