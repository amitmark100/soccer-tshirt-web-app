import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { Post } from '../types/types';
import { useAPI } from './useAPI';
import { getAuthUser } from '../utils/authCookies';

interface UseFeedReturn {
  posts: Post[];
  visiblePosts: Post[];
  visibleLimit: number;
  hasMore: boolean;
  isLoading: boolean;
  errorMessage: string;
  toggleLike: (postId: string) => void;
  addComment: (postId: string, commentText: string) => void;
  editPost: (
    postId: string,
    input: { team: string; league: string; price: number; size: string; description: string }
  ) => void;
  deletePost: (postId: string) => void;
  currentUserId: string;
  loadMore: () => void;
  resetVisibleCount: () => void;
}

const PAGE_SIZE = 2;
export const feedQueryKey = ['feed-posts'];

export const useFeed = (): UseFeedReturn => {
  const authUser = getAuthUser();
  const API = useAPI();
  const queryClient = useQueryClient();
  const [visibleCount, setVisibleCount] = useState<number>(PAGE_SIZE);

  const {
    data: posts = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: feedQueryKey,
    queryFn: API.post.getFeedPosts,
  });

  const refreshFeed = () => {
    void queryClient.invalidateQueries({ queryKey: feedQueryKey });
  };

  const toggleLikeMutation = useMutation({
    mutationFn: API.post.toggleLike,
    onSuccess: refreshFeed,
  });

  const addCommentMutation = useMutation({
    mutationFn: ({ postId, commentText }: { postId: string; commentText: string }) =>
      API.comment.create({ postId, content: commentText }),
    onSuccess: refreshFeed,
  });

  const deletePostMutation = useMutation({
    mutationFn: API.post.delete,
    onSuccess: refreshFeed,
  });

  const editPostMutation = useMutation({
    mutationFn: API.post.update,
    onSuccess: refreshFeed,
  });

  const hasMore = visibleCount < posts.length;

  const visiblePosts = useMemo(() => {
    return posts.slice(0, visibleCount);
  }, [posts, visibleCount]);

  const loadMore = () => {
    setVisibleCount((currentCount) => {
      return Math.min(currentCount + PAGE_SIZE, posts.length);
    });
  };

  const findPost = (postId: string) => posts.find((post) => post.id === postId);

  return {
    posts,
    visiblePosts,
    visibleLimit: visiblePosts.length,
    hasMore,
    isLoading,
    errorMessage: error instanceof Error ? error.message : '',
    toggleLike: (postId: string) => {
      toggleLikeMutation.mutate(postId);
    },
    addComment: (postId: string, commentText: string) => {
      const trimmedComment = commentText.trim();
      if (!trimmedComment) {
        return;
      }

      addCommentMutation.mutate({ postId, commentText: trimmedComment });
    },
    editPost: (postId, input) => {
      const post = findPost(postId);
      if (!post) {
        return;
      }

      editPostMutation.mutate({
        ...post,
        title: `${input.team.trim()} ${input.league.trim()}`,
        team: input.team.trim(),
        league: input.league.trim(),
        price: input.price,
        size: input.size,
        description: input.description.trim(),
      });
    },
    deletePost: (postId: string) => {
      deletePostMutation.mutate(postId);
    },
    currentUserId: authUser?.id || '',
    loadMore,
    resetVisibleCount: () => {
      setVisibleCount(PAGE_SIZE);
    },
  };
};
