import { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { googleLogout } from '@react-oauth/google';
import { useAPI } from '../../hooks/useAPI';
import { clearAuthCookies } from '../../utils/authCookies';
import logo from '../../assets/logo.png';

const HomeIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
    <path d="M3 10.5L12 3l9 7.5V21h-6v-6H9v6H3z" />
  </svg>
);

const CreateIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
    <path d="M11 11V4h2v7h7v2h-7v7h-2v-7H4v-2z" />
  </svg>
);

const ProfileIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
    <path d="M12 12a5 5 0 1 0-5-5 5 5 0 0 0 5 5zm0 2c-4.4 0-8 2.2-8 5v1h16v-1c0-2.8-3.6-5-8-5z" />
  </svg>
);

const LogoutIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
    <path d="M13 3h-2v8h2V3zm3.6 2.4l-1.4 1.4A7 7 0 1 1 8.8 6.8L7.4 5.4A9 9 0 1 0 16.6 5.4z" />
  </svg>
);

const LeftSidebar = () => {
  const API = useAPI();
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const navClassName = (path: string): string =>
    `feed-nav-item${location.pathname === path ? ' active' : ''}`;

  const handleRouteChange = (path: string) => {
    if (location.pathname === path) {
      return;
    }

    window.location.assign(path);
  };

  const handleLogout = async () => {
    if (isLoggingOut) {
      return;
    }

    try {
      setIsLoggingOut(true);

      await API.auth.logout();
    } finally {
      // Call googleLogout to clear Google session
      googleLogout();
      clearAuthCookies();
      navigate('/auth', { replace: true });
      setIsLoggingOut(false);
    }
  };

  return (
    <aside className="feed-left-sidebar">
      <div>
        <h1 className="feed-logo">Soccer T-Shirts</h1>

        <nav className="feed-nav" aria-label="Primary navigation">
          <button type="button" className={navClassName('/feed')} onClick={() => handleRouteChange('/feed')}>
            <HomeIcon /> Home
          </button>
          <button type="button" className={navClassName('/create')} onClick={() => handleRouteChange('/create')}>
            <CreateIcon /> Create
          </button>
          <button type="button" className={navClassName('/profile')} onClick={() => handleRouteChange('/profile')}>
            <ProfileIcon /> Profile
          </button>
        </nav>
      </div>

<div className="feed-logo-container">
        <img src={logo} alt="Soccer T-Shirts Logo" className="feed-logo-image" style={{ filter: 'brightness(0) invert(1)' }} />
      </div>

      <button
        type="button"
        onClick={handleLogout}
        disabled={isLoggingOut}
        className="feed-nav-item feed-logout"
        style={{ position: 'relative', bottom: '15px' }}
      >
        <LogoutIcon /> Log Out
      </button>
    </aside>
  );
};

export default LeftSidebar;