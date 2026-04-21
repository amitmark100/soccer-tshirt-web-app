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

export async function initApp() {
  await connectDB();

  const app: Express = express();

  const uploadsDir = path.join(__dirname, '../uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  const frontendOrigin = process.env.FRONTEND_ORIGIN || 'http://localhost:5173';

  app.use(
    cors({
      origin: frontendOrigin,
      credentials: true,
    })
  );
  app.use(express.json());
  app.use('/uploads', express.static(uploadsDir));

  if (process.env.NODE_ENV !== 'production') {
    const swaggerOptions = {
      definition: {
        openapi: '3.0.0',
        info: {
          title: 'Soccer T-Shirts REST API',
          version: '1.0.0',
        },
        servers: [
          {
            url: `http://localhost:${process.env.PORT || 5000}`,
          },
        ],
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

  app.get('/', (_req, res) => {
    res.json({ message: 'Soccer Jersey Store API' });
  });

  const PORT = process.env.PORT || 5000;
  const shouldUseHttps = process.env.USE_HTTPS === 'true';

  let server: any;

  if (process.env.NODE_ENV !== 'test') {
    if (shouldUseHttps) {
      const keyPath = path.join(__dirname, '../server.key');
      const certPath = path.join(__dirname, '../server.cert');
      const hasSSL = fs.existsSync(keyPath) && fs.existsSync(certPath);

      if (hasSSL) {
        const credentials = { 
          key: fs.readFileSync(keyPath, 'utf8'), 
          cert: fs.readFileSync(certPath, 'utf8') 
        };
        server = https.createServer(credentials, app).listen(PORT);
      } else {
        server = app.listen(PORT);
      }
    } else {
      server = app.listen(PORT);
    }
  } else {
    server = { close: (cb: any) => cb && cb() };
  }

  return { app, server };
}

const startServer = async () => {
  if (process.env.NODE_ENV !== 'test') {
    try {
      await initApp();
    } catch (error) {
      console.error('Failed to start server:', error);
    }
  }
};

startServer();