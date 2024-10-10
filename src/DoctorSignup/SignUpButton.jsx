

const SignUpButton = ({handleNextClick, currentStep, showCheckEmail} ) => (
    
    <>
        {!showCheckEmail && (
            <div className='mt-5 justify-between items-center lg:mx-[12rem] mx-[2rem]'>
                <button
                    type='button'
                    className= {` ${currentStep === 2 && ' md:w-[30%] bg-blue-700 text-white py-2 rounded-md hover:bg-blue-800 transition duration-300'} w-[300px] lg:w-[75%] md:ml-12 ml-4 lg:mr-52 md:w-[95%] py-2 px-3 inline-flex items-center justify-center gap-x-1 text-sm font-semibold rounded-lg border border-transparent bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:pointer-events-none`}
                    onClick={handleNextClick}
                >
                    {currentStep === 3 ? 'Go to Dashboard' : currentStep === 2? 'Verify':  'Next'}
                </button>
            </div>
        )}
        <div className='text-center mt-4 mb-12'>
            <a href='/patient_signup' target="" className='text-blue-500'>
                <p>Signup as Patient</p>
            </a>
        </div>
    </>
);

export default SignUpButton;

