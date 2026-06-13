import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import BenchmarkApp from './BenchmarkApp.tsx'

const RootComponent = new URLSearchParams(window.location.search).get('benchmark') === '1'
  ? BenchmarkApp
  : App

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RootComponent />
  </StrictMode>,
)
