
import React, { useState, useEffect } from 'react';
import { baseUrl } from "../env";
import Sidebar from '../PatientDashboard/Sidebar';
import axios from 'axios';

const PatientNotes = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);


  useEffect(() => {
    const fetchPatientNotes = async () => {
      setLoading(true);
      try {
         const id = sessionStorage.getItem("id"); 
         const token = JSON.parse(localStorage.getItem('authToken'))?.token;
        console.log(token);

        if (!id || !token) {
          setError("No ID or token found, unable to fetch patient notes.");
          setLoading(false);
          return;
        }

        const response = await axios.get(`${baseUrl}/api/notes/file/medfair5314`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
        const data = await response.json();
        console.log(data);
        setResults(data);
      } catch (err) {
        setError("Failed to fetch patient notes. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchPatientNotes();
  }, []); 

  return (
    <div className="h-screen flex ">
      <Sidebar />
      <div className="p-8">
        <div className=" overflow-x-auto md:space-x-4 space-y-4 md:space-y-0 ">
          <table className="table-auto border-collapse border border-gray-300 w-full text-left">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 px-4 py-2">Doctor First Name</th>
                <th className="border border-gray-300 px-4 py-2">Doctor Last Name</th>
                <th className="border border-gray-300 px-4 py-2">Visit Date</th>
                <th className="border border-gray-300 px-4 py-2">Subjective</th>
                <th className="border border-gray-300 px-4 py-2">Objective</th>
                <th className="border border-gray-300 px-4 py-2">Assessment</th>
                <th className="border border-gray-300 px-4 py-2">Plan</th>
                <th className="border border-gray-300 px-4 py-2">Final Diagnosis</th>
                <th className="border border-gray-300 px-4 py-2">SOAP Comment</th>
                <th className="border border-gray-300 px-4 py-2">Drugs</th>
              </tr>
            </thead>
            <tbody>
              {results.map((note, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="border border-gray-300 px-4 py-2">{note.doctorFirstName}</td>
                  <td className="border border-gray-300 px-4 py-2">{note.doctorLastName}</td>
                  <td className="border border-gray-300 px-4 py-2">
                    {new Date(note.visitDate).toLocaleString()}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">{note.subjective}</td>
                  <td className="border border-gray-300 px-4 py-2">{note.objective}</td>
                  <td className="border border-gray-300 px-4 py-2">{note.assessment}</td>
                  <td className="border border-gray-300 px-4 py-2">{note.plan}</td>
                  <td className="border border-gray-300 px-4 py-2">{note.finalDiagnosis}</td>
                  <td className="border border-gray-300 px-4 py-2">{note.soapComment}</td>
                  <td className="border border-gray-300 px-4 py-2">
                    <ul>
                      {note.drugs.map((drug, index) => (
                        <li key={index}>{drug.name} - {drug.dosage}</li>
                      ))}
                    </ul>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {loading && <p>Loading...</p>}
          {error && <p>{error}</p>}
        </div>
      </div>
    </div>
  );
};

export default PatientNotes;
