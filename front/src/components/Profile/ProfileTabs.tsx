import { ProfileTab } from '../../types';
import TabButton from './TabButton';

interface ProfileTabsProps {
  activeTab: ProfileTab;
  myDesignCount: number;
  savedDesignCount: number;
  onTabChange: (tab: ProfileTab) => void;
}

const ProfileTabs = ({ activeTab, myDesignCount, savedDesignCount, onTabChange }: ProfileTabsProps) => {
  return (
    <nav className="profile-tabs" aria-label="Design tabs">
      <TabButton isActive={activeTab === 'my-designs'} onClick={() => onTabChange('my-designs')}>
        My Designs <span>{myDesignCount}</span>
      </TabButton>
      <TabButton isActive={activeTab === 'saved'} onClick={() => onTabChange('saved')}>
        Saved <span>{savedDesignCount}</span>
      </TabButton>
    </nav>
  );
};

export default ProfileTabs;
