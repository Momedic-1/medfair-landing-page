import React from 'react';
import { Edit, Trash2 } from "lucide-react";
import { formatDate } from '../../utils';

const PatientTableSkeleton = () => (
  <tr className="border-b border-gray-200">
    {Array(11).fill(0).map((_, i) => (
      <td key={i} className="border border-gray-200 px-4 py-2">
        <div className="h-4 bg-gray-200 rounded animate-pulse" />
      </td>
    ))}
  </tr>
);

const PatientTable = ({ data = [], isLoading = false, emptyMessage }) => {
  return (
    <div className="w-full border rounded-lg flex flex-col h-[400px]">
      <div className="w-full overflow-x-auto">
        <table className="min-w-full">
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
              {/* <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                Actions
              </th> */}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200 overflow-y-auto">
            {isLoading ? (
        
              <>
                {Array(8).fill(0).map((_, index) => (
                  <PatientTableSkeleton key={index} />
                ))}
              </>
            ) : data.length === 0 ? (
    
              <tr>
                <td colSpan={11} className="h-[520px]"> {/* Adjusted height to account for header */}
                  <div className="flex flex-col items-center justify-center h-full space-y-2">
                    <p className="text-lg font-medium text-gray-600">{emptyMessage}</p>
                    <p className="text-sm text-gray-400">Patient records will appear here once added</p>
                  </div>
                </td>
              </tr>
            ) : (
           
              data.map((patient, index) => (
                <tr key={index} className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="px-4 py-4 whitespace-nowrap font-medium text-gray-900">{patient.patientFirstName}</td>
                  <td className="px-4 py-4 whitespace-nowrap text-gray-700">{patient.patientLastName}</td>
                  <td className="px-4 py-4 whitespace-nowrap text-gray-700">{formatDate(patient.visitDate)}</td>
                  <td className="px-4 py-4 text-gray-700">{patient.subjective}</td>
                  <td className="px-4 py-4 text-gray-700">{patient.objective}</td>
                  <td className="px-4 py-4 text-gray-700">{patient.assessment}</td>
                  <td className="px-4 py-4 text-gray-700">{patient.plan}</td>
                  <td className="px-4 py-4 text-gray-700">{patient.finalDiagnosis}</td>
                  <td className="px-4 py-4 text-gray-700">{patient.soapComment}</td>
                  <td className="px-4 py-4 text-gray-700">{patient.drugs.map((drug)=> {
                    return <p>{`${drug.name}, ${drug.dosage}`}</p>
                  })}</td>
                  {/* <td className="px-4 py-4 whitespace-nowrap">
                    <div className="flex space-x-2">
                      <button className="p-1 hover:bg-gray-100 rounded-full">
                        <Edit className="h-4 w-4 text-gray-600" />
                      </button>
                      <button className="p-1 hover:bg-red-50 rounded-full">
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </button>
                    </div>
                  </td> */}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PatientTable;