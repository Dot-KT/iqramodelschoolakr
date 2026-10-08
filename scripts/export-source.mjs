import { readdir, readFile } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
if (process.argv[2] === 'blob') {
  const path = process.argv[3];
  if (!['src/assets/pupils.jpeg', 'src/assets/admissions-poster.jpeg', 'src/assets/school-banner.jpeg'].includes(path)) throw new Error('Unexpected asset');
  const offset = Number(process.argv[4] || 0);
  console.log((await readFile(resolve(root, path), 'base64')).slice(offset, offset + 12000));
  process.exit(0);
}
const entries = [];
async function walk(folder) {
  for (const item of await readdir(resolve(root, folder), { withFileTypes: true })) {
    const path = `${folder}/${item.name}`;
    if (item.isDirectory()) await walk(path);
    else {
      const encoding = /\.(?:jpeg|jpg|png|webp)$/.test(path) ? 'base64' : 'utf-8';
      entries.push({ path, encoding, content: await readFile(resolve(root, path), encoding === 'base64' ? 'base64' : 'utf8') });
    }
  }
}
await walk('src');
for (const path of ['package.json', 'README.md', '.gitignore', '.github/workflows/deploy.yml', 'scripts/build.mjs', 'scripts/serve.mjs', 'scripts/check.mjs']) entries.push({ path, encoding: 'utf-8', content: await readFile(resolve(root, path), 'utf8') });
console.log(JSON.stringify(entries.filter(entry => entry.encoding === 'utf-8')));
