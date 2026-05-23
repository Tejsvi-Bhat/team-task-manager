import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-12">
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-6 h-6 bg-gradient-to-br from-blue-600 to-indigo-600 rounded flex items-center justify-center">
              <span className="text-white text-xs font-bold">T</span>
            </div>
            <span className="text-sm font-semibold text-gray-800">TaskManager</span>
          </Link>
          {location.pathname === '/' && (
            <span className="text-xs text-gray-400 hidden sm:block">Projects</span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center">
            <span className="text-white text-xs font-medium">{user?.name?.charAt(0).toUpperCase()}</span>
          </div>
          <span className="text-sm text-gray-600 hidden sm:block">{user?.name}</span>
          <button
            onClick={logout}
            className="text-xs text-gray-400 hover:text-gray-600 ml-1"
          >
            Log out
          </button>
        </div>
      </div>
    </nav>
  );
}
