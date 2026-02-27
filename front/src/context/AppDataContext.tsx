import { createContext, ReactNode, useCallback, useContext, useMemo, useState } from 'react';

import { Post } from '../types/types';
import { posts as initialPosts, profileUser } from '../utils/mockData';

interface CreatePostInput {
  title: string;
  description: string;
  designImage: string;
}

interface EditPostInput {
  title: string;
  description: string;
  designImage: string;
}

interface AppDataContextValue {
  currentUserId: string;
  posts: Post[];
  createPost: (input: CreatePostInput) => void;
  toggleLike: (postId: string) => void;
  addComment: (postId: string, commentText: string) => void;
  editPost: (postId: string, input: EditPostInput) => void;
  deletePost: (postId: string) => void;
}

const AppDataContext = createContext<AppDataContextValue | null>(null);

interface AppDataProviderProps {
  children: ReactNode;
}

export const AppDataProvider = ({ children }: AppDataProviderProps) => {
  const [posts, setPosts] = useState<Post[]>(initialPosts);

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
          userAvatar: profileUser.avatar
        };

        return {
          ...post,
          comments: [...post.comments, newComment],
          totalComments: post.totalComments + 1
        };
      });
    });
  }, []);

  const createPost = useCallback((input: CreatePostInput) => {
    const trimmedTitle = input.title.trim();
    const trimmedDescription = input.description.trim();
    const trimmedDesignImage = input.designImage.trim();

    if (!trimmedTitle || !trimmedDescription || !trimmedDesignImage) {
      return;
    }

    const newPost: Post = {
      id: `post-${Date.now()}-${Math.random().toString(16).slice(2)}`,
      userId: profileUser.id,
      username: profileUser.name.toLowerCase().replace(/\s+/g, ''),
      userAvatar: profileUser.avatar,
      isVerified: profileUser.isVerified,
      timestamp: 'Just now',
      designImage: trimmedDesignImage,
      title: trimmedTitle,
      description: trimmedDescription,
      likes: 0,
      isLiked: false,
      comments: [],
      totalComments: 0
    };

    setPosts((currentPosts) => [newPost, ...currentPosts]);
  }, []);

  const editPost = useCallback((postId: string, input: EditPostInput) => {
    const trimmedTitle = input.title.trim();
    const trimmedDescription = input.description.trim();
    const trimmedDesignImage = input.designImage.trim();

    if (!trimmedTitle || !trimmedDescription || !trimmedDesignImage) {
      return;
    }

    setPosts((currentPosts) => {
      return currentPosts.map((post) => {
        if (post.id !== postId) {
          return post;
        }

        return {
          ...post,
          title: trimmedTitle,
          description: trimmedDescription,
          designImage: trimmedDesignImage
        };
      });
    });
  }, []);

  const deletePost = useCallback((postId: string) => {
    setPosts((currentPosts) => currentPosts.filter((post) => post.id !== postId));
  }, []);

  const contextValue = useMemo<AppDataContextValue>(
    () => ({
      currentUserId: profileUser.id,
      posts,
      createPost,
      toggleLike,
      addComment,
      editPost,
      deletePost
    }),
    [posts, createPost, toggleLike, addComment, editPost, deletePost]
  );

  return <AppDataContext.Provider value={contextValue}>{children}</AppDataContext.Provider>;
};

export const useAppData = (): AppDataContextValue => {
  const context = useContext(AppDataContext);

  if (!context) {
    throw new Error('useAppData must be used within AppDataProvider');
  }

  return context;
};
