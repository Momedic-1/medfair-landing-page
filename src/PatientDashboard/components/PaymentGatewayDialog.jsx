import React from "react";
import { Link } from "react-router-dom";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  Slide,
  Box,
  Typography,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import LockIcon from "@mui/icons-material/Lock";

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const PaymentGatewayDialog = ({ open, handleClose, paymentLink }) => {
  return (
    <Dialog
      open={open}
      TransitionComponent={Transition}
      keepMounted
      onClose={handleClose}
      aria-describedby="payment-dialog"
      maxWidth="sm"
      fullWidth
      sx={{
        "& .MuiDialog-paper": {
          background: "linear-gradient(145deg, #f8f9ff, #ffffff)",
          borderRadius: "24px",
          padding: 0,
          overflow: "hidden",
          boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
        },
      }}
    >
      <Box
        sx={{
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          padding: "32px 24px",
          textAlign: "center",
          color: "white",
        }}
      >
        <Box
          sx={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: 80,
            height: 80,
            borderRadius: "50%",
            bgcolor: "rgba(255, 255, 255, 0.2)",
            backdropFilter: "blur(10px)",
            mb: 2,
          }}
        >
          <LockIcon sx={{ fontSize: 40, color: "#ffffff" }} />
        </Box>
        <Typography
          variant="h5"
          component="div"
          sx={{
            fontWeight: 700,
            color: "#ffffff",
            mb: 1,
          }}
        >
          Secure Payment Gateway
        </Typography>
        <Typography
          variant="body2"
          sx={{
            color: "rgba(255, 255, 255, 0.9)",
            fontSize: "0.875rem",
          }}
        >
          Your payment is protected with bank-level security
        </Typography>
      </Box>

      <DialogContent sx={{ padding: "32px 24px" }}>
        <Box
          sx={{
            bgcolor: "#f0f4ff",
            borderRadius: "12px",
            p: 3,
            mb: 3,
            display: "flex",
            alignItems: "center",
            gap: 2,
            border: "1px solid #e0e7ff",
          }}
        >
          <CheckCircleIcon sx={{ color: "#10b981", fontSize: 28 }} />
          <Box>
            <Typography
              variant="body2"
              sx={{
                color: "#1e40af",
                fontWeight: 600,
                fontSize: "0.875rem",
              }}
            >
              SSL Encrypted Connection
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: "#64748b",
                fontSize: "0.75rem",
                mt: 0.5,
              }}
            >
              Your payment information is secure and encrypted
            </Typography>
          </Box>
        </Box>

        <Box
          sx={{
            textAlign: "center",
            py: 2,
          }}
        >
          <Typography
            variant="body1"
            sx={{
              color: "#475569",
              fontSize: "0.9375rem",
              lineHeight: 1.6,
            }}
          >
            You will be redirected to our secure payment processor to complete
            your transaction.
          </Typography>
        </Box>
      </DialogContent>

      <DialogActions
        sx={{
          justifyContent: "center",
          gap: 2,
          padding: "24px",
          bgcolor: "#f8fafc",
          borderTop: "1px solid #e2e8f0",
        }}
      >
        <Button
          onClick={handleClose}
          variant="outlined"
          sx={{
            px: 4,
            py: 1.5,
            borderRadius: "12px",
            borderColor: "#cbd5e1",
            color: "#64748b",
            fontWeight: 600,
            textTransform: "none",
            "&:hover": {
              bgcolor: "#f1f5f9",
              borderColor: "#94a3b8",
            },
          }}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          component={paymentLink ? Link : "button"}
          to={paymentLink}
          disabled={!paymentLink}
          sx={{
            px: 5,
            py: 1.5,
            borderRadius: "12px",
            bgcolor: paymentLink
              ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
              : "#cbd5e1",
            color: "#ffffff",
            fontWeight: 600,
            textTransform: "none",
            boxShadow: paymentLink
              ? "0 4px 14px rgba(102, 126, 234, 0.4)"
              : "none",
            "&:hover": {
              bgcolor: paymentLink
                ? "linear-gradient(135deg, #5568d3 0%, #6a3f8f 100%)"
                : "#cbd5e1",
              boxShadow: paymentLink
                ? "0 6px 20px rgba(102, 126, 234, 0.5)"
                : "none",
            },
            "&.Mui-disabled": {
              bgcolor: "#e2e8f0",
              color: "#94a3b8",
            },
          }}
        >
          {paymentLink ? "Proceed to Payment" : "Loading Payment Gateway..."}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PaymentGatewayDialog;
