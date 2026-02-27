import React from 'react';

import { Comment as CommentType } from '../../types/types';

interface CommentProps {
  comment: CommentType;
}

const Comment: React.FC<CommentProps> = ({ comment }) => {
  return (
    <div className="feed-comment">
      <img src={comment.userAvatar} alt={comment.username} className="feed-comment-avatar" />
      <p className="feed-comment-text">
        <span className="feed-comment-username">{comment.username}</span>{' '}
        {comment.text}
      </p>
    </div>
  );
};

export default Comment;