
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { logout } from './features/authSlice';
import { IoIosLogOut } from "react-icons/io";

const Logout = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleLogout = () => {
    sessionStorage.clear();
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    localStorage.removeItem('roleType');
    dispatch(logout());

    navigate('/login', { replace: true });
  };

  return (
    <button
      onClick={handleLogout}
      className="w-full flex items-center gap-x-3.5 py-2 px-2.5 text-sm text-gray-100 rounded-lg hover:bg-gray-100 hover:text-blue-600"
    >
      <IoIosLogOut />
      LogOut
    </button>
  );
};

export default Logout;
