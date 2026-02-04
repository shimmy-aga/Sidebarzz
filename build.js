const esbuild = require('esbuild');
const fs = require('fs');
const path = require('path');

const isWatch = process.argv.includes('--watch');
const rootDir = __dirname;
const distDir = path.join(rootDir, 'dist');

// Background service worker - needs IIFE format for Chrome
const backgroundOptions = {
  entryPoints: [path.join(rootDir, 'src/background.ts')],
  bundle: true,
  outfile: path.join(distDir, 'background.js'),
  platform: 'browser',
  target: 'es2020',
  sourcemap: 'external',
  logLevel: 'info',
  format: 'iife'
};

// Sidebar defaults boot - exposes storage defaults to content script (IIFE)
const sidebarDefaultsOptions = {
  entryPoints: [path.join(rootDir, 'src/sidebar-defaults-boot.ts')],
  bundle: true,
  outfile: path.join(distDir, 'sidebar-defaults.js'),
  platform: 'browser',
  target: 'es2020',
  sourcemap: 'external',
  logLevel: 'info',
  format: 'iife'
};

// Static assets: same filename in src/ and dist/
const STATIC_ASSETS = [
  'index.css',
  'popup.html',
  'popup.js',
  'options.html',
  'options.js',
  'options.css',
  'newtab.html',
  'newtab.js',
  'sidebar.css',
  'content.js'
];

// Ensure dist exists and copy all assets from src (single source of truth)
function syncDistAssets() {
  if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir, { recursive: true });
  }
  const srcDir = path.join(rootDir, 'src');
  for (const name of STATIC_ASSETS) {
    const srcPath = path.join(srcDir, name);
    if (fs.existsSync(srcPath)) {
      fs.copyFileSync(srcPath, path.join(distDir, name));
    }
  }
}

async function build() {
  try {
    syncDistAssets();
    await Promise.all([
      esbuild.build(backgroundOptions),
      esbuild.build(sidebarDefaultsOptions)
    ]);
    console.log('Build completed successfully');
  } catch (error) {
    console.error('Build failed:', error);
    process.exit(1);
  }
}

if (isWatch) {
  Promise.all([
    esbuild.context(backgroundOptions),
    esbuild.context(sidebarDefaultsOptions)
  ]).then(([bgCtx, defaultsCtx]) => {
    bgCtx.watch();
    defaultsCtx.watch();
    console.log('Watching for changes...');
  });
} else {
  build();
}
