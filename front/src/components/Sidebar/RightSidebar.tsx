import { useMemo } from 'react';

import SuggestedUsers from '../Suggestions/SuggestedUsers';
import TrendingDesigns from '../Suggestions/TrendingDesigns';
import { Post, TopRatedUser, TrendingDesign } from '../../types/types';
import { sortPostsByTrendingScore } from '../../utils/trending';

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

  const trendingDesigns = useMemo<TrendingDesign[]>(() => {
    return sortPostsByTrendingScore(posts)
      .slice(0, 4)
      .map((post) => ({
        id: post.id,
        name: post.title,
        image: post.designImage,
        likes: post.likes,
        comments: post.totalComments,
      }));
  }, [posts]);

  return (
    <aside className="feed-right-sidebar">
      <SuggestedUsers users={topRatedUsers} />
      <TrendingDesigns designs={trendingDesigns} />
    </aside>
  );
};

export default RightSidebar;
