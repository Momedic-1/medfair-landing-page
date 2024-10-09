import  {useRef, useState} from 'react'

const VerificationInput = ({setVerificationToken}) => {
  const [code, setCode] = useState(['', '', '', '', ''])
    const inputRefs = useRef([]);

  const handleChange = (index, value) => {
      const userData = JSON.parse(localStorage.getItem('userData'))
      console.log(userData)
      console.log("userData")
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
    // const handleKeyDown = (e, index) => {
    //     if (e.key === 'Backspace' && !code[index] && index > 0) {
    //         inputRefs.current[index - 1].focus();
    //     }
    // }

  return (
    <div className='bg-white mr-10 rounded-lg'>
      <h2 className='text-xl font-bold text-center mb-4'> Check your email!</h2>
      <p className='text-sm text-center text-gray-400 font-medium mb-4'>
        A verification code was sent to you (solomonmoregood97@gmail.com).
      </p>
      <p className='text-sm text-center mb-4 font-medium text-gray-400'>
        Enter the 5-digit code to verify your Medfair account
      </p>
      <p className='text-sm text-center text-blue-500 mb-4'>Open email app</p>
      <div className='flex justify-center space-x-2 mb-16'>
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
    </div>
  )
}

export default VerificationInput
