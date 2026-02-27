export interface Comment {
  id: string;
  userId: string;
  username: string;
  text: string;
  userAvatar: string;
}

export interface Post {
  id: string;
  userId: string;
  username: string;
  userAvatar: string;
  isVerified?: boolean;
  timestamp: string;
  designImage: string;
  title: string;
  description: string;
  likes: number;
  isLiked: boolean;
  comments: Comment[];
  totalComments: number;
}

export interface SuggestedUser {
  id: string;
  username: string;
  userAvatar: string;
}

export interface TopRatedUser extends SuggestedUser {
  totalLikes: number;
}

export interface TrendingDesign {
  id: string;
  name: string;
  image: string;
  likes: number;
  comments: number;
}
