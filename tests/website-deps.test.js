const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const repoRoot = path.join(__dirname, '..');
const websitePkg = JSON.parse(
  fs.readFileSync(path.join(repoRoot, 'Website/package.json'), 'utf8')
);
const mainTs = fs.readFileSync(
  path.join(repoRoot, 'Website/src/main.ts'),
  'utf8'
);
const homePage = fs.readFileSync(
  path.join(repoRoot, 'Website/src/pages/HomePage.vue'),
  'utf8'
);

test('website package no longer includes PrimeVue or PrimeIcons', () => {
  assert.equal(websitePkg.dependencies?.primevue, undefined);
  assert.equal(websitePkg.dependencies?.primeicons, undefined);
});

test('website app no longer imports PrimeVue or PrimeIcons', () => {
  assert.doesNotMatch(mainTs, /primevue|primeicons/i);
});

test('website uses SVN assets without public duplicates', () => {
  assert.equal(websitePkg.scripts?.['sync:plugin-assets'], undefined);
  assert.match(homePage, /SVN\/assets\/banner-1544x500\.png/);

  for (const relativePath of [
    'Website/public/icon-128x128.png',
    'Website/public/icon-256x256.png',
    'Website/public/plugin-assets/banner-1544x500.png',
  ]) {
    assert.equal(fs.existsSync(path.join(repoRoot, relativePath)), false);
  }
});

test('svn mirror ignores local git metadata and generated package files', () => {
  const svnGitignore = fs.readFileSync(
    path.join(repoRoot, 'SVN/.gitignore'),
    'utf8'
  );

  assert.match(svnGitignore, /^\.gitignore$/m);
  assert.match(svnGitignore, /^package-lock\.json$/m);
  assert.match(svnGitignore, /^\*\.zip$/m);
});
