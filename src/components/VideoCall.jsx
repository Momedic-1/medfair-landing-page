import React, { useEffect, useState, useRef } from 'react';
import { VideoView, useRoomConnection } from "@whereby.com/browser-sdk/react";
import micOn from "../assets/mic_on_image.png";
import micOff from "../assets/mic_off_image.png";
import videoOn from "../assets/video-camera_on.png";
import videoOff from "../assets/video-camera_off.png";
import note from "../assets/call_note.png";
import { MdCallEnd } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import AddNoteModal from "../pages/AddNote";

const VideoCall = () => {
 
  const userData = JSON.parse(localStorage.getItem('userData'));
 
  const navigate = useNavigate();

  const [isAudioOn, setIsAudioOn] = useState(true);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false); 
 
  const roomUrl = localStorage.getItem("roomUrl"); 
  const call = JSON.parse(localStorage.getItem("call")); 

  

  const roomConnection = useRoomConnection(roomUrl, {
    localMediaOptions: {
      audio: true,
      video: true,
    },
  });

  const { actions, state } = roomConnection;
  const { connectionState, localParticipant, remoteParticipants } = state;
  const { joinRoom, toggleCamera, toggleMicrophone } = actions;

  useEffect(() => {
    joinRoom();

    return () => {
      if (connectionState === "connected") {
        actions.leaveRoom();
      }
    };
  }, [joinRoom, connectionState]);

  const leaveRoom = () => {
    actions.leaveRoom(); 
    navigate("/doctor-dashboard"); 
  };


  const firstName = call?.patientFirstName || "N/A";
  const lastName =  call?.patientLastName || "N/A";

  const dob = userData?.dob || "N/A"; 

  const calculateAge = (dob) => {
    if (!dob) return "N/A";
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDifference = today.getMonth() - birthDate.getMonth();
    if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const age = calculateAge(dob);

  const handleToggleAudio = () => {
    toggleMicrophone();
    setIsAudioOn((prev) => !prev);
  };

  const handleToggleVideo = () => {
    toggleCamera();
    setIsVideoOn((prev) => !prev);
  };

  const getDisplayName = (id) => {
    return remoteParticipants.find((p) => p.id === id)?.displayName || "Guest";
  };

  const takeNote = () => {
    
    setIsNoteModalOpen(true)
  };
   
  const handleNoteModalClose = () => {
    setIsNoteModalOpen(false); 
  };

  const handleNoteAdded = () => {
   
   
    setIsNoteModalOpen(false); 
  };

  return (
    <div className="bg-[#020e7c] h-screen flex flex-col justify-between overflow-hidden ">

      <div className=" flex items-center justify-between text-white px-5">
        <p><span className="font-bold">PatientName: </span>{`${firstName} ${lastName}`}</p>
        <p><span className="font-bold">DOB: </span>{dob}</p>
        <p><span className="font-bold">Age: </span>{age}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4  ">
        <div >
          {remoteParticipants[0]?.stream ? (
            <div className="relative h-full rounded-2xl overflow-hidden">
              <VideoView stream={remoteParticipants[0].stream} />
              <p className="md:h-[40vh] ml-1">{getDisplayName(remoteParticipants[0].id)}</p>
            </div>
          ) : null}
        </div>

        <div>
          {localParticipant?.stream ? (
            <div className="relative h-full rounded-lg overflow-hidden">
              <VideoView muted stream={localParticipant.stream} />
            </div>
          ) : null}
          <p className='font-bold text-white ml-6 mb-10'>You</p>
        </div>
      </div>

     
      <div className="w-full py-4  flex justify-center items-center gap-4 md:gap-8">
        <div
          className={`rounded-full p-3 cursor-pointer ${isAudioOn ? "bg-gray-400" : "bg-red-500"} text-white`}
          onClick={handleToggleAudio}
        >
          {isAudioOn ? <img src={micOn} alt='mic on' height={25} width={25}/> : <img src={micOff} alt='mic off' height={25} width={25}/>}
        </div>

        <div
          className={`rounded-full p-3 cursor-pointer ${isVideoOn ? "bg-gray-400" : "bg-red-500"} text-white`}
          onClick={handleToggleVideo}
        >
          {isVideoOn ? <img src={videoOn} alt='video on' height={25} width={25}/> : <img src={videoOff} alt='video off' height={25} width={25}/>}
        </div>

        <div className="rounded-full p-3 bg-gray-400 cursor-pointer" onClick={takeNote}>
          <img src={note} alt='take note' height={25} width={25} />
        </div>

        <div className="rounded-full p-3 bg-red-500 cursor-pointer" onClick={leaveRoom}>
          <MdCallEnd width={25} height={25} className="text-white" />
        </div>
      </div>

      <AddNoteModal
        isOpen={isNoteModalOpen}
        onClose={handleNoteModalClose}
        onNoteAdded={handleNoteAdded}
      />
    </div>
  );
};

export default VideoCall;
