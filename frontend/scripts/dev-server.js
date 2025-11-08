import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

const app = express();
const PORT = 3000;

// Serve static files
app.use(express.static(rootDir));

// URL rewrite: /blog → /blog.html
app.get('/:page', (req, res) => {
  const page = req.params.page;
  const filePath = path.join(rootDir, `${page}.html`);
  
  // Check if .html file exists
  if (fs.existsSync(filePath)) {
    res.sendFile(filePath);
  } else {
    res.status(404).send('Page not found');
  }
});

// SPA fallback for root
app.get('/', (req, res) => {
  res.sendFile(path.join(rootDir, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`
╔══════════════════════════════════════╗
║  🚀 Dev Server Running               ║
║  📍 http://localhost:${PORT}           ║
║  📝 URL Rewrite: /blog → /blog.html   ║
║  Press Ctrl+C to stop                ║
╚══════════════════════════════════════╝
  `);
});
