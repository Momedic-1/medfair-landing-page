import { useCallback, useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import dayjs from "dayjs";
import { toast } from "react-toastify";
import {
  ArrowLeft,
  Calendar,
  Globe,
  GraduationCap,
  Loader2,
  MapPin,
  Stethoscope,
} from "lucide-react";
import { baseUrl } from "../env";
import { formatSpecialization, getId, getToken } from "../utils";
import {
  fetchDoctorProfileForPatient,
  fetchDoctorSlotsForPatient,
  sortSpecialistSlotGroups,
} from "../utils/fetchDoctorForPatient";
import DoctorAvatar, { getDoctorDisplayName } from "./components/DoctorAvatar";
import DoctorSlotsByDate from "../components/doctor/DoctorSlotsByDate";
import { Button, Popover } from "@mui/material";
import { ColorRing } from "react-loader-spinner";

export default function PatientDoctorProfile() {
  const { doctorId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const token = getToken();
  const patientId = getId();

  const [profile, setProfile] = useState(null);
  const [specialist, setSpecialist] = useState(
    location.state?.specialist
      ? sortSpecialistSlotGroups(location.state.specialist)
      : null
  );
  const [loading, setLoading] = useState(true);
  const [slotsLoading, setSlotsLoading] = useState(!location.state?.specialist);
  const [isBooking, setIsBooking] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [pendingSlot, setPendingSlot] = useState(null);

  const loadData = useCallback(async () => {
    if (!doctorId || !token) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const profileData = await fetchDoctorProfileForPatient(doctorId, token);
      setProfile(profileData);

      setSlotsLoading(true);
      const spec =
        profileData?.medicalSpecialization ||
        profileData?.specialization ||
        location.state?.categoryName;
      const slots = await fetchDoctorSlotsForPatient({
        doctorId,
        specialization: spec,
        token,
      });
      if (slots) {
        setSpecialist(slots);
      } else if (location.state?.specialist) {
        setSpecialist(sortSpecialistSlotGroups(location.state.specialist));
      }
    } catch {
      toast.error("Could not load doctor profile.");
    } finally {
      setLoading(false);
      setSlotsLoading(false);
    }
  }, [doctorId, token, location.state?.specialist]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const displayProfile = specialist?.doctorProfile || {
    title: profile?.title,
    firstName: profile?.firstName,
    lastName: profile?.lastName,
    imageUrl: profile?.imageUrl,
    medicalSpecialization: profile?.medicalSpecialization,
    practiceName: profile?.practiceName,
    qualifications: profile?.qualifications,
    about: profile?.about,
    licenseLocation: profile?.licenseLocation,
    languages: profile?.languages,
  };

  const handleSlotClick = (e, slot) => {
    setAnchorEl(e.currentTarget);
    setPendingSlot(slot);
  };

  const handleConfirmBook = async (e) => {
    if (!pendingSlot?.slotId || !patientId) return;
    setIsBooking(true);
    try {
      await axios.post(
        `${baseUrl}/api/appointments/book?slotId=${pendingSlot.slotId}&patientId=${patientId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Appointment booked successfully!");
      setAnchorEl(null);
      setPendingSlot(null);
      await loadData();
    } catch {
      toast.error("Could not book this slot. It may already be taken.");
    } finally {
      setIsBooking(false);
    }
  };

  const languagesList = () => {
    const raw = displayProfile?.languages;
    if (!raw) return ["English"];
    if (Array.isArray(raw)) return raw.map((l) => (typeof l === "object" ? l.label || l.value : l));
    return String(raw).split(",").map((s) => s.trim()).filter(Boolean);
  };

  if (loading && !profile) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3 text-gray-500">
        <Loader2 className="h-8 w-8 animate-spin text-[#020e7c]" />
        <p className="text-sm">Loading doctor profile…</p>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-gradient-to-b from-slate-50 to-gray-100/80">
      <div className="mx-auto max-w-4xl px-3 py-5 sm:px-6 sm:py-8">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="mb-4 inline-flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm font-medium text-[#020e7c] hover:bg-white/80"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>

        <header className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#020e7c] via-[#0a1f9c] to-[#1e3a8a] p-6 text-white shadow-lg sm:p-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
            <DoctorAvatar profile={displayProfile} size="lg" className="!ring-4 !ring-white/30" />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold uppercase tracking-widest text-blue-200/90">
                Specialist profile
              </p>
              <h1 className="mt-1 text-2xl font-bold sm:text-3xl">
                {getDoctorDisplayName(displayProfile)}
              </h1>
              {displayProfile?.medicalSpecialization && (
                <p className="mt-2 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-sm backdrop-blur-sm">
                  <Stethoscope className="h-4 w-4" />
                  {formatSpecialization(displayProfile.medicalSpecialization)}
                </p>
              )}
              {displayProfile?.practiceName && (
                <p className="mt-2 text-sm text-blue-100/90">
                  {displayProfile.practiceName}
                </p>
              )}
            </div>
          </div>
        </header>

        <div className="mt-6 grid gap-6 lg:grid-cols-5">
          <aside className="space-y-4 lg:col-span-2">
            <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
                About
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-gray-700">
                {displayProfile?.about ||
                  "This provider has not added a bio yet. You can still book an available time below."}
              </p>
            </section>

            <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
                Details
              </h2>
              <ul className="mt-3 space-y-3 text-sm text-gray-700">
                {displayProfile?.qualifications && (
                  <li className="flex gap-2">
                    <GraduationCap className="mt-0.5 h-4 w-4 shrink-0 text-[#020e7c]" />
                    <span>{displayProfile.qualifications}</span>
                  </li>
                )}
                {displayProfile?.licenseLocation && (
                  <li className="flex gap-2">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#020e7c]" />
                    <span>Licensed in {displayProfile.licenseLocation}</span>
                  </li>
                )}
                <li className="flex gap-2">
                  <Globe className="mt-0.5 h-4 w-4 shrink-0 text-[#020e7c]" />
                  <span>{languagesList().join(", ")}</span>
                </li>
              </ul>
            </section>
          </aside>

          <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm lg:col-span-3 sm:p-6">
            <div className="mb-4 flex items-center gap-2">
              <Calendar className="h-5 w-5 text-[#020e7c]" />
              <h2 className="text-lg font-semibold text-[#020e7c]">
                Available appointments
              </h2>
            </div>
            <p className="mb-4 text-sm text-gray-500">
              Times are shown in Nigeria (WAT). Each day is one row. Pick a time
              to book.
            </p>

            {slotsLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-7 w-7 animate-spin text-[#020e7c]" />
              </div>
            ) : (
              <DoctorSlotsByDate
                slotGroups={specialist?.slotGroups}
                isSlotBooked={() => false}
                onSlotClick={handleSlotClick}
              />
            )}
          </section>
        </div>
      </div>

      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={() => {
          setAnchorEl(null);
          setPendingSlot(null);
        }}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <div className="w-[min(100vw-2rem,360px)] p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
            Confirm booking
          </p>
          <p className="mt-1 font-semibold text-gray-900">
            {getDoctorDisplayName(displayProfile)}
          </p>
          {pendingSlot && (
            <p className="mt-2 text-sm text-gray-600">
              {dayjs(`${pendingSlot.date}T${pendingSlot.time}`).format(
                "dddd, MMMM D · h:mm A"
              )}
            </p>
          )}
          <div className="mt-4 flex gap-2">
            <Button
              variant="outlined"
              size="small"
              fullWidth
              onClick={() => {
                setAnchorEl(null);
                setPendingSlot(null);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              size="small"
              fullWidth
              disabled={isBooking}
              sx={{ bgcolor: "#020e7c" }}
              onClick={handleConfirmBook}
            >
              {isBooking ? (
                <ColorRing height={18} width={18} colors={["#fff", "#fff", "#fff", "#fff", "#fff"]} />
              ) : (
                "Confirm"
              )}
            </Button>
          </div>
        </div>
      </Popover>
    </div>
  );
}
