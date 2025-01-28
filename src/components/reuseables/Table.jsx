import React from 'react';
import { formatDate } from '../../utils';
import { Hourglass } from 'react-loader-spinner';

const Table = ({ data = [], isLoading = false, emptyMessage }) => {
  return (
    <div className="relative w-full h-screen overflow-x-auto">
      <div className="min-w-full bg-white shadow-md rounded-lg overflow-auto">
        <table className="min-w-full leading-normal text-center">
          <thead className="bg-gray-50 sticky top-0 z-10 py-4">
            <tr>
              <th className="px-4 py-2 w-64 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Doctor's Full Name</th>
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

            <tbody className='text-center'>
           {isLoading ? (
            <div className='absolute top-20 w-full h-[400px] flex items-center justify-center'>
                  <Hourglass
                              visible={true}
                              height="40"
                              width="40"
                              ariaLabel="hourglass-loading"
                              wrapperStyle={{}}
                              wrapperClass=""
                              colors={['#306cce', '#72a1ed']}
                            /> 
            </div>
            ) : (
              data?.length < 0 ? 
              (<tr>
                <td colSpan="7" className="text-center py-4">
                  {emptyMessage || 'No data available'}
                </td>
              </tr> ) :
              data.map((patient, index) => (
                <tr key={index} className="border-b border-gray-200">
                  <td className="px-2 py-2 text-sm text-gray-700">{`${patient.doctorLastName}, ${patient.doctorFirstName}`}</td>
                  <td className="px-2 py-2 text-sm text-gray-700">{formatDate(patient.visitDate)}</td>
                  <td className="px-2 py-2 text-sm text-gray-700 ">{patient.subjective}</td>
                  <td className="px-2 py-2 text-sm text-gray-700 ">{patient.objective}</td>
                  <td className="px-2 py-2 text-sm text-gray-700 ">{patient.assessment}</td>
                  <td className="px-2 py-2 text-sm text-gray-700">{patient.plan}</td>
                  <td className="px-2 py-2 text-sm text-gray-700">{patient.finalDiagnosis}</td>
                  <td className="px-2 py-2 text-sm text-gray-700">{patient.soapComment}</td>
                  <td className="px-2 py-2 text-sm text-gray-700">{patient.drugs.map((drug)=> {
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