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
    <div className="w-full h-screen flex flex-col overflow-y-hidden bg-gradient-to-b from-blue-800 via-blue-950/40 to-white/50">

      <div className="bg-black h-20 flex items-center justify-between text-white px-5">
        <p><span className="font-bold">Patient Name: </span>{`${firstName} ${lastName}`}</p>
        <p><span className="font-bold">DOB: </span>{dob}</p>
        <p><span className="font-bold">Age: </span>{age}</p>
      </div>

      <div className="px-4 py-8 relative flex flex-col h-full w-full lg:hidden">
        <div className='flex flex-col space-y-8 w-full h-full'>
           <div className='w-full'>
         {
  remoteParticipants.map((friend) => {
    if(!friend.stream) return null;
      return (
        <div className="w-full rounded-xl" key={friend.id}>
          <VideoView style={{width:2000, height:600, borderRadius:16}} stream={friend?.stream}/>
        </div>
      )
  }) 
}
        </div>

        <div className='relative h-full w-full rounded-xl'>
          {localParticipant?.stream ? (
            <div className="w-full h-full rounded-xl">
              <VideoView muted stream={localParticipant.stream} style={{width:2000, height:600, borderRadius:16}}/>
            </div>
          ) : null}
          <p className='absolute top-8 right-6 font-bold text-white ml-6 mb-10'>You</p>
        </div>
        </div>
      </div>
      <div className="hidden px-4 py-8 relative lg:flex flex-col h-full w-full lg:flex-row lg:justify-center lg:items-center">
        <div className='flex flex-col space-y-8 w-full h-full'>
           <div className='w-full'>
         {
  remoteParticipants.map((friend) => {
    if(!friend.stream) return null;
      return (
        <div className="w-full rounded-xl" key={friend.id}>
          <VideoView style={{width:2000, height:320, borderRadius:16}} stream={friend?.stream}/>
        </div>
      )
  }) 
}
        </div>

        <div className='relative h-full w-full rounded-xl'>
          {localParticipant?.stream ? (
            <div className="w-full h-full rounded-xl">
              <VideoView muted stream={localParticipant.stream} style={{width:2000, height:320, borderRadius:16}}/>
            </div>
          ) : null}
          <p className='absolute top-8 right-6 font-bold text-white ml-6 mb-10'>You</p>
        </div>
        </div>
      </div>

     
      <div className="absolute bottom-0 w-full py-4  flex justify-center items-center gap-4 md:gap-8">
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
// import React, { useEffect, useState } from 'react';
// import { VideoView, useRoomConnection } from "@whereby.com/browser-sdk/react";
// import micOn from "../assets/mic_on_image.png";
// import micOff from "../assets/mic_off_image.png";
// import videoOn from "../assets/video-camera_on.png";
// import videoOff from "../assets/video-camera_off.png";
// import note from "../assets/call_note.png";
// import { MdCallEnd } from "react-icons/md";
// import { useNavigate } from "react-router-dom";
// import AddNoteModal from "../pages/AddNote";
// import { useSelector } from 'react-redux';
// import { capitalizeFirstLetter } from '../utils';

// const VideoCall = () => {
//   const userData = JSON.parse(localStorage.getItem('userData'));
//   const navigate = useNavigate();

//   const [isAudioOn, setIsAudioOn] = useState(true);
//   const [isVideoOn, setIsVideoOn] = useState(true);
//   const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
//   const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  
//   const roomUrl = useSelector((state) => state.auth.roomUrl);
//   const call = useSelector((state) => state.auth.call);

//   const roomConnection = useRoomConnection(roomUrl, {
//     localMediaOptions: {
//       audio: true,
//       video: true,
//     },
//   });

//   const { actions, state } = roomConnection;
//   const { connectionState, localParticipant, remoteParticipants } = state;
//   const { joinRoom, toggleCamera, toggleMicrophone } = actions;

//   // Handle window resize for responsive layout
//   useEffect(() => {
//     const handleResize = () => {
//       setIsMobile(window.innerWidth < 768);
//     };

//     window.addEventListener('resize', handleResize);
//     return () => window.removeEventListener('resize', handleResize);
//   }, []);

//   useEffect(() => {
//     joinRoom();

//     return () => {
//       if (connectionState === "connected") {
//         actions.leaveRoom();
//       }
//     };
//   }, [joinRoom, connectionState, actions]);

//   const leaveRoom = () => {
//     actions.leaveRoom(); 
//     navigate("/doctor-dashboard"); 
//   };

//   const firstName = capitalizeFirstLetter(call?.patientFirstName) || "N/A";
//   const lastName = capitalizeFirstLetter(call?.patientLastName) || "N/A";
//   const dob = userData?.dob || "N/A"; 

//   const calculateAge = (dob) => {
//     if (!dob) return "N/A";
//     const birthDate = new Date(dob);
//     const today = new Date();
//     let age = today.getFullYear() - birthDate.getFullYear();
//     const monthDifference = today.getMonth() - birthDate.getMonth();
//     if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
//       age--;
//     }
//     return age;
//   };

