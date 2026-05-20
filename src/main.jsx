import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom' // 1. Buni qo'shing
import App from './App.jsx'


createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter> {/* 2. App-ni buni ichiga o'rang */}
      <App />
    </BrowserRouter>
  </StrictMode>,
)