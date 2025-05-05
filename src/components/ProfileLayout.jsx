import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux';
import { baseUrl } from '../env'
import axios from 'axios';
import { getToken } from '../utils';
import { useEffect, useCallback, useState } from 'react';
import { Hourglass } from 'react-loader-spinner';


const ProfileLayout = () => {
  const [loading, setLoading] = useState(true);
  const { userData } = useSelector((state) => state.auth);
  const token = getToken();
  const navigate = useNavigate();

  useEffect(() => {
    if (userData) {
      checkProfile();
    }
  }, []);

  const checkProfile = useCallback(async () => {
    setLoading(true);
    console.log(userData);
    try {
      const response = await axios.get(`${baseUrl}/api/v1/doctor-profile/profile-full/${userData.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.data) {
        console.log(response.data);
        const hasNull = Object.values(response.data.data).some(value => value === null);
        if (hasNull) {
          navigate('/editProfile');
        } else {
          navigate('/doctorProfile', { state: { profileData: response.data } });
        }
      }
    } catch (error) {
      console.error('Error fetching profile data:', error);
    } finally {
      setLoading(false);
    }
  }, [userData, token, navigate]);

  // useEffect(() => {
  //   checkProfile();
  // }, [checkProfile]);

  return (
    <div className=''>
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-50 backdrop-blur-sm z-50">
          <Hourglass
            visible={true}
            height="40"
            width="40"
            ariaLabel="hourglass-loading"
            wrapperStyle={{}}
            wrapperClass=""
            colors={['#306cce', '#72a1ed']}
          />
        </div>
      )}
    </div>
  );
}

export default ProfileLayout
