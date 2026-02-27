import { useMemo, useState } from 'react';

import { ProfileProps, User } from '../types';
import { profileUser } from '../utils/mockData';

interface UseProfileReturn {
  user: User;
  isFollowing: boolean;
  followersCount: number;
  followingCount: number;
  completionPercent: number;
  isProfileComplete: boolean;
  toggleFollow: () => void;
  isEditModalOpen: boolean;
  openEditModal: () => void;
  closeEditModal: () => void;
}

const BASE_FOLLOWERS = 3650;
const BASE_FOLLOWING = 312;

export const useProfile = (_props?: ProfileProps): UseProfileReturn => {
  const [isFollowing, setIsFollowing] = useState<boolean>(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);

  const followersCount = BASE_FOLLOWERS + (isFollowing ? 1 : 0);
  const followingCount = BASE_FOLLOWING;

  const completionPercent = useMemo(() => {
    const requiredFields = [profileUser.name, profileUser.bio, profileUser.location, profileUser.joinDate, profileUser.avatar, profileUser.bannerImage];
    const completedFields = requiredFields.filter((field) => field.trim().length > 0).length;

    return Math.round((completedFields / requiredFields.length) * 100);
  }, []);

  return {
    user: profileUser,
    isFollowing,
    followersCount,
    followingCount,
    completionPercent,
    isProfileComplete: completionPercent === 100,
    toggleFollow: () => setIsFollowing((current) => !current),
    isEditModalOpen,
    openEditModal: () => setIsEditModalOpen(true),
    closeEditModal: () => setIsEditModalOpen(false)
  };
};
