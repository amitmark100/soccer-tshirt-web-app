import { Post } from '../types/types';

/**
 * Transforms backend post format to frontend display format
 * Maps MongoDB document to legacy UI component expectations
 */
export const transformPostFromBackend = (backendPost: any, currentUserId?: string): Post => {
  const postId = backendPost._id?.toString() || backendPost.id || '';
  const createdAt = new Date(backendPost.createdAt);
  const now = new Date();
  const diffMs = now.getTime() - createdAt.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  let timestamp = 'Just now';
  if (diffMins > 0) timestamp = `${diffMins}m ago`;
  if (diffHours > 0) timestamp = `${diffHours}h ago`;
  if (diffDays > 0) timestamp = `${diffDays}d ago`;

  const likedByCurrentUser = currentUserId ? backendPost.likes?.includes(currentUserId) : false;

  // Fix image URLs - prefix with API base URL if relative path
  const fixImageUrl = (imageUrl?: string): string => {
    if (!imageUrl) return 'https://via.placeholder.com/400?text=No+Image';
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
      return imageUrl; // Already absolute URL
    }
    // Relative path - prefix with API base URL
    const apiUrl = (import.meta as any).env.VITE_API_BASE_URL || 'https://localhost:5000/api';
    const baseUrl = apiUrl.replace('/api', ''); // Remove /api suffix
    return `${baseUrl}${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`;
  };

  return {
    _id: postId,
    id: postId,
    user: backendPost.user,
    text: backendPost.text || '',
    image: backendPost.image,
    jerseyDetails: backendPost.jerseyDetails,
    likes: backendPost.likes || [],
    commentsCount: backendPost.commentsCount || 0,
    createdAt: backendPost.createdAt,
    updatedAt: backendPost.updatedAt,
    // Legacy properties for backward compatibility
    userId: backendPost.user?._id?.toString() || '',
    username: backendPost.user?.username || 'Unknown',
    userAvatar: fixImageUrl(backendPost.user?.profilePicture) || 'https://via.placeholder.com/40',
    timestamp,
    designImage: fixImageUrl(backendPost.image || backendPost.jerseyDetails?.imageUrl),
    title: backendPost.jerseyDetails?.team || 'Jersey Design',
    description: backendPost.text || '',
    isLiked: likedByCurrentUser,
    totalComments: backendPost.commentsCount || 0,
    comments: [], // Comments would need separate API call
  };
};

/**
 * Transform multiple backend posts
 */
export const transformPostsFromBackend = (backendPosts: any[], currentUserId?: string): Post[] => {
  return backendPosts.map((post) => transformPostFromBackend(post, currentUserId));
};

/**
 * Format displayed time string
 */
export const getTimeAgo = (date: Date | string): string => {
  const createdAt = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - createdAt.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  const diffWeeks = Math.floor(diffMs / 604800000);

  if (diffMins === 0) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffWeeks < 4) return `${diffWeeks}w ago`;

  return createdAt.toLocaleDateString();
};
