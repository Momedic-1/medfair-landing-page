import Modal from './Modal'
import React from 'react'

const InputField = ({
  label,
  type,
  placeholder,
  required,
  name,
  value,
  onChange
}) => (
  <div className='mb-4'>
    <label className='block text-sm font-medium text-gray-700 mb-1'>
      {label} {required && <span className='text-red-500'>*</span>}
    </label>
    <input
      type={type}
      className='w-full p-2 border border-gray-300 rounded text-sm'
      placeholder={placeholder}
      name={name}
      value={value}
      onChange={onChange}
      required={required}
    />
  </div>
)

const RadioGroup = ({ label, options, name, value, onChange }) => (
  <div className='mb-4'>
    <label className='block text-sm font-medium text-gray-700 mb-1'>
      {label}
    </label>
    <div className='flex space-x-4'>
      {options.map(option => (
        <label key={option} className='flex items-center'>
          <input
            type='radio'
            name={name}
            value={option}
            checked={value === option}
            onChange={onChange}
            className='mr-2'
          />
          <span className='text-sm'>{option}</span>
        </label>
      ))}
    </div>
  </div>
)

const Checkbox = ({ label, name, checked, onChange }) => (
  <label className='flex items-center space-x-2'>
    <input
      type='checkbox'
      className='form-checkbox'
      name={name}
      checked={checked}
      onChange={onChange}
    />
    <span className='text-sm'>{label}</span>
  </label>
)

const DoctorSignupForm = ({ formData, setFormData }) => {
  const handleChange = e => {
    const { name, value, type, checked } = e.target
    setFormData(prevData => ({
      ...prevData,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  return (
    <form className='mx-auto lg:pr-9 items-center justify-center max-w-3xl'>
      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
        <InputField
          label='First Name'
          type='text'
          placeholder='Enter First Name'
          name='firstName'
          value={formData.firstName || ''}
          onChange={handleChange}
          required
        />
        <InputField
          label='Last Name'
          type='text'
          placeholder='Enter Surname'
          name='lastName'
          value={formData.lastName || ''}
          onChange={handleChange}
          required
        />
        <InputField
          label='Email'
          type='email'
          placeholder='Enter Email'
          name='emailAddress'
          value={formData.emailAddress || ''}
          onChange={handleChange}
          required
        />
        <div className='max-w-md space-y-3 mb-4'>
          <div>
            <label
              htmlFor='mobileNumber'
              className='block text-sm text-gray-700 font-medium'
            >
              Mobile Number
            </label>
            <div className='flex rounded-lg'>
              <div className='px-4 inline-flex items-center min-w-fit rounded-s-md border border-gray-300 bg-gray-100'>
                <span className='text-sm text-gray-500'>+234</span>
              </div>
              <input
                type='text'
                name='phoneNumber'
                id='mobileNumber'
                className='py-3 px-4 block w-full border border-gray-300 rounded-e-md text-sm'
                placeholder='Enter mobile Number'
                value={formData.phoneNumber || ''}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>
      </div>

      <RadioGroup
        label='Sex'
        options={['Male', 'Female']}
        name='gender'
        value={formData.gender || ''}
        onChange={handleChange}
      />

      <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-[3rem]'>
        <InputField
          label='Medical specialization'
          type='text'
          placeholder='Enter here'
          name='specialization'
          value={formData.specialization || ''}
          onChange={handleChange}
        />
        <InputField
          label='Name of Hospital you work'
          type='text'
          placeholder='Enter here'
          name='hospital'
          value={formData.hospital || ''}
          onChange={handleChange}
        />
        <InputField
          label='Input Password'
          type='password'
          placeholder='Password'
          name='password'
          value={formData.password || ''}
          onChange={handleChange}
          required
        />
        <InputField
          label='Re-Enter Password'
          type='password'
          placeholder='Confirm Password'
          name='confirmedPassword'
          value={formData.confirmedPassword || ''}
          onChange={handleChange}
          required
        />
      </div>

      <InputField
        label='How did you hear about us?'
        type='textarea'
        placeholder='How did you hear about us?'
        name='heardAboutUs'
        value={formData.heardAboutUs || ''}
        onChange={handleChange}
      />

      <div className='flex flex-col md:flex-row justify-between items-center mt-6'>
        <Modal />
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
          name='acceptTerms'
          checked={formData.acceptTerms || false}
          onChange={handleChange}
        />
      </div>
    </form>
  )
}

export default DoctorSignupForm
