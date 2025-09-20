import React from 'react'
import ReactDOM from 'react-dom/client'
import SraPistesivu from './components/SraPistesivu'
import { ErrorBoundary } from './ErrorBoundary'

ReactDOM.createRoot(document.getElementById('root')).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
)
