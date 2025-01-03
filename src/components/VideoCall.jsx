import React, { useEffect, useState, useRef } from 'react';
import { VideoView, useRoomConnection } from "@whereby.com/browser-sdk/react";
import micOn from "../assets/mic_on_image.png"
import micOff from "../assets/mic_off_image.png"
import videoOn from "../assets/video-camera_on.png"
import videoOff from "../assets/video-camera_off.png"
import note from "../assets/call_note.png"

const ROOM_URL = "https://medfair.whereby.com/8e4ab525-d645-4e5a-a5e5-abce77f255a6";
const patientName = "Ned";
const dob = "";
const age = "";

const VideoCall = () => {
  const [isAudioOn, setIsAudioOn] = React.useState(true);
  const [isVideoOn, setIsVideoOn] = React.useState(true);
  const messagesBottomRef = React.useRef<HTMLDivElement>(null);

  const roomConnection = useRoomConnection(ROOM_URL, {
    localMediaOptions: {
      audio: true,
      video: true,
    },
  });

  const { actions, state } = roomConnection;
  const {
    connectionState,
    localParticipant,
    remoteParticipants,
  } = state;

  const {
    joinRoom,
    toggleCamera,
    toggleMicrophone,
  } = actions;

  useEffect(() => {
    joinRoom();

    return () => {
      if (connectionState === "connected") {
        actions.leaveRoom();
      }
    };
  }, [joinRoom, connectionState]);

  function getDisplayName(id) {
    return remoteParticipants.find((p) => p.id === id)?.displayName || "Guest";
  }
  const takeNote =()=>{

  }
  const handleToggleAudio = () => {
    toggleMicrophone();
    setIsAudioOn((prev) => !prev);
  };
  
  const handleToggleVideo = () => {
    toggleCamera();
    setIsVideoOn((prev) => !prev);
  };

  return (
    <div className="bg-blue-500 h-screen">

      <div className="h-16 flex items-center justify-between text-white px-52">
        <p><span className="font-bold">Name: </span>{patientName}</p>
        <p><span className="font-bold">DOB: </span>{dob ? dob : "N/A"}</p>
        <p><span className="font-bold">Age: </span>{age ? age : "N/A"}</p>
      </div>

      <div className="md:flex">

        <div>
          {remoteParticipants[0]?.stream ? (
            <div className="md:h-[75vh]">
              <VideoView stream={remoteParticipants[0].stream} />
              <p  className="md:h-[45vh] ml-1">{getDisplayName(remoteParticipants[0].id)}</p>
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
        <div
          className={`md:flex  items-center px-4 py-2 gap-3`}
        >
            <div
          className={`px-4 py-2 rounded-xl cursor-pointer ${
            isAudioOn ? "bg-gray-400" : "bg-red-500 "
          } text-white`}
          onClick={handleToggleAudio}
        >
          {isAudioOn ? <img src={micOn} alt='mic on' height={25} width={25}/> : <img src={micOff} alt='mic on' height={25} width={25}/>}
        </div>

        <div
          className={`px-4 py-2 rounded-xl cursor-pointer ${
            isVideoOn ? "bg-gray-400" : "bg-red-500"
          } text-white`}
          onClick={handleToggleVideo}
        >
          {isVideoOn ? <img src={videoOn} alt='video on' height={25} width={25}/> : <img src={videoOff} alt='video on' height={25} width={25}/>}
        </div>

        <div
          className={`px-4 py-2 rounded-xl bg-gray-400 text-white cursor-pointer `}
          onClick={takeNote}
        >
          <img src={note} alt='take note' height={25} width={25}/> 
        </div>
        </div>
      
      </div>
    </div>
  );
};

export default VideoCall;
