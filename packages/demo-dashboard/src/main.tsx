import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { CanonProvider } from './state/canonStore'
import { MetricsProvider } from './state/metricsStore'
import { ModeProvider } from './state/modeStore'
import { UiProvider } from './state/uiStore'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ModeProvider>
      <UiProvider>
        <CanonProvider>
          <MetricsProvider>
            <App />
          </MetricsProvider>
        </CanonProvider>
      </UiProvider>
    </ModeProvider>
  </StrictMode>,
)
