import React from 'react';

import { Post as PostType } from '../../types/types';
import CommentSection from './CommentSection';

interface PostProps {
  post: PostType;
  onToggleLike: (postId: string) => void;
  onAddComment: (postId: string, commentText: string) => void;
}

const VerifiedBadge: React.FC = () => (
  <span className="feed-verified-badge" aria-label="Verified account" title="Verified account">
    <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true">
      <path d="M22 12l-2.8 2.2.3 3.6-3.5.9-1.9 3.1L12 20.2l-3.1 1.6-1.9-3.1-3.5-.9.3-3.6L2 12l2.8-2.2-.3-3.6 3.5-.9 1.9-3.1L12 3.8l3.1-1.6 1.9 3.1 3.5.9-.3 3.6L22 12z" />
      <path d="M9.5 12.4l1.6 1.7 3.6-3.8" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  </span>
);

const HeartIcon: React.FC<{ filled?: boolean }> = ({ filled = false }) => (
  <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" className={filled ? 'is-filled' : ''}>
    <path d="M12 21s-6.7-4.4-9.3-8.2C.5 9.6 2 5.7 5.6 4.5c2.2-.8 4.5.1 5.8 1.9 1.3-1.8 3.6-2.7 5.8-1.9 3.6 1.2 5.1 5.1 2.9 8.3C18.7 16.6 12 21 12 21z" />
  </svg>
);

const CommentIcon: React.FC = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
    <path d="M21 11.5C21 6.8 16.7 3 11.5 3S2 6.8 2 11.5 6.3 20 11.5 20c1.5 0 2.9-.3 4.2-.9L21 21l-1.5-4.6c.9-1.4 1.5-3.1 1.5-4.9z" />
  </svg>
);

const formatCompactCount = (count: number): string => {
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1).replace('.0', '')}k`;
  }

  return count.toString();
};

const Post: React.FC<PostProps> = ({ post, onToggleLike, onAddComment }) => {
  return (
    <article className="feed-post-card">
      <header className="feed-post-header">
        <div className="feed-post-user">
          <img src={post.userAvatar} alt={post.username} className="feed-post-avatar" />
          <div className="feed-post-meta">
            <div className="feed-post-username-row">
              <span className="feed-post-username">@{post.username}</span>
              {post.isVerified ? <VerifiedBadge /> : null}
            </div>
            <span className="feed-post-time">{post.timestamp}</span>
          </div>
        </div>
      </header>

      <img src={post.designImage} alt={post.title} className="feed-post-image" />

      <div className="feed-post-stats">
        <button
          type="button"
          className={`feed-stat ${post.isLiked ? 'active' : ''}`}
          onClick={() => onToggleLike(post.id)}
          aria-label={post.isLiked ? 'Unlike post' : 'Like post'}
        >
          <HeartIcon filled={post.isLiked} />
          <span>{formatCompactCount(post.likes)} likes</span>
        </button>

        <div className="feed-stat">
          <CommentIcon />
          <span>{post.totalComments} comments</span>
        </div>
      </div>

      <div className="feed-post-copy">
        <h3>{post.title}</h3>
        <p>{post.description}</p>
      </div>

      <CommentSection
        postId={post.id}
        comments={post.comments}
        totalComments={post.totalComments}
        onAddComment={onAddComment}
      />
    </article>
  );
};

export default Post;