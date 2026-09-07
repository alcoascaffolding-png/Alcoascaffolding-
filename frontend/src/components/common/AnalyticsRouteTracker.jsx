import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { trackPageView } from '../../utils/analytics';

/** Fires GA4 page_view on every SPA route change (including /ar). */
const AnalyticsRouteTracker = () => {
  const location = useLocation();

  useEffect(() => {
    trackPageView(location.pathname + location.search, document.title);
  }, [location.pathname, location.search]);

  return null;
};

export default AnalyticsRouteTracker;
