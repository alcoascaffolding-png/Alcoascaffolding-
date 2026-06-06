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

// Signal for vite-plugin-prerender / post-render crawlers
requestAnimationFrame(() => {
  document.dispatchEvent(new Event('render-event'));
});
