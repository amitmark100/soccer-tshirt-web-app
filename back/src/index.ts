import 'dotenv/config';
import express, { Express } from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import https from 'https';
import swaggerUI from 'swagger-ui-express';
import swaggerJsDoc from 'swagger-jsdoc';
import { connect as connectDB } from './config/db';
import postRoutes from './routes/postRoutes';
import authRoutes from './routes/authRoutes';
import commentRoutes from './routes/commentRoutes';

const app: Express = express();

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const frontendOrigin = process.env.FRONTEND_ORIGIN || 'http://localhost:5173';

// Middleware
app.use(
  cors({
    origin: frontendOrigin,
    credentials: true,
  })
);
app.use(express.json());

// Serve uploaded files as static assets
app.use('/uploads', express.static(uploadsDir));

// Swagger Setup
if (process.env.NODE_ENV !== 'production') {
  const swaggerOptions = {
    definition: {
      openapi: '3.0.0',
      info: {
        title: 'Soccer T-Shirts REST API',
        version: '1.0.0',
      },
    },
    apis: ['./src/docs/*.ts'],
  };
  const specs = swaggerJsDoc(swaggerOptions);
  app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(specs));
}

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/post', postRoutes);
app.use('/api/comments', commentRoutes);

// Health check
app.get('/', (_req, res) => {
  res.json({ message: 'Soccer Jersey Store API' });
});

/**
 * פונקציה לאתחול האפליקציה - משמשת גם את הטסטים
 */
export async function initApp() {
  await connectDB();
  return { app };
}

const PORT = process.env.PORT || 5000;
const shouldUseHttps = process.env.USE_HTTPS === 'true';

/**
 * פונקציה להפעלת השרת
 */
async function startServer(): Promise<void> {
  try {
    const { app: initializedApp } = await initApp();

    // אם אנחנו בטסטים, לא פותחים את ה-Listen
    if (process.env.NODE_ENV === 'test') {
      return;
    }

    const keyPath = path.join(__dirname, '../server.key');
    const certPath = path.join(__dirname, '../server.cert');
    const hasSSL = fs.existsSync(keyPath) && fs.existsSync(certPath);

    if (shouldUseHttps && hasSSL) {
      const credentials = { 
        key: fs.readFileSync(keyPath, 'utf8'), 
        cert: fs.readFileSync(certPath, 'utf8') 
      };
      https.createServer(credentials, initializedApp).listen(PORT, () => {
        console.log(`🚀 Server listening on https://localhost:${PORT}`);
      });
    } else {
      if (shouldUseHttps && !hasSSL) {
        console.warn('SSL certificates not found, falling back to HTTP');
      }
      initializedApp.listen(PORT, () => {
        console.log(`🚀 Server listening on http://localhost:${PORT}`);
      });
    }
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// הפעלה אוטומטית של השרת
startServer();

export default app;