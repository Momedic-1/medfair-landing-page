import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Modal, Box } from "@mui/material";
import { ColorRing } from "react-loader-spinner";
import { PiStethoscope } from "react-icons/pi";
import { ArrowLeft, CalendarDays, ChevronRight, ExternalLink, X } from "lucide-react";
import dayjs from "dayjs";
import Skeleton from "react-loading-skeleton";
import { formatSpecialization } from "../../utils";
import { isSlotDateTimeExpired } from "../../utils/slotDateTime";
import DoctorAvatar, {
  getDoctorDisplayName,
} from "./DoctorAvatar";
import TodaySlotsPreview from "../../components/doctor/TodaySlotsPreview";
import { getDoctorSubtitleForBookingCard } from "../../utils/doctorDisplayMeta";
import { normalizeSpecialistSlotGroups } from "../../utils/normalizeSpecialistSlots";
import {
  bookingModalSx,
  confirmBookingModalSx,
  specialistsModalBodySx,
  specialistsModalSx,
} from "./bookingModalStyles";

function CategoryCard({ category, onSelect }) {
  const isGp = category.specialization === "GENERAL_PRACTITIONER";

  return (
    <button
      type="button"
      onClick={() => onSelect(category.id)}
      className={`group relative flex w-full items-center gap-3 overflow-hidden rounded-2xl border bg-white p-4 text-left shadow-sm transition hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-[#020e7c] sm:gap-4 sm:p-4 ${
        isGp
          ? "border-[#020e7c]/25 hover:border-[#020e7c]/45"
          : "border-slate-200/90 hover:border-slate-300"
      }`}
    >
      <span
        className={`absolute inset-y-0 left-0 w-1 ${
          isGp ? "bg-[#020e7c]" : "bg-teal-500"
        }`}
        aria-hidden
      />
      <span
        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-2xl sm:h-12 sm:w-12 ${
          isGp ? "bg-[#020e7c]/10" : "bg-slate-50 group-hover:bg-slate-100"
        }`}
        aria-hidden
      >
        {category.icon}
      </span>
      <div className="min-w-0 flex-1">
        <p className="font-bold text-[#020e7c] sm:text-[15px]">{category.name}</p>
        <p className="mt-0.5 text-xs text-slate-500 sm:text-sm">
          {category.count > 0
            ? `${category.count} specialist${category.count === 1 ? "" : "s"} available`
            : "Check availability"}
        </p>
        {isGp && (
          <span className="mt-2 inline-block rounded-lg bg-[#020e7c] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
            Instant care also available
          </span>
        )}
      </div>
      <ChevronRight
        className="h-5 w-5 shrink-0 text-slate-300 transition group-hover:text-[#020e7c]"
        aria-hidden
      />
    </button>
  );
}

function SpecialistCard({
  specialist,
  isSlotBooked,
  isSlotExpired,
  onSlotClick,
  selectedCategoryName,
}) {
  const navigate = useNavigate();
  const normalized = normalizeSpecialistSlotGroups(specialist);
  const profile = normalized?.doctorProfile;
  const slotGroups = normalized?.slotGroups ?? [];
  const [, setClockTick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setClockTick((t) => t + 1), 30000);
    return () => clearInterval(id);
  }, []);

  const viewProfile = () => {
    if (!specialist?.doctorId) return;
    navigate(`/patient-dashboard/doctor/${specialist.doctorId}`, {
      state: { specialist, categoryName: selectedCategoryName },
    });
  };

  const subtitle = getDoctorSubtitleForBookingCard(profile);
  const totalSlots = slotGroups.reduce(
    (n, g) => n + (g.slots?.length || 0),
    0
  );

  return (
    <article className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm">
      <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-start sm:gap-4 sm:p-5">
        <button
          type="button"
          onClick={viewProfile}
          className="mx-auto shrink-0 rounded-full ring-offset-2 hover:ring-2 hover:ring-[#020e7c]/30 sm:mx-0"
        >
          <DoctorAvatar profile={profile} size="lg" />
        </button>
        <div className="min-w-0 flex-1 text-center sm:text-left">
          <button
            type="button"
            onClick={viewProfile}
            className="group inline-flex max-w-full items-center gap-1.5 text-left"
          >
            <h3 className="truncate text-base font-bold text-[#020e7c] transition group-hover:underline sm:text-lg">
              {getDoctorDisplayName(profile)}
            </h3>
            <ExternalLink
              className="h-3.5 w-3.5 shrink-0 text-slate-400 opacity-0 transition group-hover:opacity-100"
              aria-hidden
            />
          </button>
          {subtitle && (
            <p className="mt-1 text-sm text-slate-600">{subtitle}</p>
          )}
          {profile?.medicalSpecialization && (
            <div className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
              <PiStethoscope className="h-3.5 w-3.5 shrink-0" aria-hidden />
              {formatSpecialization(profile.medicalSpecialization)}
            </div>
          )}
          <button
            type="button"
            onClick={viewProfile}
            className="mt-2 text-xs font-semibold text-[#020e7c] hover:underline"
          >
            View full profile and more days
          </button>
        </div>
      </div>

      <div className="border-t border-slate-100 px-4 py-4 sm:px-5">
        <TodaySlotsPreview
          slotGroups={slotGroups}
          isSlotBooked={isSlotBooked}
          isSlotExpired={isSlotExpired ?? isSlotDateTimeExpired}
          onSlotClick={(e, slot) =>
            onSlotClick(
              e,
              normalized,
              `${slot.date}T${slot.time}`,
              slot.slotId
            )
          }
          onViewProfile={viewProfile}
        />
      </div>

      {totalSlots === 0 && (
        <div className="border-t border-slate-50 px-4 pb-4 sm:px-5 sm:pb-5">
          <p className="text-center text-sm text-slate-500">
            No open slots.{" "}
            <button
              type="button"
              onClick={viewProfile}
              className="font-semibold text-[#020e7c] hover:underline"
            >
              Check profile
            </button>
          </p>
        </div>
      )}
    </article>
  );
}

export default function PatientBookingModals({
  isMainModalOpen,
  setIsMainModalOpen,
  isSpecialistsModalOpen,
  setIsSpecialistsModalOpen,
  specialistCategories,
  specialistDetails,
  selectedCategoryName,
  isLoading,
  onCategoryClick,
  onBackToCategories,
  onBookAppointment,
  bookedSlots,
  isBooking,
  isSlotBooked,
  isSlotExpired,
}) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedTime, setSelectedTime] = useState(null);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedSlotId, setSelectedSlotId] = useState(null);

  const handleOpenConfirm = (_event, doctor, slotTime, slotId) => {
    setSelectedTime(slotTime);
    setSelectedDoctor(doctor);
    setSelectedSlotId(slotId);
    setConfirmOpen(true);
  };

  const handleCloseConfirm = () => {
    setConfirmOpen(false);
    setSelectedTime(null);
    setSelectedDoctor(null);
    setSelectedSlotId(null);
  };

  const profile = selectedDoctor?.doctorProfile;

  return (
    <>
      <Modal
        open={isMainModalOpen}
        onClose={() => setIsMainModalOpen(false)}
        aria-labelledby="category-modal-title"
      >
        <Box sx={bookingModalSx}>
          <div className="flex items-start justify-between gap-3 bg-[#020e7c] px-4 py-5 sm:px-6">
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-blue-200">
                Book care
              </p>
              <h2
                id="category-modal-title"
                className="mt-1 text-xl font-bold text-white"
              >
                Choose a specialist
              </h2>
              <p className="mt-1 text-sm text-blue-100/90">
                Pick a type of doctor to see who is available.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsMainModalOpen(false)}
              className="rounded-xl p-2 text-white/90 transition hover:bg-white/10"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <Box sx={{ ...specialistsModalBodySx, p: { xs: 2, sm: 2.5 } }}>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-3.5">
              {specialistCategories.map((category) => (
                <CategoryCard
                  key={category.id}
                  category={category}
                  onSelect={onCategoryClick}
                />
              ))}
            </div>
          </Box>
        </Box>
      </Modal>

      <Modal
        open={isSpecialistsModalOpen}
        onClose={() => setIsSpecialistsModalOpen(false)}
        aria-labelledby="specialists-modal-title"
      >
        <Box sx={specialistsModalSx}>
          <div className="sticky top-0 z-10 border-b border-slate-100 bg-white px-4 py-4 sm:px-5">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h2
                  id="specialists-modal-title"
                  className="text-lg font-bold text-[#020e7c] sm:text-xl"
                >
                  {selectedCategoryName || "Available specialists"}
                </h2>
                <p className="mt-0.5 text-sm text-slate-500">
                  Select a doctor and pick an available time
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsSpecialistsModalOpen(false)}
                className="shrink-0 rounded-xl p-2 text-slate-500 transition hover:bg-slate-100"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            {onBackToCategories && (
              <button
                type="button"
                onClick={onBackToCategories}
                className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-[#020e7c] hover:underline"
              >
                <ArrowLeft className="h-4 w-4" />
                Change specialist type
              </button>
            )}
          </div>

          <Box
            sx={{
              ...specialistsModalBodySx,
              px: { xs: 2, sm: 2.5 },
              py: { xs: 2, sm: 2.5 },
              bgcolor: "#f8fafc",
            }}
          >
            <div className="flex flex-col gap-4">
              {isLoading ? (
                Array(3)
                  .fill(0)
                  .map((_, index) => (
                    <div
                      key={index}
                      className="flex flex-col items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 sm:flex-row"
                    >
                      <Skeleton circle height={96} width={96} />
                      <div className="w-full flex-1 space-y-2">
                        <Skeleton height={22} width="70%" />
                        <Skeleton height={14} width="50%" />
                        <Skeleton height={40} />
                      </div>
                    </div>
                  ))
              ) : specialistDetails?.length > 0 ? (
                specialistDetails.map((specialist) => (
                  <SpecialistCard
                    key={specialist.doctorId}
                    specialist={specialist}
                    selectedCategoryName={selectedCategoryName}
                    isSlotBooked={isSlotBooked}
                    isSlotExpired={isSlotExpired}
                    onSlotClick={handleOpenConfirm}
                  />
                ))
              ) : (
                <div className="flex min-h-[220px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center">
                  <CalendarDays className="mb-3 h-10 w-10 text-slate-300" />
                  <p className="text-base font-semibold text-slate-800">
                    No specialists available
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    Try another category or check back later.
                  </p>
                  {onBackToCategories && (
                    <button
                      type="button"
                      onClick={onBackToCategories}
                      className="mt-4 rounded-xl bg-[#020e7c] px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-900"
                    >
                      Choose another type
                    </button>
                  )}
                </div>
              )}
            </div>
          </Box>
        </Box>
      </Modal>

      <Modal
        open={confirmOpen}
        onClose={handleCloseConfirm}
        aria-labelledby="confirm-booking-title"
      >
        <Box sx={confirmBookingModalSx}>
          <div className="border-b border-slate-100 px-5 py-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                  Confirm booking
                </p>
                <h2
                  id="confirm-booking-title"
                  className="mt-1 text-lg font-bold text-[#020e7c]"
                >
                  Review your visit
                </h2>
              </div>
              <button
                type="button"
                onClick={handleCloseConfirm}
                className="rounded-xl p-2 text-slate-500 hover:bg-slate-100"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div className="px-5 py-5">
            <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50/80 p-3.5">
              <DoctorAvatar profile={profile} size="sm" />
              <div className="min-w-0">
                <p className="truncate font-bold text-[#020e7c]">
                  {getDoctorDisplayName(profile)}
                </p>
                {profile?.medicalSpecialization && (
                  <p className="truncate text-xs text-slate-500">
                    {formatSpecialization(profile.medicalSpecialization)}
                  </p>
                )}
              </div>
            </div>

            <div className="mt-4 rounded-2xl border border-[#020e7c]/15 bg-[#020e7c]/5 px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-[#020e7c]/70">
                When
              </p>
              <p className="mt-1 text-sm font-semibold text-[#020e7c]">
                {selectedTime
                  ? dayjs(selectedTime).format("dddd, MMMM D [at] h:mm A")
                  : "Time not selected"}
              </p>
            </div>

            <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row">
              <button
                type="button"
                onClick={handleCloseConfirm}
                className="flex h-11 flex-1 items-center justify-center rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isBooking}
                onClick={(e) => {
                  onBookAppointment(e, selectedSlotId);
                  handleCloseConfirm();
                }}
                className="flex h-11 flex-1 items-center justify-center rounded-xl bg-[#020e7c] text-sm font-semibold text-white hover:bg-blue-900 disabled:opacity-70"
              >
                {isBooking ? (
                  <ColorRing
                    height="22"
                    width="22"
                    ariaLabel="booking"
                    colors={["white", "white", "white", "white", "white"]}
                  />
                ) : (
                  "Confirm booking"
                )}
              </button>
            </div>
          </div>
        </Box>
      </Modal>
    </>
  );
}
