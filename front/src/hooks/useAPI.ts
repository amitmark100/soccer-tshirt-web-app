import { useMemo } from 'react';

import { Post, Comment } from '../types/types';
import { getAuthUser } from '../utils/authCookies';
import { posts as mockPosts } from '../utils/mockData';

const BACKEND_URL = 'http://localhost:5000';
const FEED_FETCH_LIMIT = 5000;

interface BackendComment {
  _id: string;
  postId: string;
  content: string;
  author: {
    _id: string;
    username: string;
    profilePicture: string | null;
  };
}

interface BackendPost {
  _id: string;
  text: string;
  image: string | null;
  createdAt: string;
  commentsCount: number;
  likes: string[];
  user: {
    _id: string;
    username: string;
    profilePicture: string | null;
  };
  jerseyDetails: {
    team: string;
    league: string;
    price: number;
    size: string;
    imageUrl: string;
  };
}

interface PostsResponse {
  posts: BackendPost[];
}

interface CurrentUserResponse {
  user: {
    id: string;
    username: string;
    email: string;
    profilePicture: string | null;
    createdAt: string;
  };
}

const toAbsoluteUrl = (value: string | null | undefined) => {
  if (!value) {
    return '';
  }

  return value.startsWith('http') ? value : `${BACKEND_URL}${value}`;
};

const formatTimestamp = (value: string) => {
  const postDate = new Date(value);
  const diffMs = Date.now() - postDate.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));

  if (diffMinutes < 1) {
    return 'Just now';
  }

  if (diffMinutes < 60) {
    return `${diffMinutes} minute${diffMinutes === 1 ? '' : 's'} ago`;
  }

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) {
    return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
  }

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) {
    return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;
  }

  return postDate.toLocaleDateString();
};

const tokenizePrompt = (value: string) => {
  return value
    .toLowerCase()
    .split(/[^a-z0-9]+/i)
    .map((token) => token.trim())
    .filter((token) => token.length > 2);
};

const scoreMockPost = (post: Post, promptTokens: string[]) => {
  const searchableFields = [
    post.title,
    post.description,
    post.username,
    post.team || '',
    post.league || '',
  ];

  const haystack = searchableFields.join(' ').toLowerCase();
  let score = 0;
  const matchedTerms: string[] = [];

  for (const token of promptTokens) {
    if (haystack.includes(token)) {
      score += 1;
      matchedTerms.push(token);
    }
  }

  return {
    score,
    matchedTerms,
  };
};

const runMockSmartSearch = async (
  userPrompt: string
): Promise<{ reasoning: string; posts: Post[] }> => {
  const trimmedPrompt = userPrompt.trim();

  if (!trimmedPrompt) {
    return {
      reasoning: 'No prompt was provided, so there are no relevant mock results to rank.',
      posts: [],
    };
  }

  const promptTokens = tokenizePrompt(trimmedPrompt);
  const scoredPosts = mockPosts
    .map((post) => {
      const { score, matchedTerms } = scoreMockPost(post, promptTokens);

      return {
        post,
        score,
        matchedTerms,
      };
    })
    .filter((entry) => entry.score > 0)
    .sort((left, right) => right.score - left.score || right.post.likes - left.post.likes);

  const matchedPosts = scoredPosts.map((entry) => entry.post);
  const topMatches = scoredPosts.slice(0, 3);
  const matchedKeywords = Array.from(
    new Set(topMatches.flatMap((entry) => entry.matchedTerms))
  ).slice(0, 6);

  const reasoning =
    matchedPosts.length > 0
      ? `Mock smart search matched ${matchedPosts.length} post${matchedPosts.length === 1 ? '' : 's'} for "${trimmedPrompt}" by checking each post title, description, and creator for relevant keywords. Top signals: ${matchedKeywords.join(', ')}. Results are ranked by keyword overlap first and likes second.`
      : `Mock smart search found no relevant posts for "${trimmedPrompt}". It currently checks only local mock feed content using keyword overlap in the title, description, and creator fields.`;

  return {
    reasoning,
    posts: matchedPosts,
  };
};

const mapComment = (comment: BackendComment): Comment => ({
  id: comment._id,
  userId: comment.author._id,
  username: comment.author.username,
  text: comment.content,
  userAvatar:
    toAbsoluteUrl(comment.author.profilePicture) ||
    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&q=80',
});

