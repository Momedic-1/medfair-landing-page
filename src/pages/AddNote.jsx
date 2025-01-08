
import { useState, useEffect } from "react";
import axios from "axios";
import { baseUrl } from "../env";
import { IoIosAdd } from "react-icons/io";
import { Accordion, AccordionDetails, AccordionSummary, Alert, Typography } from "@mui/material";
import { capitalizeFirstLetter, formatDate } from "../utils";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { ColorRing, ThreeCircles } from "react-loader-spinner";

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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
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

  useEffect(()=> {
    setError("");
  }, [drugs])
   
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
        setError("Please provide both drug name and dosage.");
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
       setLoading(true)
      const response = await axios.post(`${baseUrl}/api/notes/create`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      onNoteAdded(response.data);
      resetForm();
      onClose();
      setLoading(false)
    } catch (err) {
      setLoading(false)
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
      <h2 className="text-xl font-semibold text-blue-600">{isViewNotesOpen ? "View Previous Notes" : "Add New Notes"}</h2>
      <button
      
        onClick={handleViewNotes}
        className="bg-blue-500 text-white w-[160px] h-10 px-6 py-2 rounded-md flex items-center justify-center"
      >
        {isViewNotesOpen ? "Hide Notes" : loading ? <ColorRing  visible={true}
  height="40"
  width="40"
  ariaLabel="color-ring-loading"
  wrapperStyle={{}}
  wrapperClass="color-ring-wrapper"
  colors={['white', 'white', 'white', 'white', 'white']}/>
   : 
   "View Notes"}
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
                      <Accordion>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel1-content"
          id="panel1-header"
        >
          <div className="w-full flex justify-between items-center">
            <p className="text-blue-600 font-medium">Note #{note.id}</p>
          <p className="text-gray-900/60">{formatDate(note.visitDate)}</p>
          </div>
          
        </AccordionSummary>
        <AccordionDetails>
          <div className="w-full flex flex-col">
            <div className="w-full flex flex-col mb-2 gap-y-2">
              <p className="text-gray-800 text-lg font-semibold">Subjective</p>
              <p className="text-gray-800/60 text-sm">{note.subjective || "N/A"}</p>
            </div>
            <div className="w-full flex flex-col mb-2 gap-y-2">
              <p className="text-gray-800 text-lg font-semibold">Objective</p>
              <p className="text-gray-800/60 text-sm">{note.subjective || "N/A"}</p>
            </div>
            <div className="w-full flex flex-col mb-2 gap-y-2">
              <p className="text-gray-800 text-lg font-semibold">Assessment</p>
              <p className="text-gray-800/60 text-sm">{note.assessment || "N/A"}</p>
            </div>
            <div className="w-full flex flex-col mb-2 gap-y-2">
              <p className="text-gray-800 text-lg font-semibold">Plan</p>
              <p className="text-gray-800/60 text-sm">{note.plan || "N/A"}</p>
            </div>
            <div className="w-full flex flex-col mb-2 gap-y-2">
              <p className="text-gray-800 text-lg font-semibold">Fina Diagnosis</p>
              <p className="text-gray-800/60 text-sm">{note.finalDiagnosis || "N/A"}</p>
            </div>
            <div className="w-full flex flex-col mb-2 gap-y-2">
              <p className="text-gray-800 text-lg font-semibold">SOAP Comment</p>
              <p className="text-gray-800/60 text-sm">{note.soapComment || "N/A"}</p>
            </div>
             <ul>
              <p className="text-gray-800 text-lg font-semibold">Drug Prescription</p>
                     {note.drugs.map((drug, idx) => (
                      <li key={idx} className="text-gray-800/60 text-sm">{drug.name} - {drug.dosage}</li>
                    ))}
                  </ul>
          </div>
        </AccordionDetails>
      </Accordion>
                     
                    </div>
                  ))
                ) : (
                  <p>No notes found.</p>
                )}
              </>
            )}
          </div>
        )}
   
        {!isViewNotesOpen && <form className="space-y-4">
          <div className="border rounded p-4">
            <p className="font-bold text-[#020E7C] text-xl text-left">
              Patient Name
            </p>
            <hr className="mt-1"/>
            <p className="font-bold text-gray-900/50 mt-2 text-xl text-left">
             {`${capitalizeFirstLetter(patientFirstName)} ${capitalizeFirstLetter(patientLastName)}`}
            </p>
          </div>

          <div className="border rounded p-4">
            <label htmlFor="visitDate" className="block font-medium mb-1 text-[#020E7C]">Visit Date:</label>
            <input
              type="date"
              id="visitDate"
              className="border p-2 w-full outline-none"
              value={visitDate}
              onChange={(e) => setVisitDate(e.target.value)}
              required
            />
          </div>

          <div className="border rounded p-4">
            <label htmlFor="subjective" className="block text-sm font-medium mb-1 text-[#020E7C]">Subjective</label>
            <textarea
              id="subjective"
              value={subjective}
              onChange={(e) => setSubjective(e.target.value)}
              placeholder="Enter subjective information"
              className="border rounded p-2 w-full outline-none text-gray-900/60" 
            />
          </div>

          <div className="border rounded p-4">
            <label htmlFor="objective" className="block mb-1 text-[#020E7C] text-sm font-medium">Objective</label>
            <textarea
              id="objective"
              value={objective}
              onChange={(e) => setObjective(e.target.value)}
              placeholder="Enter objective information"
              className="border rounded p-2 w-full outline-none text-gray-900/60"
            />
          </div>

          <div className="border rounded p-4">
            <label htmlFor="assessment" className="block mb-1 text-[#020E7C] text-sm font-medium">Assessment</label>
            <textarea
              id="assessment"
              value={assessment}
              onChange={(e) => setAssessment(e.target.value)}
              placeholder="Enter assessment information"
              className="border rounded p-2 w-full outline-none text-gray-900/60"
            />
          </div>

          <div className="border rounded p-4">
            <label htmlFor="plan" className="block mb-1 text-[#020E7C] text-sm font-medium">Plan</label>
            <textarea
              id="plan"
              value={plan}
              onChange={(e) => setPlan(e.target.value)}
              placeholder="Enter plan information"
              className="border rounded p-2 w-full outline-none text-gray-900/60"
            />
          </div>

          <div className="border rounded p-4">
            <label htmlFor="finalDiagnosis" className="block mb-1 text-[#020E7C] text-sm font-medium">Final Diagnosis</label>
            <input
              id="finalDiagnosis"
              type="text"
              value={finalDiagnosis}
              onChange={(e) => setFinalDiagnosis(e.target.value)}
              placeholder="Enter final diagnosis"
              className="border rounded p-2 w-full outline-none text-gray-900/60"
            />
          </div>

          <div className="border rounded p-4">
            <label htmlFor="soapComment" className="block mb-1 text-[#020E7C] text-sm font-medium">SOAP Comment</label>
            <textarea
              id="soapComment"
              value={soapComment}
              onChange={(e) => setSoapComment(e.target.value)}
              placeholder="Enter SOAP comment"
              className="border rounded p-2 w-full outline-none text-gray-900/60"
            />
          </div>

          <div>
            <h3 className="text-sm font-medium mb-2 text-[#020E7C]">Drugs</h3>
            {drugs.map((drug, index) => (
              <div key={index} className="flex space-x-4 mb-2">
                <input
                  type="text"
                  value={drug.name}
                  onChange={(e) => handleDrugChange(e, index, 'name')}
                  placeholder="Drug name"
                  className="border p-2 w-1/2 outline-none text-gray-900/60"
                />
                <input
                  type="text"
                  value={drug.dosage}
                  onChange={(e) => handleDrugChange(e, index, 'dosage')}
                  placeholder="Dosage"
                  className="border p-2 w-1/2 outline-none text-gray-900/60"
                />
              </div>
            ))}
            <button
              type="button"
              onClick={handleAddDrug}
              className="text-blue-800 flex justify-center items-center px-4 py-2 rounded-md mt-2"
            >
             <p>
              Add another drug 
              </p> 
              <IoIosAdd fontSize={24}/>
            </button>
          </div>
          {error && <Alert severity="error">{error}</Alert>}
          <div className="flex justify-between mt-6">
            <button type="button" onClick={onClose} className="bg-white text-blue-600 px-4 py-2 rounded-md">
              Cancel
            </button>
            <button type="submit" className="bg-blue-500 text-white px-6 py-2 rounded-md w-[160px] h-10 flex justify-center items-center" onClick={handleAddNote} >
              {loading ? <ColorRing  visible={true}
  height="40"
  width="40"
  ariaLabel="color-ring-loading"
  wrapperStyle={{}}
  wrapperClass="color-ring-wrapper"
  colors={['white', 'white', 'white', 'white', 'white']}/> : "Add Note" }
            </button>
            
          </div>
         
        </form>}
      </div>
     
    </div>
  );
};

export default AddNoteModal;
