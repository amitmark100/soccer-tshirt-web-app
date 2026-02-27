import { useMemo, useState } from 'react';

import { Post } from '../types/types';
import { useAppData } from '../context/AppDataContext';

interface UseFeedReturn {
  posts: Post[];
  visiblePosts: Post[];
  hasMore: boolean;
  toggleLike: (postId: string) => void;
  addComment: (postId: string, commentText: string) => void;
  editPost: (postId: string, input: { title: string; description: string; designImage: string }) => void;
  deletePost: (postId: string) => void;
  currentUserId: string;
  loadMore: () => void;
}

const PAGE_SIZE = 2;

export const useFeed = (): UseFeedReturn => {
  const { posts, toggleLike, addComment, editPost, deletePost, currentUserId } = useAppData();
  const [visibleCount, setVisibleCount] = useState<number>(PAGE_SIZE);

  const hasMore = visibleCount < posts.length;

  const visiblePosts = useMemo(() => {
    return posts.slice(0, visibleCount);
  }, [posts, visibleCount]);

  const loadMore = () => {
    setVisibleCount((currentCount) => {
      return Math.min(currentCount + PAGE_SIZE, posts.length);
    });
  };

  return {
    posts,
    visiblePosts,
    hasMore,
    toggleLike,
    addComment,
    editPost,
    deletePost,
    currentUserId,
    loadMore
  };
};
