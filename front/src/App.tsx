import { useEffect, useState } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';

import FeedPage from './pages/FeedPage';
import AuthPage from './pages/AuthPage';
import ProfilePage from './pages/ProfilePage';
import CreatePostPage from './pages/CreatePostPage';
import { authChangeEventName, hasAuthCookies } from './utils/authCookies';

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(() => hasAuthCookies());
  const location = useLocation();

  useEffect(() => {
    const syncAuthState = () => {
      setIsAuthenticated(hasAuthCookies());
    };

    window.addEventListener(authChangeEventName, syncAuthState);

    return () => {
      window.removeEventListener(authChangeEventName, syncAuthState);
    };
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [location.pathname]);

  return (
    <Routes location={location} key={location.pathname}>
      <Route path="/" element={<Navigate to={isAuthenticated ? '/feed' : '/auth'} replace />} />
      <Route path="/auth" element={isAuthenticated ? <Navigate to="/feed" replace /> : <AuthPage />} />
      <Route path="/feed" element={isAuthenticated ? <FeedPage /> : <Navigate to="/auth" replace />} />
      <Route path="/create" element={isAuthenticated ? <CreatePostPage /> : <Navigate to="/auth" replace />} />
      <Route path="/profile" element={isAuthenticated ? <ProfilePage /> : <Navigate to="/auth" replace />} />
      <Route path="*" element={<Navigate to={isAuthenticated ? '/feed' : '/auth'} replace />} />
    </Routes>
  );
};

export default App;
