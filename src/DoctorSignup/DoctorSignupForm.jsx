import React from 'react'

const InputField = ({ label, type, placeholder, required }) => (
  <div className='mb-4'>
    <label className='block text-sm font-medium text-gray-700 mb-1'>
      {label} {required && <span className='text-red-500'>*</span>}
    </label>
    <input
      type={type}
      className='w-full p-2 border border-gray-300 rounded text-sm'
      placeholder={placeholder}
    />
  </div>
)

const RadioGroup = ({ label, options }) => (
  <div className='mb-4'>
    <label className='block text-sm font-medium text-gray-700 mb-1'>
      {label}
    </label>
    <div className='flex space-x-4'>
      {options.map(option => (
        <label key={option} className='flex items-center'>
          <input type='radio' name={label} className='mr-2' />
          <span className='text-sm'>{option}</span>
        </label>
      ))}
    </div>
  </div>
)

const Checkbox = ({ label }) => (
  <label className='flex items-center space-x-2'>
    <input type='checkbox' className='form-checkbox' />
    <span className='text-sm'>{label}</span>
  </label>
)

const Button = ({ children, className }) => (
  <button
    type='submit'
    className={`w-24 py-2 bg-blue-600 text-white rounded text-sm ${className}`}
  >
    {children}
  </button>
)

const DoctorSignupForm = () => (
  <form className='max-w-4xl mx-auto p-4'>
    <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
      <InputField
        label='First Name'
        type='text'
        placeholder='Enter First Name'
      />
      <InputField label='Last Name' type='text' placeholder='Enter Surname' />
      <InputField label='Email' type='email' placeholder='Enter Email' />
      <div class='max-w-md space-y-3 mb-4'>
        <div>
          <label
            for='hs-input-with-add-on-url'
            class='block text-sm text-gray-700 font-medium'
          >
            Mobile Number
          </label>
          <div class='flex rounded-lg'>
            <div class='px-4 inline-flex items-center min-w-fit rounded-s-md border border-gray-300 bg-gray-100'>
              <span class='text-sm text-gray-500'>+234</span>
            </div>
            <input
              type='text'
              name='hs-input-with-add-on-url'
              id='hs-input-with-add-on-url'
              class='py-3 px-4  block w-full border border-gray-300 rounded-e-md text-sm'
              placeholder='Enter mobile Number'
            />
          </div>
        </div>
      </div>
      {/* <div className='flex'>
        <span className='inline-flex items-center px-3 text-sm text-gray-900 bg-gray-200 border border-r-0 border-gray-300 rounded-l-md'>
          +234
        </span>
        <input
          type='text'
          className='rounded-none rounded-r-lg border text-gray-900 block flex-1 min-w-0 w-full text-sm border-gray-300 p-2.5'
          placeholder='Enter mobile Number'
        />
      </div> */}
    </div>

    <RadioGroup label='Sex' options={['Male', 'Female']} />

    <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-[3rem]'>
      <InputField
        label='Medical specialization'
        type='text'
        placeholder='Enter here'
      />
      <InputField
        label='Name of Hospital you work'
        type='text'
        placeholder='Enter here'
      />
      <InputField
        label='Input Password'
        type='password'
        placeholder='Password'
        required
      />
      <InputField
        label='Re-Enter Password'
        type='password'
        placeholder='Confirm Password'
        required
      />
    </div>

    <InputField
      label='How did you hear about us?'
      type='textarea'
      placeholder='How did you hear about us?'
    />

    <div className='flex flex-col md:flex-row justify-between items-center mt-6'>
      <a href='#' className='text-sm font-medium text-gray-900 mb-2 md:mb-0'>
        Click here to <span className='text-violet-950'>upload</span> Documents
        →
      </a>
      <a href='#' className='text-sm font-medium text-gray-900'>
        Already have an account?{' '}
        <span className='text-violet-950'>Login here</span>
      </a>
    </div>

    <div className='mt-6'>
      <Checkbox
        label={
          <span className='text-sm text-gray-900 font-medium'>
            Accept the{' '}
            <a href='#' className='text-violet-950'>
              Terms and Conditions, Operating policies{' '}
              <span className='text-gray-900'>and</span> cookies policies of
              Medfair
            </a>
          </span>
        }
      />
    </div>
  </form>
)

export default DoctorSignupForm
