import { Navigate, Route, Routes } from 'react-router-dom';

import FeedPage from './pages/FeedPage';
import AuthPage from './pages/AuthPage';
import ProfilePage from './pages/ProfilePage';
import CreatePostPage from './pages/CreatePostPage';

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/auth" replace />} />
      <Route path="/auth" element={<AuthPage />} />
      <Route path="/feed" element={<FeedPage />} />
      <Route path="/create" element={<CreatePostPage />} />
      <Route path="/profile" element={<ProfilePage />} />
      <Route path="*" element={<Navigate to="/auth" replace />} />
    </Routes>
  );
};

export default App;
