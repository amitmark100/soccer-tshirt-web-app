import { useCallback, useMemo, useState } from 'react';

import { Design, ProfileTab } from '../types';
import { myDesigns, savedDesigns } from '../utils/mockData';

interface UseDesignGridReturn {
  activeTab: ProfileTab;
  displayedDesigns: Design[];
  myDesignCount: number;
  savedDesignCount: number;
  setActiveTab: (tab: ProfileTab) => void;
  toggleLike: (designId: string) => void;
}

export const useDesignGrid = (): UseDesignGridReturn => {
  const [activeTab, setActiveTab] = useState<ProfileTab>('my-designs');
  const [myDesignList, setMyDesignList] = useState<Design[]>(myDesigns);
  const [savedDesignList, setSavedDesignList] = useState<Design[]>(savedDesigns);

  const toggleLikeInList = useCallback((list: Design[], designId: string): Design[] => {
    return list.map((design) => {
      if (design.id !== designId) {
        return design;
      }

      const nextLiked = !design.isLiked;

      return {
        ...design,
        isLiked: nextLiked,
        likes: design.likes + (nextLiked ? 1 : -1)
      };
    });
  }, []);

  const toggleLike = useCallback(
    (designId: string) => {
      setMyDesignList((currentList) => toggleLikeInList(currentList, designId));
      setSavedDesignList((currentList) => toggleLikeInList(currentList, designId));
    },
    [toggleLikeInList]
  );

  const displayedDesigns = useMemo(() => {
    return activeTab === 'my-designs' ? myDesignList : savedDesignList;
  }, [activeTab, myDesignList, savedDesignList]);

  return {
    activeTab,
    displayedDesigns,
    myDesignCount: myDesignList.length,
    savedDesignCount: savedDesignList.length,
    setActiveTab,
    toggleLike
  };
};
