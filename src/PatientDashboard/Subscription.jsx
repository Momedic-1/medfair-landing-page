import React from 'react';
import { ActiveSlide } from './constants';
import { getToken, getUserData } from '../utils';
import { baseUrl } from '../env';
import { Hourglass } from 'react-loader-spinner';
import { Button, Dialog, DialogActions, DialogContent, Slide, Box, Typography, CircularProgress } from '@mui/material';
import axios from 'axios';
import { Link } from 'react-router-dom';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import LockIcon from '@mui/icons-material/Lock';

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const Subscription = () => {
  const [paymentLink, setPaymentLink] = React.useState(null);
  const [open, setOpen] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const token = getToken();
  const user = getUserData();

  const handleClose = () => {
    setOpen(false);
  };

  const formatPrice = (price) => {
    return price.toFixed(2);
  };

  const handleSubscription = async (e, amount) => {
    e.preventDefault();
    setIsLoading(true);
    const dataToSend = {
      amount,
      email: user?.emailAddress,
    };

    try {
      const response = await axios.post(
        `${baseUrl}/api/payment/initialize-payment`,
        dataToSend,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const result = response.data;

      if (result) {
        setPaymentLink(result);
        setOpen(true);
      } else {
        console.error("Payment URL not found in response:", result);
      }
    } catch (error) {
      console.error('Error initializing payment:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full px-4">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-50 backdrop-blur-sm z-50">
          <Hourglass
            visible={true}
            height="40"
            width="40"
            ariaLabel="hourglass-loading"
            colors={['#306cce', '#72a1ed']}
          />
        </div>
      )}
      <h1 className="text-3xl text-[#020E7C] font-extrabold mt-5 text-center">
        Choose a Subscription Plan
      </h1>
      <p className="text-gray-600 text-center mt-2">
        Select the plan that best suits your needs and enjoy premium features.
      </p>
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        {ActiveSlide.map((swipe, index) => (
          <div
            key={index}
            className="flex flex-col w-full min-h-[350px] bg-gradient-to-br from-white to-gray-100 p-6 border border-gray-200 rounded-lg shadow-lg hover:shadow-2xl transition-shadow duration-300 transform hover:-translate-y-2"
          >
            <span className="text-blue-600 text-2xl font-bold">{swipe.title}</span>
            <div className="text-4xl font-extrabold text-[#020E7C] mt-2">
              ₦{formatPrice(swipe.subTitle)}
            </div>
            <button
              className="mt-7 w-36 border text-white bg-gradient-to-r from-blue-500 to-blue-700 py-2 px-4 rounded-full hover:from-blue-600 hover:to-blue-800 transition-all duration-300"
              onClick={(e) => handleSubscription(e, swipe.subTitle)}
            >
              Subscribe
            </button>
            <div className="border-y-2 mt-4" />
            <div className="py-4">
              <ul className="text-gray-700 w-full text-lg mb-5 space-y-3">
                {swipe.content.map((content, idx) => (
                  <li key={idx} className="flex items-start">
                    <CheckCircleIcon className="text-green-500 mr-2" />
                    {content}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
      <Dialog
        open={open}
        TransitionComponent={Transition}
        keepMounted
        onClose={handleClose}
        aria-describedby="payment-dialog"
        sx={{
          '& .MuiDialog-paper': {
            background: 'linear-gradient(145deg, #f8f9ff, #ffffff)',
            borderRadius: '16px',
            padding: '24px',
            minWidth: '400px',
          },
        }}
      >
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <CheckCircleIcon sx={{ fontSize: 48, color: '#4CAF50', mb: 2 }} />
          <Typography variant="h5" component="div" sx={{ fontWeight: 600, color: '#1a237e' }}>
            Secure Payment Gateway
          </Typography>
        </Box>

        <DialogContent>
          <Box
            sx={{
              bgcolor: '#f5f5f5',
              borderRadius: '8px',
              p: 2,
              mb: 3,
              display: 'flex',
              alignItems: 'center',
              gap: 1,
            }}
          >
            <LockIcon color="success" />
            <Typography variant="body2" sx={{ color: '#616161' }}>
              SSL encrypted connection - Your payment is secure
            </Typography>
          </Box>

          {/* {paymentLink ? (
            <Box sx={{ textAlign: 'center' }}>
              <CircularProgress sx={{ mb: 2 }} />
              <Typography variant="body1" sx={{ mb: 3, color: '#424242' }}>
                Redirecting to secure payment portal...
              </Typography>
              {setTimeout(() => {
                window.location.href = paymentLink;
              }, 3000)}
            </Box>
          ) : (
            <Typography variant="body1" sx={{ color: '#d32f2f', textAlign: 'center' }}>
              Payment link not available. Please try again.
            </Typography>
          )} */}
        </DialogContent>

        <DialogActions sx={{ justifyContent: 'center', gap: 2, pb: 3 }}>
          <Button
            onClick={handleClose}
            variant="outlined"
            color="secondary"
            sx={{
              px: 4,
              borderRadius: '8px',
              '&:hover': { bgcolor: '#f5f5f5' },
            }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            color="primary"
            component={paymentLink ? Link : 'button'}
            to={paymentLink}
            disabled={!paymentLink}
            sx={{
              px: 4,
              borderRadius: '8px',
              bgcolor: '#1a237e',
              '&:hover': { bgcolor: '#303f9f' },
              '&.Mui-disabled': { bgcolor: '#e0e0e0' },
            }}
          >
            {paymentLink ? 'Proceed to Payment' : 'Loading Payment Gateway...'}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default Subscription;
