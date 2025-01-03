
import React, { useEffect, useState } from "react";
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


  const firstName = userData?.firstName || "N/A";
  const lastName = userData?.lastName || "N/A";
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

  const handleNoteAdded = (newNote) => {
    console.log("New note added:", newNote);
   
    setIsNoteModalOpen(false); 
  };

  return (
    <div className="bg-[#020e7c] h-screen">

      <div className="h-16 flex items-center justify-between text-white px-5">
        <p><span className="font-bold">Name: </span>{`${firstName} ${lastName}`}</p>
        <p><span className="font-bold">DOB: </span>{dob}</p>
        <p><span className="font-bold">Age: </span>{age}</p>
      </div>

      <div className="md:flex">
        <div>
          {remoteParticipants[0]?.stream ? (
            <div className="md:h-[75vh]">
              <VideoView stream={remoteParticipants[0].stream} />
              <p className="md:h-[45vh] ml-1">{getDisplayName(remoteParticipants[0].id)}</p>
            </div>
          ) : null}
        </div>

        <div>
          {localParticipant?.stream ? (
            <div className="md:h-[45vh] ml-1">
              <VideoView muted stream={localParticipant.stream} />
            </div>
          ) : null}
          <p className='font-bold text-white ml-6'>You</p>
        </div>
      </div>

     
      <div className="md:flex items-center justify-center">
        <div className={`md:flex items-center px-4 py-2 gap-3`}>
          <div
            className={`px-4 py-2 rounded-xl cursor-pointer ${isAudioOn ? "bg-gray-400" : "bg-red-500"} text-white`}
            onClick={handleToggleAudio}
          >
            {isAudioOn ? <img src={micOn} alt='mic on' height={25} width={25}/> : <img src={micOff} alt='mic off' height={25} width={25}/>}
          </div>

          <div
            className={`px-4 py-2 rounded-xl cursor-pointer ${isVideoOn ? "bg-gray-400" : "bg-red-500"} text-white`}
            onClick={handleToggleVideo}
          >
            {isVideoOn ? <img src={videoOn} alt='video on' height={25} width={25}/> : <img src={videoOff} alt='video off' height={25} width={25}/>}
          </div>

          <div className={`px-4 py-2 rounded-xl bg-gray-400 text-white cursor-pointer`} onClick={takeNote}>
            <img src={note} alt='take note' height={25} width={25}/>
          </div>
          <div className={`px-4 py-2 rounded-xl bg-gray-400 text-white cursor-pointer`} onClick={leaveRoom}>
            <MdCallEnd width={25} height={25}/>
          </div>
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
