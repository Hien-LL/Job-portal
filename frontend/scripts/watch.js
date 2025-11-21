// scripts/watch.js
import chokidar from 'chokidar';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

console.log('👁️  Watching for file changes...\n');

const watcher = chokidar.watch(
  [
    path.join(rootDir, '*.html'),
    path.join(rootDir, 'css', '*.css'),
    path.join(rootDir, 'js', '*.js'),
    path.join(rootDir, 'fragments', '*.html'),
    path.join(rootDir, 'tailwind.config.js'),
  ],
  {
    ignored: /node_modules|dist/,
    persistent: true,
    awaitWriteFinish: {
      stabilityThreshold: 100,
      pollInterval: 100
    }
  }
);

watcher
  .on('change', (filePath) => {
    console.log(`\n📝 File changed: ${path.relative(rootDir, filePath)}`);
    console.log('🔄 Rebuilding...\n');
    try {
      execSync('npm run build', { cwd: rootDir, stdio: 'inherit' });
      console.log('\n✅ Build successful! Ready for testing.\n');
    } catch {
      console.error('\n❌ Build failed!\n');
    }
  })
  .on('error', (error) => {
    console.error('❌ Watcher error:', error);
  });

console.log('Watching files in:');
console.log('  - *.html');
console.log('  - css/*.css');
console.log('  - js/*.js');
console.log('  - fragments/*.html\n');
console.log('Press Ctrl+C to stop watching.\n');
