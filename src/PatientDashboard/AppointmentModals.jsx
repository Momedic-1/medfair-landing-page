import { useState } from "react";
import {
  Modal,
  Box,
  List,
  ListItem,
  ListItemButton,
  Avatar,
  Button,
  Popover,
} from "@mui/material";
import { Link } from "react-router-dom";
import { ColorRing } from "react-loader-spinner";
import { formatSpecialization, getId } from "../utils";
import Skeleton from "react-loading-skeleton";
import { PiStethoscope } from "react-icons/pi";
import dayjs from "dayjs";

const modalStyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "90%",
  maxWidth: "650px",
  bgcolor: "background.paper",
  boxShadow: 24,
  p: 4,
  borderRadius: "8px",
  overflowY: "auto",
  maxHeight: "90vh",
};

const avatarStyle = {
  width: 100,
  height: 100,
};

const specialistCategory = [
  {
    id: 1,
    name: "Mental Health Specialist",
    count: 0,
    icon: "🧠",
    specialization: "MENTAL_HEALTH_SPECIALIST",
  },
  {
    id: 2,
    name: "Clinical Psychologist",
    count: 0,
    icon: "🎯",
    specialization: "CLINICAL_PSYCHOLOGIST",
  },
  {
    id: 3,
    name: "Relationship Therapist",
    count: 0,
    icon: "💭",
    specialization: "RELATIONSHIP_THERAPIST",
  },
  {
    id: 4,
    name: "Sex Therapist",
    count: 0,
    icon: "❤️",
    specialization: "SEX_THERAPIST",
  },
];

