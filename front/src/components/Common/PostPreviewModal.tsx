import { formatCompactCount } from '../../utils/formatters';
import '../../styles/PostPreviewModal.css';

interface PostPreviewModalProps {
  isOpen: boolean;
  title: string;
  description: string;
  image: string;
  creatorLabel: string;
  timestamp: string;
  likes: number;
  secondaryMetricLabel: string;
  secondaryMetricValue: number;
  onClose: () => void;
}

const PostPreviewModal = ({
  isOpen,
  title,
  description,
  image,
  creatorLabel,
  timestamp,
  likes,
  secondaryMetricLabel,
  secondaryMetricValue,
  onClose
}: PostPreviewModalProps) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="post-preview-backdrop" role="dialog" aria-modal="true" aria-label="Post preview">
      <div className="post-preview-modal">
        <button type="button" className="post-preview-close" onClick={onClose} aria-label="Close preview">
          x
        </button>
        <div className="post-preview-media-wrap">
          <img src={image} alt={title} className="post-preview-image" />
        </div>
        <div className="post-preview-content">
          <p className="post-preview-meta">
            {creatorLabel} • {timestamp}
          </p>
          <h2>{title}</h2>
          <p className="post-preview-description">{description}</p>
          <div className="post-preview-stats">
            <span>{formatCompactCount(likes)} likes</span>
            <span>
              {formatCompactCount(secondaryMetricValue)} {secondaryMetricLabel}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostPreviewModal;
