import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { ENV } from './lib/env.ts'

// Keep Render backend alive by pinging every 10 minutes
setInterval(() => {
  fetch(`${ENV.BASE_API_URL}/health`).catch(() => {});
}, 10 * 60 * 1000);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
