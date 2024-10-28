
import React, { useState } from 'react';
import payment from './assets/payment.svg';
import { useNavigate,useLocation } from 'react-router-dom';
import axios from 'axios';
import DesignedSideBar from '../components/reuseables/DesignedSideBar';

export default function PaymentPage() {
  const subscriptionPlans = {
    yearly: { name: 'Yearly', price: 45000 },
    monthly: { name: 'Monthly', price: 5000 },
    instant: { name: 'Instant', price: 1500 },
  };

  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    cardName: '',
    cardNumber: '',
    cvv: '',
    date: '',
  });

 
  
  const location = useLocation();
  const initialPlan = location.state?.selectedPlan || 'monthly';
  const [selectedPlan, setSelectedPlan] = useState(initialPlan); 
  const [selectedPrice, setSelectedPrice] = useState(subscriptionPlans[selectedPlan].price);
  const [discount, setDiscount] = useState(0);
  const [isNewCard, setIsNewCard] = useState(false); 
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    formData.plan = selectedPlan;
    formData.amount = `${selectedPrice}.00`;

    const userData = JSON.parse(localStorage.getItem('authToken'));
    const token = userData.token;
    formData.email = userData.user.emailAddress;

    try {
      const response = await axios.post(`https://momedic.onrender.com/api/payment/initialize-payment`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log(response);
      setPaymentSuccess(true);
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  const handleNewCardChange = () => {
    setIsNewCard((prev) => !prev);
  };

  const total = selectedPrice - (selectedPrice * discount) / 100;

  return (
    <div className="flex flex-col lg:flex-row h-screen">
      <DesignedSideBar />

      {paymentSuccess ? (
        <div className="flex flex-col h-screen w-screen items-center justify-center">
          <h1 className="mt-5 lg:mt-0 text-2xl text-black mb-3 text-center">Checkout Summary</h1>
          <div className="bg-white p-6 border border-gray-300 shadow-lg rounded-md w-full max-w-md text-center">
            <img src={payment} alt="Payment Success" className="h-32 w-32 mx-auto mb-4" />
            <p className="text-lg font-semibold text-green-500">Payment Successful!</p>
            <p className="text-gray-600 mt-2">Thank you for subscribing to the {subscriptionPlans[selectedPlan].name} Plan.</p>
            <p className="text-lg font-bold mt-4">Total Paid: N{total.toLocaleString()}</p>
          </div>
          <button
            onClick={() => navigate('/patient-dashboard')}
            className="mt-6 bg-gradient-to-r from-blue-400 to-purple-600 text-white p-3 rounded-md w-full max-w-xs"
          >
            Return to Dashboard
          </button>
        </div>
      ) : (
        <div className="w-full lg:w-3/5 flex flex-col items-center justify-center p-4 lg:p-0">
          <h1 className="text-2xl mb-3 text-black mt-5 lg:mt-0">Enter Payment Details</h1>
          <p className="mt-2 mb-3">Subscribe to any Medfair plan</p>

          <div className="flex flex-col lg:flex-row justify-around w-full mb-6">
            {Object.keys(subscriptionPlans).map((planKey) => {
              const plan = subscriptionPlans[planKey];
              return (
                <div
                  key={plan.name}
                  className={`p-4 border rounded-md cursor-pointer mb-4 lg:mb-0 ${
                    selectedPlan === planKey ? 'bg-blue-500 text-white' : 'bg-gray-100'
                  }`}
                  onClick={() => {
                    setSelectedPlan(planKey);
                    setSelectedPrice(plan.price);
                  }}
                >
                  <p>{plan.name} Plan</p>
                  <p className="font-bold">N{plan.price.toLocaleString()}</p>
                </div>
              );
            })}
          </div>

          <form onSubmit={handleSubmit} className="p-8 w-full md:max-w-[86%]">
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="cardName">
                Card Holder Name
              </label>
              <input
                type="text"
                name="cardName"
                id="cardName"
                placeholder="Enter cardholder name"
                value={formData.cardName}
                onChange={handleChange}
                required
                className="border rounded-md w-full p-3 text-gray-700"
              />
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="cardNumber">
                Card Number
              </label>
              <input
                type="text"
                name="cardNumber"
                id="cardNumber"
                placeholder="xxxx xxxx xxxx"
                value={formData.cardNumber}
                onChange={handleChange}
                required
                className="border rounded-md w-full p-3 text-gray-700"
              />
            </div>

            <div className="mb-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="flex flex-col">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="cvv">
                  CVV
                </label>
                <input
                  type="text"
                  name="cvv"
                  id="cvv"
                  placeholder="Enter CVV"
                  value={formData.cvv}
                  onChange={handleChange}
                  required
                  className="border rounded-md w-full p-3 text-gray-700"
                />
              </div>

              <div className="flex flex-col">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="date">
                  Expiry Date
                </label>
                <input
                  type="text"
                  name="date"
                  id="date"
                  placeholder="MM/YY"
                  value={formData.date}
                  onChange={handleChange}
                  required
                  className="border rounded-md w-full p-3 text-gray-700"
                />
              </div>
            </div>

            <div className="flex flex-col lg:flex-row justify-between items-center mb-6 space-y-4 lg:space-y-0">
              <div className="flex flex-col">
                <p>Subtotal: <span className="font-bold">N{selectedPrice.toLocaleString()}</span></p>
                <p>Discount: <span className="font-bold text-red-500">{discount}%</span></p>
                <p>Total: <span className="font-bold">N{total.toLocaleString()}</span></p>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="newCard"
                  checked={isNewCard}
                  onChange={handleNewCardChange}
                  className="mr-2 rounded-full bg-blue-500"
                />
                <label htmlFor="newCard">Use New Card</label>
              </div>
            </div>

            <button type="submit" className="bg-blue-600 text-white p-3 mt-5 rounded-md w-full">
              Checkout
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
