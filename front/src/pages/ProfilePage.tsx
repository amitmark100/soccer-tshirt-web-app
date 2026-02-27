import { FormEvent, useEffect, useState } from 'react';

import DesignGrid from '../components/Profile/DesignGrid';
import ProfileHeader from '../components/Profile/ProfileHeader';
import ProfileInfo from '../components/Profile/ProfileInfo';
import ProfileStats from '../components/Profile/ProfileStats';
import LeftSidebar from '../components/Sidebar/LeftSidebar';
import { useAppData } from '../context/AppDataContext';
import { useDesignGrid } from '../hooks/useDesignGrid';
import { useProfile } from '../hooks/useProfile';
import { User } from '../types';
import '../styles/ProfilePage.css';

interface EditProfileModalProps {
  user: User;
  onSave: (updates: Pick<User, 'name' | 'bio' | 'location' | 'joinDate'>) => void;
  onClose: () => void;
}

const EditProfileModal = ({ user, onSave, onClose }: EditProfileModalProps) => {
  const [name, setName] = useState<string>(user.name);
  const [bio, setBio] = useState<string>(user.bio);
  const [location, setLocation] = useState<string>(user.location);
  const [joinDate, setJoinDate] = useState<string>(user.joinDate);

  useEffect(() => {
    setName(user.name);
    setBio(user.bio);
    setLocation(user.location);
    setJoinDate(user.joinDate);
  }, [user]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    onSave({
      name: name.trim(),
      bio: bio.trim(),
      location: location.trim(),
      joinDate
    });
  };

  return (
    <div className="profile-modal-backdrop" role="dialog" aria-modal="true" aria-label="Edit profile modal">
      <form className="profile-modal" onSubmit={handleSubmit}>
        <h2>Edit Profile</h2>
        <div className="profile-form-grid">
          <label className="profile-form-field">
            <span>Name</span>
            <input value={name} onChange={(event) => setName(event.target.value)} required />
          </label>
          <label className="profile-form-field">
            <span>Location</span>
            <input value={location} onChange={(event) => setLocation(event.target.value)} required />
          </label>
          <label className="profile-form-field">
            <span>Join Date</span>
            <input type="date" value={joinDate} onChange={(event) => setJoinDate(event.target.value)} required />
          </label>
          <label className="profile-form-field">
            <span>Bio</span>
            <textarea value={bio} onChange={(event) => setBio(event.target.value)} rows={3} required />
          </label>
        </div>
        <div className="profile-modal-actions">
          <button type="button" className="profile-outline-btn" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="profile-primary-btn">
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
};

const ProfilePage = () => {
  const {
    user,
    completionPercent,
    isProfileComplete,
    saveProfile,
    isEditModalOpen,
    openEditModal,
    closeEditModal
  } = useProfile();
  const { designs, toggleLike } = useDesignGrid();
  const { posts, currentUserId, toggleLike: togglePostLike } = useAppData();
  const userPosts = posts.filter((post) => post.userId === currentUserId);
  const postsCount = userPosts.length;
  const profilePostDesigns = userPosts.map((post) => ({
    id: `profile-post-${post.id}`,
    title: post.title,
    image: post.designImage,
    likes: post.likes,
    views: Math.max(300, post.totalComments * 25 + post.likes * 2),
    isLiked: post.isLiked,
    createdAt: post.timestamp,
    description: post.description
  }));
  const combinedDesigns = [...profilePostDesigns, ...designs];

  const handleDesignLike = (designId: string) => {
    if (designId.startsWith('profile-post-')) {
      togglePostLike(designId.replace('profile-post-', ''));
      return;
    }

    toggleLike(designId);
  };

  return (
    <div className="profile-layout">
      <LeftSidebar />
      <main className="profile-main">
        <div className="profile-content">
          <ProfileHeader user={user} onOpenEdit={openEditModal} />
          <ProfileInfo
            user={user}
            completionPercent={completionPercent}
            isProfileComplete={isProfileComplete}
            onOpenEdit={openEditModal}
          />
          <ProfileStats postsCount={postsCount} />
          <DesignGrid designs={combinedDesigns} onToggleLike={handleDesignLike} />
        </div>
      </main>
      {isEditModalOpen ? <EditProfileModal user={user} onSave={saveProfile} onClose={closeEditModal} /> : null}
    </div>
  );
};

export default ProfilePage;
