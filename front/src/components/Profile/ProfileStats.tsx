import { formatCompactCount } from '../../utils/formatters';

interface ProfileStatsProps {
  postsCount: number;
}

const ProfileStats = ({ postsCount }: ProfileStatsProps) => {
  return (
    <section className="profile-stats" aria-label="Profile stats">
      <div>
        <strong>{formatCompactCount(postsCount)}</strong>
        <span>Posts</span>
      </div>
    </section>
  );
};

export default ProfileStats;
