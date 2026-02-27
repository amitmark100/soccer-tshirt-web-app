import 'dotenv/config';
import express, { Express } from 'express';
import cors from 'cors';
import { connect as connectDB } from './config/db';
import postRoutes from './routes/postRoutes';
import authRoutes from './routes/authRoutes';
import commentRoutes from './routes/commentRoutes';

const app: Express = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/post', postRoutes);
app.use('/api/comments', commentRoutes);

// Health check
app.get('/', (_req, res) => {
  res.json({ message: 'Soccer Jersey Store API' });
});

const PORT = process.env.PORT || 5000;

// Start server
async function startServer(): Promise<void> {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`Server listening on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
