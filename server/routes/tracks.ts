import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { db } from '../db.js';
import { userCurrentTrack, users } from '@shared/schema';
import { eq, and } from 'drizzle-orm';
import { authMiddleware } from '../auth.js';

const router = express.Router();

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(process.cwd(), 'uploads', 'tracks');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname);
    cb(null, `track-${uniqueSuffix}${extension}`);
  }
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    // Accept audio files only
    if (file.mimetype.startsWith('audio/')) {
      cb(null, true);
    } else {
      cb(new Error('Only audio files are allowed'), false);
    }
  },
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  }
});

// Upload a new track (replaces existing track for user)
router.post('/upload', authMiddleware, upload.single('track'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No audio file provided' });
    }

    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    // Get existing track to delete old file
    const [existingTrack] = await db
      .select()
      .from(userCurrentTrack)
      .where(eq(userCurrentTrack.userId, userId));

    // Delete old file if exists
    if (existingTrack && fs.existsSync(existingTrack.filePath)) {
      fs.unlinkSync(existingTrack.filePath);
    }

    // Upsert (insert or update) track for user
    const [track] = await db
      .insert(userCurrentTrack)
      .values({
        userId,
        filename: req.file.filename,
        originalName: req.file.originalname,
        fileSize: req.file.size,
        mimeType: req.file.mimetype,
        filePath: req.file.path,
      })
      .onConflictDoUpdate({
        target: userCurrentTrack.userId,
        set: {
          filename: req.file.filename,
          originalName: req.file.originalname,
          fileSize: req.file.size,
          mimeType: req.file.mimetype,
          filePath: req.file.path,
          updatedAt: new Date(),
        },
      })
      .returning();

    res.json({
      success: true,
      track: {
        id: track.id,
        originalName: track.originalName,
        fileSize: track.fileSize,
        mimeType: track.mimeType,
        updatedAt: track.updatedAt,
      }
    });
  } catch (error) {
    console.error('Track upload error:', error);
    res.status(500).json({ error: 'Failed to upload track' });
  }
});

// Get user's current track
router.get('/current', authMiddleware, async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const [track] = await db
      .select({
        id: userCurrentTrack.id,
        originalName: userCurrentTrack.originalName,
        fileSize: userCurrentTrack.fileSize,
        mimeType: userCurrentTrack.mimeType,
        updatedAt: userCurrentTrack.updatedAt,
      })
      .from(userCurrentTrack)
      .where(eq(userCurrentTrack.userId, userId));

    if (!track) {
        // Define a default track object
        const defaultTrack = {
            id: 'default-track',
            originalName: 'Welcome to GlobalSocial',
            fileSize: 0,
            mimeType: 'audio/mpeg', // or a suitable default
            updatedAt: new Date(),
        };
        console.log('No tracks found, returning default track');
        return res.json({ track: defaultTrack });
    }

    res.json({ track: track });
  } catch (error) {
    console.error('Get current track error:', error);
    res.status(500).json({ error: 'Failed to get current track' });
  }
});

// Stream current track file
router.get('/stream', authMiddleware, async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const [track] = await db
      .select()
      .from(userCurrentTrack)
      .where(eq(userCurrentTrack.userId, userId));

    if (!track) {
      return res.status(404).json({ error: 'No current track found' });
    }

    if (!fs.existsSync(track.filePath)) {
      return res.status(404).json({ error: 'Track file not found' });
    }

    const stat = fs.statSync(track.filePath);
    const fileSize = stat.size;
    const range = req.headers.range;

    if (range) {
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      const chunksize = (end - start) + 1;
      const file = fs.createReadStream(track.filePath, { start, end });
      const head = {
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunksize,
        'Content-Type': track.mimeType,
      };
      res.writeHead(206, head);
      file.pipe(res);
    } else {
      const head = {
        'Content-Length': fileSize,
        'Content-Type': track.mimeType,
      };
      res.writeHead(200, head);
      fs.createReadStream(track.filePath).pipe(res);
    }
  } catch (error) {
    console.error('Stream track error:', error);
    res.status(500).json({ error: 'Failed to stream track' });
  }
});

// Delete current track
router.delete('/current', authMiddleware, async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const [track] = await db
      .select()
      .from(userCurrentTrack)
      .where(eq(userCurrentTrack.userId, userId));

    if (!track) {
      return res.status(404).json({ error: 'No current track found' });
    }

    // Delete file from filesystem
    if (fs.existsSync(track.filePath)) {
      fs.unlinkSync(track.filePath);
    }

    // Delete from database
    await db
      .delete(userCurrentTrack)
      .where(eq(userCurrentTrack.userId, userId));

    res.json({ success: true });
  } catch (error) {
    console.error('Delete current track error:', error);
    res.status(500).json({ error: 'Failed to delete current track' });
  }
});



export default router;