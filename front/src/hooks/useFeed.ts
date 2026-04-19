import { useCallback, useMemo, useState } from 'react';
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
  smartSearchResults: Post[] | null;
  smartSearchReasoning: string;
  isSmartSearchLoading: boolean;
  smartSearchErrorMessage: string;
  toggleLike: (postId: string) => void;
  addComment: (postId: string, commentText: string) => void;
  editPost: (
    postId: string,
    input: { team: string; league: string; price: number; size: string; description: string }
  ) => void;
  deletePost: (postId: string) => void;
  runSmartSearch: (query: string) => void;
  clearSmartSearch: () => void;
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
  const [smartSearchResults, setSmartSearchResults] = useState<Post[] | null>(null);
  const [smartSearchReasoning, setSmartSearchReasoning] = useState<string>('');

  const {
    data: posts = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: feedQueryKey,
    queryFn: API.post.getFeedPosts,
  });

  const refreshFeed = useCallback(() => {
    void queryClient.invalidateQueries({ queryKey: feedQueryKey });
  }, [queryClient]);

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

  const smartSearchMutation = useMutation({
    mutationFn: API.post.smartSearch,
    onSuccess: ({ reasoning, posts: matchedPosts }) => {
      setSmartSearchReasoning(reasoning);
      setSmartSearchResults(matchedPosts);
    },
  });

  const hasMore = visibleCount < posts.length;

  const visiblePosts = useMemo(() => {
    return posts.slice(0, visibleCount);
  }, [posts, visibleCount]);

  const loadMore = useCallback(() => {
    setVisibleCount((currentCount) => {
      return Math.min(currentCount + PAGE_SIZE, posts.length);
    });
  }, [posts.length]);

  const findPost = (postId: string) => posts.find((post) => post.id === postId);

  const runSmartSearch = useCallback((query: string) => {
    const trimmedQuery = query.trim();

    if (!trimmedQuery) {
      setSmartSearchReasoning('');
      setSmartSearchResults([]);
      smartSearchMutation.reset();
      return;
    }

    smartSearchMutation.mutate(trimmedQuery);
  }, [smartSearchMutation]);

  const clearSmartSearch = useCallback(() => {
    setSmartSearchReasoning('');
    setSmartSearchResults(null);
    smartSearchMutation.reset();
  }, [smartSearchMutation]);

  const resetVisibleCount = useCallback(() => {
    setVisibleCount(PAGE_SIZE);
  }, []);

  return {
    posts,
    visiblePosts,
    visibleLimit: visiblePosts.length,
    hasMore,
    isLoading,
    errorMessage: error instanceof Error ? error.message : '',
    smartSearchResults,
    smartSearchReasoning,
    isSmartSearchLoading: smartSearchMutation.isPending,
    smartSearchErrorMessage:
      smartSearchMutation.error instanceof Error ? smartSearchMutation.error.message : '',
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
    runSmartSearch,
    clearSmartSearch,
    currentUserId: authUser?.id || '',
    loadMore,
    resetVisibleCount,
  };
};
