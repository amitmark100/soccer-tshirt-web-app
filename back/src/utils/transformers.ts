import { IPost } from '../models/Post';

export interface FrontendPost {
  id: string;
  userId: string;
  username: string;
  userAvatar: string;
  isVerified?: boolean;
  timestamp: string;
  designImage: string;
  title: string;
  team?: string;
  league?: string;
  price?: number;
  size?: string;
  likes: number;
  isLiked: boolean;
  comments: any[];
  totalComments: number;
}

export const transformPostToFrontend = (post: any): FrontendPost => {
  const postObj = post.toObject?.() || post;
  const userData = postObj.user;

  // לוג לבדיקה - תראה את זה בטרמינל של ה-BACK
  if (!postObj._id) console.log("⚠️ WARNING: Post missing _id in transformer");

  return {
    id: postObj._id?.toString() || postObj.id || '',
    userId: userData?._id?.toString() || '',
    username: userData?.username || 'User',
    userAvatar: userData?.profilePicture || '', 
    isVerified: postObj.isVerified || false,
    timestamp: postObj.createdAt?.toString() || new Date().toISOString(),
    // ניסיון לשלוף מכל שדה אפשרי כדי שהתמונה לא תיעלם
    designImage: postObj.image || postObj.designImage || postObj.imageUrl || '', 
    title: postObj.text || postObj.title || '',
    team: postObj.jerseyDetails?.team || '',
    league: postObj.jerseyDetails?.league || '',
    price: postObj.jerseyDetails?.price || 0,
    size: postObj.jerseyDetails?.size || '',
    likes: Array.isArray(postObj.likes) ? postObj.likes.length : 0,
    isLiked: false, 
    comments: [],
    totalComments: postObj.commentsCount || 0,
  };
};

export const transformPostsToFrontend = (posts: any[]): FrontendPost[] => {
  if (!Array.isArray(posts)) return [];
  return posts.map(transformPostToFrontend);
};