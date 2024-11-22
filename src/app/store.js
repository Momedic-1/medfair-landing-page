// import { configureStore } from "@reduxjs/toolkit";
// import counterReducer from '../features/counter/counterSlice'
// import { setupListeners } from '@reduxjs/toolkit/query';
// import { registrationApi } from "../redux-query/RegistrationQuery";

// export const store = configureStore({
//     reducer: {
//         counter: counterReducer,
//         [registrationApi.reducerPath]: registrationApi.reducer,
//     },
//     middleware: (getDefaultMiddleware) =>
//         getDefaultMiddleware()
//               .concat(registrationApi.middleware)
//   })
//   setupListeners(store.dispatch)
  
// import { configureStore } from '@reduxjs/toolkit';
// import authReducer from '../redux-query/authSlice';
// import { persistReducer,persistStore } from 'redux-persist';
// import storage from "redux-persist/lib/storage"


// const persistConfig = {
//     key: 'root',
//     storage,
//   };
//   const persistedReducer = persistReducer(persistConfig, authReducer);

//   export const store = configureStore({
//     reducer: {
//       auth: persistedReducer,
//     },
//   });
  
// export const persistor = persistStore(store);
// store.js
import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/authSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
  },
});

export default store;