//   const age = calculateAge(dob);

//   const handleToggleAudio = () => {
//     toggleMicrophone();
//     setIsAudioOn((prev) => !prev);
//   };

//   const handleToggleVideo = () => {
//     toggleCamera();
//     setIsVideoOn((prev) => !prev);
//   };

//   const takeNote = () => {
//     setIsNoteModalOpen(true);
//   };
   
//   const handleNoteModalClose = () => {
//     setIsNoteModalOpen(false); 
//   };

//   const handleNoteAdded = () => {
//     setIsNoteModalOpen(false); 
//   };

//   // Get the first remote participant (usually the patient)
//   const mainRemoteParticipant = remoteParticipants.length > 0 ? remoteParticipants[0] : null;

//   return (
//     <div className="flex flex-col h-screen overflow-hidden">
//       {/* Header with patient info */}
//       <div className="bg-black h-16 md:h-20 flex flex-wrap md:flex-nowrap items-center justify-between text-white px-3 md:px-5 z-10">
//         <p className="text-sm md:text-base"><span className="font-bold">Patient:</span> {`${firstName} ${lastName}`}</p>
//         <p className="text-sm md:text-base"><span className="font-bold">DOB:</span> {dob}</p>
//         <p className="text-sm md:text-base"><span className="font-bold">Age:</span> {age}</p>
//       </div>

//       {/* Main video content area */}
//       <div className="relative flex-grow w-full bg-gray-900">
//         {/* Remote participant (patient) - Takes up most of the screen */}
//         <div className="absolute inset-0">
//           {
//           // mainRemoteParticipant && mainRemoteParticipant.stream ? (
//           //   <VideoView 
//           //     stream={mainRemoteParticipant.stream} 
//           //     className="w-full h-full object-cover"
//           //   />
//           // ) : (
//           //   <div className="w-full h-full flex items-center justify-center">
//           //     <p className="text-blue-600 text-lg">Waiting for patient to join...</p>
//           //   </div>
//           // )
//           remoteParticipants.map((friend) => {
//               if(!friend.stream) return null;
//                 return (
              
//                     <VideoView stream={friend?.stream}  className="w-full h-full object-cover" key={friend.id}/>
               
//                 )
//             }) 
//           }
//         </div>

//         {/* Local participant (doctor) - Positioned differently based on screen size */}
//         {localParticipant?.stream && (
//           <div className={`
//             ${isMobile 
//               ? "absolute bottom-28 right-4 w-1/3 h-1/4 max-h-36" 
//               : "absolute top-6 right-6 w-1/4 h-1/4 max-w-xs max-h-48"
//             } 
//             rounded-lg overflow-hidden shadow-lg z-20
//           `}>
//             <VideoView 
//               muted 
//               stream={localParticipant.stream} 
//               className="w-full h-full object-cover"
//             />
//             <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 px-2 py-1 rounded text-white text-xs">
//               You
//             </div>
//           </div>
//         )}

//         {/* Control buttons */}
//         <div className="absolute bottom-4 left-0 right-0 flex justify-center items-center gap-3 md:gap-6 z-30">
//           <button
//             className={`rounded-full p-3 md:p-4 ${isAudioOn ? "bg-gray-700 hover:bg-gray-600" : "bg-red-500 hover:bg-red-600"} transition-colors`}
//             onClick={handleToggleAudio}
//             aria-label={isAudioOn ? "Mute microphone" : "Unmute microphone"}
//           >
//             <img src={isAudioOn ? micOn : micOff} alt={isAudioOn ? 'Mic on' : 'Mic off'} className="h-5 w-5 md:h-6 md:w-6" />
//           </button>

//           <button
//             className={`rounded-full p-3 md:p-4 ${isVideoOn ? "bg-gray-700 hover:bg-gray-600" : "bg-red-500 hover:bg-red-600"} transition-colors`}
//             onClick={handleToggleVideo}
//             aria-label={isVideoOn ? "Turn off camera" : "Turn on camera"}
//           >
//             <img src={isVideoOn ? videoOn : videoOff} alt={isVideoOn ? 'Video on' : 'Video off'} className="h-5 w-5 md:h-6 md:w-6" />
//           </button>

//           <button
//             className="rounded-full p-3 md:p-4 bg-gray-700 hover:bg-gray-600 transition-colors"
//             onClick={takeNote}
//             aria-label="Take note"
//           >
//             <img src={note} alt='Take note' className="h-5 w-5 md:h-6 md:w-6" />
//           </button>

//           <button
//             className="rounded-full p-3 md:p-4 bg-red-500 hover:bg-red-600 transition-colors"
//             onClick={leaveRoom}
//             aria-label="End call"
//           >
//             <MdCallEnd className="h-5 w-5 md:h-6 md:w-6 text-white" />
//           </button>
//         </div>
//       </div>

//       {/* Note Modal */}
//       <AddNoteModal
//         isOpen={isNoteModalOpen}
//         onClose={handleNoteModalClose}
//         onNoteAdded={handleNoteAdded}
//       />
//     </div>
//   );
// };

// export default VideoCall;