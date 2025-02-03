

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { baseUrl } from '../env';

export const login = createAsyncThunk(
  'auth/login',
  async (formData, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${baseUrl}/api/v1/auth/login`, formData);
      localStorage.setItem('authToken', JSON.stringify({"token":  response?.data?.token}));
      return response.data.user;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    userData: null,
    token: null,
    isLoading: false,
    error: null,
    roomUrl: null,
    call: null,
  },
  reducers: {
    logout(state) {
      state.userData = null;
      state.token = null;
      sessionStorage.clear();
      localStorage.removeItem('authToken');
      localStorage.removeItem('userData');
      localStorage.removeItem('roleType');
    },
    clearError(state) {
      state.error = null;
    },
    setError(state, action) {
      state.error = action.payload;
    },
    setRoomUrl : (state, action)=> {
      state.roomUrl = action.payload
    }, 
    setCall: (state, action) => {
      state.call = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
       
        state.token = action.payload?.message;
        state.userData = action.payload;
        sessionStorage.setItem('id', action.payload.id);
        // localStorage.setItem('authToken', state?.token);
        localStorage.setItem('userData', JSON.stringify(state.userData));
        localStorage.setItem('roleType', state.userData.role);
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload
        
      });
  },
});

export const { logout, clearError, setError, setRoomUrl, setCall } = authSlice.actions;
export default authSlice.reducer;
