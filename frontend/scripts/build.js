// scripts/build.js
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

// 2. Copy HTML files ở root vào dist
console.log('📄 Copying HTML files...');
const htmlFiles = fs.readdirSync(rootDir).filter(f => f.endsWith('.html'));
for (const file of htmlFiles) {
  await fs.copy(path.join(rootDir, file), path.join(distDir, file));
}

// 2.1. Copy admin HTML files
console.log('📄 Copying admin HTML files...');
const adminDir = path.join(rootDir, 'admin');
const adminDistDir = path.join(distDir, 'admin');
let adminHtmlFiles = [];
if (await fs.pathExists(adminDir)) {
  await fs.ensureDir(adminDistDir);
  adminHtmlFiles = fs.readdirSync(adminDir).filter(f => f.endsWith('.html'));
  for (const file of adminHtmlFiles) {
    await fs.copy(path.join(adminDir, file), path.join(adminDistDir, file));
  }

  // Also copy admin-specific assets (js and fragments) into dist/admin
  const adminJsSrc = path.join(adminDir, 'js');
  const adminFragmentsSrc = path.join(adminDir, 'fragments');
  if (await fs.pathExists(adminJsSrc)) {
    await fs.copy(adminJsSrc, path.join(adminDistDir, 'js'));
  }
  if (await fs.pathExists(adminFragmentsSrc)) {
    await fs.copy(adminFragmentsSrc, path.join(adminDistDir, 'fragments'));
  }
}

// 2.2. Replace CDN with compiled CSS in dist HTML files
console.log('🔄 Updating HTML files for production...');
const allHtmlFiles = [...htmlFiles, ...adminHtmlFiles.map(f => path.join('admin', f))];
for (const file of allHtmlFiles) {
  const filePath = path.join(distDir, file);
  if (await fs.pathExists(filePath)) {
    let content = await fs.readFile(filePath, 'utf8');
    // For admin pages (in dist/admin/), the correct relative path is ../css/tailwind.css
    const isAdmin = file.startsWith('admin' + path.sep) || file.startsWith('admin/');
    const cssLink = isAdmin ? '<link rel="stylesheet" href="../css/tailwind.css">' : '<link rel="stylesheet" href="css/tailwind.css">';
    content = content.replace('<script src="https://cdn.tailwindcss.com"></script>', cssLink);
    await fs.writeFile(filePath, content);
  }
}

// 2.5. Copy root CSS files
console.log('📄 Copying root CSS files...');
const cssFiles = fs.readdirSync(rootDir).filter(f => f.endsWith('.css'));
for (const file of cssFiles) {
  await fs.copy(path.join(rootDir, file), path.join(distDir, file));
}

// 3. Copy assets: css, js, img, fragments
console.log('📚 Copying assets...');
const foldersToCopy = ['css', 'js', 'img', 'fragments'];
for (const folder of foldersToCopy) {
  const src = path.join(rootDir, folder);
  if (await fs.pathExists(src)) {
    await fs.copy(src, path.join(distDir, folder));
  }
}

// 4. Build Tailwind CSS vào dist/css/tailwind.css
console.log('🎨 Building Tailwind CSS...');
try {
  await fs.ensureDir(path.join(distDir, 'css'));
  execSync(
    'npx tailwindcss -i ./css/tailwind.css -o ./dist/css/tailwind.css --minify',
    { cwd: rootDir, stdio: 'inherit' }
  );
  console.log('✅ Tailwind CSS built\n');
} catch (error) {
  console.error('❌ Tailwind build failed:', error.message);
}

// 5. Minify JS files trong dist/js
console.log('🗜️  Minifying JavaScript files...');
const jsDir = path.join(distDir, 'js');
if (await fs.pathExists(jsDir)) {
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

// 6. Summary
const distSize = getDirectorySize(distDir);
console.log('✨ Build complete!');
console.log(`📁 Output: ${distDir}`);
console.log(`📊 Size: ${(distSize / 1024 / 1024).toFixed(2)} MB\n`);
console.log('🚀 Ready for deployment (Nginx mount ./dist → /usr/share/nginx/html)!\n');

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
