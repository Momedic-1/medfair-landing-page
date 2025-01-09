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
import { useSelector } from 'react-redux';
import { capitalizeFirstLetter } from '../utils';

const VideoCall = () => {
 
  const userData = JSON.parse(localStorage.getItem('userData'));
 
  const navigate = useNavigate();

  const [isAudioOn, setIsAudioOn] = useState(true);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false); 
 
  const roomUrl = useSelector((state)=> state.auth.roomUrl) 
  console.log(roomUrl, "room url"); 
  const call =  useSelector((state)=> state.auth.call)


  const roomConnection = useRoomConnection(roomUrl, {
    localMediaOptions: {
      audio: true,
      video: true,
    },
  });

  const { actions, state } = roomConnection;
  const { connectionState, localParticipant, remoteParticipants } = state;
  const { joinRoom, toggleCamera, toggleMicrophone } = actions;

  console.log("remoteParticipants", remoteParticipants);

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


  const firstName = capitalizeFirstLetter(call?.patientFirstName) || "N/A";
  const lastName =  capitalizeFirstLetter(call?.patientLastName) || "N/A";

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
  console.log(remoteParticipants.map((p)=> p.stream), "stream");
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
    <div className="flex flex-col overflow-y-hidden">

      <div className="bg-black h-20 flex items-center justify-between text-white px-5">
        <p><span className="font-bold">Patient Name: </span>{`${firstName} ${lastName}`}</p>
        <p><span className="font-bold">DOB: </span>{dob}</p>
        <p><span className="font-bold">Age: </span>{age}</p>
      </div>

      <div className="relative w-full h-[88vh]">
        <div className='h-full w-full'>
         {
  remoteParticipants.map((friend) => {
    if(!friend.stream) return null;
      return (
        <div className="w-full h-full" key={friend.id}>
          <VideoView stream={friend?.stream} />
        </div>
      )
  }) 
}
        </div>

        <div className='absolute -top-40 right-4 h-full w-80 rounded-xl'>
          {localParticipant?.stream ? (
            <div className="w-full h-full rounded-xl">
              <VideoView muted stream={localParticipant.stream} />
            </div>
          ) : null}
          <p className='absolute top-60 right-6 font-bold text-white ml-6 mb-10'>You</p>
        </div>
      </div>

     
      <div className="absolute bottom-16 w-full py-4  flex justify-center items-center gap-4 md:gap-8">
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
