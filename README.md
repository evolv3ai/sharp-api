# Sharp Image Processing API

REST API for image manipulation using Sharp. Designed for use with Claude Code and automated workflows.

## Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Health check |
| `/metadata` | POST | Get image metadata |
| `/resize` | POST | Resize image |
| `/convert` | POST | Convert format (png, jpg, webp, avif) |
| `/optimize` | POST | Optimize for web |
| `/crop` | POST | Crop image |
| `/rotate` | POST | Rotate image |
| `/blur` | POST | Apply blur |
| `/grayscale` | POST | Convert to grayscale |
| `/flip` | POST | Flip/flop image |
| `/watermark` | POST | Add watermark |
| `/thumbnail` | POST | Generate thumbnail |
| `/sharpen` | POST | Sharpen image |
| `/tint` | POST | Apply color tint |

## Usage Examples (curl)

### Resize
```bash
curl -X POST -F "image=@input.jpg" -F "width=800" -F "height=600" \
  http://sharp-api.yourdomain.com/resize -o resized.jpg
```

### Convert to WebP
```bash
curl -X POST -F "image=@input.jpg" -F "format=webp" -F "quality=85" \
  http://sharp-api.yourdomain.com/convert -o output.webp
```

### Optimize for Web
```bash
curl -X POST -F "image=@input.jpg" -F "maxWidth=1920" -F "quality=80" \
  http://sharp-api.yourdomain.com/optimize -o optimized.webp
```

### Get Metadata
```bash
curl -X POST -F "image=@input.jpg" http://sharp-api.yourdomain.com/metadata
```

### Crop
```bash
curl -X POST -F "image=@input.jpg" -F "left=100" -F "top=100" -F "width=500" -F "height=500" \
  http://sharp-api.yourdomain.com/crop -o cropped.jpg
```

### Generate Thumbnail
```bash
curl -X POST -F "image=@input.jpg" -F "size=150" \
  http://sharp-api.yourdomain.com/thumbnail -o thumb.webp
```

## Deploy to Coolify

1. Create new resource → Docker Compose
2. Point to this repository or paste docker-compose.yml
3. Set your domain
4. Deploy

## Claude Code Integration

Add to your workflow:
```bash
# Example: Resize and optimize an image
curl -s -X POST -F "image=@./hero.png" -F "maxWidth=1200" -F "quality=85" \
  https://sharp-api.yourdomain.com/optimize -o ./hero-optimized.webp
```
