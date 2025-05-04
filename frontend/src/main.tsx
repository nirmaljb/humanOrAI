import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { BrowserRouter, Route, Routes } from 'react-router'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {/* <meta name="mobile-web-app-capable" content="yes" /> */}
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        {/* <Route path="/claude" element={<GameChat />} /> */}
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
