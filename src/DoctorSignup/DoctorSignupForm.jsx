
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Formik, Field, Form, ErrorMessage } from 'formik';
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
  password: yup
    .string()
    .min(8, 'Password must be at least 8 characters')
    .required('Password is required'),
  confirmedPassword: yup
    .string()
    .oneOf([yup.ref('password'), null], 'Passwords do not match')
    .required('Confirm password is required'),
  heardAboutUs: yup.string(),
  acceptTerms: yup.bool().oneOf([true], 'You must accept the terms and conditions'),
});

const DoctorSignupForm = () => {
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
    heardAboutUs: '',
    acceptTerms: false,
  };

  const handleSubmit = (values, { resetForm }) => {
    console.log(values);
    resetForm(); 
  };

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
              <div className="flex">
                <div className="px-4 inline-flex items-center min-w-fit rounded-s-md border border-gray-300 bg-gray-100">
                  <span className="text-sm text-gray-500">+234</span>
                </div>
                <Field
                  type="text"
                  name="phoneNumber"
                  className="w-[56%] max-w-xs sm:max-w-sm md:max-w-full p-2 border border-gray-300 rounded text-sm"
                  placeholder="Enter mobile Number"
                />
              </div>
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
            <label className="block text-sm font-medium text-gray-700 mb-1">
              How did you hear about us?
            </label>
            <Field
              type="text"
              name="heardAboutUs"
              className="w-[90%] max-w-xs sm:max-w-sm md:max-w-full p-2 border border-gray-300 rounded text-sm"
              placeholder="How did you hear about us?"
            />
          </div>

          {/* <div className="mt-6">
            <label className="text-violet-950 text-sm cursor-pointer">
              Click here to upload Documents →
            </label>
          </div> */}
         
          <div className="flex gap-7 flex-col md:flex-row  mt-6">
            <Modal />
            <a onClick={() => navigate('/login')} className="text-sm font-medium">
              Already have an account? <span className="text-violet-950">Login here</span>
            </a>
          </div>

          <div className="mt-6 flex items-center ">
            <Field type="checkbox" name="acceptTerms" className="form-checkbox" />
            <span className="text-sm ml-2 ">
              Accept the{' '}
              <a href="#" className="text-violet-950">
                Terms and Conditions, Operating policies{' '}
                <span className="text-gray-900">and</span> cookies policies of Medfair
              </a>
            </span>
            <ErrorMessage name="acceptTerms" component="div" className="text-red-500 text-sm" />
          </div>
         
        </Form>
      )}
    </Formik>
  );
};

export default DoctorSignupForm;

