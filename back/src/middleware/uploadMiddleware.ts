import multer, { FileFilterCallback } from 'multer';
import path from 'path';
import fs from 'fs';
import { Request } from 'express';
import { v4 as generateUUID } from 'uuid';

/**
 * Ensure uploads directory exists
 */
const uploadsDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

/**
 * Configure multer storage
 * Files are stored in back/uploads/ with unique names
 */
const storage = multer.diskStorage({
  destination: (_req: Request, _file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) => {
    cb(null, uploadsDir);
  },
  filename: (_req: Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) => {
    // Generate unique filename: uuid + original extension
    const ext = path.extname(file.originalname);
    const filename = `${generateUUID()}${ext}`;
    cb(null, filename);
  },
});

/**
 * File filter: Only accept image files
 */
const fileFilter = (_req: Request, file: Express.Multer.File, cb: FileFilterCallback): void => {
  const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid file type. Only image files are allowed. Received: ${file.mimetype}`));
  }
};

/**
 * Multer instance for single file uploads
 */
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max file size
  },
});

/**
 * Upload middleware for avatar (user profile picture)
 * Handles single file upload with field name 'avatar'
 */
export const uploadAvatar = upload.single('avatar');

/**
 * Upload middleware for post image
 * Handles single file upload with field name 'image'
 */
export const uploadImage = upload.single('image');

export default upload;
