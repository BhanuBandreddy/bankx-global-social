import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { db } from '../db.js';
import { userTracks, users } from '@shared/schema';
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

// Upload a new track
router.post('/upload', authMiddleware, upload.single('track'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No audio file provided' });
    }

    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    // Deactivate previous active track
    await db
      .update(userTracks)
      .set({ isActive: false })
      .where(eq(userTracks.userId, userId));

    // Save track info to database
    const [track] = await db
      .insert(userTracks)
      .values({
        userId,
        filename: req.file.filename,
        originalName: req.file.originalname,
        fileSize: req.file.size,
        mimeType: req.file.mimetype,
        filePath: req.file.path,
        isActive: true,
      })
      .returning();

    res.json({
      success: true,
      track: {
        id: track.id,
        originalName: track.originalName,
        fileSize: track.fileSize,
        mimeType: track.mimeType,
        isActive: track.isActive,
        createdAt: track.createdAt,
      }
    });
  } catch (error) {
    console.error('Track upload error:', error);
    res.status(500).json({ error: 'Failed to upload track' });
  }
});

// Get user's tracks
router.get('/user', authMiddleware, async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const tracks = await db
      .select({
        id: userTracks.id,
        originalName: userTracks.originalName,
        fileSize: userTracks.fileSize,
        mimeType: userTracks.mimeType,
        isActive: userTracks.isActive,
        createdAt: userTracks.createdAt,
      })
      .from(userTracks)
      .where(eq(userTracks.userId, userId))
      .orderBy(userTracks.createdAt);

    res.json({ tracks });
  } catch (error) {
    console.error('Get tracks error:', error);
    res.status(500).json({ error: 'Failed to get tracks' });
  }
});

// Stream a track file
router.get('/stream/:trackId', authMiddleware, async (req, res) => {
  try {
    const { trackId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const [track] = await db
      .select()
      .from(userTracks)
      .where(and(
        eq(userTracks.id, trackId),
        eq(userTracks.userId, userId)
      ));

    if (!track) {
      return res.status(404).json({ error: 'Track not found' });
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

// Set active track
router.post('/set-active/:trackId', authMiddleware, async (req, res) => {
  try {
    const { trackId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    // Deactivate all tracks for user
    await db
      .update(userTracks)
      .set({ isActive: false })
      .where(eq(userTracks.userId, userId));

    // Activate selected track
    const [track] = await db
      .update(userTracks)
      .set({ isActive: true })
      .where(and(
        eq(userTracks.id, trackId),
        eq(userTracks.userId, userId)
      ))
      .returning();

    if (!track) {
      return res.status(404).json({ error: 'Track not found' });
    }

    res.json({ success: true, track });
  } catch (error) {
    console.error('Set active track error:', error);
    res.status(500).json({ error: 'Failed to set active track' });
  }
});

// Delete a track
router.delete('/:trackId', authMiddleware, async (req, res) => {
  try {
    const { trackId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const [track] = await db
      .select()
      .from(userTracks)
      .where(and(
        eq(userTracks.id, trackId),
        eq(userTracks.userId, userId)
      ));

    if (!track) {
      return res.status(404).json({ error: 'Track not found' });
    }

    // Delete file from filesystem
    if (fs.existsSync(track.filePath)) {
      fs.unlinkSync(track.filePath);
    }

    // Delete from database
    await db
      .delete(userTracks)
      .where(and(
        eq(userTracks.id, trackId),
        eq(userTracks.userId, userId)
      ));

    res.json({ success: true });
  } catch (error) {
    console.error('Delete track error:', error);
    res.status(500).json({ error: 'Failed to delete track' });
  }
});

export default router;