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
  medicalSpecialization: yup.string(), 
  nameOfHospital: yup.string(),
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

const DoctorSignupForm = ({ formValue, setFormValue }) => {
  const navigate = useNavigate();

  const handleSubmit = (values, { resetForm }) => {
    setFormValue(values);
    resetForm(); 
  };

  return (
    <Formik
      initialValues={{
        firstName: '',
        lastName: '',
        emailAddress: '',
        phoneNumber: '',
        gender: '',
        medicalSpecialization: '',
        nameOfHospital: '',
        password: '',
        confirmedPassword: '',
        howDidYouHearAboutUs: '',
        dateOfBirth: '',
        acceptTerms: false,
      }}
      validationSchema={validationSchema}

      onSubmit={(values, { setSubmitting }) => {
         setTimeout(() => {
           alert(JSON.stringify(values, null, 2));
           console.log(values, "valuse")
           setSubmitting(false);
         }, 400);
       }}
    >
         {({
         values,
         errors,
         touched,
         handleChange,
         handleBlur,
         handleSubmit,
         isSubmitting,
         
       }) => (
        <form onSubmit={handleSubmit} className="mx-auto p-4 max-w-xl md:max-w-3xl lg:p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="mb-4">
              <label htmlFor='firstName' className="block text-sm font-medium text-gray-700 mb-1">
                First Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="firstName"
                 onChange={(e) => {
                  handleChange(e);
                  console.log({ ...values, firstName: e.target.value });
                }}
                value={values.firstName}
                className="w-[75%] max-w-xs sm:max-w-sm md:max-w-full p-2 border border-gray-300 rounded text-sm"
                placeholder="Enter First Name"
              />
              <p className="text-red-500 text-sm">
              {errors.firstName && touched.firstName && errors.firstName}
              </p>
            </div>

            <div className="mb-4">
              <label htmlFor='lastName' className="block text-sm font-medium text-gray-700 mb-1">
                Last Name <span className="text-red-500">*</span>
              </label>
             
              <input
                type="text"
                name="lastName"
                onChange={(e) => {
                  handleChange(e);
                  console.log({ ...values, lastName: e.target.value });
                 
                }}
                value={values.lastName}
                 placeholder="Enter Last Name"
                 className="w-[75%] max-w-xs sm:max-w-sm md:max-w-full p-2 border border-gray-300 rounded text-sm"
              />
              <p className="text-red-500 text-sm">
              {errors.lastName && touched.lastName && errors.lastName}
              </p>
            </div>

            <div className="mb-4">
              <label htmlFor='emailAddress' className="block text-sm font-medium text-gray-700 mb-1">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                name="emailAddress"
                onChange={(e) => {
                  handleChange(e);
                  console.log({ ...values, lastName: e.target.value });
                 
                }}
                value={values.emailAddress}
                 placeholder="Enter email"
                 className="w-[75%] max-w-xs sm:max-w-sm md:max-w-full p-2 border border-gray-300 rounded text-sm"
              />
               
             <p className="text-red-500 text-sm">
              {errors.emailAddress && touched.emailAddress && errors.emailAddress}
              </p>
            </div>

            <div className="mb-4">
              <label htmlFor='phoneNumber' className="block text-sm font-medium text-gray-700 mb-1">
                Mobile Number
              </label>
              <div className="flex">
                <div className="px-4 inline-flex items-center min-w-fit rounded-s-md border border-gray-300 bg-gray-100">
                  <span className="text-sm text-gray-500">+234</span>
                </div>
                <input
                  type="text"
                  name="phoneNumber"
                  onChange={(e) => {
                  handleChange(e);
                  console.log({ ...values, phoneNumber: e.target.value });
                 
                }}
                value={values.phoneNumber}
                 placeholder="Enter mobile number"
                 className="w-[57%] max-w-xs sm:max-w-sm md:max-w-full p-2 border border-gray-300 rounded text-sm"
                />
              </div>
              <p className="text-red-500 text-sm">
              {errors.phoneNumber && touched.phoneNumber && errors.phoneNumber}
              </p>
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Sex</label>
            <div className="flex flex-wrap space-x-4">
              <label htmlFor='gender' className="flex items-center">
                <input type="radio" name="gender" value="Male" className="mr-2" />
                <span className="text-sm">Male</span>
              </label>
              <label htmlFor='gender' className="flex items-center">
                <Field type="radio" name="gender" value="Female" className="mr-2" />
                <span className="text-sm">Female</span>
              </label>
             </div>
            <p className="text-red-500 text-sm">
              {errors.gender && touched.gender && errors.gender}
              </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="mb-4">
              <label htmlFor='medicalSpecialization' className="block text-sm font-medium text-gray-700 mb-1">
                Medical Specialization
              </label>
              <input
                type="text"
                name="medicalSpecialization"
                onChange={(e) => {
                  handleChange(e);
                  console.log({ ...values, lastName: e.target.value });
                 
                }}
                value={values.medicalSpecialization}
                 placeholder="Enter medicalSpecializaton"
                 className="w-[75%] max-w-xs sm:max-w-sm md:max-w-full p-2 border border-gray-300 rounded text-sm"
              />
            </div>

            <div className="mb-4">
              <label htmlFor='nameOfHospital' className="block text-sm font-medium text-gray-700 mb-1">
                Name of Hospital you work
              </label>
              <input
                type="text"
                name="nameOfHospital"
                onChange={(e) => {
                  handleChange(e);
                  console.log({ ...values, hosiptal: e.target.value });
                 
                }}
                value={values.nameOfHospital}
                 placeholder="Enter nameOfHospital"
                 className="w-[75%] max-w-xs sm:max-w-sm md:max-w-full p-2 border border-gray-300 rounded text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="mb-4">
              <label htmlFor='password' className="block text-sm font-medium text-gray-700 mb-1">
                Input Password <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                name="password"
                onChange={(e) => {
                  handleChange(e);
                  console.log({ ...values, password: e.target.value });
                 
                }}
                value={values.password}
                 placeholder="Enter password"
                 className="w-[75%] max-w-xs sm:max-w-sm md:max-w-full p-2 border border-gray-300 rounded text-sm"
              />
           <p className="text-red-500 text-sm">
              {errors.password && touched.password && errors.password}
              </p>
            </div>

            <div className="mb-4">
              <label htmlFor='confirmedPassword' className="block text-sm font-medium text-gray-700 mb-1">
                Re-Enter Password <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                name="confirmedPassword"
                onChange={(e) => {
                  handleChange(e);
                  console.log({ ...values, confirmedPassword: e.target.value });
                 
                }}
                value={values.confirmedPassword}
                 placeholder="Enter confirm password"
                 className="w-[75%] max-w-xs sm:max-w-sm md:max-w-full p-2 border border-gray-300 rounded text-sm"
              />
                <p className="text-red-500 text-sm">
               {errors.confirmedPassword && touched.confirmedPassword && errors.confirmedPassword}
              </p>
            </div>
          </div>

          <div className="mb-4">
  <label htmlFor='howDidYouHearAboutUs' className="block text-sm font-medium text-gray-700 mb-1">
    How did you hear about us?
  </label>
  <Field
    type="text"
    name="howDidYouHearAboutUs"
    onChange={(e) => {
      handleChange(e);
      console.log({ ...values, hearAboutUs: e.target.value });
    }}
    value={values.howDidYouHearAboutUs}
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
              onChange={(e) => {
                  handleChange(e);
                  console.log({ ...values, dateOfBirth: e.target.value });
                 
                }}
                value={values.dateOfBirth}
                  className="w-[76%] lg:w-[88%] p-2 border border-gray-300 rounded text-sm"
            />
          </div>
           
          <div className="flex gap-7 flex-col md:flex-row  mt-6">
             <Modal/>
             <a onClick={() => navigate('/login')} className="text-sm font-medium  lg:ml-36 md:mr-8">
               Already have an account? <span className="text-violet-950">Login here</span>
             </a>
          </div>
          <div className="mt-4">
            <label className="flex items-center">
              <Field type="checkbox" name="acceptTerms" className="mr-2" />
              I accept the terms and conditions <span className="text-red-500">*</span>
            </label>
            <p className="text-red-500 text-sm">
              {errors.acceptTerms && touched.terms && errors.terms}
              </p>
          </div>

         
        </form>
      )}
    </Formik>
  );
};

export default DoctorSignupForm;
