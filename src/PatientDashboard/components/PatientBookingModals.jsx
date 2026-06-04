import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Modal,
  Box,
  Button,
  Popover,
} from "@mui/material";
import { ColorRing } from "react-loader-spinner";
import { PiStethoscope } from "react-icons/pi";
import { ChevronRight, ExternalLink, X } from "lucide-react";
import dayjs from "dayjs";
import Skeleton from "react-loading-skeleton";
import { formatSpecialization } from "../../utils";
import { isSlotDateTimeExpired } from "../../utils/slotDateTime";
import DoctorAvatar, {
  getDoctorDisplayName,
} from "./DoctorAvatar";
import DoctorSlotsByDate from "../../components/doctor/DoctorSlotsByDate";
import TodaySlotsPreview, {
  countFutureDays,
} from "../../components/doctor/TodaySlotsPreview";
import { getDoctorSubtitleForBookingCard } from "../../utils/doctorDisplayMeta";
import { normalizeSpecialistSlotGroups } from "../../utils/normalizeSpecialistSlots";
import {
  bookingModalSx,
  specialistsModalBodySx,
  specialistsModalSx,
} from "./bookingModalStyles";

function CategoryCard({ category, onSelect }) {
  const isGp = category.specialization === "GENERAL_PRACTITIONER";

  return (
    <button
      type="button"
      onClick={() => onSelect(category.id)}
      className={`group w-full rounded-2xl border p-4 text-left transition sm:p-5 ${
        isGp
          ? "border-blue-200 bg-gradient-to-br from-blue-50/80 to-white hover:border-blue-300 hover:shadow-md"
          : "border-gray-100 bg-white hover:border-blue-100 hover:bg-blue-50/40 hover:shadow-sm"
      }`}
    >
      <div className="flex items-center gap-3 sm:gap-4">
        <span
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-2xl sm:h-14 sm:w-14 ${
            isGp ? "bg-blue-100" : "bg-gray-50 group-hover:bg-blue-50"
          }`}
          aria-hidden
        >
          {category.icon}
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-gray-900 sm:text-lg">{category.name}</p>
          <p className="mt-0.5 text-sm text-gray-500">
            {category.count > 0
              ? `${category.count} specialist${category.count === 1 ? "" : "s"} available`
              : "Check availability"}
          </p>
          {isGp && (
            <span className="mt-2 inline-block rounded-full bg-[#020e7c]/10 px-2.5 py-0.5 text-xs font-medium text-[#020e7c]">
              Most popular
            </span>
          )}
        </div>
        <ChevronRight
          className="h-5 w-5 shrink-0 text-gray-300 transition group-hover:text-[#020e7c]"
          aria-hidden
        />
      </div>
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
  const upcomingDays = countFutureDays(slotGroups);
  const totalSlots = slotGroups.reduce(
    (n, g) => n + (g.slots?.length || 0),
    0
  );

  return (
    <article className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
      <div className="flex flex-col gap-4 bg-gradient-to-b from-slate-50/80 to-white p-4 sm:flex-row sm:items-start sm:p-5">
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
            className="group inline-flex items-center gap-1.5 text-left"
          >
            <h3 className="text-lg font-semibold text-gray-900 transition group-hover:text-[#020e7c] sm:text-xl">
              {getDoctorDisplayName(profile)}
            </h3>
            <ExternalLink
              className="h-4 w-4 shrink-0 text-gray-400 opacity-0 transition group-hover:opacity-100 group-hover:text-[#020e7c]"
              aria-hidden
            />
          </button>
          <p className="mt-0.5 text-xs text-[#020e7c]">
            <button
              type="button"
              onClick={viewProfile}
              className="font-medium hover:underline"
            >
              View full profile &amp; slots
            </button>
          </p>
          {subtitle && (
            <p className="mt-1 text-sm text-gray-600">{subtitle}</p>
          )}
          {profile?.medicalSpecialization && (
            <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-600">
              <PiStethoscope className="h-3.5 w-3.5 shrink-0" aria-hidden />
              {formatSpecialization(profile.medicalSpecialization)}
            </div>
          )}
        </div>
      </div>

      <div className="border-t border-gray-100 px-4 py-4 sm:px-5">
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

      {(upcomingDays > 0 || totalSlots > 0) && (
      <div className="border-t border-gray-50 p-4 sm:p-5">
        {upcomingDays > 0 && (
          <>
            <h4 className="mb-2 text-sm font-semibold text-gray-700">
              Upcoming dates
            </h4>
            <DoctorSlotsByDate
              slotGroups={slotGroups}
              excludeToday
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
              emptyMessage=""
            />
          </>
        )}
      </div>
      )}

      {totalSlots === 0 && (
      <div className="border-t border-gray-50 px-4 pb-4 sm:px-5 sm:pb-5">
        <p className="text-center text-sm text-gray-500">
          No open slots.{" "}
          <button
            type="button"
            onClick={viewProfile}
            className="font-medium text-[#020e7c] hover:underline"
          >
            check profile
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
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedSlotId, setSelectedSlotId] = useState(null);

  const handleOpenPopover = (event, doctor, slotTime, slotId) => {
    setAnchorEl(event.currentTarget);
    setSelectedTime(slotTime);
    setSelectedDoctor(doctor);
    setSelectedSlotId(slotId);
  };

  const handleClosePopover = () => {
    setAnchorEl(null);
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
          <div className="flex items-center justify-between border-b border-blue-600/20 bg-gradient-to-r from-[#020e7c] to-blue-700 px-4 py-4 sm:px-5">
            <div>
              <h2
                id="category-modal-title"
                className="text-lg font-semibold text-white sm:text-xl"
              >
                Book an appointment
              </h2>
              <p className="mt-0.5 text-sm text-blue-100">Choose a type of specialist</p>
            </div>
            <button
              type="button"
              onClick={() => setIsMainModalOpen(false)}
              className="rounded-full p-2 text-white/90 transition hover:bg-white/10"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <Box sx={{ ...specialistsModalBodySx, p: { xs: 2, sm: 2.5 } }}>
            <div className="flex flex-col gap-3 sm:gap-4">
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
          <div className="sticky top-0 z-10 border-b border-gray-100 bg-white px-4 py-4 sm:px-5">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h2
                  id="specialists-modal-title"
                  className="text-lg font-semibold text-[#020e7c] sm:text-xl"
                >
                  {selectedCategoryName || "Available specialists"}
                </h2>
              <p className="text-sm text-gray-500">
                  Select a doctor and pick an available time
              </p>
              </div>
              <button
                type="button"
                onClick={() => setIsSpecialistsModalOpen(false)}
                className="shrink-0 rounded-full p-2 text-gray-500 transition hover:bg-gray-100"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            {onBackToCategories && (
              <button
                type="button"
                onClick={onBackToCategories}
                className="mt-3 text-sm font-medium text-[#020e7c] hover:underline"
              >
                ← Change specialist type
              </button>
            )}
          </div>

          <Box
            sx={{
              ...specialistsModalBodySx,
              px: { xs: 2, sm: 2.5 },
              py: { xs: 2, sm: 2.5 },
            }}
          >
            <div className="flex flex-col gap-4">
            {isLoading ? (
              Array(3)
                .fill(0)
                .map((_, index) => (
                  <div
                    key={index}
                    className="flex flex-col items-center gap-4 rounded-2xl border p-5 sm:flex-row"
                  >
                    <Skeleton circle height={112} width={112} />
                    <div className="w-full flex-1 space-y-2">
                      <Skeleton height={24} width="70%" />
                      <Skeleton height={16} width="50%" />
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
                  onSlotClick={handleOpenPopover}
                />
              ))
            ) : (
              <div className="flex min-h-[200px] flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-gray-50/50 p-8 text-center">
                <p className="text-lg font-medium text-gray-700">No specialists available</p>
                <p className="mt-1 text-sm text-gray-500">
                  Try another category or check back later.
                </p>
              </div>
            )}
            </div>
          </Box>
        </Box>
      </Modal>

      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={handleClosePopover}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        transformOrigin={{ vertical: "top", horizontal: "center" }}
        slotProps={{
          paper: {
            sx: {
              width: { xs: "calc(100vw - 2rem)", sm: 360 },
              maxWidth: 360,
              borderRadius: 2,
              p: 0,
            },
          },
        }}
      >
        <div className="p-4 sm:p-5">
          <div className="mb-4 flex items-center gap-3">
            <DoctorAvatar profile={profile} size="sm" />
            <div className="min-w-0">
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                Confirm booking
              </p>
              <p className="truncate font-semibold text-gray-900">
                {getDoctorDisplayName(profile)}
              </p>
            </div>
          </div>
          <p className="text-sm text-gray-600">
            <span className="font-medium text-gray-800">When: </span>
            {selectedTime &&
              dayjs(selectedTime).format("dddd, MMMM D · h:mm A")}
          </p>
          <div className="mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button variant="outlined" size="small" onClick={handleClosePopover} fullWidth>
              Cancel
            </Button>
            <Button
              variant="contained"
              size="small"
              fullWidth
              sx={{ bgcolor: "#020e7c", "&:hover": { bgcolor: "#1e3a8a" } }}
              onClick={(e) => {
                onBookAppointment(e, selectedSlotId);
                handleClosePopover();
              }}
              disabled={isBooking}
            >
              {isBooking ? (
                <ColorRing
                  height="20"
                  width="20"
                  ariaLabel="booking"
                  colors={["white", "white", "white", "white", "white"]}
                />
              ) : (
                "Confirm booking"
              )}
            </Button>
          </div>
        </div>
      </Popover>
    </>
  );
}
