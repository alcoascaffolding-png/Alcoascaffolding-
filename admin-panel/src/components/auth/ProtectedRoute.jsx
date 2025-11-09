/**
 * Protected Route - Works with Dummy Auth
 */

import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  // Check localStorage for dummy auth
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';

  // Later: Replace with Redux auth check
  // const { isAuthenticated } = useSelector((state) => state.auth);

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
