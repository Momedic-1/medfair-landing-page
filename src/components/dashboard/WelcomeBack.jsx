import DoctorImg from '../../assets/doctor.png'

function WelcomeBack () {
  return (
    <div className='mx-auto max-w-screen-2xl px-4 md:px-8'>
      <div className='flex flex-col overflow-hidden rounded-lg bg-gray-200 sm:flex-row'>
        <div className='flex w-full flex-col p-4 sm:w-1/2 sm:p-8 lg:w-3/5'>
          <h2 className='mb-1 text-xl font-bold text-[#020e7c] md:text-2xl lg:text-4xl'>
            Welcome Back!
          </h2>

          <p className='mb-4 max-w-md text-[#020e7c] font-semibold text-xl text-center items-center justify-center'>
            Doctor A. Buchi
          </p>

          <div className='mt-auto'>
            <a
              href='#'
              className='flex whitespace-nowrap rounded-lg bg-[#020e7c] px-8 py-3 text-center text-sm font-semibold text-gray-100 outline-none ring-indigo-300 transition duration-100 hover:bg-blue-600 focus-visible:ring active:bg-gray-200 md:text-base'
            >
              <span className='mr-4'>Join Meeting Room</span>
              <svg
                width='24'
                height='24'
                viewBox='0 0 24 24'
                fill='none'
                xmlns='http://www.w3.org/2000/svg'
              >
                <path
                  d='M3.77762 11.9424C2.8296 10.2893 2.37185 8.93948 2.09584 7.57121C1.68762 5.54758 2.62181 3.57081 4.16938 2.30947C4.82345 1.77638 5.57323 1.95852 5.96 2.6524L6.83318 4.21891C7.52529 5.46057 7.87134 6.08139 7.8027 6.73959C7.73407 7.39779 7.26737 7.93386 6.33397 9.00601L3.77762 11.9424ZM3.77762 11.9424C5.69651 15.2883 8.70784 18.3013 12.0576 20.2224M12.0576 20.2224C13.7107 21.1704 15.0605 21.6282 16.4288 21.9042C18.4524 22.3124 20.4292 21.3782 21.6905 19.8306C22.2236 19.1766 22.0415 18.4268 21.3476 18.04L19.7811 17.1668C18.5394 16.4747 17.9186 16.1287 17.2604 16.1973C16.6022 16.2659 16.0661 16.7326 14.994 17.666L12.0576 20.2224Z'
                  stroke='white'
                  stroke-width='1.5'
                  stroke-linejoin='round'
                />
                <path
                  d='M14 6.83185C15.4232 7.43624 16.5638 8.57677 17.1682 10M14.654 2C18.1912 3.02076 20.9791 5.80852 22 9.34563'
                  stroke='white'
                  stroke-width='1.5'
                  stroke-linecap='round'
                />
              </svg>
            </a>
          </div>
        </div>
        <div className='h-44 w-full bg-gray-300 sm:order-none sm:h-[13rem] sm:w-1/2 lg:w-2/5'>
          <img
            src={DoctorImg}
            loading='lazy'
            alt='Photo by Andras Vas'
            className='h-full w-full object-cover object-center'
          />
        </div>
      </div>
    </div>
  )
}

export default WelcomeBack
