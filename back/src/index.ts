import 'dotenv/config';
import express, { Express } from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import https from 'https';
import { connect as connectDB } from './config/db';
import postRoutes from './routes/postRoutes';
import authRoutes from './routes/authRoutes';
import commentRoutes from './routes/commentRoutes';

const app: Express = express();

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('Created uploads directory:', uploadsDir);
}

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());

// Serve uploaded files as static assets
app.use('/uploads', express.static(uploadsDir));

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

    // Check for SSL certificate files for HTTPS
    const keyPath = path.join(__dirname, '../server.key');
    const certPath = path.join(__dirname, '../server.cert');
    const hasSSL = fs.existsSync(keyPath) && fs.existsSync(certPath);

    if (hasSSL) {
      // HTTPS mode: Load SSL certificates
      const privateKey = fs.readFileSync(keyPath, 'utf8');
      const certificate = fs.readFileSync(certPath, 'utf8');
      const credentials = { key: privateKey, cert: certificate };

      const httpsServer = https.createServer(credentials, app);
      httpsServer.listen(PORT, () => {
        console.log(`🔒 Server listening on https://localhost:${PORT}`);
        console.log('SSL certificates loaded successfully');
      });
    } else {
      // HTTP fallback: If SSL files missing, start without HTTPS
      console.warn(
        '⚠️  SSL certificate files not found (server.key, server.cert)'
      );
      console.warn(
        '   Falling back to HTTP mode. To enable HTTPS, generate certificates using:'
      );
      console.warn(
        "   openssl req -x509 -newkey rsa:2048 -keyout server.key -out server.cert -days 365 -nodes"
      );
      console.warn('');

      app.listen(PORT, () => {
        console.log(`Server listening on http://localhost:${PORT}`);
      });
    }
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
