import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, '../..');
const svnAssetsDir = path.join(repoRoot, 'SVN', 'assets');
const websitePublicDir = path.resolve(scriptDir, '../public');

const mappings = [
  { sourceName: 'banner-1544x500.png', targetRelativePath: 'plugin-assets/banner-1544x500.png', required: true },
  { sourceName: 'icon-128x128.png', targetRelativePath: 'icon-128x128.png', required: true },
  { sourceName: 'icon-256x256.png', targetRelativePath: 'icon-256x256.png', required: true },
  { sourceName: 'icon-128x128.png', targetRelativePath: 'favicon.ico', required: false },
];

async function copyMappedAsset({ sourceName, targetRelativePath, required }) {
  const sourcePath = path.join(svnAssetsDir, sourceName);
  const targetPath = path.join(websitePublicDir, targetRelativePath);

  try {
    await fs.access(sourcePath);
    await fs.mkdir(path.dirname(targetPath), { recursive: true });
    await fs.copyFile(sourcePath, targetPath);
  } catch (error) {
    if (required) {
      throw error;
    }

    console.warn(`Skipped optional asset ${targetRelativePath}: ${error.message}`);
  }
}

async function main() {
  for (const mapping of mappings) {
    await copyMappedAsset(mapping);
  }

  console.log('Synced site-search assets from SVN/assets');
}

main().catch((error) => {
  console.error('Failed to sync site-search plugin asset:', error);
  process.exit(1);
});
