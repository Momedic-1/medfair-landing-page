import { useEffect, useState } from "react";
import { VideoView, useRoomConnection } from "@whereby.com/browser-sdk/react";
import micOn from "../assets/mic_on_image.png";
import micOff from "../assets/mic_off_image.png";
import videoOn from "../assets/video-camera_on.png";
import videoOff from "../assets/video-camera_off.png";
import note from "../assets/call_note.png";
import { MdCallEnd, MdSwapHoriz } from "react-icons/md";
import { useNavigate, useLocation } from "react-router-dom";
import AddNoteModal from "../pages/AddNote";
import { useSelector, useDispatch } from "react-redux";
import { capitalizeFirstLetter } from "../utils";
import { setRoomUrl, setCall } from "../features/authSlice";

const VideoCall = () => {
  const [userData] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("userData")) || {};
    } catch {
      return {};
    }
  });

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [isAudioOn, setIsAudioOn] = useState(true);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [showCopiedMessage, setShowCopiedMessage] = useState(false);
  const [displayInfo, setDisplayInfo] = useState(null);
  const [isLocalVideoFullscreen, setIsLocalVideoFullscreen] = useState(true);

  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const roomUrl = queryParams.get("roomUrl") || useSelector((state) => state.auth.roomUrl);
  const call = useSelector((state) => state.auth.call);

  const roomConnection = useRoomConnection(roomUrl, {
    localMediaOptions: {
      audio: true,
      video: true,
    },
  });

  const { actions, state } = roomConnection;
  const { connectionState, localParticipant, remoteParticipants } = state;
  const { joinRoom, toggleCamera, toggleMicrophone } = actions;

  // Join the room only once
  useEffect(() => {
    joinRoom();
    return () => {
      actions.leaveRoom();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const leaveRoom = async () => {
    try {
      if (isVideoOn) {
        await toggleCamera();
        setIsVideoOn(false);
      }
      if (isAudioOn) {
        await toggleMicrophone();
        setIsAudioOn(false);
      }

      await actions.leaveRoom();

      if (localParticipant?.stream) {
        localParticipant.stream.getTracks().forEach((track) => {
          track.stop();
        });
      }

      dispatch(setRoomUrl(null));
      dispatch(setCall(null));

      navigate("/doctor-dashboard");
      window.location.reload();
    } catch (error) {
      console.error("Error leaving room:", error);
      navigate("/doctor-dashboard");
    }
  };

  const calculateAge = (dob) => {
    if (!dob) return "N/A";
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDifference = today.getMonth() - birthDate.getMonth();
    if (
      monthDifference < 0 ||
      (monthDifference === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }
    return age;
  };

  useEffect(() => {
    const userRole = userData?.role;
    if (userRole === "PATIENT" && call) {
      setDisplayInfo({
        firstName: capitalizeFirstLetter(call.patientFirstName) || "N/A",
        lastName: capitalizeFirstLetter(call.patientLastName) || "N/A",
        dob: "N/A",
        age: calculateAge(call.doctorDob),
      });
    } else if (userRole === "DOCTOR" && call) {
      setDisplayInfo({
        label: "Patient",
        firstName: capitalizeFirstLetter(call.name) || "N/A",
        // lastName: capitalizeFirstLetter(call.patientLastName) || "",
        dob: call.dob || userData?.dob || "N/A",
        age: calculateAge(call.dob || userData?.dob),
      });
    } else {
      setDisplayInfo({
        label: userRole === "DOCTOR" ? "Patient" : "Doctor",
        firstName: capitalizeFirstLetter(userData?.firstName) || "N/A",
        lastName: capitalizeFirstLetter(userData?.lastName) || "N/A",
        dob: userData?.dob || "N/A",
        age: calculateAge(userData?.dob),
      });
    }
  }, [call, userData]);

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
    setIsNoteModalOpen(true);
  };

  const handleNoteModalClose = () => {
    setIsNoteModalOpen(false);
  };

  const handleNoteAdded = () => {
    setIsNoteModalOpen(false);
  };

  const handleShareLink = async () => {
    try {
      await navigator.clipboard.writeText(roomUrl);
      setShowCopiedMessage(true);
      setTimeout(() => setShowCopiedMessage(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const toggleVideoView = () => {
    setIsLocalVideoFullscreen((prev) => !prev);
  };

  return (
    <div className="w-full h-screen flex flex-col overflow-hidden bg-gradient-to-b from-blue-800 via-blue-950/40 to-white/50">
      <div className="bg-black h-16 md:h-20 flex flex-col md:flex-row items-start md:items-center justify-start md:justify-between text-white px-2 py-1 md:px-5 md:py-0 space-y-1 md:space-y-0">
        <p className="text-xs sm:text-sm md:text-base">
          <span className="font-bold">Patient: </span>
          {displayInfo
            ? `${displayInfo.firstName} ${displayInfo.lastName}`
            : "Loading..."}
        </p>
        <p className="text-xs sm:text-sm md:text-base">
          <span className="font-bold">DOB: </span>
          {displayInfo ? displayInfo.dob : "Loading..."}
        </p>
        <p className="text-xs sm:text-sm md:text-base">
          <span className="font-bold">Age: </span>
          {displayInfo ? displayInfo.age : "Loading..."}
        </p>
      </div>

      <div className="relative flex-1 w-full">
        <div className="absolute inset-0">
          {isLocalVideoFullscreen ? (
            localParticipant?.stream ? (
              <VideoView
                muted
                stream={localParticipant.stream}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            ) : null
          ) : (
            remoteParticipants.map((participant) => {
              if (!participant.stream) return null;
              return (
                <VideoView
                  key={participant.id}
                  stream={participant.stream}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              );
            })
          )}
          <p className="absolute bottom-4 right-6 font-bold text-white bg-black/50 px-3 py-1 rounded">
            {isLocalVideoFullscreen ? "You" : "Remote"}
          </p>
        </div>

        <div className="absolute top-2 right-2 z-10 w-[160px] h-[120px] sm:w-[200px] sm:h-[150px] md:w-[250px] md:h-[180px] lg:w-[300px] lg:h-[200px] rounded-xl overflow-hidden shadow-lg">
          {isLocalVideoFullscreen ? (
            remoteParticipants.length > 0 ? (
              remoteParticipants.map((participant) => {
                if (!participant.stream) return null;
                return (
                  <div key={participant.id} className="w-full h-full">
                    <VideoView
                      stream={participant.stream}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        borderRadius: "12px",
                      }}
                    />
                    <p className="absolute top-2 left-2 font-bold text-white bg-black/50 px-2 py-1 rounded text-xs sm:text-sm">
                      {getDisplayName(participant.id)}
                    </p>
                  </div>
                );
              })
            ) : (
              <div className="w-full h-full bg-gray-900 flex flex-col items-center justify-center p-2">
                <p className="text-white text-xs mb-2">Share this link:</p>
                <div className="w-[90%] bg-gray-800 rounded-lg p-2 mb-2">
                  <p className="text-gray-300 text-xs break-all">{roomUrl}</p>
                </div>
                <button
                  onClick={handleShareLink}
                  className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-1 rounded-lg transition-colors"
                >
                  {showCopiedMessage ? "Copied!" : "Copy"}
                </button>
              </div>
            )
          ) : (
            localParticipant?.stream && (
              <div className="w-full h-full">
                <VideoView
                  muted
                  stream={localParticipant.stream}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    borderRadius: "12px",
                  }}
                />
                <p className="absolute top-2 left-2 font-bold text-white bg-black/50 px-2 py-1 rounded text-xs sm:text-sm">
                  You
                </p>
              </div>
            )
          )}
        </div>

        {remoteParticipants.length > 0 && (
          <button
            onClick={toggleVideoView}
            className="absolute top-2 left-2 z-20 bg-gray-800/70 hover:bg-gray-700 text-white rounded-full p-2 transition-colors"
            title="Switch view"
          >
            <MdSwapHoriz size={24} />
          </button>
        )}
      </div>

      <div className="absolute bottom-0 w-full py-4 flex justify-center items-center gap-4 md:gap-8 bg-black/30">
        <div
          className={`rounded-full p-3 cursor-pointer ${
            isAudioOn ? "bg-gray-400" : "bg-red-500"
          } text-white`}
          onClick={handleToggleAudio}
        >
          <img
            src={isAudioOn ? micOn : micOff}
            alt="mic"
            height={25}
            width={25}
          />
        </div>

        <div
          className={`rounded-full p-3 cursor-pointer ${
            isVideoOn ? "bg-gray-400" : "bg-red-500"
          } text-white`}
          onClick={handleToggleVideo}
        >
          <img
            src={isVideoOn ? videoOn : videoOff}
            alt="video"
            height={25}
            width={25}
          />
        </div>

        {userData?.role === "DOCTOR" && (
          <div
            className="rounded-full p-3 bg-gray-400 cursor-pointer"
            onClick={takeNote}
          >
            <img src={note} alt="note" height={25} width={25} />
          </div>
        )}

        <div
          className="rounded-full p-3 bg-red-500 cursor-pointer"
          onClick={leaveRoom}
        >
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
