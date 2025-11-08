import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const distDir = path.resolve(rootDir, 'dist');

console.log('🔨 Building Job Portal Frontend...\n');

// 1. Clean dist folder
console.log('📦 Cleaning dist folder...');
await fs.emptyDir(distDir);

// 2. Copy HTML files
console.log('📄 Copying HTML files...');
const htmlFiles = fs.readdirSync(rootDir).filter(f => f.endsWith('.html'));
for (const file of htmlFiles) {
  await fs.copy(path.join(rootDir, file), path.join(distDir, file));
}

// 3. Copy CSS, JS, img folders
console.log('📚 Copying assets...');
const foldersToCopy = ['css', 'js', 'img', 'fragments'];
for (const folder of foldersToCopy) {
  const src = path.join(rootDir, folder);
  if (fs.existsSync(src)) {
    await fs.copy(src, path.join(distDir, folder));
  }
}

// 4. Build Tailwind CSS
console.log('🎨 Building Tailwind CSS...');
try {
  execSync('npx tailwindcss -i ./tailwind.css -o ./dist/css/tailwind.css --minify', {
    cwd: rootDir,
    stdio: 'inherit'
  });
  console.log('✅ Tailwind CSS built\n');
} catch (error) {
  console.error('❌ Tailwind build failed:', error.message);
}

// 5. Minify JS files
console.log('🗜️  Minifying JavaScript files...');
const jsDir = path.join(distDir, 'js');
if (fs.existsSync(jsDir)) {
  const jsFiles = fs.readdirSync(jsDir).filter(f => f.endsWith('.js'));
  for (const file of jsFiles) {
    const filePath = path.join(jsDir, file);
    try {
      execSync(`npx terser "${filePath}" -o "${filePath}"`, { stdio: 'pipe' });
      console.log(`  ✓ ${file}`);
    } catch (error) {
      console.warn(`  ⚠ Could not minify ${file}: ${error.message}`);
    }
  }
}
console.log('✅ JavaScript minified\n');

// 6. CSS already minified by Tailwind
console.log('✅ CSS minified (by Tailwind)\n');

// 7. Summary
const distSize = getDirectorySize(distDir);
console.log('✨ Build complete!');
console.log(`📁 Output: ${distDir}`);
console.log(`📊 Size: ${(distSize / 1024 / 1024).toFixed(2)} MB\n`);
console.log('🚀 Ready for deployment!\n');

function getDirectorySize(dir) {
  let size = 0;
  const files = fs.readdirSync(dir, { withFileTypes: true });
  for (const file of files) {
    const fullPath = path.join(dir, file.name);
    if (file.isDirectory()) {
      size += getDirectorySize(fullPath);
    } else {
      size += fs.statSync(fullPath).size;
    }
  }
  return size;
}
