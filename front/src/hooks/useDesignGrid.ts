import { useCallback, useState } from 'react';

import { Design } from '../types';
import { myDesigns } from '../utils/mockData';

interface UseDesignGridReturn {
  designs: Design[];
  myDesignCount: number;
  toggleLike: (designId: string) => void;
}

export const useDesignGrid = (): UseDesignGridReturn => {
  const [myDesignList, setMyDesignList] = useState<Design[]>(myDesigns);

  const toggleLike = useCallback((designId: string) => {
    setMyDesignList((currentList) => {
      return currentList.map((design) => {
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
    });
  }, []);

  return {
    designs: myDesignList,
    myDesignCount: myDesignList.length,
    toggleLike
  };
};
