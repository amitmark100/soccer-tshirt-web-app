import { TrendingDesign } from '../../types/types';

interface TrendingDesignsProps {
  designs: TrendingDesign[];
}

const HeartIcon = () => (
  <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true">
    <path d="M12 21s-6.7-4.4-9.3-8.2C.5 9.6 2 5.7 5.6 4.5c2.2-.8 4.5.1 5.8 1.9 1.3-1.8 3.6-2.7 5.8-1.9 3.6 1.2 5.1 5.1 2.9 8.3C18.7 16.6 12 21 12 21z" />
  </svg>
);

const CommentIcon = () => (
  <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true">
    <path d="M21 11.5C21 6.8 16.7 3 11.5 3S2 6.8 2 11.5 6.3 20 11.5 20c1.5 0 2.9-.3 4.2-.9L21 21l-1.5-4.6c.9-1.4 1.5-3.1 1.5-4.9z" />
  </svg>
);

const formatCompactCount = (count: number): string => {
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1).replace('.0', '')}k`;
  }

  return count.toString();
};

const TrendingDesigns = ({ designs }: TrendingDesignsProps) => {
  return (
    <section className="feed-panel">
      <h2>Trending Designs</h2>

      <div className="feed-trending-grid">
        {designs.map((design) => (
          <article key={design.id} className="feed-trending-card">
            <img src={design.image} alt={design.name} className="feed-trending-image" />
            <h3>{design.name}</h3>
            <div className="feed-trending-stats">
              <span>
                <HeartIcon /> {formatCompactCount(design.likes)}
              </span>
              <span>
                <CommentIcon /> {design.comments}
              </span>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};

export default TrendingDesigns;
