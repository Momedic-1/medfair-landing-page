
import { useNavigate } from 'react-router-dom';
import { Formik, Field, Form, ErrorMessage } from 'formik';
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { useState } from 'react';
import * as yup from 'yup';
import Modal from './Modal';

const validationSchema = yup.object().shape({
  firstName: yup.string().required('First name is required'),
  lastName: yup.string().required('Last name is required'),
  emailAddress: yup.string().email('Invalid email').required('Email is required'),
  phoneNumber: yup.string().required('Phone number is required'),
  gender: yup.string().oneOf(['Male', 'Female'], 'Invalid gender').required('Gender is required'),
  specialization: yup.string(),
  hospital: yup.string(),
  dateOfBirth: yup.string(),
  password: yup
    .string()
    .min(8, 'Password must be at least 8 characters')
    .required('Password is required'),
  confirmedPassword: yup
    .string()
    .oneOf([yup.ref('password'), null], 'Passwords do not match')
    .required('Confirm password is required'),
 howDidYouHearAboutUs: yup.string(),
  acceptTerms: yup.bool().oneOf([true], 'You must accept the terms and conditions'),
});

const DoctorSignupForm = ({setCurrentStep}) => {
  const [value, setValue] = useState()
  const navigate = useNavigate();

  const initialValues = {
    firstName: '',
    lastName: '',
    emailAddress: '',
    phoneNumber: '',
    gender: '',
    specialization: '',
    hospital: '',
    password: '',
    confirmedPassword: '',
   howDidYouHearAboutUs: '',
    acceptTerms: false,
  };

  const handleSubmit =async (values, { resetForm }) => {
    console.log(values);
    try {
      // const response = await fetch(`${baseUrl}/api/v1/registration/doctors-registration`, {
      const response = await fetch(`https://momedic.onrender.com/api/v1/registration/doctors-registration`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });
      const responseText = await response.text();
      console.log(response)
      localStorage.setItem('email', JSON.stringify(values.emailAddress));

      setCurrentStep(2)

    }catch (error) {
      console.log(error)
    }finally {
      resetForm();
    }
  }


  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={handleSubmit}
    >
      {({ handleSubmit }) => (
        <Form className="mx-auto p-4 max-w-xl md:max-w-3xl lg:p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                First Name <span className="text-red-500">*</span>
              </label>
              <Field
                type="text"
                name="firstName"
                className="w-[75%] max-w-xs sm:max-w-sm md:max-w-full p-2 border border-gray-300 rounded text-sm"
                placeholder="Enter First Name"
              />
              <ErrorMessage name="firstName" component="div" className="text-red-500 text-sm" />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Last Name <span className="text-red-500">*</span>
              </label>
              <Field
                type="text"
                name="lastName"
                className="w-[75%] max-w-xs sm:max-w-sm md:max-w-full p-2 border border-gray-300 rounded text-sm"
                placeholder="Enter Last Name"
              />
              <ErrorMessage name="lastName" component="div" className="text-red-500 text-sm" />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email <span className="text-red-500">*</span>
              </label>
              <Field
                type="email"
                name="emailAddress"
                className="w-[75%] max-w-xs sm:max-w-sm md:max-w-full p-2 border border-gray-300 rounded text-sm"
                placeholder="Enter Email"
              />
              <ErrorMessage name="emailAddress" component="div" className="text-red-500 text-sm" />
            </div>

            <div className="mb-4">
           <label className="block text-sm font-medium text-gray-700 mb-1">
          Mobile Number
        </label>
        <Field name="phoneNumber">
    {({ field, form }) => (
      <PhoneInput
        placeholder="Enter mobile number"
        country={'ng'}
        value={field.value}
        onChange={(phoneNumber) => form.setFieldValue('phoneNumber', phoneNumber)}
        inputStyle={{
          width: '76%',
          height: '40px',
          paddingLeft: '60px',
        }}
        buttonStyle={{
          padding: '10px',
        }}
      />
    )}
  </Field>

       <ErrorMessage name="phoneNumber" component="div" className="text-red-500 text-sm" /> 
    </div>


          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Sex</label>
            <div className="flex flex-wrap space-x-4">
              <label className="flex items-center">
                <Field type="radio" name="gender" value="Male" className="mr-2" />
                <span className="text-sm">Male</span>
              </label>
              <label className="flex items-center">
                <Field type="radio" name="gender" value="Female" className="mr-2" />
                <span className="text-sm">Female</span>
              </label>
            </div>
            <ErrorMessage name="gender" component="div" className="text-red-500 text-sm" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Medical specialization
              </label>
              <Field
                type="text"
                name="specialization"
                className="w-[75%] max-w-xs sm:max-w-sm md:max-w-full p-2 border border-gray-300 rounded text-sm"
                placeholder="Enter here"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name of Hospital you work
              </label>
              <Field
                type="text"
                name="hospital"
                className="w-[75%] max-w-xs sm:max-w-sm md:max-w-full p-2 border border-gray-300 rounded text-sm"
                placeholder="Enter here"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Input Password <span className="text-red-500">*</span>
              </label>
              <Field
                type="password"
                name="password"
                className="w-[75%] max-w-xs sm:max-w-sm md:max-w-full p-2 border border-gray-300 rounded text-sm"
                placeholder="Password"
              />
              <ErrorMessage name="password" component="div" className="text-red-500 text-sm" />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Re-Enter Password <span className="text-red-500">*</span>
              </label>
              <Field
                type="password"
                name="confirmedPassword"
                className="w-[75%] max-w-xs sm:max-w-sm md:max-w-full p-2 border border-gray-300 rounded text-sm"
                placeholder="Confirm Password"
              />
              <ErrorMessage
                name="confirmedPassword"
                component="div"
                className="text-red-500 text-sm"
              />
            </div>
          </div>

          
          
          <div className="mb-4">
  <label htmlFor='howDidYouHearAboutUs' className="block text-sm font-medium text-gray-700 mb-1">
    How did you hear about us?
  </label>
  <Field
    type="text"
    name="howDidYouHearAboutUs"
    
    placeholder="Enter heard About Us"
    className="w-[76%] lg:w-[88%] p-2 border border-gray-300 rounded text-sm"
  />
</div>
       <div className="mb-4">
            <label htmlFor='dateOfBirth' className="block text-sm font-medium text-gray-700 mb-1">
              Date of Birth
            </label>
            <Field
              type="date"
              name="dateOfBirth"
             className="w-[76%] lg:w-[88%] p-2 border border-gray-300 rounded text-sm"
            />
          </div>
         
          <div className="flex gap-7 flex-col md:flex-row  mt-6">
            <Modal />
            <a onClick={() => navigate('/login')} className="text-sm font-medium lg:ml-36 md:mr-8">
              Already have an account? <span className="text-[#020E7C]">Login here</span>
            </a>
          </div>

          <div className="mt-6 flex items-center ">
            <Field type="checkbox" name="acceptTerms" className="form-checkbox" />
            <span className="text-sm ml-2 ">
              Accept the{' '}
              <a href="#" className="text-[#020E7C]">
                Terms and Conditions, Operating policies{' '}
                <span className="text-gray-900">and</span> cookies policies of Medfair
              </a>
            </span>
            <ErrorMessage name="acceptTerms" component="div" className="text-red-500 text-sm" />
          </div>
          <button type='submit' className={` w-[300px] mt-5 lg:w-[90%]  md:w-[95%] py-2 px-3 inline-flex items-center justify-center  text-sm font-semibold rounded-lg border border-transparent bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:pointer-events-none`}> Next </button>
         
        </Form>
      )}
    </Formik>
  );
};

export default DoctorSignupForm;

