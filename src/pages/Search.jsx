

import { useState, useEffect } from "react";
import axios from "axios";
import AddNoteModal from "./AddNote";
import { baseUrl } from "../env";

const Search = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const token = JSON.parse(localStorage.getItem('authToken'))?.token;
  const userData = JSON.parse(localStorage.getItem('userData'));
  const doctorId = userData?.id; 
  const [selectedNote, setSelectedNote] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAddNoteModalOpen, setIsAddNoteModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(
         `${baseUrl}/api/notes/file/${fileNumber}` 
      );
      setResults(response.data);
      setCurrentPage(1);
    } catch (err) {
      setError("Failed to fetch data. Please try again later.");
    } finally {
      setLoading(false);
    }
  };


  const handleAddNote = async (newNote) => {
    try {
      await axios.post(
        `${baseUrl}/api/notes/notes/doctor/${doctorId}`,
        newNote,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      fetchNotes();
      setIsAddNoteModalOpen(false); 
    } catch (err) {
      console.error("Failed to add note", err);
    }
  };

  const fetchNotes = async () => {
    try {
      const response = await axios.get(
        `${baseUrl}/api/notes/notes/doctor/${doctorId}`
      );
      setResults(response.data);
    } catch (err) {
      console.error("Failed to fetch notes", err);
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
  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
  };
  useEffect(() => {
    fetchNotes();
  }, []);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentResults = results.slice(indexOfFirstItem, indexOfLastItem);

  const totalPages = Math.ceil(results.length / itemsPerPage);
  
  return (
    <div className="p-4">
      <div className="flex justify-end mb-4">
        <button
          className="bg-green-500 text-white px-4 py-2 rounded  hover:bg-green-600"
          onClick={openAddNoteModal}
        >
          Add New Note
        </button>
      </div>
      <h2>Patient Note</h2>
     

      <div className="h-96 overflow-y-auto  max-w-full lg:pl-56">
        <table className="border-collapse border border-gray-300 w-full text-left table-auto">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-300 px-4 py-2">Patient First Name</th>
              <th className="border border-gray-300 px-4 py-2">Patient Last Name</th>
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
            {results.length > 0 ? 
            currentResults.map((note, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="border border-gray-300 px-4 py-2">{note.patientFirstName}</td>
                <td className="border border-gray-300 px-4 py-2">{note.patientLastName}</td>
                <td className="border border-gray-300 px-4 py-2">{new Date(note.visitDate).toLocaleString()}</td>
                <td className="border border-gray-300 px-4 py-2">{note.subjective}</td>
                <td className="border border-gray-300 px-4 py-2">{note.objective}</td>
                <td className="border border-gray-300 px-4 py-2">{note.assessment}</td>
                <td className="border border-gray-300 px-4 py-2">{note.plan}</td>
                <td className="border border-gray-300 px-4 py-2">{note.finalDiagnosis}</td>
                <td className="border border-gray-300 px-4 py-2">{note.soapComment}</td>
                <td className="border border-gray-300 px-4 py-2">
                  <ul>
                    {note.drugs.map((drug, idx) => (
                      <li key={idx}>{drug.name} - {drug.dosage}</li>
                    ))}
                  </ul>
                </td>
                <td className="border border-gray-300 px-4 ">
                  <button
                    onClick={() => handleView(note)}
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-green-600"
                  >
                    View
                  </button>
                </td>
              </tr>
            )): (
              <div>

                {/* <p>You haven't taken any notes for a patient yet</p> */}
              </div>
            )}
          </tbody>
        </table>
      </div>
      <div className="flex justify-center mt-4 space-x-2">
        {Array.from({ length: totalPages }, (_, index) => (
          <button
            key={index}
            onClick={() => paginate(index + 1)}
            className={`px-4 py-2 rounded ${
              currentPage === index + 1 ? "bg-blue-500 text-white" : "bg-gray-200"
            }`}
          >
            {index + 1}
          </button>
        ))}
      </div>

      {isModalOpen && selectedNote && (
        <div className="fixed inset-0 bg-black bg-opacity-50   flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-11/12 md:w-1/2 overflow-y-auto max-h-[60vh]">
            <h2 className="text-xl font-bold mb-4">View Note</h2>
            <div className="space-y-4">
              <div className="border py-2 px-2">
                <label className="font-medium">Visit Date:</label>
                <p>{new Date(selectedNote.visitDate).toLocaleString()}</p>
              </div>
              <div className="border py-2 px-2">
                <label className="font-medium">Subjective:</label>
                <p>{selectedNote.subjective}</p>
              </div>
              <div className="border py-2 px-2">
                <label className="font-medium">Objective:</label>
                <p>{selectedNote.objective}</p>
              </div>
              <div className="border py-2 px-2">
                <label className="font-medium">Assessment:</label>
                <p>{selectedNote.assessment}</p>
              </div>
              <div className="border py-2 px-2">
                <label className="font-medium">Plan:</label>
                <p>{selectedNote.plan}</p>
              </div>
              <div className="border py-2 px-2">
                <label className="font-medium">Final Diagnosis:</label>
                <p>{selectedNote.finalDiagnosis}</p>
              </div>
              <div className="border py-2 px-2">
                <label className="font-medium">SOAP Comment:</label>
                <p>{selectedNote.soapComment}</p>
              </div>
              <div className="border py-2 px-2">
                <label className="font-medium">Drugs:</label>
                <ul>
                  {selectedNote.drugs.map((drug, idx) => (
                    <li key={idx}>{drug.name} - {drug.dosage}</li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="mt-4 text-right">
              <button
                onClick={closeModal}
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

  
      <AddNoteModal 
      isOpen={isAddNoteModalOpen}
       onClose={closeAddNoteModal}
        onNoteAdded={handleAddNote} 
        />
        
    </div>
  );
};

export default Search;
