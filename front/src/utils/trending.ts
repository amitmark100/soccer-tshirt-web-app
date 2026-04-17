import { Post } from '../types/types';

export const getTrendingScore = (post: Pick<Post, 'likes' | 'totalComments'>): number => {
  return post.likes + post.totalComments;
};

export const sortPostsByTrendingScore = (posts: Post[]): Post[] => {
  return [...posts].sort((left, right) => {
    const scoreDifference = getTrendingScore(right) - getTrendingScore(left);

    if (scoreDifference !== 0) {
      return scoreDifference;
    }

    if (right.likes !== left.likes) {
      return right.likes - left.likes;
    }

    if (right.totalComments !== left.totalComments) {
      return right.totalComments - left.totalComments;
    }

    return right.id.localeCompare(left.id);
  });
};
