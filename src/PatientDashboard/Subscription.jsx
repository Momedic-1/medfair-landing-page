import React from 'react';
import { ActiveSlide } from './constants';
import { formatNumber, getToken, getUserData } from '../utils';
import { baseUrl } from '../env';
import { Hourglass } from 'react-loader-spinner';
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Slide } from '@mui/material';
import axios from 'axios';
import { Link } from 'react-router-dom';

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
    <div className='w-full px-4'>
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
      <h1 className="text-2xl text-[#020E7C] font-bold mt-5 cursor-pointer">
        Choose a Subscription Plan
      </h1>
      <div className="mt-5 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {ActiveSlide.map((swipe, index) => (
          <div
            key={index}
            className="flex flex-col w-full min-h-[350px] bg-white p-5 border border-gray-300 rounded-lg shadow-md mb-8"
          >
            <span className="text-blue-600 text-2xl font-bold">{swipe.title}</span>
            <div className="text-4xl font-bold text-[#020E7C] mt-2">₦{formatNumber(swipe.subTitle)}</div>
            <button className="mt-7 w-32 border text-white bg-[#020E7C] py-2 px-4 rounded-3xl" onClick={(e) => handleSubscription(e, swipe.subTitle)}>
              Subscribe
            </button>
            <div className="border-y-2 mt-3" />
            <div className="py-4">
              <ul className="text-gray-950/60 w-full text-lg mb-5 space-y-2">
                {swipe.content.map((content, idx) => (
                  <li key={idx} className="flex items-start">
                    <span className="text-green-600 mr-2">✔</span> {content}
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
        sx={{paddingY: '20px'}}
      >
        <DialogContent>
          <DialogContentText id="alert-dialog-slide-description">
            <p className="mb-4 text-gray-950/60 text-lg">Click the button below to proceed with the payment.</p>
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button variant="contained" color="primary">
            <Link to={paymentLink} className="text-white">
              Make Payment
            </Link>
            
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default Subscription;