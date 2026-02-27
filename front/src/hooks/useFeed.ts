import { useCallback, useMemo, useState } from 'react';

import { Post } from '../types/types';
import { posts as initialPosts } from '../utils/mockData';

interface UseFeedReturn {
  posts: Post[];
  visiblePosts: Post[];
  hasMore: boolean;
  toggleLike: (postId: string) => void;
  addComment: (postId: string, commentText: string) => void;
  loadMore: () => void;
}

const PAGE_SIZE = 2;

export const useFeed = (): UseFeedReturn => {
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [visibleCount, setVisibleCount] = useState<number>(PAGE_SIZE);

  const hasMore = visibleCount < posts.length;

  const visiblePosts = useMemo(() => {
    return posts.slice(0, visibleCount);
  }, [posts, visibleCount]);

  const toggleLike = useCallback((postId: string) => {
    setPosts((currentPosts) => {
      return currentPosts.map((post) => {
        if (post.id !== postId) {
          return post;
        }

        const nextLiked = !post.isLiked;

        return {
          ...post,
          isLiked: nextLiked,
          likes: post.likes + (nextLiked ? 1 : -1)
        };
      });
    });
  }, []);

  const addComment = useCallback((postId: string, commentText: string) => {
    const trimmedComment = commentText.trim();

    if (!trimmedComment) {
      return;
    }

    setPosts((currentPosts) => {
      return currentPosts.map((post) => {
        if (post.id !== postId) {
          return post;
        }

        const newComment = {
          id: `comment-${Date.now()}-${Math.random().toString(16).slice(2)}`,
          userId: 'current-user',
          username: 'you',
          text: trimmedComment,
          userAvatar: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?auto=format&fit=crop&w=80&q=80'
        };

        return {
          ...post,
          comments: [...post.comments, newComment],
          totalComments: post.totalComments + 1
        };
      });
    });
  }, []);

  const loadMore = useCallback(() => {
    setVisibleCount((currentCount) => {
      return Math.min(currentCount + PAGE_SIZE, posts.length);
    });
  }, [posts.length]);

  return {
    posts,
    visiblePosts,
    hasMore,
    toggleLike,
    addComment,
    loadMore
  };
};
