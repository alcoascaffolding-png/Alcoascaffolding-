import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { HelmetProvider } from 'react-helmet-async';
import './index.css';
import App from './App.jsx';
import { initAnalyticsClickTracking } from './utils/analytics.js';

// Static head tags from the build-time prerender would otherwise duplicate the
// tags react-helmet-async renders (React 19 hoists, it does not replace).
document.head.querySelectorAll('[data-prerender]').forEach((el) => el.remove());

initAnalyticsClickTracking();

const root = createRoot(document.getElementById('root'));

root.render(
  <StrictMode>
    <HelmetProvider>
      <App />
    </HelmetProvider>
  </StrictMode>
);
