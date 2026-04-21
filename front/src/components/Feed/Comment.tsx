import { Comment as CommentType } from '../../types/types';

interface CommentProps {
  comment: CommentType;
}

const Comment = ({ comment }: CommentProps) => {
  return (
    <div className="feed-comment">
      <img src={comment.userAvatar} alt={comment.username} className="feed-comment-avatar" />
      <div className="feed-comment-body">
        <p className="feed-comment-text">
          <span className="feed-comment-username">{comment.username}</span>{' '}
          {comment.text}
        </p>
        {comment.timestamp ? <span className="feed-comment-time">{comment.timestamp}</span> : null}
      </div>
    </div>
  );
};

export default Comment;
