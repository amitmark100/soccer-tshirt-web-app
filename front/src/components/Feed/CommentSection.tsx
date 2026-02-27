import React, { FormEvent, useState } from 'react';

import { Comment as CommentType } from '../../types/types';
import Comment from './Comment';

interface CommentSectionProps {
  postId: string;
  comments: CommentType[];
  totalComments: number;
  onAddComment: (postId: string, commentText: string) => void;
}

const CommentSection: React.FC<CommentSectionProps> = ({
  postId,
  comments,
  totalComments,
  onAddComment
}) => {
  const [commentValue, setCommentValue] = useState<string>('');

  const visibleComments = comments.slice(-3);

  const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    onAddComment(postId, commentValue);
    setCommentValue('');
  };

  return (
    <div className="feed-comment-section">
      <div className="feed-comment-list">
        {visibleComments.map((comment) => (
          <Comment key={comment.id} comment={comment} />
        ))}
      </div>

      <button type="button" className="feed-link-button">
        View all {totalComments} comments
      </button>

      <form className="feed-comment-form" onSubmit={handleSubmit}>
        <input
          type="text"
          value={commentValue}
          onChange={(event) => setCommentValue(event.target.value)}
          placeholder="Comment..."
          className="feed-comment-input"
          aria-label="Add comment"
        />
        <button type="submit" className="feed-post-button" disabled={!commentValue.trim()}>
          Post
        </button>
      </form>
    </div>
  );
};

export default CommentSection;