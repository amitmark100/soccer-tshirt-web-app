import { BsPatchCheckFill } from 'react-icons/bs';
import { FiCalendar, FiMapPin } from 'react-icons/fi';

import { User } from '../../types';
import { formatJoinDate } from '../../utils/formatters';

interface ProfileInfoProps {
  user: User;
  completionPercent: number;
  isProfileComplete: boolean;
  onOpenEdit: () => void;
}

const VerifiedBadge = () => (
  <span className="profile-verified-badge" aria-label="Verified account" title="Verified account">
    <BsPatchCheckFill size={14} />
  </span>
);

const ProfileInfo = ({
  user,
  completionPercent,
  isProfileComplete,
  onOpenEdit
}: ProfileInfoProps) => {
  return (
    <section className="profile-info-card">
      <div className="profile-info-head">
        <div className="profile-title-wrap">
          <h1>{user.name}</h1>
          {user.isVerified ? <VerifiedBadge /> : null}
        </div>
        <div className="profile-actions">
          <button type="button" className="profile-outline-btn" onClick={onOpenEdit}>
            Edit Profile
          </button>
        </div>
      </div>
      <p className="profile-bio">{user.bio}</p>
      <div className="profile-meta">
        <span>
          <FiMapPin size={15} /> {user.location}
        </span>
        <span>
          <FiCalendar size={15} /> Joined {formatJoinDate(user.joinDate)}
        </span>
      </div>
      <div className="profile-completion">
        <span>
          Profile completeness: <strong>{completionPercent}%</strong>
        </span>
        <span className={isProfileComplete ? 'complete' : 'incomplete'}>
          {isProfileComplete ? 'Complete' : 'Needs updates'}
        </span>
      </div>
    </section>
  );
};

export default ProfileInfo;
