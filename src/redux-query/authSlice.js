// import { createSlice,createAsyncThunk } from "@reduxjs/toolkit";
// import { baseUrl } from "../env";

// import axios from 'axios';


// export const login = createAsyncThunk(
//   'auth/login',
//   async (formData, { rejectWithValue }) => {
//     try {
//       const response = await axios.post(`${baseUrl}/api/v1/auth/login`, formData, {
//         headers: { 'Content-Type': 'application/json' },
//       });
//       return response.data; 
//     } catch (err) {
//       return rejectWithValue(err.response?.data?.message || 'Login failed');
//     }
//   }
// );

// const authSlice = createSlice({
//   name: 'auth',
//   initialState: {
//     user: null,
//     token: null,
//     role: null,
//     isLoading: false,
//     error: null,
//   },
//   reducers: {
//     logout: (state) => {
//       state.user = null;
//       state.token = null;
//       state.role = null;
//     },
//   },
//   extraReducers: (builder) => {
//     builder
//       .addCase(login.pending, (state) => {
//         state.isLoading = true;
//         state.error = null;
//       })
//       .addCase(login.fulfilled, (state, action) => {
//         state.isLoading = false;
//         state.token = action.payload.message; 
//         state.user = action.payload.data; 
//         state.role = action.payload.data.role;
//       })
//       .addCase(login.rejected, (state, action) => {
//         state.isLoading = false;
//         state.error = action.payload;
//       });
//   },
// });

// export const { logout } = authSlice.actions;

// export default authSlice.reducer;