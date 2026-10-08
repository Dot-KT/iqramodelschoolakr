import assert from 'node:assert/strict';
import { readFile, stat } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const source = resolve(root, 'src');
const html = await readFile(resolve(source, 'index.html'), 'utf8');
const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]);
assert.equal(new Set(ids).size, ids.length, 'HTML IDs must be unique');
for (const match of html.matchAll(/\bhref="#([^"]+)"/g)) assert.ok(ids.includes(match[1]), `Navigation target missing: ${match[1]}`);
for (const match of html.matchAll(/\b(?:src|href)="(\.\/[^"?#]+)"/g)) {
  const path = resolve(source, match[1]);
  assert.ok((await stat(path)).size > 0, `Local asset missing or empty: ${match[1]}`);
}
for (const match of html.matchAll(/\baria-(?:controls|labelledby)="([^"]+)"/g)) for (const id of match[1].split(' ')) assert.ok(ids.includes(id), `ARIA target missing: ${id}`);
assert.ok(html.includes('tel:+2348140672194'), 'Admission phone number missing');
assert.equal((await readFile(resolve(source, 'CNAME'), 'utf8')).trim(), 'iqramodelschoolakr.com.ng');
assert.ok(!/lorem ipsum|TODO|coming soon/i.test(html), 'Unfinished content found');
console.log('Passed: local assets, navigation, unique IDs, accessible relationships, contact details and domain.');
