import { FormEvent, useEffect, useState } from 'react';

import PostPreviewModal from '../components/Common/PostPreviewModal';
import DesignGrid from '../components/Profile/DesignGrid';
import ProfileHeader from '../components/Profile/ProfileHeader';
import ProfileInfo from '../components/Profile/ProfileInfo';
import ProfileStats from '../components/Profile/ProfileStats';
import LeftSidebar from '../components/Sidebar/LeftSidebar';
import { useAppData } from '../context/AppDataContext';
import { useProfile } from '../hooks/useProfile';
import { Design, User } from '../types';
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
  const { posts, currentUserId, toggleLike: togglePostLike, editPost, deletePost } = useAppData();
  const [editingPost, setEditingPost] = useState<{
    postId: string;
    title: string;
    description: string;
    designImage: string;
  } | null>(null);
  const [selectedDesign, setSelectedDesign] = useState<Design | null>(null);
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
  const handleDesignLike = (designId: string) => {
    if (designId.startsWith('profile-post-')) {
      togglePostLike(designId.replace('profile-post-', ''));
    }
  };

  const canManageProfileDesign = (designId: string) => designId.startsWith('profile-post-');

  const handleEditDesign = (designId: string) => {
    if (!designId.startsWith('profile-post-')) {
      return;
    }

    const postId = designId.replace('profile-post-', '');
    const post = posts.find((currentPost) => currentPost.id === postId);

    if (!post) {
      return;
    }

    setEditingPost({
      postId,
      title: post.title,
      description: post.description,
      designImage: post.designImage
    });
  };

  const handleDeleteDesign = (designId: string) => {
    if (!designId.startsWith('profile-post-')) {
      return;
    }

    const postId = designId.replace('profile-post-', '');
    deletePost(postId);
  };

  const handleSaveEditedPost = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!editingPost) {
      return;
    }

    editPost(editingPost.postId, {
      title: editingPost.title,
      description: editingPost.description,
      designImage: editingPost.designImage
    });
    setEditingPost(null);
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
          <DesignGrid
            designs={profilePostDesigns}
            onOpenPreview={setSelectedDesign}
            onToggleLike={handleDesignLike}
            canManageDesign={canManageProfileDesign}
            onEditDesign={handleEditDesign}
            onDeleteDesign={handleDeleteDesign}
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
                <span>Title</span>
                <input
                  value={editingPost.title}
                  onChange={(event) =>
                    setEditingPost((current) => (current ? { ...current, title: event.target.value } : null))
                  }
                  required
                />
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
              <label className="profile-form-field">
                <span>Image URL</span>
                <input
                  value={editingPost.designImage}
                  onChange={(event) =>
                    setEditingPost((current) => (current ? { ...current, designImage: event.target.value } : null))
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
        creatorLabel={`@${user.name.toLowerCase().replace(/\s+/g, '')}`}
        timestamp={selectedDesign?.createdAt ?? ''}
        likes={selectedDesign?.likes ?? 0}
        secondaryMetricLabel="views"
        secondaryMetricValue={selectedDesign?.views ?? 0}
        onClose={() => setSelectedDesign(null)}
      />
    </div>
  );
};

export default ProfilePage;
