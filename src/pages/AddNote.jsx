
import { useState, useEffect } from "react";
import axios from "axios";
import { baseUrl } from "../env";

const AddNoteModal = ({ isOpen, onClose, onNoteAdded }) => {
  const [visitDate, setVisitDate] = useState('');
  const [subjective, setSubjective] = useState('');
  const [objective, setObjective] = useState('');
  const [assessment, setAssessment] = useState('');
  const [plan, setPlan] = useState('');
  const [finalDiagnosis, setFinalDiagnosis] = useState('');
  const [soapComment, setSoapComment] = useState('');
  const [drugs, setDrugs] = useState([{ name: '', dosage: '' }]);

  const [patientId, setPatientId] = useState('');
  const [doctorId, setDoctorId] = useState('');

  const token = JSON.parse(localStorage.getItem('authToken'))?.token;
  const userData = JSON.parse(localStorage.getItem('userData')) || {};

  useEffect(() => {
    if (userData.id) {
      setPatientId(userData.id);
      setDoctorId(userData.id);
    }
  }, [userData]);

  
  


  const handleAddNote = async (e) => {
    e.preventDefault();

    for (let drug of drugs) {
      if (!drug.name || !drug.dosage) {
        alert("Please provide both drug name and dosage.");
        return;
      }
    }
    const formData = {
      doctorId,
      patientId,
      visitDate,
      subjective,
      objective,
      assessment,
      plan,
      finalDiagnosis,
      soapComment,
      drugs,
    };

    try {
      const response = await axios.post(`${baseUrl}/api/notes/create`, formData, {
        headers: {
          Authorization: `Bearer ${token}`, 
        },
      });

      onNoteAdded(response.data);
      
      setVisitDate('');
      setSubjective('');
      setObjective('');
      setAssessment('');
      setPlan('');
      setFinalDiagnosis('');
      setSoapComment('');
      setDrugs([{ name: '', dosage: '' }]);
     
      onClose();
    } catch (err) {
      console.error("Failed to add note:", err);
      
    }
  };

  const handleDrugChange = (e, index, field) => {
    const updatedDrugs = [...drugs];
    updatedDrugs[index][field] = e.target.value;
    setDrugs(updatedDrugs);
  };

  const handleAddDrug = () => {
    setDrugs([...drugs, { name: '', dosage: '' }]);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white w-[90%] max-w-lg rounded-lg shadow-lg p-6 max-h-[80vh] overflow-y-auto">
        <h2 className="text-xl font-semibold mb-4">Add New Note</h2>
        <form onSubmit={handleAddNote} className="space-y-4">
        
          <div className="border rounded p-4">
            <span className="font-bold text-[#020E7C] mb-4 text-xl text-center">
              Doctor {userData.firstName} {userData.lastName}
            </span>
          </div>
          <div className="border rounded p-4">
            <label htmlFor="visitDate" className="block font-medium">Visit Date:</label>
            <input
              type="date"
              id="visitDate"
              className="border p-2 w-full"
              value={visitDate}
              onChange={(e) => setVisitDate(e.target.value)}
              required
            />
          </div>
          <div className="border rounded p-4">
            <label htmlFor="subjective" className="block text-sm font-medium">Subjective</label>
            <textarea
              id="subjective"
              value={subjective}
              onChange={(e) => setSubjective(e.target.value)}
              placeholder="Enter subjective information"
              className="border rounded p-2 w-full"
            />
          </div>
          <div className="border rounded p-4">
            <label htmlFor="objective" className="block text-sm font-medium">Objective</label>
            <textarea
              id="objective"
              value={objective}
              onChange={(e) => setObjective(e.target.value)}
              placeholder="Enter objective information"
              className="border rounded p-2 w-full"
            />
          </div>

          
          <div className="border rounded p-4">
            <label htmlFor="assessment" className="block text-sm font-medium">Assessment</label>
            <textarea
              id="assessment"
              value={assessment}
              onChange={(e) => setAssessment(e.target.value)}
              placeholder="Enter assessment information"
              className="border rounded p-2 w-full"
            />
          </div>
          <div className="border rounded p-4">
            <label htmlFor="plan" className="block text-sm font-medium">Plan</label>
            <textarea
              id="plan"
              value={plan}
              onChange={(e) => setPlan(e.target.value)}
              placeholder="Enter plan information"
              className="border rounded p-2 w-full"
            />
          </div>
          <div className="border rounded p-4">
            <label htmlFor="finalDiagnosis" className="block text-sm font-medium">Final Diagnosis</label>
            <input
              id="finalDiagnosis"
              type="text"
              value={finalDiagnosis}
              onChange={(e) => setFinalDiagnosis(e.target.value)}
              placeholder="Enter final diagnosis"
              className="border rounded p-2 w-full"
            />
          </div>

          <div className="border rounded p-4">
            <label htmlFor="soapComment" className="block text-sm font-medium">SOAP Comment</label>
            <textarea
              id="soapComment"
              value={soapComment}
              onChange={(e) => setSoapComment(e.target.value)}
              placeholder="Enter SOAP comment"
              className="border rounded p-2 w-full"
            />
          </div>
          <div>
            <h3 className="text-sm font-medium mb-2">Drugs</h3>
            {drugs.map((drug, index) => (
              <div key={index} className="flex space-x-4 mb-2">
                <input
                  type="text"
                  value={drug.name}
                  onChange={(e) => handleDrugChange(e, index, 'name')}
                  placeholder="Drug name"
                  className="border p-2 w-1/2"
                />
                <input
                  type="text"
                  value={drug.dosage}
                  onChange={(e) => handleDrugChange(e, index, 'dosage')}
                  placeholder="Dosage"
                  className="border p-2 w-1/2"
                />
              </div>
            ))}
            <button
              type="button"
              onClick={handleAddDrug}
              className="bg-gray-300 text-black px-4 py-2 rounded-md mt-2"
            >
              Add another drug
            </button>
          </div>

          <div className="flex justify-between mt-6">
            <button type="button" onClick={onClose} className="bg-gray-300 text-black px-4 py-2 rounded-md">
              Cancel
            </button>
            <button type="submit" className="bg-blue-500 text-white px-6 py-2 rounded-md">
              Add Note
            </button>
          </div>
        </form>

       
      </div>
    </div>
  );
};

export default AddNoteModal;
