import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Projects from './pages/Projects';
import ProjectBoard from './pages/ProjectBoard';
import Dashboard from './pages/Dashboard';
import Navbar from './components/Navbar';

function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  return user ? children : <Navigate to="/login" />;
}

export default function App() {
  const { user } = useAuth();
  const location = useLocation();
  const isBoardPage = location.pathname.match(/^\/projects\/[^/]+$/);

  return (
    <div className="min-h-screen bg-gray-50">
      {user && <Navbar />}
      {isBoardPage && user ? (
        <Routes>
          <Route path="/projects/:id" element={<PrivateRoute><ProjectBoard /></PrivateRoute>} />
        </Routes>
      ) : (
        <div className="max-w-7xl mx-auto px-4 py-6">
          <Routes>
            <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
            <Route path="/signup" element={user ? <Navigate to="/" /> : <Signup />} />
            <Route path="/" element={<PrivateRoute><Projects /></PrivateRoute>} />
            <Route path="/projects/:id" element={<PrivateRoute><ProjectBoard /></PrivateRoute>} />
            <Route path="/projects/:id/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          </Routes>
        </div>
      )}
    </div>
  );
}
