/**
 * Navbar - Works with Dummy Auth
 */

import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const Navbar = ({ toggleSidebar }) => {
  const navigate = useNavigate();
  
  // Get user from localStorage (dummy auth)
  const user = JSON.parse(localStorage.getItem('user') || '{"name":"Admin User","role":"admin"}');

  const handleLogout = () => {
    // Clear localStorage (dummy auth)
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    
    toast.success('Logged out successfully');
    navigate('/login');
  };

  return (
    <nav className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-30 shadow-sm">
      <div className="flex items-center justify-between">
        {/* Left Side */}
        <div className="flex items-center space-x-4">
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors duration-200"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Alcoa Admin Panel</h2>
            <p className="text-xs text-gray-500">Business Management System</p>
          </div>
        </div>

        {/* Right Side */}
        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <button className="relative p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          {/* User Info */}
          <div className="flex items-center space-x-3 px-4 py-2 rounded-lg bg-gray-50 border border-gray-200">
            <div className="text-right">
              <p className="text-sm font-semibold text-gray-900">{user?.name}</p>
              <p className="text-xs text-gray-500 capitalize">{user?.role?.replace('_', ' ')}</p>
            </div>
            
            <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center shadow-sm">
              <span className="text-white font-semibold">
                {user?.name?.charAt(0).toUpperCase()}
              </span>
            </div>
          </div>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="px-4 py-2 rounded-lg bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 transition-colors duration-200 font-medium text-sm"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
