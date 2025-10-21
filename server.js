import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

const UPSTREAM = 'https://mail.hackclub.com';
const ID_RE = /^[A-Za-z0-9!_-]{1,64}$/;

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

// SPA fallback
app.get('*', (req, res) => {
  res.sendFile(join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
