import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

const UPSTREAM = 'https://mail.hackclub.com';
const ID_RE = /^[A-Za-z0-9!_-]{1,64}$/;

// Enable cross-origin isolation for WASM/Worker support
app.use((req, res, next) => {
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
  res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
  next();
});

// GET /api/letters/:id
app.get('/api/letters/:id', async (req, res) => {
  const auth = req.headers.authorization;
  if (!auth?.startsWith('Bearer ')) {
    return res.status(401).send('Unauthorized');
  }

  const id = req.params.id;
  if (!ID_RE.test(id)) {
    return res.status(400).send('Invalid id');
  }

  const upstream = `${UPSTREAM}/api/v1/letters/${encodeURIComponent(id)}`;
  
  try {
    const response = await fetch(upstream, {
      method: 'GET',
      headers: { 
        Authorization: auth,
        'Content-Type': 'application/json'
      },
      signal: AbortSignal.timeout(10_000),
    });

    const body = await response.text();
    res.status(response.status)
      .set('content-type', response.headers.get('content-type') || 'application/json')
      .send(body);
  } catch (err) {
    console.error('Upstream error:', err);
    res.status(502).send('Upstream error');
  }
});

// POST /api/letters/:id/mark_mailed
app.post('/api/letters/:id/mark_mailed', async (req, res) => {
  const auth = req.headers.authorization;
  if (!auth?.startsWith('Bearer ')) {
    return res.status(401).send('Unauthorized');
  }

  const id = req.params.id;
  if (!ID_RE.test(id)) {
    return res.status(400).send('Invalid id');
  }

  const upstream = `${UPSTREAM}/api/v1/letters/${encodeURIComponent(id)}/mark_mailed`;
  
  try {
    const response = await fetch(upstream, {
      method: 'POST',
      headers: { 
        Authorization: auth,
        'Content-Type': 'application/json'
      },
      signal: AbortSignal.timeout(10_000),
    });

    const body = await response.text();
    res.status(response.status)
      .set('content-type', response.headers.get('content-type') || 'application/json')
      .send(body);
  } catch (err) {
    console.error('Upstream error:', err);
    res.status(502).send('Upstream error');
  }
});

// Serve static files
app.use(express.static(join(__dirname, 'dist')));

// SPA fallback - but not for files with extensions
app.get('*', (req, res) => {
  // Don't use SPA fallback for files with extensions (like .js, .wasm, .css, etc.)
  if (req.path.includes('.')) {
    return res.status(404).send('Not found');
  }
  res.sendFile(join(__dirname, 'dist', 'index.html'));
});

const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Graceful shutdown
const shutdown = (signal) => {
  console.log(`${signal} received, shutting down gracefully...`);
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });

  // Force shutdown after 10 seconds
  setTimeout(() => {
    console.error('Forced shutdown after timeout');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
