import { Design } from '../../types';
import DesignCard from './DesignCard';

interface DesignGridProps {
  designs: Design[];
  onToggleLike: (designId: string) => void;
  canManageDesign?: (designId: string) => boolean;
  onEditDesign?: (designId: string) => void;
  onDeleteDesign?: (designId: string) => void;
}

const DesignGrid = ({ designs, onToggleLike, canManageDesign, onEditDesign, onDeleteDesign }: DesignGridProps) => {
  return (
    <section className="profile-design-grid-wrap">
      <div className="profile-design-grid">
        {designs.map((design) => (
          <DesignCard
            key={design.id}
            design={design}
            onToggleLike={onToggleLike}
            canManage={canManageDesign ? canManageDesign(design.id) : false}
            onEdit={onEditDesign}
            onDelete={onDeleteDesign}
          />
        ))}
      </div>
      {designs.length === 0 ? (
        <p className="profile-empty-state">No designs available in this tab yet.</p>
      ) : null}
    </section>
  );
};

export default DesignGrid;
