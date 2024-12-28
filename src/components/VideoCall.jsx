


import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { baseUrl } from '../env';
import "@whereby.com/browser-sdk/embed"; 

const MyComponent = () => {
  const wherebyRef = useRef(null);
  const [roomUrl, setRoomUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  
  const userData = JSON.parse(localStorage.getItem('userData'));

  useEffect(() => {
    const fetchMeetingUrl = async () => {
      try {
        const id = sessionStorage.getItem("id");
        const token = JSON.parse(localStorage.getItem('authToken'))?.token;
        
        if (!id || !token) {
          setError("User ID or token is missing.");
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

 
  const userName = userData?.firstName
    ? userData.firstName.charAt(0).toUpperCase() + userData.firstName.slice(1).toLowerCase()
    : "Unknown User";
  const dateOfBirth = userData?.dateOfBirth

  const calculateAge = (dob) => {
    if (!dob) return "Unknown age"; 
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const userAge = calculateAge(dateOfBirth);

  return (
    <div style={{display:"flex"}}>
      <span>{userName}</span>
      <span>Date of Birth: {dateOfBirth || "Unknown DOB"}</span> <br />
      <span>Age: {userAge}</span>
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
          style={{ width: '100%', height: '1000px' }}
        />
      ) : (
        <p>Meeting room is not available.</p>
      )}
    </div>
  );
};

export default MyComponent;
