import { BsPatchCheckFill } from 'react-icons/bs';
import { FiEdit2 } from 'react-icons/fi';

import { User } from '../../types';

interface ProfileHeaderProps {
  user: User;
  onOpenEdit: () => void;
}

const ProfileHeader = ({ user, onOpenEdit }: ProfileHeaderProps) => {
  return (
    <section className="profile-header">
      <div className="profile-banner-wrap">
        {user.bannerImage ? (
          <img src={user.bannerImage} alt={`${user.name} banner`} className="profile-banner" />
        ) : (
          <div className="profile-banner profile-banner-placeholder" aria-hidden="true" />
        )}
        <button type="button" className="profile-banner-edit-btn" onClick={onOpenEdit} aria-label="Edit banner">
          <FiEdit2 size={18} />
        </button>
      </div>
      <div className="profile-avatar-wrap">
        {user.avatar ? (
          <img src={user.avatar} alt={user.name} className="profile-avatar" />
        ) : (
          <div className="profile-avatar profile-avatar-placeholder" aria-hidden="true">
            {user.name.slice(0, 1).toUpperCase()}
          </div>
        )}
        {user.isVerified ? (
          <span className="profile-avatar-badge" aria-label="Verified user">
            <BsPatchCheckFill size={13} />
          </span>
        ) : null}
      </div>
    </section>
  );
};

export default ProfileHeader;
