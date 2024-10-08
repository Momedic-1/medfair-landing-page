import React from "react";


const Stepper = ({stepLabels, currentStep})=>{
    return <>
        <div data-hs-stepper>
            <ul className='relative flex justify-center items-center mb-4 ml-4 lg:ml-[14rem] mr-4 lg:mr-[18rem] rounded-md bg-slate-100 p-6'>
                {stepLabels.map((label, index) => (
                    <li
                        key={index}
                        className='flex items-center gap-x-2 shrink basis-0 flex-1 group'
                        data-hs-stepper-nav-item={`{"index": ${index + 1}}`}
                    >
                  <span className='min-w-7 min-h-7 group inline-flex items-center text-xs align-middle'>
                    <span
                        className={`size-7 flex justify-center items-center flex-shrink-0 ${
                            currentStep >= index + 1
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-100 text-gray-800'
                        } font-medium rounded-full`}
                    >
                      {index + 1}
                    </span>
                    <span className='ms-2 text-sm font-medium text-gray-800'>
                      {label}
                    </span>
                  </span>
                        {index < 2 && (
                            <div className='w-full h-px flex-1 bg-gray-200 group-last:hidden'></div>
                        )}
                    </li>
                ))}
            </ul>
            </div>
        </>
        }

        export default Stepper;