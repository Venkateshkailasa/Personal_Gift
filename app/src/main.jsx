/**
 * Main entry point for the Personal Gift React application
 * Sets up the root React component and renders the app
 */

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Create React root and render the application
// StrictMode enables additional development checks and warnings
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
