
import React, { useState, useEffect } from 'react';
import { baseUrl } from "../env";
import Table from '../components/reuseables/Table';

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

        if (!id || !token) {
          setError("No ID or token found, unable to fetch patient notes.");
          setLoading(false);
          return;
        }

        const response = await fetch(`${baseUrl}/api/notes/patient/${id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
        const data = await response.json();
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
      <div className="p-8 w-full">
        <Table emptyMessage={"No Patients data"}/>
      </div>
    </div>
  );
};

export default PatientNotes;
