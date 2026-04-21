import { motion } from 'framer-motion';
import './ReasoningBox.css';

interface ReasoningBoxProps {
  reasoning?: string;
  isLoading?: boolean;
}

const ReasoningBox = ({ reasoning, isLoading }: ReasoningBoxProps) => {
  if (!reasoning && !isLoading) {
    return null;
  }

  return (
    <motion.div
      className="reasoning-box"
      initial={{ opacity: 0, y: -15, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -15, scale: 0.95 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
    >
      <div className="reasoning-header">
        <span className="reasoning-icon">✨</span>
        <span className="reasoning-title">JerseyAI</span>
      </div>
      <div className="reasoning-content">
        {isLoading ? (
          <motion.div
            className="reasoning-typing"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            JerseyAI מחפש לך את החולצה המושלמת...
          </motion.div>
        ) : (
          <motion.p
            className="reasoning-text"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            {reasoning}
          </motion.p>
        )}
      </div>
    </motion.div>
  );
};

export default ReasoningBox;
