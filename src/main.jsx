
import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import App from './App'
import 'preline'
import { NextUIProvider } from '@nextui-org/react'
import store from './app/store'
import { Provider } from 'react-redux'
import { WherebyProvider } from '@whereby.com/browser-sdk/react'

ReactDOM.createRoot(document.getElementById('root')).render(
 <Provider store={store}>
  <React.StrictMode>
    <NextUIProvider>
    <WherebyProvider>
      <App />
    </WherebyProvider>
    </NextUIProvider>
  </React.StrictMode>
 </Provider>
   

  )
