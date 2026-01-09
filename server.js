import express from 'express';
import multer from 'multer';
import sharp from 'sharp';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs/promises';

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 50 * 1024 * 1024 } });

app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => res.json({ status: 'ok', service: 'sharp-api' }));

// Get image metadata
app.post('/metadata', upload.single('image'), async (req, res) => {
  try {
    const metadata = await sharp(req.file.buffer).metadata();
    res.json(metadata);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Resize image
app.post('/resize', upload.single('image'), async (req, res) => {
  try {
    const { width, height, fit = 'cover' } = req.body;
    const buffer = await sharp(req.file.buffer)
      .resize(parseInt(width) || null, parseInt(height) || null, { fit })
      .toBuffer();
    res.set('Content-Type', req.file.mimetype);
    res.send(buffer);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Convert format (png, jpg, webp, avif)
app.post('/convert', upload.single('image'), async (req, res) => {
  try {
    const { format = 'webp', quality = 80 } = req.body;
    const formats = { png: 'png', jpg: 'jpeg', jpeg: 'jpeg', webp: 'webp', avif: 'avif' };
    const outputFormat = formats[format.toLowerCase()] || 'webp';
    
    const buffer = await sharp(req.file.buffer)
      .toFormat(outputFormat, { quality: parseInt(quality) })
      .toBuffer();
    
    res.set('Content-Type', `image/${outputFormat}`);
    res.send(buffer);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Optimize for web
app.post('/optimize', upload.single('image'), async (req, res) => {
  try {
    const { maxWidth = 1920, quality = 80, format = 'webp' } = req.body;
    const buffer = await sharp(req.file.buffer)
      .resize(parseInt(maxWidth), null, { withoutEnlargement: true })
      .toFormat(format, { quality: parseInt(quality) })
      .toBuffer();
    
    res.set('Content-Type', `image/${format}`);
    res.send(buffer);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Crop image
app.post('/crop', upload.single('image'), async (req, res) => {
  try {
    const { left, top, width, height } = req.body;
    const buffer = await sharp(req.file.buffer)
      .extract({ left: parseInt(left), top: parseInt(top), width: parseInt(width), height: parseInt(height) })
      .toBuffer();
    
    res.set('Content-Type', req.file.mimetype);
    res.send(buffer);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Rotate image
app.post('/rotate', upload.single('image'), async (req, res) => {
  try {
    const { angle = 90, background = '#ffffff' } = req.body;
    const buffer = await sharp(req.file.buffer)
      .rotate(parseInt(angle), { background })
      .toBuffer();
    
    res.set('Content-Type', req.file.mimetype);
    res.send(buffer);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Blur image
app.post('/blur', upload.single('image'), async (req, res) => {
  try {
    const { sigma = 5 } = req.body;
    const buffer = await sharp(req.file.buffer)
      .blur(parseFloat(sigma))
      .toBuffer();
    
    res.set('Content-Type', req.file.mimetype);
    res.send(buffer);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Grayscale
app.post('/grayscale', upload.single('image'), async (req, res) => {
  try {
    const buffer = await sharp(req.file.buffer).grayscale().toBuffer();
    res.set('Content-Type', req.file.mimetype);
    res.send(buffer);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Flip/Flop
app.post('/flip', upload.single('image'), async (req, res) => {
  try {
    const { direction = 'vertical' } = req.body;
    let image = sharp(req.file.buffer);
    image = direction === 'horizontal' ? image.flop() : image.flip();
    const buffer = await image.toBuffer();
    
    res.set('Content-Type', req.file.mimetype);
    res.send(buffer);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Composite/Watermark
app.post('/watermark', upload.fields([{ name: 'image' }, { name: 'watermark' }]), async (req, res) => {
  try {
    const { gravity = 'southeast', opacity = 0.5 } = req.body;
    const watermark = await sharp(req.files.watermark[0].buffer)
      .ensureAlpha(parseFloat(opacity))
      .toBuffer();
    
    const buffer = await sharp(req.files.image[0].buffer)
      .composite([{ input: watermark, gravity }])
      .toBuffer();
    
    res.set('Content-Type', req.files.image[0].mimetype);
    res.send(buffer);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Generate thumbnail
app.post('/thumbnail', upload.single('image'), async (req, res) => {
  try {
    const { size = 150 } = req.body;
    const buffer = await sharp(req.file.buffer)
      .resize(parseInt(size), parseInt(size), { fit: 'cover' })
      .toFormat('webp', { quality: 80 })
      .toBuffer();
    
    res.set('Content-Type', 'image/webp');
    res.send(buffer);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Sharpen image
app.post('/sharpen', upload.single('image'), async (req, res) => {
  try {
    const { sigma = 1, flat = 1, jagged = 2 } = req.body;
    const buffer = await sharp(req.file.buffer)
      .sharpen(parseFloat(sigma), parseFloat(flat), parseFloat(jagged))
      .toBuffer();
    
    res.set('Content-Type', req.file.mimetype);
    res.send(buffer);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Tint image
app.post('/tint', upload.single('image'), async (req, res) => {
  try {
    const { r = 255, g = 0, b = 0 } = req.body;
    const buffer = await sharp(req.file.buffer)
      .tint({ r: parseInt(r), g: parseInt(g), b: parseInt(b) })
      .toBuffer();
    
    res.set('Content-Type', req.file.mimetype);
    res.send(buffer);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Sharp API running on port ${PORT}`);
});
