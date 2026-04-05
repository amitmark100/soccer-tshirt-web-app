import apiClient from './apiClient';
import { Post } from '../types/types';

export interface PaginationMeta {
  total: number;
  pages: number;
  currentPage: number;
  pageSize: number;
}

export interface PaginatedResponse {
  posts: Post[];
  meta: PaginationMeta;
}

export interface PostResponse {
  posts: Post[];
  meta: PaginationMeta;
}

/**
 * Fetch posts with pagination
 * @param page - Page number (1-indexed)
 * @param limit - Number of posts per page
 */
export const fetchPosts = async (page: number = 1, limit: number = 10): Promise<PostResponse> => {
  try {
    const response = await apiClient.get('/post', {
      params: { page, limit },
    });
    return response.data;
  } catch (error) {
    console.error('Failed to fetch posts:', error);
    throw error;
  }
};

/**
 * Search posts using AI-generated filters from natural language query
 * @param query - Natural language search query
 * @param page - Page number (1-indexed)
 * @param limit - Number of results per page
 */
export const aiSearchPosts = async (
  query: string,
  page: number = 1,
  limit: number = 10
): Promise<PostResponse> => {
  try {
    const response = await apiClient.post('/post/ai-search', {
      query,
      page,
      limit,
    });
    return response.data;
  } catch (error) {
    console.error('Failed to perform AI search:', error);
    throw error;
  }
};

/**
 * Get a single post by ID
 * @param postId - Post ID
 */
export const getPostById = async (postId: string): Promise<Post> => {
  try {
    const response = await apiClient.get(`/post/${postId}`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch post:', error);
    throw error;
  }
};

/**
 * Toggle like on a post
 * @param postId - Post ID
 */
export const toggleLikePost = async (postId: string): Promise<Post> => {
  try {
    const response = await apiClient.patch(`/post/${postId}/like`);
    return response.data;
  } catch (error) {
    console.error('Failed to toggle like:', error);
    throw error;
  }
};

/**
 * Create a new post
 * @param formData - FormData with title, description, and image
 */
export const createPost = async (formData: FormData): Promise<Post> => {
  try {
    const response = await apiClient.post('/post', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Failed to create post:', error);
    throw error;
  }
};

/**
 * Update a post
 * @param postId - Post ID
 * @param formData - FormData with updated fields
 */
export const updatePost = async (postId: string, formData: FormData): Promise<Post> => {
  try {
    const response = await apiClient.put(`/post/${postId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Failed to update post:', error);
    throw error;
  }
};

/**
 * Delete a post
 * @param postId - Post ID
 */
export const deletePost = async (postId: string): Promise<void> => {
  try {
    await apiClient.delete(`/post/${postId}`);
  } catch (error) {
    console.error('Failed to delete post:', error);
    throw error;
  }
};
