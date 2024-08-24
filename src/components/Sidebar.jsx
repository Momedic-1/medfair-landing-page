import React from 'react'
import { NavLink } from 'react-router-dom'
import myLogo from '../assets/medfair.svg'

const Sidebar = () => {
  return (
    <>
      <header className='sticky top-0 inset-x-0 flex flex-wrap md:justify-start md:flex-nowrap z-[48] w-full bg-white border-b text-sm py-2.5 lg:ps-[260px]'>
        <nav className='px-4 sm:px-6 flex basis-full items-center w-full mx-auto'>
          <div className='me-5 whitespace-nowrap lg:me-0 lg:hidden'>
            <a
              className='items-center space-x-2 flex-none rounded-md text-sm inline-block font-semibold focus:outline-none focus:opacity-80'
              href='#'
              aria-label='Dashboard'
            >
              <span className='text-blue-800'>Doctor’s Dashboard</span>
            </a>
          </div>

          <div className='w-full flex items-center justify-end ms-auto md:justify-between gap-x-1 md:gap-x-3'>
            <div className='hidden md:block'>
              <div className='relative'>
                <div className='absolute inset-y-0 start-0 flex items-center pointer-events-none z-20 ps-3.5'>
                  <svg
                    className='shrink-0 size-4 text-gray-400'
                    xmlns='http://www.w3.org/2000/svg'
                    width='24'
                    height='24'
                    viewBox='0 0 24 24'
                    fill='none'
                    stroke='currentColor'
                    stroke-width='2'
                    stroke-linecap='round'
                    stroke-linejoin='round'
                  >
                    <circle cx='11' cy='11' r='8' />
                    <path d='m21 21-4.3-4.3' />
                  </svg>
                </div>
                <input
                  type='text'
                  className='py-2 ps-10 pe-16 block w-[34rem] bg-white border border-gray-500 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none'
                  placeholder='Search anything'
                />
                <div className='hidden absolute inset-y-0 end-0 flex items-center pointer-events-none z-20 pe-1'>
                  <button
                    type='button'
                    className='inline-flex shrink-0 justify-center items-center size-6 rounded-full text-gray-500 hover:text-blue-600 focus:outline-none focus:text-blue-600'
                    aria-label='Close'
                  >
                    <span className='sr-only'>Close</span>
                    <svg
                      className='shrink-0 size-4'
                      xmlns='http://www.w3.org/2000/svg'
                      width='24'
                      height='24'
                      viewBox='0 0 24 24'
                      fill='none'
                      stroke='currentColor'
                      stroke-width='2'
                      stroke-linecap='round'
                      stroke-linejoin='round'
                    >
                      <circle cx='12' cy='12' r='10' />
                      <path d='m15 9-6 6' />
                      <path d='m9 9 6 6' />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            <div className='flex flex-row items-center justify-end gap-1'>
              <button
                type='button'
                className='md:hidden size-[38px] relative inline-flex justify-center items-center gap-x-2 text-sm font-semibold rounded-full border border-transparent text-gray-800 hover:bg-gray-100 focus:outline-none focus:bg-gray-100 disabled:opacity-50 disabled:pointer-events-none'
              >
                <svg
                  className='shrink-0 size-4'
                  xmlns='http://www.w3.org/2000/svg'
                  width='24'
                  height='24'
                  viewBox='0 0 24 24'
                  fill='none'
                  stroke='currentColor'
                  stroke-width='2'
                  stroke-linecap='round'
                  stroke-linejoin='round'
                >
                  <circle cx='11' cy='11' r='8' />
                  <path d='m21 21-4.3-4.3' />
                </svg>
                <span className='sr-only'>Search</span>
              </button>

              <button
                type='button'
                className='size-[38px] relative inline-flex justify-center items-center gap-x-2 text-sm font-semibold rounded-full border border-transparent text-gray-800 hover:bg-gray-100 focus:outline-none focus:bg-gray-100 disabled:opacity-50 disabled:pointer-events-none'
              >
                <svg
                  className='shrink-0 size-4'
                  xmlns='http://www.w3.org/2000/svg'
                  width='24'
                  height='24'
                  viewBox='0 0 24 24'
                  fill='none'
                  stroke='currentColor'
                  stroke-width='2'
                  stroke-linecap='round'
                  stroke-linejoin='round'
                >
                  <path d='M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9' />
                  <path d='M10.3 21a1.94 1.94 0 0 0 3.4 0' />
                </svg>
                <span className='sr-only'>Notifications</span>
              </button>

              <button className='bg-blue-800 text-white px-4 py-2 rounded-md'>
                Create appointment
              </button>
            </div>
          </div>
        </nav>
      </header>

      <div className='-mt-px'>
        <div className='sticky top-0 inset-x-0 z-20 bg-white border-y px-4 sm:px-6 lg:px-8 lg:hidden'>
          <div className='flex items-center py-2'>
            <button
              type='button'
              className='size-8 flex justify-center items-center gap-x-2 border border-gray-200 text-gray-800 hover:text-gray-500 rounded-lg focus:outline-none focus:text-gray-500 disabled:opacity-50 disabled:pointer-events-none'
              aria-haspopup='dialog'
              aria-expanded='false'
              aria-controls='hs-application-sidebar'
              aria-label='Toggle navigation'
              data-hs-overlay='#hs-application-sidebar'
            >
              <span className='sr-only'>Toggle Navigation</span>
              <svg
                className='shrink-0 size-4'
                xmlns='http://www.w3.org/2000/svg'
                width='24'
                height='24'
                viewBox='0 0 24 24'
                fill='none'
                stroke='currentColor'
                stroke-width='2'
                stroke-linecap='round'
                stroke-linejoin='round'
              >
                <rect width='18' height='18' x='3' y='3' rx='2' />
                <path d='M15 3v18' />
                <path d='m8 9 3 3-3 3' />
              </svg>
            </button>

            <ol className='ms-3 flex items-center whitespace-nowrap'>
              <li className='flex items-center text-sm text-gray-800'>
                Application Layout
                <svg
                  className='shrink-0 mx-3 overflow-visible size-2.5 text-gray-400'
                  width='16'
                  height='16'
                  viewBox='0 0 16 16'
                  fill='none'
                  xmlns='http://www.w3.org/2000/svg'
                >
                  <path
                    d='M5 1L10.6869 7.16086C10.8637 7.35239 10.8637 7.64761 10.6869 7.83914L5 14'
                    stroke='currentColor'
                    stroke-width='2'
                    stroke-linecap='round'
                  />
                </svg>
              </li>
              <li
                className='text-sm font-semibold text-gray-800 truncate'
                aria-current='page'
              >
                Dashboard
              </li>
            </ol>
          </div>
        </div>
      </div>

      <div
        id='hs-application-sidebar'
        className='hs-overlay  [--auto-close:lg]
      hs-overlay-open:translate-x-0
      -translate-x-full transition-all duration-300 transform
      w-[260px] h-full
      hidden
      fixed inset-y-0 start-0 z-[60]
      bg-[#020e7c] border-e border-gray-200
      lg:block lg:translate-x-0 lg:end-auto lg:bottom-0
     '
        role='dialog'
        tabindex='-1'
        aria-label='Sidebar'
      >
        <div className='relative flex flex-col h-full max-h-full'>
          <div className='px-6 pt-4'>
            <a
              className='flex items-center space-x-2 flex-none rounded-md text-sm inline-block font-semibold focus:outline-none focus:opacity-80'
              href='#'
              aria-label='Dashboard'
            >
              <span className='text-white'>Doctor’s Dashboard</span>
            </a>
          </div>

          <div className='h-full overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-gray-100 [&::-webkit-scrollbar-thumb]:bg-gray-300'>
            <nav
              className='hs-accordion-group p-3 w-full flex flex-col flex-wrap'
              data-hs-accordion-always-open
            >
              <ul className='flex flex-col space-y-1 mt-6'>
                <li className='mb-2'>
                  <NavLink
                    to='/dashboard'
                    className={({ isActive }) =>
                      `flex items-center p-2 rounded-lg ${
                        isActive
                          ? 'bg-blue-100 text-blue-800'
                          : 'text-gray-100 hover:bg-gray-100'
                      }`
                    }
                  >
                    <svg
                      className='shrink-0 size-4 mr-2'
                      xmlns='http://www.w3.org/2000/svg'
                      width='24'
                      height='24'
                      viewBox='0 0 24 24'
                      fill='none'
                      stroke='currentColor'
                      stroke-width='2'
                      stroke-linecap='round'
                      stroke-linejoin='round'
                    >
                      <path d='m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z' />
                      <polyline points='9 22 9 12 15 12 15 22' />
                    </svg>
                    Dashboard
                  </NavLink>
                </li>

                <li>
                  <a
                    className='w-full flex items-center gap-x-3.5 py-2 px-2.5 text-sm text-gray-100 rounded-lg hover:bg-gray-100 hover:text-blue-600'
                    href='#'
                  >
                    <svg
                      width='12'
                      height='12'
                      viewBox='0 0 12 12'
                      fill='none'
                      xmlns='http://www.w3.org/2000/svg'
                    >
                      <g id='calendar-03'>
                        <path
                          id='Vector'
                          d='M9 1V2M3 1V2'
                          stroke='#A3ADFF'
                          stroke-width='1.5'
                          stroke-linecap='round'
                          stroke-linejoin='round'
                        />
                        <path
                          id='Vector_2'
                          d='M5.99775 6.5H6.00225M5.99775 8.5H6.00225M7.9955 6.5H8M4 6.5H4.00449M4 8.5H4.00449'
                          stroke='#A3ADFF'
                          stroke-width='2'
                          stroke-linecap='round'
                          stroke-linejoin='round'
                        />
                        <path
                          id='Vector_3'
                          d='M1.75 4H10.25'
                          stroke='#A3ADFF'
                          stroke-width='1.5'
                          stroke-linecap='round'
                          stroke-linejoin='round'
                        />
                        <path
                          id='Vector_4'
                          d='M1.25 6.1216C1.25 3.94297 1.25 2.85364 1.87606 2.17682C2.50212 1.5 3.50975 1.5 5.525 1.5H6.475C8.49025 1.5 9.4979 1.5 10.124 2.17682C10.75 2.85364 10.75 3.94297 10.75 6.1216V6.3784C10.75 8.55705 10.75 9.64635 10.124 10.3232C9.4979 11 8.49025 11 6.475 11H5.525C3.50975 11 2.50212 11 1.87606 10.3232C1.25 9.64635 1.25 8.55705 1.25 6.3784V6.1216Z'
                          stroke='#A3ADFF'
                          stroke-width='1.5'
                          stroke-linecap='round'
                          stroke-linejoin='round'
                        />
                        <path
                          id='Vector_5'
                          d='M1.5 4H10.5'
                          stroke='#A3ADFF'
                          stroke-width='1.5'
                          stroke-linecap='round'
                          stroke-linejoin='round'
                        />
                      </g>
                    </svg>
                    View Profile
                  </a>
                </li>
                <li>
                  <a
                    className='w-full flex items-center gap-x-3.5 py-2 px-2.5 text-sm text-gray-100 rounded-lg hover:bg-gray-100 hover:text-blue-600'
                    href='#'
                  >
                    <svg
                      width='12'
                      height='12'
                      viewBox='0 0 12 12'
                      fill='none'
                      xmlns='http://www.w3.org/2000/svg'
                    >
                      <path
                        d='M6.25 1.50186C5.80245 1.4952 5.35235 1.50645 4.9147 1.53554C2.82319 1.67457 1.1572 3.36419 1.02012 5.48535C0.993294 5.90045 0.993294 6.33035 1.02012 6.74545C1.07005 7.518 1.41171 8.2333 1.81395 8.8373C2.0475 9.26015 1.89337 9.7879 1.6501 10.2489C1.4747 10.5813 1.387 10.7475 1.45742 10.8675C1.52784 10.9876 1.68513 10.9914 1.99971 10.9991C2.62183 11.0142 3.04134 10.8379 3.37434 10.5923C3.5632 10.4531 3.65763 10.3834 3.72272 10.3754C3.7878 10.3674 3.91588 10.4202 4.172 10.5257C4.4022 10.6205 4.66948 10.6789 4.9147 10.6952C5.6268 10.7426 6.37175 10.7427 7.0853 10.6952C9.1768 10.5562 10.8428 8.8666 10.9799 6.74545C11.001 6.418 11.0055 6.08135 10.9933 5.75'
                        stroke='#A3ADFF'
                        stroke-width='1.5'
                        stroke-linecap='round'
                        stroke-linejoin='round'
                      />
                      <path
                        d='M7.5 2.75H11M9.25 1V4.5'
                        stroke='#A3ADFF'
                        stroke-width='1.5'
                        stroke-linecap='round'
                        stroke-linejoin='round'
                      />
                      <path
                        d='M5.99765 6.25H6.0021M7.9954 6.25H7.9999M3.99988 6.25H4.00436'
                        stroke='#A3ADFF'
                        stroke-width='2'
                        stroke-linecap='round'
                        stroke-linejoin='round'
                      />
                    </svg>
                    Messages
                  </a>
                </li>
                <li>
                  <a
                    className='w-full flex items-center gap-x-3.5 py-2 px-2.5 text-sm text-gray-100 rounded-lg hover:bg-gray-100 hover:text-blue-600'
                    href='#'
                  >
                    <svg
                      width='12'
                      height='12'
                      viewBox='0 0 12 12'
                      fill='none'
                      xmlns='http://www.w3.org/2000/svg'
                    >
                      <path
                        d='M1.88881 5.9712C1.4148 5.14465 1.18592 4.46974 1.04792 3.78561C0.84381 2.77379 1.3109 1.78541 2.08469 1.15474C2.41172 0.888191 2.78661 0.979261 2.98 1.3262L3.41659 2.10946C3.76264 2.73029 3.93567 3.0407 3.90135 3.3698C3.86703 3.6989 3.63368 3.96693 3.16698 4.50301L1.88881 5.9712ZM1.88881 5.9712C2.84825 7.64415 4.35392 9.15065 6.0288 10.1112M6.0288 10.1112C6.85535 10.5852 7.53025 10.8141 8.2144 10.9521C9.2262 11.1562 10.2146 10.6891 10.8452 9.9153C11.1118 9.5883 11.0207 9.2134 10.6738 9.02L9.89055 8.5834C9.2697 8.23735 8.9593 8.06435 8.6302 8.09865C8.3011 8.13295 8.03305 8.3663 7.497 8.833L6.0288 10.1112Z'
                        stroke='#A3ADFF'
                        stroke-width='1.5'
                        stroke-linejoin='round'
                      />
                      <path
                        d='M7 3.41593C7.7116 3.71812 8.2819 4.28838 8.5841 5M7.327 1C9.0956 1.51038 10.4895 2.90426 11 4.67281'
                        stroke='#A3ADFF'
                        stroke-width='1.5'
                        stroke-linecap='round'
                      />
                    </svg>
                    Audio calls
                  </a>
                </li>
                <li>
                  <a
                    className='w-full flex items-center gap-x-3.5 py-2 px-2.5 text-sm text-gray-100 rounded-lg hover:bg-gray-100 hover:text-blue-600'
                    href='#'
                  >
                    <svg
                      width='12'
                      height='12'
                      viewBox='0 0 12 12'
                      fill='none'
                      xmlns='http://www.w3.org/2000/svg'
                    >
                      <path
                        d='M5.5 7.5H6.5'
                        stroke='#A3ADFF'
                        stroke-width='1.5'
                        stroke-linecap='round'
                        stroke-linejoin='round'
                      />
                      <path d='M6 9V11' stroke='#A3ADFF' stroke-width='1.5' />
                      <path
                        d='M4 11H8'
                        stroke='#A3ADFF'
                        stroke-width='1.5'
                        stroke-linecap='round'
                      />
                      <path
                        d='M4.5 1.00049C3.18727 1.00466 2.47825 1.04363 1.95946 1.40689C1.74446 1.55744 1.55745 1.74444 1.40691 1.95944C1 2.54056 1 3.36037 1 4.99998C1 6.6396 1 7.4594 1.40691 8.04055C1.55745 8.25555 1.74446 8.44255 1.95946 8.5931C2.54058 9 3.36038 9 5 9H7C8.6396 9 9.4594 9 10.0406 8.5931C10.2556 8.44255 10.4425 8.25555 10.5931 8.04055C10.9563 7.52175 10.9953 6.8127 10.9995 5.5'
                        stroke='#A3ADFF'
                        stroke-width='1.5'
                        stroke-linecap='round'
                      />
                      <path
                        d='M9.75 2.07315L9.7815 2.05043C10.3104 1.66855 10.5749 1.47761 10.7874 1.56981C11 1.662 11 1.96765 11 2.57895V2.92105C11 3.53235 11 3.838 10.7874 3.9302C10.5749 4.02239 10.3104 3.83145 9.7815 3.44957L9.75 3.42685M7.75 4.5H8C8.82495 4.5 9.23745 4.5 9.4937 4.27575C9.75 4.0515 9.75 3.69059 9.75 2.96875V2.53125C9.75 1.80941 9.75 1.44849 9.4937 1.22424C9.23745 1 8.82495 1 8 1H7.75C6.92505 1 6.51255 1 6.2563 1.22424C6 1.44849 6 1.80941 6 2.53125V2.96875C6 3.69059 6 4.0515 6.2563 4.27575C6.51255 4.5 6.92505 4.5 7.75 4.5Z'
                        stroke='#A3ADFF'
                        stroke-width='1.5'
                        stroke-linecap='round'
                      />
                    </svg>
                    Video calls
                  </a>
                </li>
                <li>
                  <a
                    className='w-full flex items-center gap-x-3.5 py-2 px-2.5 text-sm text-gray-100 rounded-lg hover:bg-gray-100 hover:text-blue-600'
                    href='#'
                  >
                    <svg
                      width='12'
                      height='12'
                      viewBox='0 0 12 12'
                      fill='none'
                      xmlns='http://www.w3.org/2000/svg'
                    >
                      <path
                        d='M7.49023 3.50781C7.49023 3.50781 7.74023 3.75781 7.99023 4.25781C7.99023 4.25781 8.78433 3.00781 9.49023 2.75781'
                        stroke='#A3ADFF'
                        stroke-width='1.5'
                        stroke-linecap='round'
                        stroke-linejoin='round'
                      />
                      <path
                        d='M4.99743 1.0107C3.74819 0.957809 2.78306 1.10172 2.78306 1.10172C2.17364 1.14529 1.00573 1.48695 1.00574 3.4823C1.00575 5.4607 0.99282 7.89965 1.00574 8.872C1.00574 9.466 1.37355 10.8517 2.64663 10.9259C4.19405 11.0162 6.98135 11.0354 8.26025 10.9259C8.60255 10.9066 9.7423 10.6379 9.88655 9.39785C10.036 8.1132 10.0063 7.22035 10.0063 7.00785'
                        stroke='#A3ADFF'
                        stroke-width='1.5'
                        stroke-linecap='round'
                        stroke-linejoin='round'
                      />
                      <path
                        d='M11 3.50781C11 4.88853 9.87957 6.0078 8.49752 6.0078C7.11552 6.0078 5.99512 4.88853 5.99512 3.50781C5.99512 2.1271 7.11552 1.00781 8.49752 1.00781C9.87957 1.00781 11 2.1271 11 3.50781Z'
                        stroke='#A3ADFF'
                        stroke-width='1.5'
                        stroke-linecap='round'
                      />
                      <path
                        d='M3.49023 6.50781H5.49025'
                        stroke='#A3ADFF'
                        stroke-width='1.5'
                        stroke-linecap='round'
                      />
                      <path
                        d='M3.49023 8.50781H7.49025'
                        stroke='#A3ADFF'
                        stroke-width='1.5'
                        stroke-linecap='round'
                      />
                    </svg>
                    Documents
                  </a>
                </li>
                <li>
                  <a
                    className='w-full flex items-center gap-x-3.5 py-2 px-2.5 text-sm text-gray-100 rounded-lg hover:bg-gray-100 hover:text-blue-600'
                    href='#'
                  >
                    <svg
                      width='12'
                      height='12'
                      viewBox='0 0 12 12'
                      fill='none'
                      xmlns='http://www.w3.org/2000/svg'
                    >
                      <path
                        d='M10.4713 8.4177C10.1432 6.4433 9.1216 4.97306 8.2335 4.1095C7.97505 3.85821 7.84585 3.73257 7.5604 3.61629C7.27495 3.5 7.0296 3.5 6.5389 3.5H5.4611C4.9704 3.5 4.72505 3.5 4.43961 3.61629C4.15417 3.73257 4.02495 3.85821 3.76652 4.1095C2.87841 4.97306 1.8568 6.4433 1.52863 8.4177C1.28446 9.8867 2.63963 11 4.15416 11H7.84585C9.36035 11 10.7155 9.8867 10.4713 8.4177Z'
                        stroke='#A3ADFF'
                        stroke-width='1.5'
                        stroke-linecap='round'
                        stroke-linejoin='round'
                      />
                      <path
                        d='M3.62831 2.22144C3.52515 2.07129 3.37564 1.8675 3.68449 1.82103C4.00196 1.77326 4.3316 1.99057 4.65427 1.9861C4.94618 1.98206 5.0949 1.85259 5.25445 1.66774C5.42245 1.47308 5.6826 1 6 1C6.3174 1 6.57755 1.47308 6.74555 1.66774C6.9051 1.85259 7.0538 1.98206 7.3457 1.9861C7.6684 1.99057 7.99805 1.77326 8.3155 1.82103C8.62435 1.8675 8.47485 2.07129 8.3717 2.22144L7.90525 2.90032C7.70575 3.19073 7.606 3.33593 7.3972 3.41797C7.18845 3.5 6.91865 3.5 6.3791 3.5H5.6209C5.08135 3.5 4.81155 3.5 4.60278 3.41797C4.39401 3.33593 4.29425 3.19073 4.09473 2.90032L3.62831 2.22144Z'
                        stroke='#A3ADFF'
                        stroke-width='1.5'
                        stroke-linejoin='round'
                      />
                      <path
                        d='M6.81335 6.45953C6.70525 6.06048 6.15505 5.70038 5.4946 5.96978C4.83415 6.23913 4.72924 7.10588 5.72825 7.19798C6.17975 7.23958 6.47415 7.14968 6.74365 7.40403C7.0132 7.65833 7.06325 8.36563 6.37425 8.55623C5.68525 8.74683 5.003 8.44903 4.92871 8.02608M5.92085 5.49658V5.87678M5.92085 8.61488V8.99658'
                        stroke='#A3ADFF'
                        stroke-width='1.5'
                        stroke-linecap='round'
                        stroke-linejoin='round'
                      />
                    </svg>
                    Finances
                  </a>
                </li>
                <li>
                  <a
                    className='w-full flex items-center gap-x-3.5 py-2 px-2.5 text-sm text-gray-100 rounded-lg hover:bg-gray-100 hover:text-blue-600'
                    href='#'
                  >
                    <svg
                      width='12'
                      height='12'
                      viewBox='0 0 12 12'
                      fill='none'
                      xmlns='http://www.w3.org/2000/svg'
                    >
                      <path
                        d='M10.116 5.02749C10.356 4.75751 10.77 4.34951 10.7479 4.18335C10.7649 4.02174 10.6774 3.86993 10.5024 3.5663L10.2557 3.138C10.069 2.81409 9.9757 2.65213 9.8169 2.58755C9.65815 2.52296 9.47855 2.57393 9.1194 2.67585L8.50925 2.8477C8.27995 2.90057 8.0394 2.87058 7.83 2.763L7.66155 2.66582C7.48205 2.55082 7.34395 2.38127 7.2675 2.18198L7.1005 1.68328C6.99075 1.35328 6.93585 1.18827 6.80515 1.09389C6.67445 0.999512 6.50085 0.999512 6.1537 0.999512H5.5963C5.2491 0.999512 5.0755 0.999512 4.94486 1.09389C4.81416 1.18827 4.75926 1.35328 4.64946 1.68328L4.48251 2.18198C4.40606 2.38127 4.26796 2.55082 4.08841 2.66582L3.91996 2.763C3.71061 2.87058 3.47001 2.90057 3.24071 2.8477L2.63062 2.67585C2.27147 2.57393 2.09187 2.52296 1.93307 2.58755C1.77427 2.65213 1.68097 2.81409 1.49432 3.138L1.24752 3.5663C1.07257 3.86993 0.985123 4.02174 1.00207 4.18335C1.01907 4.34496 1.13617 4.4752 1.37037 4.73567L1.88592 5.31199C2.01187 5.47149 2.10137 5.74949 2.10137 5.99939C2.10137 6.24949 2.01192 6.52739 1.88592 6.68694L1.37037 7.26329C1.13617 7.52374 1.01907 7.65399 1.00207 7.81559C0.985123 7.97724 1.07257 8.12904 1.24752 8.43264L1.49432 8.86094C1.68097 9.18484 1.77427 9.34684 1.93307 9.41139C2.09187 9.47599 2.27147 9.42504 2.63062 9.32309L3.24071 9.15124C3.47006 9.09834 3.71066 9.12839 3.92006 9.23599L4.08846 9.33319C4.26801 9.44819 4.40606 9.61769 4.48246 9.81699L4.64946 10.3157C4.75926 10.6457 4.81996 10.8173 4.92 10.8895C4.95 10.9111 5.07 11.0095 5.364 11.0005'
                        stroke='#A3ADFF'
                        stroke-width='1.5'
                        stroke-linecap='round'
                      />
                      <path
                        d='M7.5 8.60898C7.5 8.60898 8 8.75098 8.25 9.25098C8.25 9.25098 8.7981 8.00098 9.504 7.75098'
                        stroke='#A3ADFF'
                        stroke-width='1.5'
                        stroke-linecap='round'
                        stroke-linejoin='round'
                      />
                      <path
                        d='M11 8.49902C11 9.87972 9.8807 10.999 8.5 10.999C7.1193 10.999 6 9.87972 6 8.49902C6 7.11832 7.1193 5.99902 8.5 5.99902C9.8807 5.99902 11 7.11832 11 8.49902Z'
                        stroke='#A3ADFF'
                        stroke-width='1.5'
                        stroke-linecap='round'
                      />
                      <path
                        d='M7.07995 4.72156C6.65995 4.37956 6.32995 4.24756 5.84995 4.24756C4.94993 4.25956 4.12793 5.00304 4.12793 5.96954C4.12793 6.50239 4.28993 6.83954 4.59593 7.19354'
                        stroke='#A3ADFF'
                        stroke-width='1.5'
                        stroke-linecap='round'
                      />
                    </svg>
                    Settings
                  </a>
                </li>
                <li>
                  <a
                    className='w-full flex items-center gap-x-3.5 py-2 px-2.5 text-sm text-gray-100 rounded-lg hover:bg-gray-100 hover:text-blue-600'
                    href='#'
                  >
                    <svg
                      width='12'
                      height='12'
                      viewBox='0 0 12 12'
                      fill='none'
                      xmlns='http://www.w3.org/2000/svg'
                    >
                      <path
                        d='M6 11C8.76142 11 11 8.76142 11 6C11 3.23858 8.76142 1 6 1C3.23858 1 1 3.23858 1 6C1 8.76142 3.23858 11 6 11Z'
                        stroke='#A3ADFF'
                        stroke-width='1.5'
                      />
                      <path
                        d='M5 4.5C5 3.94771 5.4477 3.5 6 3.5C6.5523 3.5 7 3.94771 7 4.5C7 4.69907 6.94185 4.88457 6.84155 5.0404C6.5427 5.50485 6 5.9477 6 6.5V6.75'
                        stroke='#A3ADFF'
                        stroke-width='1.5'
                        stroke-linecap='round'
                      />
                      <path
                        d='M5.99597 8.5H6.00047'
                        stroke='#A3ADFF'
                        stroke-width='2'
                        stroke-linecap='round'
                        stroke-linejoin='round'
                      />
                    </svg>
                    Help
                  </a>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      </div>

      {/* <div className='w-full lg:ps-64'>
        <div className='p-4 sm:p-6 space-y-4 sm:space-y-6'>h vbmrxyu hbn</div>
      </div> */}
    </>
  )
}

export default Sidebar
