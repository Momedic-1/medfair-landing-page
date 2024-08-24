import AvatarImage from '../../assets/avatar.png'

export default function RecentPatients () {
  const patients = [
    {
      id: 1,
      avatar: AvatarImage,
      name: 'Solomon Moregood',
      gender: 'M',
      age: 23,
      date: '03/24',
      bloodtype: 'AS',
      disease: 'Cough',
      status: 'Attended'
    },
    {
      id: 2,
      avatar: AvatarImage,
      name: 'Solomon Moregood',
      gender: 'M',
      age: 23,
      date: '03/24',
      bloodtype: 'AS',
      disease: 'Cough',
      status: 'Pending'
    },
    {
      id: 3,
      avatar: AvatarImage,
      name: 'Solomon Moregood',
      gender: 'M',
      age: 23,
      date: '03/24',
      bloodtype: 'AS',
      disease: 'Cough',
      status: 'Pending'
    },
    {
      id: 4,
      avatar: AvatarImage,
      name: 'Solomon Moregood',
      gender: 'M',
      age: 23,
      date: '03/24',
      bloodtype: 'AS',
      disease: 'Cough',
      status: 'Pending'
    }
  ]

  return (
    <div className='max-w-screen-2xl w-full mx-auto '>
      <div className='items-start justify-between flex'>
        <div className='max-w-lg'>
          <h3 className='text-gray-800 text-xl font-bold sm:text-2xl'>
            Recent Patients
          </h3>
        </div>
        <div className=''>
          <a
            href='javascript:void(0)'
            className='inline-block px-4 py-2 text-white duration-150 font-medium bg-indigo-600 rounded-lg hover:bg-indigo-500 active:bg-indigo-700 md:text-sm'
          >
            Add Patient
          </a>
        </div>
      </div>
      <div className='mt-4 shadow-sm border rounded-lg overflow-x-auto'>
        <table className='w-full table-auto text-sm text-left'>
          <thead className='bg-gray-50 text-gray-600 font-medium border-b'>
            <tr>
              <th className='py-3 px-6'>Name</th>
              <th className='py-3 px-6'>Gender</th>
              <th className='py-3 px-6'>Age</th>
              <th className='py-3 px-6'>Date</th>
              <th className='py-3 px-6'>Blood Type</th>
              <th className='py-3 px-6'>Disease</th>
              <th className='py-3 px-6'>Status</th>
              <th className='py-3 px-6'></th>
            </tr>
          </thead>
          <tbody className='text-gray-600 divide-y'>
            {patients.map(patient => (
              <tr key={patient.id}>
                <td className='flex items-center gap-x-3 py-3 px-6 whitespace-nowrap'>
                  <img
                    src={patient.avatar}
                    className='w-10 h-10 rounded-full'
                    alt={patient.name}
                  />
                  <div>
                    <span className='block text-gray-700 text-sm font-medium'>
                      {patient.name}
                    </span>
                  </div>
                </td>
                <td className='pl-12 py-4  whitespace-nowrap'>
                  {patient.gender}
                </td>
                <td className='px-6 py-4 whitespace-nowrap'>{patient.age}</td>
                <td className='px-6 py-4 whitespace-nowrap'>{patient.date}</td>
                <td className='px-6 py-4 whitespace-nowrap'>
                  {patient.bloodtype}
                </td>
                <td className='px-6 py-4 whitespace-nowrap'>
                  {patient.disease}
                </td>
                <td
                  className={`px-6 py-4 whitespace-nowrap ${
                    patient.status === 'Attended'
                      ? 'text-green-500'
                      : 'text-red-500'
                  }`}
                >
                  {patient.status}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
