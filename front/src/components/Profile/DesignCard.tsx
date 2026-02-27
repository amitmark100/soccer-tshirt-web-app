import { FaHeart, FaRegHeart } from 'react-icons/fa';
import { FiEye } from 'react-icons/fi';

import { Design } from '../../types';
import { formatCompactCount } from '../../utils/formatters';

interface DesignCardProps {
  design: Design;
  onToggleLike: (designId: string) => void;
}

const DesignCard = ({ design, onToggleLike }: DesignCardProps) => {
  return (
    <article className="profile-design-card">
      <img src={design.image} alt={design.title} className="profile-design-image" />
      <div className="profile-design-overlay">
        <h3>{design.title}</h3>
        <p>{design.description}</p>
      </div>
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
