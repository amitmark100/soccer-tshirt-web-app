import { FaHeart, FaRegHeart } from 'react-icons/fa';
import { FiEye } from 'react-icons/fi';

import { Design } from '../../types';
import { formatCompactCount } from '../../utils/formatters';

interface DesignCardProps {
  design: Design;
  onOpenPreview: (design: Design) => void;
  onToggleLike: (designId: string) => void;
  canManage?: boolean;
  onEdit?: (designId: string) => void;
  onDelete?: (designId: string) => void;
}

const DesignCard = ({ design, onOpenPreview, onToggleLike, canManage = false, onEdit, onDelete }: DesignCardProps) => {
  return (
    <article className="profile-design-card">
      <button type="button" className="profile-preview-trigger" onClick={() => onOpenPreview(design)} aria-label="Open post preview">
        <img src={design.image} alt={design.title} className="profile-design-image" />
      </button>
      {canManage ? (
        <div className="profile-design-actions">
          <button type="button" onClick={() => onEdit?.(design.id)}>
            Edit
          </button>
          <button type="button" className="danger" onClick={() => onDelete?.(design.id)}>
            Delete
          </button>
        </div>
      ) : null}
      <button type="button" className="profile-design-overlay profile-preview-trigger" onClick={() => onOpenPreview(design)} aria-label="Open post preview">
        <h3>{design.title}</h3>
        <p>{design.description}</p>
      </button>
      <div className="profile-design-stats">
        <button
          type="button"
          onClick={() => onToggleLike(design.id)}
          className={`profile-icon-btn ${design.isLiked ? 'active' : ''}`}
          aria-label={design.isLiked ? 'Unlike design' : 'Like design'}
        >
          {design.isLiked ? <FaHeart size={14} /> : <FaRegHeart size={14} />}
          <span>{formatCompactCount(design.likes)}</span>
        </button>
        <div className="profile-icon-btn static">
          <FiEye size={15} />
          <span>{formatCompactCount(design.views)}</span>
        </div>
      </div>
    </article>
  );
};

export default DesignCard;
