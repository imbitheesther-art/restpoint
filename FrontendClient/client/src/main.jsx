import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

// NOTE: Heavy libraries (moment, jquery, fullcalendar) removed from entry point.
// They are imported lazily inside the components that use them.
// This saves ~500KB from the initial critical render path.

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
