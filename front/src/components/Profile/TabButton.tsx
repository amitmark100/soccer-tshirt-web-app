import { ReactNode } from 'react';

interface TabButtonProps {
  isActive: boolean;
  onClick: () => void;
  children: ReactNode;
}

const TabButton = ({ isActive, onClick, children }: TabButtonProps) => {
  return (
    <button
      type="button"
      className={`profile-tab-button ${isActive ? 'active' : ''}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
};

export default TabButton;
