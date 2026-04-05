import { Request, Response } from 'express';
import { generateFilterFromQuery } from '../services/aiService';
import Post from '../models/Post'; // Assuming Post model is default export

export const aiSearch = async (req: Request, res: Response) => {
    try {
        const { query } = req.body;
        if (!query) {
            return res.status(400).json({ message: 'Query is required' });
        }

        try {
            const filter = await generateFilterFromQuery(query);
            const posts = await Post.find(filter);
            return res.status(200).json(posts);
        } catch (aiError: any) {
            console.error('AI Search service error:', aiError.message);
            return res.status(503).json({ message: 'AI Search is temporarily unavailable' });
        }
    } catch (error) {
        console.error('AI Search error:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};
