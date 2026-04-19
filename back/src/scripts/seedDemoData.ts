import 'dotenv/config';
import bcrypt from 'bcryptjs';
import mongoose, { Types } from 'mongoose';
import { connect } from '../config/db';
import User from '../models/User';
import Post from '../models/Post';
import Comment from '../models/Comment';

const SEEDED_EMAIL_DOMAIN = 'seed.soccer-store.local';
const TOTAL_USERS = 100;
const POSTS_PER_USER = 20;
const PASSWORD = 'SeedPass123!';

const avatarUrls = [
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1527980965255-d3b416303d12?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1615109398623-88346a601842?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1633332755192-727a05c4013d?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?auto=format&fit=crop&w=300&q=80',
];

const jerseyImageUrls = [
  'https://images.unsplash.com/photo-1596005554384-d293674c91d7?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1522778526097-ce0a22ceb253?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1603342217505-b0a15ec3261c?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1577223625816-7546f13df25d?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1589487391730-58f20eb2c308?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1517466787929-bc90951d0974?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1560272564-c83b66b1ad12?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1606923829579-0cb981a83e2d?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1200&q=80',
];

const firstNames = [
  'Alex', 'Jordan', 'Noah', 'Liam', 'Maya', 'Sofia', 'Ava', 'Leo', 'Eli', 'Mila',
  'Owen', 'Nina', 'Zoe', 'Kai', 'Mason', 'Ruby', 'Mia', 'Lucas', 'Eden', 'Amir',
];

const lastNames = [
  'Martinez', 'Silva', 'Cohen', 'Levy', 'Kim', 'Costa', 'Santos', 'Walker', 'Rossi',
  'Mendes', 'Parker', 'Nguyen', 'Lopez', 'Brown', 'Ali', 'Singh', 'Taylor', 'Reyes',
];

const teams = [
  'Arsenal', 'Barcelona', 'Bayern', 'Chelsea', 'Dortmund', 'Inter', 'Juventus', 'Liverpool',
  'Milan', 'Napoli', 'PSG', 'Real Madrid', 'Roma', 'Tottenham', 'Ajax', 'Benfica',
  'Celtic', 'Galatasaray', 'Marseille', 'Atletico Madrid',
];

const leagues = [
  'Premier League', 'La Liga', 'Bundesliga', 'Serie A', 'Ligue 1', 'Champions League',
  'Europa League', 'MLS', 'Eredivisie', 'Primeira Liga',
];

const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'] as const;

const postOpeners = [
  'Retro-inspired concept', 'Streetwear crossover', 'Clean home look', 'Bold away concept',
  'Matchday-ready design', 'Cup edition concept', 'Third kit experiment', 'Minimal crest study',
];

const postDetails = [
  'with tonal striping and premium collar trim.',
  'built around vintage color blocking and modern fabric texture.',
  'featuring sharp sleeve accents and a simplified sponsor lockup.',
  'with subtle geometric overlays for a night-match feel.',
  'mixing heritage identity with a cleaner contemporary silhouette.',
  'with a monochrome base and a brighter secondary accent.',
];

const commentStarts = [
  'Love the', 'This nailed the', 'Really into the', 'Strong use of', 'The best part is the',
  'Can definitely see the', 'This would look great with', 'Huge fan of the',
];

const commentEnds = [
  'color balance.', 'retro energy.', 'sleeve detailing.', 'crest treatment.',
  'fabric texture.', 'overall silhouette.', 'matchday vibe.', 'away-kit feel.',
];

const pickRandom = <T>(items: T[]): T => {
  return items[Math.floor(Math.random() * items.length)];
};

const randomInt = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

const shuffle = <T>(items: T[]): T[] => {
  const next = [...items];

  for (let index = next.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [next[index], next[swapIndex]] = [next[swapIndex], next[index]];
  }

  return next;
};

const createRandomDateWithinDays = (daysBack: number): Date => {
  const now = Date.now();
  const maxOffset = daysBack * 24 * 60 * 60 * 1000;
  return new Date(now - Math.floor(Math.random() * maxOffset));
};

const createUsername = (index: number): string => {
  const first = firstNames[index % firstNames.length].toLowerCase();
  const last = lastNames[index % lastNames.length].toLowerCase();
  return `${first}${last}${String(index + 1).padStart(3, '0')}`;
};

const createEmail = (index: number): string => {
  return `seed.user${String(index + 1).padStart(3, '0')}@${SEEDED_EMAIL_DOMAIN}`;
};

const createPostText = (team: string, league: string): string => {
  return `${pickRandom(postOpeners)} for ${team} in the ${league}, ${pickRandom(postDetails)}`;
};

const createCommentText = (): string => {
  return `${pickRandom(commentStarts)} ${pickRandom([
    'layout',
    'palette',
    'striping',
    'collar',
    'badge placement',
    'contrast',
    'typography',
  ])} ${pickRandom(commentEnds)}`;
};

const getLogicalLikesCount = (authorPopularity: number): number => {
  const rawScore = authorPopularity + Math.random() * 0.8;

  if (rawScore > 1.45) {
    return randomInt(45, 88);
  }

  if (rawScore > 1.05) {
    return randomInt(24, 52);
  }

  if (rawScore > 0.65) {
    return randomInt(10, 28);
  }

  return randomInt(0, 14);
};

const getLogicalCommentsCount = (likesCount: number): number => {
  if (likesCount === 0) {
    return randomInt(0, 2);
  }

  const maxComments = Math.max(3, Math.floor(likesCount * 0.35));
  const minComments = Math.min(maxComments, Math.floor(likesCount * 0.08));
  return randomInt(minComments, maxComments);
};

