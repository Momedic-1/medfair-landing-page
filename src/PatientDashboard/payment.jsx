
import {useEffect, useState, useCallback} from 'react';
import payment from './assets/payment.svg';
import { useNavigate,useLocation } from 'react-router-dom';
import axios from 'axios';
import DesignedSideBar from '../components/reuseables/DesignedSideBar';
import {baseUrl} from "../env.jsx";
import {getId} from "../utils";

export default function PaymentPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    cardName: '',
    cardNumber: '',
    cvv: '',
    date: '',
  });
  
  const location = useLocation();
  const [subscriptionPlans, setSubscriptionPlans] = useState({});
  const [plansLoading, setPlansLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState(null); 
  const [selectedPrice, setSelectedPrice] = useState(0);
  const [discount] = useState(0);
  const [isNewCard, setIsNewCard] = useState(false); 
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };
  const fetchPlans = useCallback(async () => {
    const userData = JSON.parse(localStorage.getItem('authToken'));
    const token = userData?.token;
    const userId = getId();

    if (!token || !userId) {
      setPlansLoading(false);
      return;
    }

    try {
      const response = await axios.get(
        `${baseUrl}/api/subscription/get-plans-for-user?userId=${userId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data && Array.isArray(response.data)) {
        // Map API response to the format expected by the component
        const plansMap = {};
        response.data.forEach((plan) => {
          // Create a key based on plan name (lowercase, replace spaces with underscores)
          const key = plan.name.toLowerCase().replace(/\s+/g, '_');
          // Handle special cases
          let planKey = key;
          if (key.includes('instant')) {
            planKey = 'instant';
          } else if (key.includes('monthly')) {
            planKey = 'monthly';
          } else if (key.includes('yearly')) {
            planKey = 'yearly';
          } else if (key.includes('specialist') && key.includes('single')) {
            planKey = 'specialist';
          } else if (key.includes('ent') || key.includes('ear_nose_throat')) {
            planKey = 'ent';
          }
          
          plansMap[planKey] = {
            id: plan.id,
            name: plan.name,
            price: plan.price,
            consultationCount: plan.consultationCount,
          };
        });

        setSubscriptionPlans(plansMap);

        // Set initial selected plan
        const locationPlan = location.state?.selectedPlan;
        if (locationPlan && plansMap[locationPlan]) {
          setSelectedPlan(locationPlan);
          setSelectedPrice(plansMap[locationPlan].price);
        } else {
          // Default to first available plan
          const firstPlanKey = Object.keys(plansMap)[0];
          if (firstPlanKey) {
            setSelectedPlan(firstPlanKey);
            setSelectedPrice(plansMap[firstPlanKey].price);
          }
        }
      } else {
        setSubscriptionPlans({});
      }
    } catch (error) {
      console.error('Error fetching subscription plans:', error);
      setSubscriptionPlans({});
    } finally {
      setPlansLoading(false);
    }
  }, [location]);

  useEffect(() => {
    fetchPlans();
    viewPaymentPrice();
  }, [fetchPlans]);

  const viewPaymentPrice = async () => {
    const userData = JSON.parse(localStorage.getItem('authToken'));
    const token = userData?.token;

    if (!token) return;

    try {
      await axios.get(`${baseUrl}/api/payment/payment-price/view`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    } catch (error) {
      console.error('Error viewing payment prices :', error);
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedPlan || !subscriptionPlans[selectedPlan]) {
      console.error('No plan selected');
      return;
    }

    formData.plan = selectedPlan;
    formData.amount = `${selectedPrice}.00`;
    
    const userData = JSON.parse(localStorage.getItem('userData'));

    if (!userData) {
      console.error('User data not found');
      return;
    }
    
    formData.email = userData.emailAddress;

    try {
      await axios.post(`${baseUrl}/api/payment/initialize-payment`, formData);

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
            <p className="text-gray-600 mt-2">
              Thank you for subscribing to the {selectedPlan && subscriptionPlans[selectedPlan] ? subscriptionPlans[selectedPlan].name : 'Plan'} Plan.
            </p>
            <p className="text-lg font-bold mt-4">Total Paid: N{total.toLocaleString()}</p>
          </div>
          <button
            onClick={() => navigate('/patient-dashboard')}
            className="mt-6 bg-gradient-to-r from-blue-400 to-purple-600 text-white p-3 rounded-md w-full max-w-xs"
          >
            Return to Dashboard
          </button>
        </div>
      ) : plansLoading ? (
        <div className="w-full lg:w-3/5 flex flex-col items-center justify-center p-4 lg:p-0">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Loading subscription plans...</span>
          </div>
        </div>
      ) : Object.keys(subscriptionPlans).length === 0 ? (
        <div className="w-full lg:w-3/5 flex flex-col items-center justify-center p-4 lg:p-0">
          <p className="text-gray-600">No subscription plans available at the moment.</p>
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
                  key={plan.id || planKey}
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
                <p>Subtotal: <span className="font-bold">N{selectedPrice ? selectedPrice.toLocaleString() : '0'}</span></p>
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

            <button 
              type="submit" 
              className="bg-blue-600 text-white p-3 mt-5 rounded-md w-full disabled:bg-gray-400 disabled:cursor-not-allowed"
              disabled={!selectedPlan || selectedPrice === 0}
            >
              Checkout
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
