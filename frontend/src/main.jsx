import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { HelmetProvider } from 'react-helmet-async';
import './index.css';
import App from './App.jsx';
import { initAnalyticsClickTracking } from './utils/analytics.js';

initAnalyticsClickTracking();

const root = createRoot(document.getElementById('root'));

root.render(
  <StrictMode>
    <HelmetProvider>
      <App />
    </HelmetProvider>
  </StrictMode>
);

/**
 * Prerender signal: wait until the app has replaced the loading spinner
 * (or timeout) so Puppeteer captures real route content when using build:prerender.
 */
const signalReady = () => {
  document.dispatchEvent(new Event('render-event'));
};

const waitForContent = (attempts = 0) => {
  const rootEl = document.getElementById('root');
  const text = rootEl?.innerText?.trim() || '';
  const hasSpinnerOnly = text.length < 40;
  if (!hasSpinnerOnly || attempts > 40) {
    signalReady();
    return;
  }
  setTimeout(() => waitForContent(attempts + 1), 100);
};

if (document.readyState === 'complete') {
  requestAnimationFrame(() => waitForContent());
} else {
  window.addEventListener('load', () => requestAnimationFrame(() => waitForContent()));
}
