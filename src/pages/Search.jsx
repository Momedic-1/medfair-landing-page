

import { useState } from "react";
import { baseUrl } from "../env";

const Search = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const token = JSON.parse(localStorage.getItem('authToken'))?.token;
  const userData = JSON.parse(localStorage.getItem('userData'));
  const [selectedNote, setSelectedNote] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAddNoteModalOpen, setIsAddNoteModalOpen] = useState(false);

  const [doctorName, setDoctorName] = useState("");
  const [visitDate, setVisitDate] = useState("");
  const [subjective, setSubjective] = useState("");
   const [objective, setObjective] = useState("");
   const [assessment, setAssessment] = useState("");
   const [plan, setPlan] = useState("");
   const [finalDiagnosis, setFinalDiagnosis] = useState("");
   const [soapComment, setSoapComment] = useState("");
  
   const [drugs, setDrugs] = useState("");
 
  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `${baseUrl}/api/notes/search?firstName=${firstName}&lastName=${lastName}`
      );
      if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
      const data = await response.json();
      setResults(data);
    } catch (err) {
      setError("Failed to fetch data. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

   
  const handleView = (note) => {
    setSelectedNote(note);
    setIsModalOpen(true);
  };

  
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedNote(null);
  };


  const openAddNoteModal = () => {
    setIsAddNoteModalOpen(true);
  };

  const closeAddNoteModal = () => {
    setIsAddNoteModalOpen(false);
  };


  const handleAddNote = async (e) => {
    e.preventDefault();

    const newNote = {
      doctor: `${userData.firstName} ${userData.lastName}`,
      visitDate,
      subjective: "", 
      objective: "",
      assessment: "",
      plan: "",
      finalDiagnosis: "",
      soapComment: "",
      drugs: [], 
    };
    
    setNotes([...notes, newNote]);

    
    setVisitDate('');
    setSubjective('');
    setObjective('');
    setAssessment('');
    setPlan('');
    setFinalDiagnosis('');
    setSoapComment('');
    setDrugs('');
    
    try {
      const response = await fetch(`${baseUrl}/api/notes/search`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newNote),
      });

      if (!response.ok) throw new Error("Failed to add note");

      const addedNote = await response.json();

     
      setResults([...results, addedNote]);

     
      setDoctorName("");
      setVisitDate("");
      closeAddNoteModal(); 
    } catch (err) {
      setError("Failed to add note. Please try again later.");
    }
  };

  return (
    <div className="p-6">
     
      <div className="flex justify-end mb-4">
        <button
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          onClick={openAddNoteModal}
        >
          Add New Note
        </button>
      </div>

      <form onSubmit={handleSearch} className="mb-6 space-y-4">
        <div className="flex flex-col  md:flex-row md:space-x-4 space-y-4 md:space-y-0 lg:pl-56">
          <div>
            <label htmlFor="firstName" className="block text-sm font-medium">
              First Name
            </label>
            <input
              id="firstName"
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="Enter first name"
              className="border rounded p-2 w-full md:w-[200px]"
            />
          </div>
          <div>
            <label htmlFor="lastName" className="block text-sm font-medium">
              Last Name
            </label>
            <input
              id="lastName"
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Enter last name"
              className="border rounded p-2 w-full md:w-[200px]"
            />
          </div>
          <div className="flex items-end">
            <button
              type="submit"
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 w-full md:w-auto"
            >
              Search
            </button>
          </div>
        </div>
      </form>

      <div className="overflow-x-auto md:space-x-4 space-y-4 md:space-y-0 lg:pl-56">
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
              <th className="border border-gray-300 px-4 py-2">Actions</th>
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
        <td className="border border-gray-300 px-4 py-2">
       <button
       onClick={() => handleView(note)}
     className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-green-600"
      >
         View
       </button>
          </td>  
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
           <div className="bg-white w-[90%] max-w-lg rounded-lg shadow-lg p-6  max-h-[80vh] overflow-y-auto">
             <h2 className="text-xl font-semibold mb-4">View Note</h2>
             <div className="space-y-4">
               <div className="border py-2 px-2">
                <label className="font-medium">Doctor Name:</label>
                 <p>{selectedNote?.doctorFirstName} {selectedNote?.doctorLastName}</p>
               </div>
               <div className="border py-2 px-2">
                <label className="font-medium">Visit Date:</label>
                <p>{new Date(selectedNote?.visitDate).toLocaleDateString()}</p>
              </div>
              <div className=" border py-2 px-2">
                <label className="font-medium">Subjective:</label>
                <p>{selectedNote?.subjective}</p>
               </div>
               <div className="border py-2 px-2">
                 <label className="font-medium">Objective:</label>
                 <p>{selectedNote?.objective}</p>
               </div>
              <div className="border">
                 <label className="font-medium">Assessment:</label>
                <p>{selectedNote?.assessment}</p>
               </div>
               <div className="border py-2 px-2">
                 <label className="font-medium">Plan:</label>
                 <p>{selectedNote?.plan}</p>
               </div>
               <div className="border py-2 px-2">
                 <label className="font-medium">Final Diagnosis:</label>
                 <p>{selectedNote?.finalDiagnosis}</p>
               </div>
               <div className="border py-2 px-2">
                 <label className="font-medium">SOAP Comment:</label>
                 <p>{selectedNote?.soapComment}</p>
               </div>
               <div className="border py-2 px-2">
                 <label className="font-medium">Drugs:</label>
                 <ul>
                   {selectedNote?.drugs.map((drug, index) => (
                     <li key={index}>{drug.name} - {drug.dosage}</li>
                   ))}
                 </ul>
               </div>
              </div>
                <button
                   type="button"
                   onClick={closeModal}
                   className="bg-gray-500 text-white mt-4 px-4 py-2 rounded hover:bg-gray-600"
                >
                   Cancel
                </button>
           </div>
        </div>
       )}
    
      {isAddNoteModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white w-[90%] max-w-lg rounded-lg shadow-lg p-6 max-h-[80vh] overflow-y-auto">
       
            <h2 className="text-xl font-semibold mb-4">Add New Note</h2>
            <form onSubmit={handleAddNote} className="space-y-4">
            <div className="border rounded p-4">
                <span className="font-bold text-[#020E7C] mb-4 max-w-md text-xl text-center items-center justify-center pr-[3rem] sm:pr-[12rem] lg:pr-[7rem] md:pr-[13rem]">
                  Doctor {userData.firstName} {userData.lastName}
                </span>
              </div>
              <div className="border rounded p-4">
                <label htmlFor="visitDate" className="block font-medium">
                  Visit Date:
                </label>
                <input
                  type="date"
                  id="visitDate"
                  className="border p-2 w-full"
                  value={visitDate}
                  onChange={(e) => setVisitDate(e.target.value)}
                  required
                />
              </div>
              <div>
                 <label htmlFor="subjective" className="block text-sm font-medium">Subjective</label>
                <textarea
                  id="subjective"
                   value={subjective}
                   onChange={(e) => setSubjective(e.target.value)}
                   placeholder="Enter subjective information"
                   className="border rounded p-2 w-full"
                 />
               </div>
               <div>
               <label htmlFor="objective" className="block text-sm font-medium">Objective</label>
                <textarea
                  id="objective"
                  value={objective}
                  onChange={(e) => setObjective(e.target.value)}
                   placeholder="Enter objective information"
                   className="border rounded p-2 w-full"
                 />
              </div>
              <div>
                <label htmlFor="assessment" className="block text-sm font-medium">Assessment</label>
                <textarea
                  id="assessment"
                  value={assessment}
                   onChange={(e) => setAssessment(e.target.value)}
                  placeholder="Enter assessment information"
                  className="border rounded p-2 w-full"
                 />
               </div>

               
               <div>
                 <label htmlFor="plan" className="block text-sm font-medium">Plan</label>
                 <textarea
                   id="plan"
                  value={plan}
                  onChange={(e) => setPlan(e.target.value)}
                  placeholder="Enter plan information"
                   className="border rounded p-2 w-full"
                />
              </div>
              <div>
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
               <div>
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
                <label htmlFor="drugs" className="block text-sm font-medium">Drugs</label>
                 <textarea
                   id="drugs"
                   type="text"
                  value={drugs}
                  onChange={(e) => setDrugs(e.target.value)}
                  placeholder="Enter drugs "
                  className="border rounded p-2 w-full"
                />
              </div>
              <div className="flex justify-end space-x-4">
                <button
                   type="button"
                   onClick={closeAddNoteModal}
                   className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                >
                   Cancel
                </button>
                 <button
                   type="submit"
                   className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                 >
                  Save Note
                </button>
               </div>
            </form>
          </div>
        </div>
      )}
     
    </div>
  );
};
export default Search;



