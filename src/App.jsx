import React from 'react'
import './Global.css'
import AppRouter from './router/AppRouter'
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const App = () => {
  return (
    <>
      <AppRouter />
      <ToastContainer />
    </>
  )
}

export default App
