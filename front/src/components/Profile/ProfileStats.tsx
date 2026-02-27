import { formatCompactCount } from '../../utils/formatters';

interface ProfileStatsProps {
  postsCount: number;
  followersCount: number;
  followingCount: number;
}

const ProfileStats = ({ postsCount, followersCount, followingCount }: ProfileStatsProps) => {
  return (
    <section className="profile-stats" aria-label="Profile stats">
      <div>
        <strong>{formatCompactCount(postsCount)}</strong>
        <span>Posts</span>
      </div>
      <div>
        <strong>{formatCompactCount(followersCount)}</strong>
        <span>Followers</span>
      </div>
      <div>
        <strong>{formatCompactCount(followingCount)}</strong>
        <span>Following</span>
      </div>
    </section>
  );
};

export default ProfileStats;
