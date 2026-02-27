import { Link } from 'react-router-dom';

import '../styles/FeedPage.css';

const ProfilePage = () => {
  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        padding: '24px'
      }}
    >
      <section className="feed-panel" style={{ maxWidth: 520, width: '100%' }}>
        <h1 style={{ marginTop: 0 }}>Profile Page</h1>
        <p style={{ color: 'var(--feed-muted)' }}>
          This page is a placeholder route and can be implemented next.
        </p>
        <Link to="/feed" className="feed-link-button" style={{ marginTop: 4, display: 'inline-block' }}>
          Back to Feed
        </Link>
      </section>
    </main>
  );
};

export default ProfilePage;
