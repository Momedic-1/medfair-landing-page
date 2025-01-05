
import { useState, useEffect } from "react";
import axios from "axios";
import { baseUrl } from "../env";

const AddNoteModal = ({ isOpen, onClose, onNoteAdded }) => {
  const [patientFirstName, setpatientFirstName] = useState('');
  const [patientLastName, setPatientLastName] = useState('');
  const [visitDate, setVisitDate] = useState('');
  const [subjective, setSubjective] = useState('');
  const [objective, setObjective] = useState('');
  const [assessment, setAssessment] = useState('');
  const [plan, setPlan] = useState('');
  const [finalDiagnosis, setFinalDiagnosis] = useState('');
  const [soapComment, setSoapComment] = useState('');
  const [drugs, setDrugs] = useState([{ name: '', dosage: '' }]);
  const [existingNotes, setExistingNotes] = useState([]);
  const [isViewNotesOpen, setIsViewNotesOpen] = useState(false);
  const [loading, setLoading] = useState("");
  const token = JSON.parse(localStorage.getItem('authToken'))?.token;
  const userData = JSON.parse(localStorage.getItem('userData')) || {};
  

  const patientId = localStorage.getItem("patientId"); 

  useEffect(() => {
    if (patientId && isOpen && !existingNotes.length) {
      fetchPatientNotes();
    }
  }, [isOpen]);

  const fetchPatientNotes = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${baseUrl}/api/notes/get-all-patient-note/${patientId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const notesData = response.data;
      if (notesData.length > 0) {
        const firstNote = notesData[0];
        setpatientFirstName(firstNote.patientFirstName);
        setPatientLastName(firstNote.patientLastName);
      }
        setExistingNotes(notesData);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching patient notes:", err);
      setLoading(false);
    }
  };
   
  const handleViewNotes = async () => {
    if (!isViewNotesOpen) {
      await fetchPatientNotes();
    }
    setIsViewNotesOpen((prev) => !prev);
  };
  
  const handleAddNote = async (e) => {
    e.preventDefault();

    for (let drug of drugs) {
      if (!drug.name || !drug.dosage) {
        alert("Please provide both drug name and dosage.");
        return;
      }
    }
    const formData = {
      doctorId: userData?.id, 
      patientId: patientId, 
      patientFirstName,
      patientLastName,
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
      resetForm();
      onClose();
    } catch (err) {
      console.error("Failed to add note:", err);
    }
  };
  const resetForm = () => {
    setVisitDate('');
    setSubjective('');
    setObjective('');
    setAssessment('');
    setPlan('');
    setFinalDiagnosis('');
    setSoapComment('');
    setDrugs([{ name: '', dosage: '' }]);
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
      <div className="bg-white w-[90%] max-w-lg rounded-lg shadow-lg p-6 max-h-[80vh] overflow-y-scroll">
      
     
      <div className="flex items-center justify-between mb-4">
      <h2 className="text-xl font-semibold">Add New Note</h2>
      <button
        onClick={handleViewNotes}
        className="bg-blue-500 text-white px-6 py-2 rounded-md"
      >
        {isViewNotesOpen ? "Hide Notes" : "View Notes"}
      </button>
    </div>
        {isViewNotesOpen && (
          <div className="border p-4 mb-4">
            {loading ? (
              <p>Loading notes...</p>
            ) : (
              <>
                {existingNotes.length > 0 ? (
                  existingNotes.map((note, index) => (
                    <div key={index} className="border-b mb-2">
                      <p><strong>Date:</strong> {note.visitDate}</p>
                      <p><strong>Subjective:</strong> {note.subjective}</p>
                      <p><strong>Objective:</strong> {note.objective}</p>
                      <p><strong>Assessment:</strong> {note.assessment}</p>
                      <p><strong>Plan:</strong> {note.plan}</p>
                      <p><strong>finalDiagnosis:</strong> {note.finalDiagnosis}</p>
                      <p><strong>soapComment:</strong> {note.soapComment}</p>
                      <ul>
                     {note.drugs.map((drug, idx) => (
                      <li key={idx}>{drug.name} - {drug.dosage}</li>
                    ))}
                  </ul>
                    </div>
                  ))
                ) : (
                  <p>No notes found.</p>
                )}
              </>
            )}
          </div>
        )}
   
        <form onSubmit={handleAddNote} className="space-y-4">
          <div className="border rounded p-4">
            <span className="font-bold text-[#020E7C] mb-4 text-xl text-center">
              PatientName: {patientFirstName} {patientLastName}
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
