

import AvatarImage from '../../assets/avatar.png';

export default function RecentPatients() {
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
      status: 'Attended',
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
      status: 'Pending',
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
      status: 'Pending',
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
      status: 'Pending',
    },
    {
      id: 5,
      avatar: AvatarImage,
      name: 'Solomon Moregood',
      gender: 'M',
      age: 23,
      date: '03/24',
      bloodtype: 'AS',
      disease: 'Cough',
      status: 'Attended',
    },
    {
      id: 6,
      avatar: AvatarImage,
      name: 'Solomon Moregood',
      gender: 'M',
      age: 23,
      date: '03/24',
      bloodtype: 'AS',
      disease: 'Cough',
      status: 'Pending',
    },
    {
      id: 7,
      avatar: AvatarImage,
      name: 'Solomon Moregood',
      gender: 'M',
      age: 23,
      date: '03/24',
      bloodtype: 'AS',
      disease: 'Cough',
      status: 'Pending',
    },
    {
      id: 8,
      avatar: AvatarImage,
      name: 'Solomon Moregood',
      gender: 'M',
      age: 23,
      date: '03/24',
      bloodtype: 'AS',
      disease: 'Cough',
      status: 'Pending',
    },
  ];

  return (
    <div className='max-w-screen-2xl w-full mx-auto  '>
      <div className='bg-white shadow-lg rounded-lg border border-blue-300'>
        <h2 className='text-xl font-bold text-[#020e7c] p-4'>
          Recent Patient
        </h2>
        <div className=''>
         
          <div className='max-h-80 overflow-y-auto'>
            <table className='w-full table-auto text-sm text-left'>
              <thead className='bg-blue-50 text-[#020e7c] font-semibold border-b'>
                <tr>
                  <th className='py-3 px-6'>Name</th>
                  <th className='py-3 px-6'>Gender</th>
                  <th className='py-3 px-6'>Age</th>
                  <th className='py-3 px-6'>Date</th>
                  <th className='py-3 px-6'>Bloodtype</th>
                  <th className='py-3 px-6'>Disease</th>
                  <th className='py-3 px-6'>Status</th>
                </tr>
              </thead>
              <tbody className='divide-y divide-gray-200'>
                {patients.map((patient) => (
                  <tr
                    key={patient.id}
                    className='hover:bg-blue-50 transition duration-300'
                  >
                    <td className='flex items-center gap-x-3 py-3 px-6 whitespace-nowrap'>
                      <img
                        src={patient.avatar}
                        className='w-10 h-10 rounded-full'
                        alt={patient.name}
                      />
                      <div>
                        <span className='block text-[#020e7c] font-semibold'>
                          {patient.name}
                        </span>
                      </div>
                    </td>
                    <td className='py-4 px-6 text-[#020e7c] whitespace-nowrap'>
                      {patient.gender}
                    </td>
                    <td className='py-4 px-6 text-[#020e7c] whitespace-nowrap'>
                      {patient.age}
                    </td>
                    <td className='py-4 px-6 text-[#020e7c] whitespace-nowrap'>
                      {patient.date}
                    </td>
                    <td className='py-4 px-6 text-[#020e7c] whitespace-nowrap'>
                      {patient.bloodtype}
                    </td>
                    <td className='py-4 px-6 text-[#020e7c] whitespace-nowrap'>
                      {patient.disease}
                    </td>
                    <td
                      className={`py-4 px-6 whitespace-nowrap font-semibold ${
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
      </div>
    </div>
  );
}
