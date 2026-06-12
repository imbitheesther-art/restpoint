import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

// Dynamically import jQuery and other libraries if needed
// Instead of loading via script tags, import them as modules
import 'moment'
import 'jquery'

// Import FullCalendar as modules (better than CDN)
import '@fullcalendar/react'
import '@fullcalendar/daygrid'
import '@fullcalendar/timegrid'
import '@fullcalendar/interaction'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)