const AppointmentModals = ({
  isMainModalOpen,
  setIsMainModalOpen,
  isSpecialistsModalOpen,
  setIsSpecialistsModalOpen,
  isCallADoctorModalOpen,
  setIsCallADoctorModalOpen,
  specialistCategories,
  specialistDetails,
  isLoading,
  videoLink,
  onCategoryClick,
  onBookAppointment,
  onCreateMeeting,
  bookedSlots,
  isBooking
}) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedSlotId, setSelectedSlotId] = useState(null);

  const patientId = getId();

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
  };

  const handleBookingConfirm = (e) => {
    onBookAppointment(e, selectedSlotId, patientId);
    handleClosePopover();
  };

  return (
    <>
      {/* Main Category Selection Modal */}
      <Modal
        open={isMainModalOpen}
        onClose={() => setIsMainModalOpen(false)}
        aria-labelledby="category-modal-title"
      >
        <Box sx={modalStyle}>
          <div className="w-full flex justify-between items-center mb-4 bg-gradient-to-r from-blue-500 to-blue-700 p-4 rounded-t-lg">
            <p className="text-2xl text-white font-semibold">Choose Specialist</p>
            <button
              onClick={() => setIsMainModalOpen(false)}
              className="p-2 hover:bg-blue-600 rounded-full transition-colors"
            >
              <span className="text-white">✕</span>
            </button>
          </div>
          {specialistCategories.map((category) => (
            <button
              key={category.id}
              onClick={() => onCategoryClick(category.id)}
              className="w-full p-4 mb-4 hover:bg-blue-50 rounded-xl transition-colors border border-gray-100 hover:border-blue-100 group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className="text-2xl">{category.icon}</span>
                  <div className="text-left">
                    <div className="font-medium text-gray-900">{category.name}</div>
                    <div className="text-sm text-gray-500">
                      {category.count} specialists available
                    </div>
                  </div>
                </div>
                <span className="text-gray-400 group-hover:text-blue-500 transition-colors">
                  →
                </span>
              </div>
            </button>
          ))}
        </Box>
      </Modal>

      {/* Specialists List Modal */}
      <Modal
        open={isSpecialistsModalOpen}
        onClose={() => setIsSpecialistsModalOpen(false)}
        aria-labelledby="specialists-modal-title"
      >
        <Box sx={{ height: 800, overflowY: "auto", ...modalStyle }}>
          <div className="w-full flex justify-between items-center mb-4 overflow-y-scroll">
            <p className="mb-1 text-2xl text-gray-950/60 font-semibold">
              Available Specialists
            </p>
            <button
              onClick={() => setIsSpecialistsModalOpen(false)}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <span className="text-gray-500">✕</span>
            </button>
          </div>

          <List sx={{ width: "100%", bgcolor: "background.paper", overflowY: "auto" }}>
            {isLoading ? (
              Array(5).fill(0).map((_, index) => (
                <ListItem key={index} disablePadding>
                  <ListItemButton>
                    <div className="flex items-center justify-between w-full">
                      <div className="w-[10%]">
                        <Skeleton circle={true} height={50} width={50} />
                      </div>
                      <div className="w-[50%]">
                        <Skeleton height={20} width="80%" />
                        <Skeleton height={14} width="60%" style={{ marginTop: 6 }} />
                      </div>
                      <div className="w-[40%]">
                        <Skeleton height={20} width="100%" />
                      </div>
                    </div>
                  </ListItemButton>
                </ListItem>
              ))
            ) : specialistDetails?.length > 0 ? (
              specialistDetails.map((specialist) => (
                <ListItem key={specialist.slots.slotId} disablePadding>
                  <ListItemButton>
                    <div className="px-4 py-4 border shadow-xl rounded-lg flex flex-col gap-4 w-full md:flex-row md:items-center">
                      <div className="flex flex-col items-center md:items-start md:w-1/3">
                        {specialist.doctorProfile ? (
                          <Avatar
                            src={specialist?.doctorProfile?.imageUrl}
                            sx={avatarStyle}
                            className="mb-4 md:mb-0"
                          />
                        ) : (
                          <Avatar
                            src="/broken-image.jpg"
                            sx={avatarStyle}
                            className="mb-4 md:mb-0"
                          />
                        )}
                      </div>

                      <div className="flex flex-col gap-2 md:w-2/3">
                        <p className="text-xl font-sans font-semibold text-gray-900 text-center md:text-left">
                          {specialist?.doctorProfile?.title +
                            " " +
                            specialist?.doctorProfile?.firstName +
                            " " +
                            specialist?.doctorProfile?.lastName}
                        </p>
                        <p className="text-sm text-gray-600 text-center md:text-left">
                          {specialist?.doctorProfile?.practiceName +
                            " | " +
                            specialist?.doctorProfile?.qualifications}
                        </p>
                        <div className="flex flex-col items-center md:items-start">
                          <div className="flex flex-row items-center gap-1">
                            <PiStethoscope
                              style={{
                                width: "1.3em",
                                height: "1.3em",
                                color: "gray",
                              }}
                            />
                            <p className="text-sm text-gray-500">
                              {formatSpecialization(
                                specialist?.doctorProfile?.medicalSpecialization
                              )}
                            </p>
                          </div>
                          <button className="bg-blue-500 text-white text-sm py-1 px-4 rounded-sm hover:bg-blue-600 transition mt-2">
                            Available Today
                          </button>
                        </div>
                      </div>

                      <div className="w-[140px] mt-4 md:mt-0">
                        <p className="text-sm font-bold text-center md:text-left">
                          {dayjs().format("ddd, MMM D")}
                        </p>
                        <div className="flex flex-wrap justify-center md:justify-start gap-2 mt-2">
                          {specialist.slots?.length > 0 ? (
                            specialist.slots
                              .filter((slot) => dayjs(slot.date).isSame(dayjs(), "day"))
                              .map((slot) => (
                                <button
                                  key={slot.slotId}
                                  className={`${
                                    bookedSlots.has(slot.slotId)
                                      ? "bg-red-500 cursor-not-allowed"
                                      : "bg-[#020E7C] hover:bg-blue-600"
                                  } text-white text-sm px-4 py-2 rounded-full transition`}
                                  onClick={(e) =>
                                    !bookedSlots.has(slot.slotId) &&
                                    handleOpenPopover(
                                      e,
                                      specialist,
                                      `${slot.date}T${slot.time}`,
                                      slot.slotId
                                    )
                                  }
                                  disabled={bookedSlots.has(slot.slotId)}
                                >
                                  {bookedSlots.has(slot.slotId)
                                    ? "Booked"
                                    : dayjs(`${slot.date}T${slot.time}`).format("h:mm A")}
                                </button>
                              ))
                          ) : (
                            <p className="text-sm text-gray-500">No available slots today</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </ListItemButton>
                </ListItem>
              ))
            ) : (
              <div className="w-full h-[300px] flex justify-center items-center">
                <p className="text-2xl text-gray-950/60">No specialists available</p>
              </div>
            )}
          </List>
        </Box>
      </Modal>

      {/* Call a Doctor Modal */}
      <Modal
        open={isCallADoctorModalOpen}
        onClose={() => setIsCallADoctorModalOpen(false)}
        aria-labelledby="call-doctor-modal-title"
      >
        <Box
          sx={{
            width: 400,
            height: 200,
            overflowY: "auto",
            bgcolor: "background.paper",
            boxShadow: 24,
            p: 4,
            borderRadius: 2,
            position: "absolute",
            top: "40%",
            left: "50%",
            transform: "translate(-50%, -50%)",
          }}
        >
          <div className="w-full h-full flex flex-col gap-y-8 px-4">
            {videoLink === null ? (
              <>
                <p className="text-lg text-center font-medium">Want to call a doctor?</p>
                <button
                  className="bg-blue-500 flex justify-center items-center w-full h-14 text-white rounded-full"
                  onClick={onCreateMeeting}
                >
                  {isLoading ? (
                    <ColorRing
                      height="40"
                      width="40"
                      ariaLabel="color-ring-loading"
                      wrapperStyle={{}}
                      wrapperClass="color-ring-wrapper"
                      colors={["white", "white", "white", "white", "white"]}
                    />
                  ) : (
                    "Create Meeting"
                  )}
                </button>
              </>
            ) : (
              <div className="w-full h-full flex flex-col gap-y-4">
                <p className="text-xl font-medium">Your meeting link is:</p>
                <a
                  href={videoLink?.roomUrl}
                  className="text-[12px] cursor-pointer font-medium text-blue-800"
                >
                  {videoLink?.roomUrl}
                </a>
                <Link
                  to={`/video-call?roomUrl=${encodeURIComponent(videoLink?.roomUrl)}`}
                >
                  <button className="bg-blue-500 w-full h-10 text-white rounded-full">
                    Click to join a call
                  </button>
                </Link>
              </div>
            )}
          </div>
        </Box>
      </Modal>

      {/* Booking Confirmation Popover */}
      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={handleClosePopover}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "center",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "center",
        }}
      >
        <div className="p-4">
          <p>
            Confirm booking with{" "}
            <span className="font-bold">
              {selectedDoctor?.doctorProfile.title +
                " " +
                selectedDoctor?.doctorProfile.firstName +
                " " +
                selectedDoctor?.doctorProfile.lastName}
            </span>
          </p>
          <p className="font-bold">
            {selectedTime && dayjs(selectedTime).format("MMMM D, YYYY [at] h:mm A")}
          </p>
          <div className="flex justify-end gap-2 mt-3">
            <Button variant="outlined" size="small" onClick={handleClosePopover}>
              Cancel
            </Button>
            <Button
              variant="contained"
              color="primary"
              size="small"
              onClick={handleBookingConfirm}
              disabled={isBooking}
            >
              {isBooking ? (
                <ColorRing
                  height="20"
                  width="20"
                  ariaLabel="color-ring-loading"
                  wrapperStyle={{}}
                  wrapperClass="color-ring-wrapper"
                  colors={["white", "white", "white", "white", "white"]}
                />
              ) : (
                "Confirm"
              )}
            </Button>
          </div>
        </div>
      </Popover>
    </>
  );
};

export default AppointmentModals;