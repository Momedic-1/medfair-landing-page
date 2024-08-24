function Stats () {
  const stats = [
    { label: 'Appointment', value: 10 },
    { label: 'Total Patient', value: 50 },
    { label: 'Consultations', value: 20 },
    { label: 'Return Patient', value: 5 }
  ]

  return (
    <div className='space-y-4'>
      {/* <div className='flex justify-between items-center'>
        <h3 className='font-semibold'>Status</h3>
        <div className='w-2/3 bg-gray-200 rounded-full h-2'>
          <div className='bg-blue-600 h-2 rounded-full w-3/4'></div>
        </div>
      </div> */}
      <div className='grid grid-cols-2 gap-4'>
        {stats.map(stat => (
          <div key={stat.label} className='bg-gray-100 p-4 rounded-lg'>
            <p className='text-2xl font-bold'>{stat.value}</p>
            <p className='text-sm text-gray-600'>{stat.label}</p>
          </div>
        ))}
      </div>
      <div className='flex justify-between'>
        <button className='bg-blue-600 text-white px-4 py-2 rounded-lg'>
          9 Missed calls
        </button>
        <button className='border border-blue-600 text-blue-600 px-4 py-2 rounded-lg'>
          10 Messages
        </button>
      </div>
    </div>
  )
}

export default Stats
