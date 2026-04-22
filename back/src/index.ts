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

// Security header middleware for OAuth popup support in HTTPS mode
app.use((_req, res, next) => {
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');
  next();
});

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


export async function initApp() {
  await connectDB();
  return { app };
}


async function startServer(): Promise<void> {
  try {
    const { app: initializedApp } = await initApp();

    if (process.env.NODE_ENV === 'test') {
      return;
    }

    const PORT = process.env.PORT || 5000;

    // Standard HTTP server for non-production environments
    if (process.env.NODE_ENV !== 'production') {
      initializedApp.listen(PORT, () => {
        console.log(`🚀 Development Server ready at http://localhost:${PORT}`);
      });
    } 
    // HTTPS server for production
    else {
      const keyPath = path.join(__dirname, '../server.key');
      const certPath = path.join(__dirname, '../server.cert');

      // Verify SSL certificates exist
      if (!fs.existsSync(keyPath) || !fs.existsSync(certPath)) {
        console.error('❌ SSL certificate files missing!');
        console.error(`Expected files at: ${keyPath} and ${certPath}`);
        console.error('Cannot start HTTPS server in production mode.');
        process.exit(1);
      }

      // Load and create HTTPS server
      const options = {
        key: fs.readFileSync(keyPath),
        cert: fs.readFileSync(certPath)
      };

      https.createServer(options, initializedApp).listen(PORT, () => {
        console.log(`🔒 Production Secure Server ready at https://localhost:${PORT}`);
      });
    }
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

export default app;