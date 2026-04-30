import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext.jsx';
import { WishlistAlertProvider } from './context/WishlistAlertContext.jsx';
import Navbar from './components/Navbar.jsx';
import Home from './pages/Home.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Profile from './pages/Profile.jsx';
import Matches from './pages/Matches.jsx';
import ChatPage from './pages/ChatPage.jsx';
import ActivityFeedPage from './pages/ActivityFeedPage.jsx';
import WishlistPage from './pages/WishlistPage.jsx';
import UniversityMapPage from './pages/UniversityMapPage.jsx';
import TradeChainsPage from './pages/TradeChainsPage.jsx';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <PageLoader />;
  return user ? children : <Navigate to="/login" replace />;
};

const PageLoader = () => (
  <div className="min-h-screen bg-paper flex items-center justify-center">
    <div className="flex flex-col items-center gap-3">
      <div className="w-8 h-8 border-4 border-ink border-t-accent animate-spin" />
      <span className="font-display text-2xl tracking-widest text-ink">CARGANDO</span>
    </div>
  </div>
);

export default function App() {
  const { user, loading } = useAuth();
  if (loading) return <PageLoader />;

  return (
    // WishlistAlertProvider necesita estar dentro de BrowserRouter (ya está en main.jsx)
    // y dentro de AuthProvider para poder usar useSocket (que necesita user)
    <WishlistAlertProvider>
      <div className="min-h-screen bg-paper">
        {user && <Navbar />}
        <main className={user ? 'pt-16' : ''}>
          <Routes>
            <Route path="/login"    element={!user ? <Login />    : <Navigate to="/" replace />} />
            <Route path="/register" element={!user ? <Register /> : <Navigate to="/" replace />} />
            <Route path="/"         element={<PrivateRoute><Home /></PrivateRoute>} />
            <Route path="/profile/:userId?" element={<PrivateRoute><Profile /></PrivateRoute>} />
            <Route path="/matches"  element={<PrivateRoute><Matches /></PrivateRoute>} />
            <Route path="/chat/:conversationId?" element={<PrivateRoute><ChatPage /></PrivateRoute>} />
            <Route path="/feed"     element={<PrivateRoute><ActivityFeedPage /></PrivateRoute>} />
            <Route path="/wishlist" element={<PrivateRoute><WishlistPage /></PrivateRoute>} />
            <Route path="/map"      element={<PrivateRoute><UniversityMapPage /></PrivateRoute>} />
            <Route path="/chains"   element={<PrivateRoute><TradeChainsPage /></PrivateRoute>} />
            <Route path="*"         element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </WishlistAlertProvider>
  );
}
