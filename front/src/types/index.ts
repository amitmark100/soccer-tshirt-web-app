export interface User {
  id: string;
  name: string;
  email: string;
  joinDate: string;
  avatar: string;
  bannerImage: string;
  isVerified?: boolean;
  bio?: string;
  location?: string;
  postsCount?: number;
}

export interface Design {
  id: string;
  title: string;
  image: string;
  likes: number;
  views: number;
  isLiked: boolean;
  createdAt: string;
  description: string;
  team?: string;
  league?: string;
  price?: number;
  size?: string;
}

export interface ProfileProps {
  userId?: string;
}

export type ProfileTab = 'my-designs' | 'saved';
