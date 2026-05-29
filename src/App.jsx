import React from 'react'
import './Global.css'
import AppRouter from './router/AppRouter'
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ReportBatchProvider } from './context/ReportBatchContext'

const App = () => {
  return (
    <>
      <ReportBatchProvider>
        <AppRouter />
      </ReportBatchProvider>
      <ToastContainer />
    </>
  )
}

export default App
