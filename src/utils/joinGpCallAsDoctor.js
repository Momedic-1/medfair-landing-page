import axios from "axios";
import { baseUrl } from "../env";
import { setCall, setRoomUrl } from "../features/authSlice";
import { openVideoCallPreferNewTab } from "./videoCallNavigation";
import { dismissIncomingCallId } from "./dismissedIncomingCalls";
import { saveDoctorJoinedSession } from "./activeCallSession";
import { rememberPickedCallId } from "./pickedCalls";

export function formatGpJoinError(error) {
  const data = error?.response?.data;
  if (typeof data === "string" && data.trim()) return data.trim();
  if (data?.message) return data.message;
  if (data?.error) return data.error;
  return "Failed to join call. Please try again.";
}

/**
 * Doctor joins a GP instant call — opens video and persists rejoin session.
 */
export async function joinGpCallAsDoctor({
  call,
  doctorId,
  token,
  dispatch,
}) {
  const callId = call?.callId;
  if (!callId || !doctorId || !token) {
    throw new Error("Missing call or sign-in details.");
  }

  // #region agent log
  const __joinStartedAt = Date.now();
  fetch('http://127.0.0.1:7473/ingest/d91cda34-e11e-485c-99d5-4c98ac7ea275',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'be24c6'},body:JSON.stringify({sessionId:'be24c6',runId:'post-fix',hypothesisId:'E',location:'joinGpCallAsDoctor.js:beforeJoinApi',message:'Doctor join API starting',data:{callId,doctorId},timestamp:Date.now()})}).catch(()=>{});
  // #endregion
  const response = await axios.post(
    `${baseUrl}/api/v1/video/join?callId=${callId}&doctorId=${doctorId}`,
    {},
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    },
  );
  // #region agent log
  fetch('http://127.0.0.1:7473/ingest/d91cda34-e11e-485c-99d5-4c98ac7ea275',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'be24c6'},body:JSON.stringify({sessionId:'be24c6',runId:'post-fix',hypothesisId:'E',location:'joinGpCallAsDoctor.js:afterJoinApi',message:'Doctor join API finished',data:{callId,doctorId,apiMs:Date.now()-__joinStartedAt,hasUrl:Boolean(response?.data?.joinRoomUrl)},timestamp:Date.now()})}).catch(()=>{});
  // #endregion

  const { patientId, joinRoomUrl, patientFirstName, patientLastName } =
    response.data || {};

  if (!joinRoomUrl) {
    throw new Error("Another doctor has already joined this call.");
  }

  const enrichedCall = {
    ...call,
    callId,
    patientId: patientId ?? call.patientId,
    patientFirstName: patientFirstName ?? call.patientFirstName,
    patientLastName: patientLastName ?? call.patientLastName,
  };

  dispatch(setRoomUrl(joinRoomUrl));
  dispatch(setCall(enrichedCall));

  if (patientId != null) {
    localStorage.setItem("patientId", String(patientId));
  }

  rememberPickedCallId(callId);
  dismissIncomingCallId(callId);

  const session = saveDoctorJoinedSession({
    call: enrichedCall,
    joinRoomUrl,
    patientId,
    patientFirstName: enrichedCall.patientFirstName,
    patientLastName: enrichedCall.patientLastName,
  });

  const { usedSameTab } = openVideoCallPreferNewTab(joinRoomUrl, callId);

  return { enrichedCall, session, usedSameTab, joinRoomUrl };
}
