import React, {useRef, useState,useEffect} from 'react'
import {baseUrl} from "../env.jsx";
import {useNavigate} from "react-router-dom";
import SignUpTop from "./SignUpTop.jsx";
import Stepper from "../Steps.jsx";
import Steps from "../Steps.jsx";
const VerificationInput = () => {
    const navigate = useNavigate();
    const [code, setCode] = useState(['', '', '', '', ''])
    const [userName, setUserName] = useState('')
    const [userEmail, setUserEmail] = useState('')
    const inputRefs = useRef([]);
    const [loading, setLoading] = useState(false);
    const [verificationToken, setVerificationToken] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    // Load user data from localStorage
    useEffect(() => {
        const userData = JSON.parse(localStorage.getItem('userData'))
        const email = JSON.parse(localStorage.getItem('email'))
        if (userData) {
            setUserName(userData.name || 'User')  // Set the name from userData, default to 'User' if not available
            setUserEmail(email)    // Set the email from userData
        }
    }, [])

    async function verifyEmail(){
        setLoading(true);
        const verificationData = { token: verificationToken, email: userEmail}
        console.log(verificationData)
        try {
            const response = await fetch(`https://momedic.onrender.com/api/v1/registration/verify-email`, {
                // const response = await fetch(`${baseUrl}/api/v1/registration/verify-email`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(verificationData),
            });

            const contentType = response.headers.get('Content-Type');
            let result;
            if (contentType && contentType.includes('application/json')) {
                result = await response.json();
            } else {
                result = await response.text();
            }
            if (result.includes('Email verification successful')) {
                navigate('/verification-success');
                setLoading(false)
                // setCurrentStep(3);
            } else {
                setLoading(false);
                setErrorMessage('Incorrect token! Please try again.');
                console.error(result.message);
            }
        } catch (error) {
            setLoading(false);
            setErrorMessage('Something went wrong. Try again!');
            console.error('Error verifying email:', error);
        }
    }

    const handleChange = (index, value) => {
        const newCode = [...code]
        newCode[index] = value
        setCode(newCode)

        if (value && index < 4) {
            document.getElementById(`input-${index + 1}`).focus()
        }
        if (index === 4) {
            // When the last input is filled, set the verification token
            setVerificationToken(newCode.join(''));
            console.log(newCode.join(''))
        } else if (value && index < 4) {
            inputRefs.current[index + 1].focus();
        }

    }
    const stepLabels = ['Account', 'Verification', 'Login']
    return (

        <div className='bg-white mr-10 rounded-lg p-6 mt-10'>
            <SignUpTop />
            <Steps stepLabels={stepLabels} currentStep={2} />
            <h2 className='text-xl font-bold text-center mb-4 md:mt-14 mt-10 text-[#020E7C]'>Check your email, {userName.toUpperCase()}!</h2>
            <p className='text-sm text-center text-gray-400 font-medium mb-4'>
                A verification code was sent to {userEmail}.
            </p>
            <p className='text-sm text-center mb-4 font-medium text-gray-400'>
                Enter the 5-digit code to verify your Medfair account
            </p>
            <p className='text-sm text-center text-blue-500 mb-4'>Open email app</p>


            <div className='flex flex-col items-center space-y-4 '>
                <div className='flex space-x-2'>
                    {code.map((digit, index) => (
                        <input
                            key={index}
                            id={`input-${index}`}
                            type='text'
                            maxLength='1'
                            className='w-12 h-12 text-center border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                            value={digit}
                            onChange={e => handleChange(index, e.target.value)}
                        />
                    ))}
                </div>


                <div className={`mt-96`}></div>
                <button
                    onClick={() => verifyEmail()}
                    className={`md:w-[30%] bg-[#020E7C] text-white py-2  rounded-md hover:bg-blue-800 transition duration-300 w-[300px] px-3 inline-flex items-center justify-center gap-x-1 text-sm font-semibold  border border-transparent disabled:opacity-50 disabled:pointer-events-none`}
                >
                    Next
                </button>
            </div>
        </div>


    )
}

export default VerificationInput