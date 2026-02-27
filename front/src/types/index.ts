export interface User {
  id: string;
  name: string;
  bio: string;
  location: string;
  joinDate: string;
  avatar: string;
  bannerImage: string;
  isVerified: boolean;
  postsCount: number;
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
}

export interface ProfileProps {
  userId?: string;
}

export type ProfileTab = 'my-designs' | 'saved';
