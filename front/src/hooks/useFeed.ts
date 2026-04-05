import { useCallback, useEffect, useState } from 'react';

import { Post } from '../types/types';
import { fetchPosts, aiSearchPosts, toggleLikePost } from '../services/postApi';
import { transformPostsFromBackend } from '../utils/adapters';

interface UseFeedReturn {
  posts: Post[];
  visiblePosts: Post[];
  hasMore: boolean;
  isLoading: boolean;
  error: string | null;
  toggleLike: (postId: string) => void;
  addComment: (postId: string, commentText: string) => void;
  editPost: (postId: string, input: { title: string; description: string; designImage: string }) => void;
  deletePost: (postId: string) => void;
  currentUserId: string;
  loadMore: () => void;
  setAiSearch: (query: string | null) => void;
  currentSearchQuery: string | null;
}

const PAGE_SIZE = 10;

export const useFeed = (): UseFeedReturn => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [aiSearchQuery, setAiSearchQuery] = useState<string | null>(null);
  const [currentUserId] = useState<string>(() => {
    return localStorage.getItem('userId') || 'guest-user';
  });

  // Fetch posts from API
  const fetchData = useCallback(
    async (page: number, isAiSearch: boolean = false) => {
      setIsLoading(true);
      setError(null);

      try {
        const response = isAiSearch && aiSearchQuery
          ? await aiSearchPosts(aiSearchQuery, page, PAGE_SIZE)
          : await fetchPosts(page, PAGE_SIZE);

        // Transform backend posts to frontend format
        const transformedPosts = transformPostsFromBackend(response.posts, currentUserId);

        if (page === 1) {
          // First page: replace all posts
          setPosts(transformedPosts);
        } else {
          // Subsequent pages: append to existing posts
          setPosts((prevPosts) => [...prevPosts, ...transformedPosts]);
        }

        setTotalPages(response.meta.pages);
        setCurrentPage(page);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch posts';
        setError(errorMessage);
        console.error('Error fetching posts:', err);
      } finally {
        setIsLoading(false);
      }
    },
    [aiSearchQuery, currentUserId]
  );

  // Initial fetch on mount or when AI search query changes
  useEffect(() => {
    setCurrentPage(1);
    fetchData(1, !!aiSearchQuery);
  }, [aiSearchQuery, fetchData]);

  const hasMore = currentPage < totalPages;

  const visiblePosts = posts;

  const loadMore = useCallback(() => {
    if (!isLoading && hasMore) {
      const nextPage = currentPage + 1;
      fetchData(nextPage, !!aiSearchQuery);
    }
  }, [currentPage, hasMore, isLoading, aiSearchQuery, fetchData]);

  // Toggle like: optimistic update + server sync
  const toggleLike = useCallback(
    async (postId: string) => {
      // Optimistic update
      setPosts((prevPosts) =>
        prevPosts.map((post) => {
          if (post.id !== postId) return post;

          const nextLiked = !post.isLiked;
          const newLikesArray = nextLiked
            ? [...(post.likes || []), currentUserId]
            : (post.likes || []).filter((id) => id !== currentUserId);

          return {
            ...post,
            isLiked: nextLiked,
            likes: newLikesArray,
          };
        })
      );

      // Server sync
      try {
        await toggleLikePost(postId);
      } catch (err) {
        console.error('Failed to toggle like:', err);
        // Revert optimistic update on error
        setPosts((prevPosts) =>
          prevPosts.map((post) => {
            if (post.id !== postId) return post;
            const nextLiked = !post.isLiked;
            const newLikesArray = nextLiked
              ? [...(post.likes || []), currentUserId]
              : (post.likes || []).filter((id) => id !== currentUserId);

            return {
              ...post,
              isLiked: nextLiked,
              likes: newLikesArray,
            };
          })
        );
      }
    },
    [currentUserId]
  );

  // Add comment (client-side only for now, can be extended)
  const addComment = useCallback((postId: string, commentText: string) => {
    const trimmedComment = commentText.trim();
    if (!trimmedComment) return;

    setPosts((prevPosts) =>
      prevPosts.map((post) => {
        if (post.id !== postId) return post;

        const newComment = {
          id: `comment-${Date.now()}-${Math.random().toString(16).slice(2)}`,
          userId: currentUserId,
          username: 'you',
          text: trimmedComment,
          userAvatar: localStorage.getItem('userAvatar') || '',
        };

        return {
          ...post,
          comments: [...(post.comments || []), newComment],
          totalComments: (post.totalComments || 0) + 1,
          commentsCount: (post.commentsCount || 0) + 1,
        };
      })
    );
  }, [currentUserId]);

  // Edit post (placeholder)
  const editPost = useCallback(
    (postId: string, input: { title: string; description: string; designImage: string }) => {
      setPosts((prevPosts) =>
        prevPosts.map((post) => {
          if (post.id !== postId) return post;

          return {
            ...post,
            title: input.title,
            description: input.description,
            designImage: input.designImage,
            text: input.description,
          };
        })
      );
    },
    []
  );

  // Delete post
  const deletePost = useCallback((postId: string) => {
    setPosts((prevPosts) => prevPosts.filter((post) => post.id !== postId));
  }, []);

  const setAiSearch = useCallback((query: string | null) => {
    setAiSearchQuery(query);
  }, []);

  return {
    posts: visiblePosts,
    visiblePosts,
    hasMore,
    isLoading,
    error,
    toggleLike,
    addComment,
    editPost,
    deletePost,
    currentUserId,
    loadMore,
    setAiSearch,
    currentSearchQuery: aiSearchQuery,
  };
};
