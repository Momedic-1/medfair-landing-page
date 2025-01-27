
import React, { useState, useEffect } from 'react';
import { baseUrl } from "../env";
import Table from '../components/reuseables/Table';
import axios from 'axios';
import { getPatientId, getToken } from '../utils';

const PatientNotes = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const patientId = getPatientId();
  const token = getToken();

   console.log(results, "result");
  const fetchPatients = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${baseUrl}/api/notes/patient/${patientId}`, {
        headers:{
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });
   
      const data = response?.data
      console.log(data, "data");
     
      setResults(data);
      } catch (error) {
        setError(error.message);
        setLoading(false);
        } finally {
          setLoading(false);
        }
  }


  useEffect(() => {
    fetchPatients();
  }, []); 

  return (
    <div className="h-screen flex ">
      <div className="p-8 w-full">
        <Table data={results} isLoading={loading} emptyMessage={"No Patients data"}/>
      </div>
    </div>
  );
};

export default PatientNotes;
