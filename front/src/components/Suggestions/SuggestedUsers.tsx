import { TopRatedUser } from '../../types/types';

interface SuggestedUsersProps {
  users: TopRatedUser[];
}

const formatCompactCount = (count: number): string => {
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1).replace('.0', '')}k`;
  }

  return count.toString();
};

const SuggestedUsers = ({ users }: SuggestedUsersProps) => {
  return (
    <section className="feed-panel">
      <div className="feed-panel-header">
        <h2>Top rated Users</h2>
        <button type="button" className="feed-link-button">
          See All
        </button>
      </div>

      <ul className="feed-user-list">
        {users.map((user) => (
          <li key={user.id} className="feed-user-item">
            <div className="feed-user-row">
              <img src={user.userAvatar} alt={user.username} className="feed-user-avatar" />
              <span className="feed-user-name">@{user.username}</span>
            </div>
            <span className="feed-like-counter">{formatCompactCount(user.totalLikes)} likes</span>
          </li>
        ))}
      </ul>
    </section>
  );
};

export default SuggestedUsers;
