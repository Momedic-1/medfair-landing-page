// main.jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import App from './App'
import 'preline'
import { NextUIProvider } from '@nextui-org/react'
import { store } from './app/store'
import { Provider } from 'react-redux'

ReactDOM.createRoot(document.getElementById('root')).render(
  <Provider store={store}>
  <React.StrictMode>
    <NextUIProvider>
      <App />
    </NextUIProvider>
  </React.StrictMode>
  </Provider>
)
