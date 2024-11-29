


import React, { useState } from "react";
import { baseUrl } from "../env";
const Search = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedNote, setSelectedNote] = useState(null); 
  const [isModalOpen, setIsModalOpen] = useState(false);

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

  return (
    <div className="p-6">
      
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
                <td className="border border-gray-300 px-4 py-2"> {new Date(note.visitDate).toLocaleString()} </td>
                <td className="border border-gray-300 px-4 py-2">{note.subjective}</td>
              <td className="border border-gray-300 px-4 py-2">{note.objective}</td>
              <td className="border border-gray-300 px-4 py-2">{note.assessment}</td>
           <td className="border border-gray-300 px-4 py-2">{note.plan}</td>
            <td className="border border-gray-300 px-4 py-2">{note.finalDiagnosis}</td>
             <td className="border border-gray-300 px-4 py-2">{note.soapComment}</td>
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
          <div className="bg-white w-[90%] max-w-lg rounded-lg shadow-lg p-6 relative">
            <button
              onClick={closeModal}
              className="absolute top-2 right-2 text-black font-bold"
            >
              ✖
            </button>
            <h2 className="text-xl font-semibold mb-4">View Note</h2>
            <div className="space-y-4">
              <div>
                <label className="font-medium">Doctor Name:</label>
                <p>{selectedNote?.doctorFirstName} {selectedNote?.doctorLastName}</p>
              </div>
              <div>
                <label className="font-medium">Visit Date:</label>
                <p>{new Date(selectedNote?.visitDate).toLocaleDateString()}</p>
              </div>
              <div>
                <label className="font-medium">Subjective:</label>
                <p>{selectedNote?.subjective}</p>
              </div>
              <div>
                <label className="font-medium">Objective:</label>
                <p>{selectedNote?.objective}</p>
              </div>
              <div>
                <label className="font-medium">Assessment:</label>
                <p>{selectedNote?.assessment}</p>
              </div>
              <div>
                <label className="font-medium">Plan:</label>
                <p>{selectedNote?.plan}</p>
              </div>
              <div>
                <label className="font-medium">Final Diagnosis:</label>
                <p>{selectedNote?.finalDiagnosis}</p>
              </div>
              <div>
                <label className="font-medium">SOAP Comment:</label>
                <p>{selectedNote?.soapComment}</p>
              </div>
              <div>
                <label className="font-medium">Drugs:</label>
                <ul>
                  {selectedNote?.drugs.map((drug, index) => (
                    <li key={index}>{drug.name} - {drug.dosage}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Search;
