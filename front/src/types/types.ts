export interface Comment {
  id: string;
  userId: string;
  username: string;
  text: string;
  userAvatar: string;
}

export interface User {
  _id: string;
  username: string;
  email: string;
  profilePicture?: string;
}

export interface JerseyDetails {
  team: string;
  league: string;
  price: number;
  size: string;
  imageUrl: string;
}

export interface Post {
  _id?: string;
  id: string;
  user: User;
  text: string;
  image?: string;
  jerseyDetails: JerseyDetails;
  likes: string[]; // Array of user IDs
  commentsCount: number;
  createdAt?: string;
  updatedAt?: string;
  // Legacy properties (provided by adapter for backward compatibility)
  userId: string;
  username: string;
  userAvatar: string;
  isVerified?: boolean;
  timestamp: string;
  designImage: string;
  title: string;
  description: string;
  isLiked: boolean;
  totalComments: number;
  comments: Comment[];
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