const mapBackendPostToFeedPost = (
  post: BackendPost,
  comments: BackendComment[] = []
): Post => {
  const authUser = getAuthUser();
  const currentUserAvatar =
    authUser?.id === post.user._id ? toAbsoluteUrl(authUser.profilePicture) : '';

  return {
    id: post._id,
    userId: post.user._id,
    username: post.user.username,
    userAvatar:
      currentUserAvatar ||
      toAbsoluteUrl(post.user.profilePicture) ||
      'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&q=80',
    timestamp: formatTimestamp(post.createdAt),
    designImage: toAbsoluteUrl(post.image || post.jerseyDetails.imageUrl),
    imagePath: post.image || post.jerseyDetails.imageUrl,
    title: `${post.jerseyDetails.team} ${post.jerseyDetails.league}`,
    description: post.text,
    team: post.jerseyDetails.team,
    league: post.jerseyDetails.league,
    price: post.jerseyDetails.price,
    size: post.jerseyDetails.size,
    likes: post.likes.length,
    isLiked: Boolean(authUser && post.likes.some((likeUserId) => likeUserId === authUser.id)),
    comments: comments.map(mapComment),
    totalComments: post.commentsCount,
  };
};

export const useAPI = () => {
  return useMemo(() => {
    const request = async <T>(path: string, init?: RequestInit): Promise<T> => {
      const isFormData = init?.body instanceof FormData;
      const headers = new Headers(init?.headers);

      if (!isFormData && init?.body && !headers.has('Content-Type')) {
        headers.set('Content-Type', 'application/json');
      }

      const response = await fetch(`${BACKEND_URL}${path}`, {
        credentials: 'include',
        ...init,
        headers,
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.error || data?.msg || 'Request failed');
      }

      return data as T;
    };

    return {
      auth: {
        register: (payload: { username: string; email: string; password: string }) =>
          request<{ msg: string; user: { id: string; username: string; email: string } }>(
            '/api/auth/register',
            {
              method: 'POST',
              body: JSON.stringify(payload),
            }
          ),
        login: (payload: { email: string; password: string }) =>
          request<{ msg: string; user: { id: string; username: string; email: string } }>(
            '/api/auth/login',
            {
              method: 'POST',
              body: JSON.stringify(payload),
            }
          ),
        me: () => request<CurrentUserResponse>('/api/auth/me'),
        updateProfile: (userId: string, payload: { username: string; avatar?: File | null }) => {
          const formData = new FormData();
          formData.append('username', payload.username);
          if (payload.avatar) {
            formData.append('avatar', payload.avatar);
          }

          return request<CurrentUserResponse>('/api/auth/user/' + userId, {
            method: 'PUT',
            body: formData,
          });
        },
        logout: () =>
          request<{ msg: string }>('/api/auth/logout', {
            method: 'POST',
          }),
      },
      post: {
        getFeedPosts: async (): Promise<Post[]> => {
          const [postsData, commentsData] = await Promise.all([
            request<PostsResponse>(`/api/post?limit=${FEED_FETCH_LIMIT}`),
            request<BackendComment[]>('/api/comments'),
          ]);

          const commentsByPost = new Map<string, BackendComment[]>();
          for (const comment of commentsData) {
            const existing = commentsByPost.get(comment.postId) || [];
            existing.push(comment);
            commentsByPost.set(comment.postId, existing);
          }

          return postsData.posts.map((post) =>
            mapBackendPostToFeedPost(post, commentsByPost.get(post._id) || [])
          );
        },
        create: (formData: FormData) =>
          request<BackendPost>('/api/post', {
            method: 'POST',
            body: formData,
          }),
        getUserPosts: async (userId: string): Promise<Post[]> => {
          const [postsData, commentsData] = await Promise.all([
            request<PostsResponse>(
              `/api/post?userId=${encodeURIComponent(userId)}&limit=${FEED_FETCH_LIMIT}`
            ),
            request<BackendComment[]>('/api/comments'),
          ]);

          const commentsByPost = new Map<string, BackendComment[]>();
          for (const comment of commentsData) {
            const existing = commentsByPost.get(comment.postId) || [];
            existing.push(comment);
            commentsByPost.set(comment.postId, existing);
          }

          return postsData.posts.map((post) =>
            mapBackendPostToFeedPost(post, commentsByPost.get(post._id) || [])
          );
        },
        toggleLike: (postId: string) =>
          request<BackendPost>(`/api/post/${postId}/like`, {
            method: 'PATCH',
          }),
        update: (post: Post) =>
          request<BackendPost>(`/api/post/${post.id}`, {
            method: 'PUT',
            body: JSON.stringify({
              text: post.description,
              image: post.imagePath || '',
              jerseyDetails: {
                team: post.team,
                league: post.league,
                price: post.price,
                size: post.size,
                imageUrl: post.imagePath || '',
              },
            }),
          }),
        delete: (postId: string) =>
          request<{ msg: string }>(`/api/post/${postId}`, {
            method: 'DELETE',
          }),
        smartSearch: (userPrompt: string): Promise<{ reasoning: string; posts: Post[] }> =>
          runMockSmartSearch(userPrompt),
        mapToFeedPost: mapBackendPostToFeedPost,
      },
      comment: {
        create: (payload: { postId: string; content: string }) =>
          request<BackendComment>('/api/comments', {
            method: 'POST',
            body: JSON.stringify(payload),
          }),
      },
    };
  }, []);
};
