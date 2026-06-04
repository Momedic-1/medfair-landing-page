

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
      let payload = response?.data;
      if (typeof payload === "string") {
        try {
          payload = JSON.parse(payload);
        } catch {
          return rejectWithValue({
            message: "Sign-in response was invalid. Please try again.",
          });
        }
      }
      if (!payload?.token || !payload?.user?.id) {
        return rejectWithValue({
          message: "Sign-in succeeded but the server returned incomplete data.",
        });
      }
      localStorage.setItem(
        'authToken',
        JSON.stringify({
          token: payload.token,
          refreshToken: payload.refreshToken ?? null,
        }),
      );
      return payload.user;
    } catch (error) {
      if (!error?.response) {
        return rejectWithValue({
          network: true,
          message:
            error?.message === "Network Error"
              ? `Cannot reach the API at ${baseUrl}. Check your connection or contact support.`
              : error?.message || formatAuthError(null),
        });
      }
      const { data, status } = error.response;
      if (typeof data === "string" && data.trim()) {
        return rejectWithValue(data);
      }
      if (data && typeof data === "object") {
        return rejectWithValue({ ...data, status });
      }
      return rejectWithValue({ status });
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
        state.error = null;
        if (!action.payload?.id) {
          state.error = "Sign-in succeeded but user data was missing. Please try again.";
          return;
        }
        state.token = action.payload?.message;
        state.userData = action.payload;
        sessionStorage.setItem('id', String(action.payload.id));
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
