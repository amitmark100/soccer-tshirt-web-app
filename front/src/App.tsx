import { useEffect, useState } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';

import FeedPage from './pages/FeedPage';
import AuthPage from './pages/AuthPage';
import ProfilePage from './pages/ProfilePage';
import CreatePostPage from './pages/CreatePostPage';
import { authChangeEventName, hasAuthCookies } from './utils/authCookies';

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(() => hasAuthCookies());

  useEffect(() => {
    const syncAuthState = () => {
      setIsAuthenticated(hasAuthCookies());
    };

    window.addEventListener(authChangeEventName, syncAuthState);

    return () => {
      window.removeEventListener(authChangeEventName, syncAuthState);
    };
  }, []);

  return (
    <Routes>
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
