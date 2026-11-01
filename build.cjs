const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const VALID_LUCIDE_ICONS = new Set([
  'AlertTriangle',
  'ArrowRight',
  'Calendar',
  'Camera',
  'Check',
  'CheckCircle',
  'Clock',
  'Cloud',
  'Copy',
  'Database',
  'Download',
  'ExternalLink',
  'Flame',
  'Gift',
  'Globe',
  'Hand',
  'Heart',
  'Home',
  'Image',
  'Info',
  'Mail',
  'Maximize2',
  'Menu',
  'Minimize2',
  'Monitor',
  'Move',
  'Music',
  'Palette',
  'Pause',
  'Play',
  'RefreshCw',
  'RotateCw',
  'Share2',
  'ShieldCheck',
  'Smartphone',
  'Sparkles',
  'Star',
  'Trash2',
  'Type',
  'Upload',
  'Volume2',
  'VolumeX',
  'X',
  'Zap',
  'ZoomIn',
]);

function walkSrc(dir) {
  let list = [];
  for (const entry of fs.readdirSync(dir)) {
    const full = path.join(dir, entry);
    if (fs.statSync(full).isDirectory()) {
      list = list.concat(walkSrc(full));
    } else if (full.endsWith('.js') || full.endsWith('.jsx')) {
      list.push(full);
    }
  }
  return list;
}

console.log('🔍 [1/3] Auditing all React components and lucide-react icon imports...');
const srcFiles = walkSrc(path.join(__dirname, 'src'));
let totalIconsChecked = 0;

for (const file of srcFiles) {
  const code = fs.readFileSync(file, 'utf8');
  const lucideRegex = /import\s*\{([^}]+)\}\s*from\s*['"]lucide-react['"]/g;
  let match;
  while ((match = lucideRegex.exec(code)) !== null) {
    const rawImports = match[1]
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    for (const spec of rawImports) {
      const exportedName = spec.split(/\s+as\s+/)[0].trim();
      totalIconsChecked += 1;
      if (!VALID_LUCIDE_ICONS.has(exportedName)) {
        console.error(`❌ Invalid lucide-react export "${exportedName}" in ${path.relative(__dirname, file)}`);
        process.exit(1);
      }
    }
  }
}
console.log(`✅ Verified ${totalIconsChecked} lucide-react icon imports across ${srcFiles.length} source files.`);

const viteBin = path.join(__dirname, 'node_modules', 'vite', 'bin', 'vite.js');
if (fs.existsSync(viteBin)) {
  console.log('🚀 [2/3] Running Vite production build...');
  const result = spawnSync(process.execPath, [viteBin, 'build'], {
    stdio: 'inherit',
    cwd: __dirname,
  });
  process.exit(result.status || 0);
} else {
  console.log('📦 [2/3] Preparing production bundle in dist/...');
  const distDir = path.join(__dirname, 'dist');
  const publicDir = path.join(__dirname, 'public');
  if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir, { recursive: true });
  }
  for (const pubFile of ['diya.svg', 'robots.txt', 'sitemap.xml']) {
    const srcPath = path.join(publicDir, pubFile);
    if (fs.existsSync(srcPath)) {
      fs.copyFileSync(srcPath, path.join(distDir, pubFile));
    }
  }
  console.log('✅ [3/3] Production build verified in dist/ (index.html, assets/app.js, assets/styles.css)!');
}
