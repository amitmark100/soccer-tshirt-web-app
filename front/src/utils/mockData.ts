import { Post, TrendingDesign } from '../types/types';

export const posts: Post[] = [
  {
    id: 'post-1',
    userId: 'user-1',
    username: 'jerseydesigner',
    userAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&q=80',
    isVerified: true,
    timestamp: '2 hours ago',
    designImage: 'https://images.unsplash.com/photo-1596005554384-d293674c91d7?auto=format&fit=crop&w=1200&q=80',
    title: 'New Manchester inspired kit design!',
    description: 'Bold red, black, and white textures with a streetwear edge. #manchester #kitdesign #soccerjersey',
    likes: 2400,
    isLiked: false,
    comments: [
      {
        id: 'comment-1',
        userId: 'user-11',
        username: 'UserA',
        text: 'This is fire! Need this asap.',
        userAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=80&q=80'
      },
      {
        id: 'comment-2',
        userId: 'user-12',
        username: 'UserB',
        text: 'Love the retro vibes! Great work.',
        userAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=80&q=80'
      },
      {
        id: 'comment-3',
        userId: 'user-13',
        username: 'KitScout',
        text: 'The pattern placement is super clean.',
        userAvatar: 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?auto=format&fit=crop&w=80&q=80'
      }
    ],
    totalComments: 284
  },
  {
    id: 'post-2',
    userId: 'user-2',
    username: 'kitcreator',
    userAvatar: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?auto=format&fit=crop&w=80&q=80',
    timestamp: '4 hours ago',
    designImage: 'https://images.unsplash.com/photo-1522778526097-ce0a22ceb253?auto=format&fit=crop&w=1200&q=80',
    title: 'Vintage Brazil vibes',
    description: 'Bringing back the classic look with modern fabric details. #brazil #retrokit #football',
    likes: 1800,
    isLiked: true,
    comments: [
      {
        id: 'comment-4',
        userId: 'user-14',
        username: 'UserC',
        text: 'Classic! This color blocking is perfect.',
        userAvatar: 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?auto=format&fit=crop&w=80&q=80'
      },
      {
        id: 'comment-5',
        userId: 'user-15',
        username: 'UserD',
        text: 'The textures are amazing!',
        userAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=80&q=80'
      },
      {
        id: 'comment-6',
        userId: 'user-16',
        username: 'DesignNerd',
        text: 'Would buy this in a heartbeat.',
        userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=80&q=80'
      }
    ],
    totalComments: 150
  },
  {
    id: 'post-3',
    userId: 'user-3',
    username: 'retrothreads',
    userAvatar: 'https://images.unsplash.com/photo-1615109398623-88346a601842?auto=format&fit=crop&w=80&q=80',
    isVerified: true,
    timestamp: '6 hours ago',
    designImage: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=1200&q=80',
    title: 'Dark away concept',
    description: 'Minimal crest and geometric linework for night matches. #awaykit #concept',
    likes: 975,
    isLiked: false,
    comments: [
      {
        id: 'comment-7',
        userId: 'user-17',
        username: 'StadiumSoul',
        text: 'Need this with gold numbering.',
        userAvatar: 'https://images.unsplash.com/photo-1541532713592-79a0317b6b77?auto=format&fit=crop&w=80&q=80'
      },
      {
        id: 'comment-8',
        userId: 'user-18',
        username: 'PitchMode',
        text: 'Simple and premium, really good.',
        userAvatar: 'https://images.unsplash.com/photo-1547425260-76bcadfb4f2c?auto=format&fit=crop&w=80&q=80'
      }
    ],
    totalComments: 63
  }
];

export const trendingDesigns: TrendingDesign[] = [
  {
    id: 'trend-1',
    name: 'Ajax Third Kit Concept',
    image: 'https://images.unsplash.com/photo-1603342217505-b0a15ec3261c?auto=format&fit=crop&w=300&q=80',
    likes: 2400,
    comments: 284
  },
  {
    id: 'trend-2',
    name: 'Arsenal x Adidas Collab',
    image: 'https://images.unsplash.com/photo-1589487391730-58f20eb2c308?auto=format&fit=crop&w=300&q=80',
    likes: 2100,
    comments: 198
  },
  {
    id: 'trend-3',
    name: 'PSG 2026 Away Kit',
    image: 'https://images.unsplash.com/photo-1577223625816-7546f13df25d?auto=format&fit=crop&w=300&q=80',
    likes: 1950,
    comments: 150
  },
  {
    id: 'trend-4',
    name: 'USA 94 Remix',
    image: 'https://images.unsplash.com/photo-1517466787929-bc90951d0974?auto=format&fit=crop&w=300&q=80',
    likes: 2450,
    comments: 284
  }
];
