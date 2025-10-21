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

1. Enter your Hack Club Mail API key in the app. (Or import via QR code)
2. Point your camera at the QR code on the letter.
3. Profit!

## API Proxy

For CORS reasons, there is an express server that proxies requests to the Hack Club Mail API:

- `POST /api/letters/{id}/mark_mailed` → `https://mail.hackclub.com/api/v1/letters/{id}/mark_mailed`
- `GET /api/letters/{id}` → `https://mail.hackclub.com/api/v1/letters/{id}`

API keys are passed from the client through the proxy and never stored server-side.

## Environment Variables

The app requires no configuration - users provide their own API keys in the UI.

**Optional:**

- `PORT` - Server port (default: `3000`)
