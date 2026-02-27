import { useMemo } from 'react';

import SuggestedUsers from '../Suggestions/SuggestedUsers';
import TrendingDesigns from '../Suggestions/TrendingDesigns';
import { Post, TopRatedUser } from '../../types/types';
import { trendingDesigns } from '../../utils/mockData';

interface RightSidebarProps {
  posts: Post[];
}

const RightSidebar = ({ posts }: RightSidebarProps) => {
  const topRatedUsers = useMemo<TopRatedUser[]>(() => {
    const usersById = new Map<string, TopRatedUser>();

    posts.forEach((post) => {
      const existing = usersById.get(post.userId);

      if (!existing) {
        usersById.set(post.userId, {
          id: post.userId,
          username: post.username,
          userAvatar: post.userAvatar,
          totalLikes: post.likes
        });
        return;
      }

      existing.totalLikes += post.likes;
    });

    return [...usersById.values()].sort((a, b) => b.totalLikes - a.totalLikes).slice(0, 3);
  }, [posts]);

  return (
    <aside className="feed-right-sidebar">
      <SuggestedUsers users={topRatedUsers} />
      <TrendingDesigns designs={trendingDesigns} />
    </aside>
  );
};

export default RightSidebar;
