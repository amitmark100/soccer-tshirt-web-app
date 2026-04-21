import { ChangeEvent, FormEvent, useEffect, useState } from 'react';

import PostPreviewModal from '../components/Common/PostPreviewModal';
import DesignGrid from '../components/Profile/DesignGrid';
import ProfileHeader from '../components/Profile/ProfileHeader';
import ProfileInfo from '../components/Profile/ProfileInfo';
import ProfileStats from '../components/Profile/ProfileStats';
import LeftSidebar from '../components/Sidebar/LeftSidebar';
import { useProfile } from '../hooks/useProfile';
import { Design, User } from '../types';
import '../styles/ProfilePage.css';

interface EditProfileModalProps {
  user: User;
  onSave: (updates: { name: string; avatar?: File | null }) => Promise<void>;
  onClose: () => void;
}

const EditProfileModal = ({ user, onSave, onClose }: EditProfileModalProps) => {
  const [name, setName] = useState(user.name);
  const [avatar, setAvatar] = useState<File | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setName(user.name);
    setAvatar(null);
  }, [user]);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    setAvatar(event.target.files?.[0] || null);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSaving(true);

    try {
      await onSave({
        name: name.trim(),
        avatar,
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="profile-modal-backdrop" role="dialog" aria-modal="true" aria-label="Edit profile modal">
      <form className="profile-modal" onSubmit={handleSubmit}>
        <h2>Edit Profile</h2>
        <div className="profile-form-grid">
          <label className="profile-form-field">
            <span>Username</span>
            <input value={name} onChange={(event) => setName(event.target.value)} required />
          </label>
          <label className="profile-form-field">
            <span>Profile Image</span>
            <input type="file" accept="image/png,image/jpeg,image/webp,image/gif" onChange={handleFileChange} />
          </label>
        </div>
        <div className="profile-modal-actions">
          <button type="button" className="profile-outline-btn" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="profile-primary-btn" disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
};

const ProfilePage = () => {
  const {
    user,
    postsCount,
    designs,
    isLoading,
    errorMessage,
    saveProfile,
    togglePostLike,
    editPost,
    deletePost,
    isEditModalOpen,
    openEditModal,
    closeEditModal,
  } = useProfile();
  const [editingPost, setEditingPost] = useState<{
    postId: string;
    team: string;
    league: string;
    price: string;
    size: string;
    description: string;
  } | null>(null);
  const [selectedDesign, setSelectedDesign] = useState<Design | null>(null);

  const handleEditDesign = (designId: string) => {
    const design = designs.find((currentDesign) => currentDesign.id === designId);
    if (!design) {
      return;
    }

    setEditingPost({
      postId: designId,
      team: design.team || '',
      league: design.league || '',
      price: String(design.price || 1),
      size: design.size || 'M',
      description: design.description,
    });
  };

  const handleSaveEditedPost = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!editingPost) {
      return;
    }

    editPost(editingPost.postId, {
      team: editingPost.team,
      league: editingPost.league,
      price: Number(editingPost.price),
      size: editingPost.size,
      description: editingPost.description,
    });
    setEditingPost(null);
  };

  if (isLoading) {
    return (
      <div className="profile-layout">
        <LeftSidebar />
        <main className="profile-main">
          <div className="profile-content">
            <p className="profile-empty-state">Loading profile...</p>
          </div>
        </main>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="profile-layout">
        <LeftSidebar />
        <main className="profile-main">
          <div className="profile-content">
            <p className="profile-empty-state">{errorMessage || 'Unable to load profile.'}</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="profile-layout">
      <LeftSidebar />
      <main className="profile-main">
        <div className="profile-content">
          <ProfileHeader user={user} onOpenEdit={openEditModal} />
          <ProfileInfo
            user={user}
            completionPercent={user.avatar ? 100 : 75}
            isProfileComplete={Boolean(user.avatar)}
            onOpenEdit={openEditModal}
          />
          <ProfileStats postsCount={postsCount} />
          <DesignGrid
            designs={designs}
            onOpenPreview={setSelectedDesign}
            onToggleLike={togglePostLike}
            canManageDesign={() => true}
            onEditDesign={handleEditDesign}
            onDeleteDesign={deletePost}
          />
        </div>
      </main>
      {isEditModalOpen ? <EditProfileModal user={user} onSave={saveProfile} onClose={closeEditModal} /> : null}
      {editingPost ? (
        <div className="profile-modal-backdrop" role="dialog" aria-modal="true" aria-label="Edit post modal">
          <form className="profile-modal" onSubmit={handleSaveEditedPost}>
            <h2>Edit Post</h2>
            <div className="profile-form-grid">
              <label className="profile-form-field">
                <span>Team</span>
                <input
                  value={editingPost.team}
                  onChange={(event) =>
                    setEditingPost((current) => (current ? { ...current, team: event.target.value } : null))
                  }
                  required
                />
              </label>
              <label className="profile-form-field">
                <span>League</span>
                <input
                  value={editingPost.league}
                  onChange={(event) =>
                    setEditingPost((current) => (current ? { ...current, league: event.target.value } : null))
                  }
                  required
                />
              </label>
              <label className="profile-form-field">
                <span>Price</span>
                <input
                  type="number"
                  min="1"
                  step="0.01"
                  value={editingPost.price}
                  onChange={(event) =>
                    setEditingPost((current) => (current ? { ...current, price: event.target.value } : null))
                  }
                  required
                />
              </label>
              <label className="profile-form-field">
                <span>Size</span>
                <select
                  value={editingPost.size}
                  onChange={(event) =>
                    setEditingPost((current) => (current ? { ...current, size: event.target.value } : null))
                  }
                >
                  {['XS', 'S', 'M', 'L', 'XL', 'XXL'].map((sizeOption) => (
                    <option key={sizeOption} value={sizeOption}>
                      {sizeOption}
                    </option>
                  ))}
                </select>
              </label>
              <label className="profile-form-field">
                <span>Description</span>
                <textarea
                  rows={3}
                  value={editingPost.description}
                  onChange={(event) =>
                    setEditingPost((current) => (current ? { ...current, description: event.target.value } : null))
                  }
                  required
                />
              </label>
            </div>
            <div className="profile-modal-actions">
              <button type="button" className="profile-outline-btn" onClick={() => setEditingPost(null)}>
                Cancel
              </button>
              <button type="submit" className="profile-primary-btn">
                Save Post
              </button>
            </div>
          </form>
        </div>
      ) : null}
      <PostPreviewModal
        isOpen={Boolean(selectedDesign)}
        title={selectedDesign?.title ?? ''}
        description={selectedDesign?.description ?? ''}
        image={selectedDesign?.image ?? ''}
        creatorLabel={`@${user.name}`}
        timestamp={selectedDesign?.createdAt ?? ''}
        price={selectedDesign?.price}
        size={selectedDesign?.size}
        likes={selectedDesign?.likes ?? 0}
        secondaryMetricLabel="views"
        secondaryMetricValue={selectedDesign?.views ?? 0}
        onClose={() => setSelectedDesign(null)}
      />
    </div>
  );
};

export default ProfilePage;
