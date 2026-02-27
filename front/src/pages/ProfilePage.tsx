import DesignGrid from '../components/Profile/DesignGrid';
import ProfileHeader from '../components/Profile/ProfileHeader';
import ProfileInfo from '../components/Profile/ProfileInfo';
import ProfileStats from '../components/Profile/ProfileStats';
import ProfileTabs from '../components/Profile/ProfileTabs';
import LeftSidebar from '../components/Sidebar/LeftSidebar';
import { useDesignGrid } from '../hooks/useDesignGrid';
import { useProfile } from '../hooks/useProfile';
import '../styles/ProfilePage.css';

const EditProfileModal = ({ onClose }: { onClose: () => void }) => {
  return (
    <div className="profile-modal-backdrop" role="dialog" aria-modal="true" aria-label="Edit profile modal">
      <div className="profile-modal">
        <h2>Edit Profile</h2>
        <p>This is a preview-only modal. Save behavior is intentionally not implemented.</p>
        <button type="button" className="profile-primary-btn" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
};

const ProfilePage = () => {
  const {
    user,
    isFollowing,
    followersCount,
    followingCount,
    completionPercent,
    isProfileComplete,
    toggleFollow,
    isEditModalOpen,
    openEditModal,
    closeEditModal
  } = useProfile();
  const { activeTab, displayedDesigns, myDesignCount, savedDesignCount, setActiveTab, toggleLike } = useDesignGrid();

  return (
    <div className="profile-layout">
      <LeftSidebar />
      <main className="profile-main">
        <div className="profile-content">
          <ProfileHeader user={user} onOpenEdit={openEditModal} />
          <ProfileInfo
            user={user}
            isFollowing={isFollowing}
            completionPercent={completionPercent}
            isProfileComplete={isProfileComplete}
            onToggleFollow={toggleFollow}
            onOpenEdit={openEditModal}
          />
          <ProfileStats postsCount={user.postsCount} followersCount={followersCount} followingCount={followingCount} />
          <ProfileTabs
            activeTab={activeTab}
            myDesignCount={myDesignCount}
            savedDesignCount={savedDesignCount}
            onTabChange={setActiveTab}
          />
          <DesignGrid designs={displayedDesigns} activeTab={activeTab} onToggleLike={toggleLike} />
        </div>
      </main>
      {isEditModalOpen ? <EditProfileModal onClose={closeEditModal} /> : null}
    </div>
  );
};

export default ProfilePage;
