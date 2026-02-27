import { useMemo, useState } from 'react';

import { ProfileProps, User } from '../types';
import { profileUser } from '../utils/mockData';

interface UseProfileReturn {
  user: User;
  completionPercent: number;
  isProfileComplete: boolean;
  saveProfile: (updates: Pick<User, 'name' | 'bio' | 'location' | 'joinDate'>) => void;
  isEditModalOpen: boolean;
  openEditModal: () => void;
  closeEditModal: () => void;
}

export const useProfile = (_props?: ProfileProps): UseProfileReturn => {
  const [user, setUser] = useState<User>(profileUser);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);

  const completionPercent = useMemo(() => {
    const requiredFields = [user.name, user.bio, user.location, user.joinDate, user.avatar, user.bannerImage];
    const completedFields = requiredFields.filter((field) => field.trim().length > 0).length;

    return Math.round((completedFields / requiredFields.length) * 100);
  }, [user]);

  return {
    user,
    completionPercent,
    isProfileComplete: completionPercent === 100,
    saveProfile: (updates) => {
      setUser((current) => ({
        ...current,
        ...updates
      }));
      setIsEditModalOpen(false);
    },
    isEditModalOpen,
    openEditModal: () => setIsEditModalOpen(true),
    closeEditModal: () => setIsEditModalOpen(false)
  };
};
