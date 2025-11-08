import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

const app = express();
const PORT = 3000;

// Serve static files
app.use(express.static(rootDir));

// SPA fallback
app.get('*', (req, res) => {
  res.sendFile(path.join(rootDir, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`
╔══════════════════════════════════════╗
║  🚀 Dev Server Running               ║
║  📍 http://localhost:${PORT}           ║
║  Press Ctrl+C to stop                ║
╚══════════════════════════════════════╝
  `);
});
