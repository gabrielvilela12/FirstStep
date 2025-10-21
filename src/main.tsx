import React from 'react'
import ReactDOM from 'react-dom/client'
// 1. Importe o BrowserRouter
import { BrowserRouter } from 'react-router-dom' 
import App from './App.tsx'
import './index.css'
import { ThemeProvider } from './hooks/use-theme.tsx'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      {/* 2. Envolva o App com o BrowserRouter */}
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ThemeProvider>
  </React.StrictMode>,
)