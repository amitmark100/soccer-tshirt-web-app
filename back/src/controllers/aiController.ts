import { Request, Response } from 'express';
import { generateFilterFromQuery, buildMongooseFilter } from '../services/aiService';
import Post from '../models/Post';

/**
 * @desc    AI-powered search for posts using natural language query
 * @access  Private (requires authentication)
 * @route   POST /api/post/ai-search
 * @body    { query: string } - Natural language search query
 * @returns { posts: Array, aiReasoning: string } - Filtered posts and AI explanation
 */
export const aiSearch = async (req: Request, res: Response): Promise<void> => {
  try {
    const { query } = req.body;

    // Validate query parameter
    if (!query || typeof query !== 'string' || query.trim().length === 0) {
      res.status(400).json({
        error: 'Query is required and must be a non-empty string',
        posts: [],
        aiReasoning: 'Invalid search query provided.',
      });
      return;
    }

    console.log('[AI Search] Processing query:', query);

    try {
      // Step 1: Use Grok AI to extract search terms and get reasoning
      const searchTerms = await generateFilterFromQuery(query.trim());
      const aiReasoning = searchTerms.reasoning || 'Search completed.';

      console.log('[AI Search] Step 1 complete - extracted terms and reasoning');

      // Step 2: Build MongoDB filter from extracted terms
      const mongoFilter = buildMongooseFilter(searchTerms);

      console.log('[AI Search] Step 2 complete - built MongoDB filter');

      // Step 3: Fetch posts from database
      // Note: User info is already embedded in Post documents via userSubSchema, no need for populate()
      let posts = await Post.find(mongoFilter)
        .sort({ createdAt: -1 })
        .lean();

      console.log(`[AI Search] Step 3 complete - found ${posts.length} posts`);

      // Return results in the required format
      res.status(200).json({
        posts,
        aiReasoning,
      });
    } catch (aiError: any) {
      const errorMessage = aiError instanceof Error ? aiError.message : 'AI processing failed';
      console.error('[AI Search] AI service error:', errorMessage);

      // Return empty results with error explanation in English
      res.status(200).json({
        posts: [],
        aiReasoning: `The search could not be completed: ${errorMessage}. Please try a different search query.`,
      });
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    console.error('[AI Search] Unexpected error:', errorMessage);

    // Return empty results with generic error message
    res.status(500).json({
      posts: [],
      aiReasoning: 'An unexpected error occurred during the search. Please try again later.',
    });
  }
};
