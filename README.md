# Mail Scanner

A little app to help me mark stuff as mailed.

## Quick Start

### Development

```bash
npm install
npm run dev
```

The Vite dev server includes a proxy to bypass CORS during development.

### Docker Deployment (Recommended)

```bash
# Build the Docker image
docker build -t mail-scanner .

# Run the container
docker run -p 3000:3000 mail-scanner

# Or with a custom port
docker run -p 8080:8080 -e PORT=8080 mail-scanner
```

The app will be available at `http://localhost:3000` (or your custom port).

### Manual Production Build

```bash
npm run build
npm start
```

This builds the frontend and starts the Express server on port 3000.

## Usage

1. **Enter API Key**: On first load, enter your Hack Club Mail API key

   - You can also load your API key by scanning a QR code
   - Optionally check "Store key locally" to persist it in localStorage

2. **Scan QR Codes**: Point your camera at QR codes containing letter URLs

   - Valid format: `https://hack.club/ltr!xxxxxxxx`
   - The scanner will automatically detect and process codes

3. **Status Colors**:

   - **Gray**: Idle, ready to scan
   - **Yellow**: Processing request
   - **Green**: Successfully marked as mailed (800ms)
   - **Red**: Error occurred (1.5s then returns to idle)
   - **Flashing Red**: Duplicate scan detected (flashes for 5 seconds, then solid red for 1.5s)

4. **View History**: Previously scanned letters appear in the history list at the bottom

## Features

- **QR Code Scanner**: Real-time scanning with webcam preview
- **API Key Sharing**: Generate QR codes to share API keys across devices
- **Duplicate Detection**: Prevents scanning the same letter twice
- **Status Colors**: Visual feedback for scan results
- **History Tracking**: View all scanned letters with timestamps
- **Audio Feedback**: Different sounds for success, error, and duplicate scans

## API Integration

For CORS reasons, there is an express server that proxies requests to the Hack Club Mail API:

- `POST /api/letters/{id}/mark_mailed` → `https://mail.hackclub.com/api/v1/letters/{id}/mark_mailed`
- `GET /api/letters/{id}` → `https://mail.hackclub.com/api/v1/letters/{id}`

API keys are passed from the client through the proxy and never stored server-side.

## Environment Variables

The app requires no configuration - users provide their own API keys in the UI.

**Optional:**

- `PORT` - Server port (default: `3000`)
