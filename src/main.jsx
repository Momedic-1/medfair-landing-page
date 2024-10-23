// main.jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import App from './App'
import 'preline'
import { NextUIProvider } from '@nextui-org/react'
// import { store } from './app/store'
// import { Provider } from 'react-redux'

ReactDOM.createRoot(document.getElementById('root')).render(
<<<<<<< HEAD
  
=======
  // <Provider store={store}>
>>>>>>> 12171ab96999e9a20f134ee5adc31ba97e4ff276
  <React.StrictMode>
    <NextUIProvider>
    {/* <Provider store={store}> */}
      <App />
      {/* </Provider> */}
    </NextUIProvider>
  </React.StrictMode>
<<<<<<< HEAD
 
=======
  // </Provider>
>>>>>>> 12171ab96999e9a20f134ee5adc31ba97e4ff276
)
