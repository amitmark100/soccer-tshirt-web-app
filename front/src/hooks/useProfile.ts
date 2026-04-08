import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { feedQueryKey } from './useFeed';
import { useAPI } from './useAPI';
import { broadcastAuthChange } from '../utils/authCookies';
import { Post } from '../types/types';
import { Design, ProfileProps, User } from '../types';

export const currentUserQueryKey = ['current-user'];
export const userPostsQueryKey = (userId: string) => ['user-posts', userId];

interface UseProfileReturn {
  user: User | null;
  postsCount: number;
  designs: Design[];
  isLoading: boolean;
  errorMessage: string;
  saveProfile: (updates: { name: string; avatar?: File | null }) => Promise<void>;
  togglePostLike: (postId: string) => void;
  editPost: (
    postId: string,
    input: { team: string; league: string; price: number; size: string; description: string }
  ) => void;
  deletePost: (postId: string) => void;
  isEditModalOpen: boolean;
  openEditModal: () => void;
  closeEditModal: () => void;
}

const toProfileUser = (input: {
  id: string;
  username: string;
  email: string;
  profilePicture: string | null;
  createdAt: string;
}): User => ({
  id: input.id,
  name: input.username,
  email: input.email,
  joinDate: input.createdAt,
  avatar: input.profilePicture ? `http://localhost:5000${input.profilePicture}` : '',
  bannerImage: input.profilePicture ? `http://localhost:5000${input.profilePicture}` : '',
  isVerified: false,
});

const toDesign = (post: Post): Design => ({
  id: post.id,
  title: post.title,
  image: post.designImage,
  likes: post.likes,
  views: Math.max(300, post.totalComments * 25 + post.likes * 2),
  isLiked: post.isLiked,
  createdAt: post.timestamp,
  description: post.description,
  team: post.team,
  league: post.league,
  price: post.price,
  size: post.size,
});

export const useProfile = (_props?: ProfileProps): UseProfileReturn => {
  const API = useAPI();
  const queryClient = useQueryClient();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const {
    data: user,
    isLoading: isLoadingUser,
    error: userError,
  } = useQuery({
    queryKey: currentUserQueryKey,
    queryFn: async () => {
      const data = await API.auth.me();
      return toProfileUser(data.user);
    },
  });

  const {
    data: posts = [],
    isLoading: isLoadingPosts,
    error: postsError,
  } = useQuery({
    queryKey: userPostsQueryKey(user?.id || ''),
    queryFn: () => API.post.getUserPosts(user!.id),
    enabled: Boolean(user?.id),
  });

  const refreshProfileData = () => {
    void queryClient.invalidateQueries({ queryKey: currentUserQueryKey });
    void queryClient.invalidateQueries({ queryKey: feedQueryKey });
    if (user?.id) {
      void queryClient.invalidateQueries({ queryKey: userPostsQueryKey(user.id) });
    }
  };

  const updateProfileMutation = useMutation({
    mutationFn: (input: { name: string; avatar?: File | null }) =>
      API.auth.updateProfile(user!.id, {
        username: input.name,
        avatar: input.avatar,
      }),
    onSuccess: () => {
      broadcastAuthChange();
      refreshProfileData();
      setIsEditModalOpen(false);
    },
  });

  const toggleLikeMutation = useMutation({
    mutationFn: API.post.toggleLike,
    onSuccess: refreshProfileData,
  });

  const deletePostMutation = useMutation({
    mutationFn: API.post.delete,
    onSuccess: refreshProfileData,
  });

  const editPostMutation = useMutation({
    mutationFn: API.post.update,
    onSuccess: refreshProfileData,
  });

  const designs = useMemo(() => posts.map(toDesign), [posts]);

  return {
    user: user || null,
    postsCount: posts.length,
    designs,
    isLoading: isLoadingUser || isLoadingPosts,
    errorMessage:
      (userError instanceof Error ? userError.message : '') ||
      (postsError instanceof Error ? postsError.message : ''),
    saveProfile: async (updates) => {
      await updateProfileMutation.mutateAsync(updates);
    },
    togglePostLike: (postId: string) => {
      toggleLikeMutation.mutate(postId);
    },
    editPost: (postId, input) => {
      const post = posts.find((currentPost) => currentPost.id === postId);
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
    isEditModalOpen,
    openEditModal: () => setIsEditModalOpen(true),
    closeEditModal: () => setIsEditModalOpen(false),
  };
};
