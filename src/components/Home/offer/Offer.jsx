import { LinearProgress } from '@mui/material'
import React from 'react'

const Offer = () => {
  const [activeTab, setActiveTab] = React.useState(0)
  const [progress, setProgress] = React.useState(0);
  const [activeImage, setActiveImage] = React.useState(0)

  const tabs =[
    { id: 0, title:'Availability', content: "Book an appointment 24 hours a day and 7 days a week, with doctors always ready on standby to serve and attend to your needs", image: "https://res.cloudinary.com/da79pzyla/image/upload/v1737299447/tele3_nknjae.jpg" },
    { id: 1, title:'Security and Data Privacy', content: "Experience secure and confidential consultations, with your privacy fully protected. We ensure your data are protected and meant for you alone.", image: "https://res.cloudinary.com/da79pzyla/image/upload/v1737299447/tele4_iuvbms.jpg" },
    { id: 2, title:'Patient Support', content: " Dedicated support around the clock, ensuring you're never alone when you need assistance or medical guidance.", image: "https://res.cloudinary.com/da79pzyla/image/upload/v1737299447/tele7_cowogr.jpg" },
  ]
 
 React.useLayoutEffect(() => {
  setProgress(0)
    if (tabs.some((tab) => tab.id === activeTab)) {
      const timer = setInterval(() => {
        setProgress((oldProgress) => {
          if (oldProgress >= 100) {
            setActiveTab((prevTab) => (prevTab + 1) % tabs.length); 
            return 0;
          }
          const diff = Math.random() * 5; 
          return Math.min(oldProgress + diff, 100);
        });
      }, 200);

      return () => {
        clearInterval(timer);
      };
    } else {
      setProgress(0); 
    }
  }, [activeTab, tabs.length]);

  React.useEffect(() => {
    if (tabs.some((tab) => tab.id === activeTab)) {
      setActiveImage( tabs[activeTab].image)
    }
  }, [activeTab])
  return (
    <div className="w-full mt-4 bg-blue-50/20 px-2 py-8" id="offer"
    //  data-aos="zoom-out"
    //     data-aos-easing="ease-in-sine"
    //     data-aos-duration="1000"
    >
   
      <div className='w-full flex justify-center'>
      <p className="mt-4 text-2xl text-[#475467] font-bold leading-8 font-sans md:text-center md:w-[768px]">
        Why Choose Us?
      </p>
      </div>
      <div className='w-full flex flex-col py-6 md:py-20 md:px-6 lg:px-20 md:flex-row'>
      <div className="w-full md:w-1/2">
        {
          tabs.map((item)=> (
          <div className='flex items-start gap-x-6'>
          <button
                className="w-1.5 mb-4 cursor-pointer"
                onClick={() => setActiveTab(item.id)}
                style={{
                  backgroundColor: activeTab === item.id ? '#095AD3' : '#F9FAFB', 
                  borderRadius: '13px',
                  height: activeTab === item.id ? '182px' : '64px', 
                  transition: 'all 0.3s ease', 
                }}
              >
                {activeTab === item.id && (
                  <LinearProgress
                    variant="determinate"
                    value={progress}
                    sx={{
                      height: '100%',
                      borderRadius: '13px',
                      '& .MuiLinearProgress-bar': {
                        transform: `translateY(${progress - 100}%) !important`,
                        transition: 'all 0.3s ease',
                        height: '100%',
                      },
                    }}
                  />
                )}
          </button>
          <div className='w-full flex flex-col gap-y-4 mb-6'>
          <h4 className='text-[#101828] text-24 leading-8 font-sans font-semibold cursor-pointer' onClick={()=>setActiveTab(item.id)}>{item.title}</h4>
          <div className={`w-full flex flex-col gap-y-12 cursor-pointer ${activeTab === item.id ? "h-full cursor-default": "hidden"}`}>
          <div className='w-full'>
          <p className='text-[20px] font-sans text-[#475467] font-normal leading-7 md:w-[100%] lg:w-[96%]'>{item.content}</p>
         
          </div>
          </div>        
        </div>
      </div>
          ))
        }
      </div>
       <div className='w-full px-4 md:w-1/2 flex justify-center items-start md:px-8'>
          <img src={activeImage} className='' alt={`image${activeTab}`}/>
          </div>
      </div>

    </div>
  )
}
export default Offer