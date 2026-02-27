import { NavLink } from 'react-router-dom';

const HomeIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
    <path d="M3 10.5L12 3l9 7.5V21h-6v-6H9v6H3z" />
  </svg>
);

const ExploreIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
    <path d="M21 3l-7.5 17-3-7-7-3L21 3zm-10 10l2 2 4-9-9 4 3 1z" />
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

const FolderIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
    <path d="M3 6h6l2 2h10v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6z" />
  </svg>
);

const LogoutIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
    <path d="M13 3h-2v8h2V3zm3.6 2.4l-1.4 1.4A7 7 0 1 1 8.8 6.8L7.4 5.4A9 9 0 1 0 16.6 5.4z" />
  </svg>
);

const LeftSidebar = () => {
  const navClassName = ({ isActive }: { isActive: boolean }): string =>
    `feed-nav-item${isActive ? ' active' : ''}`;

  return (
    <aside className="feed-left-sidebar">
      <div>
        <h1 className="feed-logo">Soccer T-Shirts</h1>

        <nav className="feed-nav" aria-label="Primary navigation">
          <NavLink to="/feed" end className={navClassName}>
            <HomeIcon /> Home
          </NavLink>
          <a href="#" className="feed-nav-item">
            <ExploreIcon /> Explore
          </a>
          <a href="#" className="feed-nav-item">
            <CreateIcon /> Create
          </a>
          <NavLink to="/profile" className={navClassName}>
            <ProfileIcon /> Profile
          </NavLink>
        </nav>

        <section className="feed-collections">
          <h2>Collections</h2>
          <a href="#" className="feed-nav-item">
            <FolderIcon /> My Collections
          </a>
          <a href="#" className="feed-nav-item">
            <FolderIcon /> Saved Designs
          </a>
        </section>
      </div>

      <NavLink to="/auth" className="feed-nav-item feed-logout">
        <LogoutIcon /> Log Out
      </NavLink>
    </aside>
  );
};

export default LeftSidebar;