interface SeedCommentDocument {
  postId: Types.ObjectId;
  author: {
    _id: Types.ObjectId;
    username: string;
    profilePicture: string | null;
  };
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

const main = async (): Promise<void> => {
  await connect();

  try {
    const existingSeedUsers = await User.find({
      email: { $regex: `@${SEEDED_EMAIL_DOMAIN.replace('.', '\\.')}$`, $options: 'i' },
    }).select('_id');

    if (existingSeedUsers.length > 0) {
      const existingUserIds = existingSeedUsers.map((user) => user._id);
      const existingPosts = await Post.find({ 'user._id': { $in: existingUserIds } }).select('_id');
      const existingPostIds = existingPosts.map((post) => post._id);

      await Comment.deleteMany({
        $or: [
          { postId: { $in: existingPostIds } },
          { 'author._id': { $in: existingUserIds } },
        ],
      });
      await Post.deleteMany({ 'user._id': { $in: existingUserIds } });
      await User.deleteMany({ _id: { $in: existingUserIds } });
    }

    const hashedPassword = await bcrypt.hash(PASSWORD, 10);

    const userDocs = Array.from({ length: TOTAL_USERS }, (_, index) => ({
      username: createUsername(index),
      email: createEmail(index),
      password: hashedPassword,
      profilePicture: avatarUrls[index % avatarUrls.length],
      refreshTokens: [],
      likedPosts: [] as Types.ObjectId[],
    }));

    const users = await User.insertMany(userDocs);
    const likedPostsByUserId = new Map<string, Types.ObjectId[]>();
    users.forEach((user) => likedPostsByUserId.set(user._id.toString(), []));

    const postDocs = [];
    const postMeta: Array<{
      commentsCount: number;
      createdAt: Date;
    }> = [];

    for (let userIndex = 0; userIndex < users.length; userIndex += 1) {
      const user = users[userIndex];
      const authorPopularity = 0.35 + Math.random();

      for (let postIndex = 0; postIndex < POSTS_PER_USER; postIndex += 1) {
        const team = pickRandom(teams);
        const league = pickRandom(leagues);
        const imageUrl = pickRandom(jerseyImageUrls);
        const likesCount = Math.min(users.length - 1, getLogicalLikesCount(authorPopularity));
        const commentsCount = getLogicalCommentsCount(likesCount);
        const availableLikerIds = users
          .filter((candidate) => candidate._id.toString() !== user._id.toString())
          .map((candidate) => candidate._id);
        const selectedLikes = shuffle(availableLikerIds).slice(0, likesCount);
        const createdAt = createRandomDateWithinDays(120);

        postDocs.push({
          user: {
            _id: user._id,
            username: user.username,
            profilePicture: user.profilePicture,
          },
          text: createPostText(team, league),
          image: imageUrl,
          jerseyDetails: {
            team,
            league,
            price: randomInt(55, 145),
            size: pickRandom([...sizes]),
            imageUrl,
          },
          likes: selectedLikes,
          commentsCount,
          createdAt,
          updatedAt: createdAt,
        });

        postMeta.push({
          commentsCount,
          createdAt,
        });
      }
    }

    const insertedPosts = await Post.insertMany(postDocs);

    insertedPosts.forEach((post) => {
      const likerIds = post.likes as Types.ObjectId[];
      likerIds.forEach((likerId) => {
        likedPostsByUserId.get(likerId.toString())?.push(post._id);
      });
    });

    await Promise.all(
      users.map((user) =>
        User.updateOne(
          { _id: user._id },
          { $set: { likedPosts: likedPostsByUserId.get(user._id.toString()) || [] } }
        )
      )
    );

    const commentDocs: SeedCommentDocument[] = [];

    insertedPosts.forEach((post, index) => {
      const commentsCount = postMeta[index].commentsCount;
      if (commentsCount === 0) {
        return;
      }

      const authorId = post.user._id.toString();
      const availableCommenters = users.filter(
        (candidate) => candidate._id.toString() !== authorId
      );

      for (let commentIndex = 0; commentIndex < commentsCount; commentIndex += 1) {
        const commenter = pickRandom(availableCommenters);
        const createdAt = new Date(
          postMeta[index].createdAt.getTime() + randomInt(1, 14) * 60 * 60 * 1000
        );

        commentDocs.push({
          postId: post._id,
          author: {
            _id: commenter._id,
            username: commenter.username,
            profilePicture: commenter.profilePicture,
          },
          content: createCommentText(),
          createdAt,
          updatedAt: createdAt,
        });
      }
    });

    await Comment.insertMany(commentDocs);

    const topTrending = insertedPosts
      .map((post) => ({
        id: post._id.toString(),
        title: `${post.jerseyDetails.team} ${post.jerseyDetails.league}`,
        likes: post.likes.length,
        comments: post.commentsCount,
        score: post.likes.length + post.commentsCount,
      }))
      .sort((left, right) => {
        if (right.score !== left.score) {
          return right.score - left.score;
        }

        if (right.likes !== left.likes) {
          return right.likes - left.likes;
        }

        if (right.comments !== left.comments) {
          return right.comments - left.comments;
        }

        return right.id.localeCompare(left.id);
      })
      .slice(0, 4);

    console.log(`Seeded ${users.length} users`);
    console.log(`Seeded ${insertedPosts.length} posts`);
    console.log(`Seeded ${commentDocs.length} comments`);
    console.log('Trending validation: top 4 posts by likes + comments');
    topTrending.forEach((post, index) => {
      console.log(
        `${index + 1}. ${post.title} | score=${post.score} | likes=${post.likes} | comments=${post.comments}`
      );
    });
  } finally {
    await mongoose.disconnect();
  }
};

void main().catch((error) => {
  const errorMessage = error instanceof Error ? error.message : String(error);
  console.error('Seed failed:', errorMessage);
  process.exit(1);
});
