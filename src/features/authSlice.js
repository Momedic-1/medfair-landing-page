

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { baseUrl } from '../env';
import { setPatientPartnerSlug, PATIENT_PARTNER_SLUG_STORAGE_KEY, getUserRole } from '../utils';
import { formatAuthError } from '../utils/parseApiError';

export const login = createAsyncThunk(
  'auth/login',
  async (formData, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${baseUrl}/api/v1/auth/login`, formData);
      const payload =
        typeof response?.data === "string" ? JSON.parse(response.data) : response?.data;
      localStorage.setItem(
        'authToken',
        JSON.stringify({
          token: payload?.token,
          refreshToken: payload?.refreshToken ?? null,
        }),
      );
      return payload?.user;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data ?? { message: formatAuthError(null) },
      );
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
      localStorage.removeItem(PATIENT_PARTNER_SLUG_STORAGE_KEY);
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
        localStorage.setItem('userData', JSON.stringify(state.userData));
        const rawRole = action.payload?.role;
        const role =
          typeof rawRole === "string"
            ? rawRole.toUpperCase()
            : rawRole?.name
              ? String(rawRole.name).toUpperCase()
              : getUserRole();
        if (role) {
          localStorage.setItem("roleType", role);
          if (state.userData && typeof state.userData === "object") {
            state.userData.role = role;
            localStorage.setItem("userData", JSON.stringify(state.userData));
          }
        }
        if (state.userData?.partnerSlug != null && String(state.userData.partnerSlug).trim() !== '') {
          setPatientPartnerSlug(state.userData.partnerSlug);
        } else if (state.userData?.partner_slug != null && String(state.userData.partner_slug).trim() !== '') {
          setPatientPartnerSlug(state.userData.partner_slug);
        }
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.error = formatAuthError(action.payload);
      });
  },
});

export const { logout, clearError, setError, setRoomUrl, setCall } = authSlice.actions;
export default authSlice.reducer;
