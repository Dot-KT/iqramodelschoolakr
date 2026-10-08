import { cp, mkdir, readFile } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const source = resolve(root, 'src');
const output = resolve(root, 'dist');
await readFile(resolve(source, 'index.html'));
await mkdir(output, { recursive: true });
await cp(source, output, { recursive: true });
console.log('Built IQRA Model School to dist/ — ready for GitHub Pages.');
