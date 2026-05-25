/** Shared responsive MUI modal styles for patient booking & call flows */
export const bookingModalSx = {
  position: "fixed",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: { xs: "calc(100% - 1.5rem)", sm: "min(92vw, 640px)" },
  maxWidth: 640,
  maxHeight: { xs: "92vh", sm: "90vh" },
  bgcolor: "background.paper",
  boxShadow: 24,
  borderRadius: { xs: 2, sm: 3 },
  overflow: "hidden",
  outline: "none",
  display: "flex",
  flexDirection: "column",
};

export const specialistsModalSx = {
  ...bookingModalSx,
  maxWidth: 720,
  width: { xs: "calc(100% - 1rem)", sm: "min(94vw, 720px)" },
};

export const callDoctorModalSx = {
  position: "fixed",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: { xs: "calc(100% - 2rem)", sm: "min(92vw, 420px)" },
  maxWidth: 420,
  bgcolor: "background.paper",
  boxShadow: 24,
  borderRadius: 3,
  overflow: "hidden",
  outline: "none",
};

export const confirmModalSx = {
  ...callDoctorModalSx,
  p: { xs: 2.5, sm: 3 },
};
