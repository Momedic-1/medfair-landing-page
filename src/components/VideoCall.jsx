import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { baseUrl } from '../env';
import "@whereby.com/browser-sdk/embed"; 

const MyComponent = () => {
  const wherebyRef = useRef(null);
  const [roomUrl, setRoomUrl] = useState(null);  
  const [loading, setLoading] = useState(true);  
  const [error, setError] = useState(null);  

  useEffect(() => {
    const fetchMeetingUrl = async () => {
      try {

        const id = sessionStorage.getItem("id");
        const token = JSON.parse(localStorage.getItem('authToken'))?.token;
        
        if (!id || !token) {
          setError("User ID,  or token is missing.");
          setLoading(false);
          return;
        }
     
       
        const response = await axios.post(
          `${baseUrl}/api/v1/video/create-meeting?patientId=${id}`, 
          {},  
          {
            headers: {
              Authorization: `Bearer ${token}`, 
            },
          }
        );
        
        if (response.data && response.data.roomUrl) {
          console.log("Room URL fetched successfully:", response.data.roomUrl);
          setRoomUrl(response.data.roomUrl);  
        } else {
          throw new Error("No room URL found in the response.");
        }
      } catch (error) {
        console.error("Error fetching meeting URL:", error);
        setError("Failed to fetch meeting URL.");
      } finally {
        setLoading(false);  
      }
    };

    fetchMeetingUrl();
  }, []);  
  useEffect(() => {
    if (wherebyRef.current && roomUrl) {
      wherebyRef.current.room = roomUrl; 
    }
  }, [roomUrl]);

  
  return (
    <div style={{ backgroundColor: '#020E7C' }}>
      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p>{error}</p>
      ) : roomUrl ? (
        <whereby-embed
          ref={wherebyRef}
          chat="off"
          screenshare="off"
          people="off"
          room={roomUrl} 
          style={{ width: '100%', height: '1000px'}}  
        />
      ) : (
        <p>Meeting room is not available.</p>
      )}
    </div>
  );
};

export default MyComponent;
