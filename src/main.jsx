import React from 'react'
import ReactDOM from 'react-dom/client'

function Smoke() {
  return (
    <div style={{padding:20, fontFamily:'system-ui'}}>
      <h1>✅ Smoke OK</h1>
      <p>Jos näet tämän, Vite-bundle ja root-mount toimivat.</p>
    </div>
  )
}

const rootEl = document.getElementById('root')
console.log('Mounting into #root =', !!rootEl)
ReactDOM.createRoot(rootEl).render(<Smoke />)
