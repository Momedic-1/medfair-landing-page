import React from 'react';
import { ActiveSlide } from './constants';
import { formatNumber, getToken, getUserData } from '../utils';
import { baseUrl } from '../env';
import { Hourglass } from 'react-loader-spinner';
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Slide } from '@mui/material';
import axios from 'axios';
import { Link } from 'react-router-dom';
import CheckCircleIcon from '@mui/icons-material/CheckCircle'; // Import Material Icon

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
            wrapperStyle={{}}
            wrapperClass=""
            colors={['#306cce', '#72a1ed']}
          />
        </div>
      )}
      <h1 className="text-3xl text-[#020E7C] font-extrabold mt-5 cursor-pointer text-center">
        Choose a Subscription Plan
      </h1>
      <p className="text-gray-600 text-center mt-2">
        Select the plan that best suits your needs and enjoy premium features.
      </p>
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {ActiveSlide.map((swipe, index) => (
          <div
            key={index}
            className="flex flex-col w-full min-h-[350px] bg-gradient-to-br from-white to-gray-100 p-6 border border-gray-200 rounded-lg shadow-lg hover:shadow-2xl transition-shadow duration-300 transform hover:-translate-y-2"
          >
            <span className="text-blue-600 text-2xl font-bold">{swipe.title}</span>
            <div className="text-4xl font-extrabold text-[#020E7C] mt-2">
              ₦{formatNumber(swipe.subTitle)}
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
        aria-describedby="alert-dialog-slide-description"
        sx={{ paddingY: '20px' }}
      >
        <DialogContent>
          <DialogContentText id="alert-dialog-slide-description">
            <p className="mb-4 text-gray-700 text-lg">
              Click the button below to proceed with the payment.
            </p>
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} variant="outlined" color="secondary">
            Cancel
          </Button>
          <Button variant="contained" color="primary">
            <Link to={paymentLink} className="text-white no-underline">
              Make Payment
            </Link>
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default Subscription;