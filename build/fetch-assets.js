import { existsSync, mkdirSync, writeFileSync, readFileSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const sources = JSON.parse(readFileSync(join(root, 'assets/sources.json'), 'utf8'));
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36';

async function download(url, file) {
  const res = await fetch(url, { headers: { 'User-Agent': UA, Accept: '*/*' }, redirect: 'follow' });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText} for ${url}`);
  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.length < 1000) throw new Error(`Suspiciously small response (${buf.length} bytes) for ${url}`);
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, buf);
  return buf.length;
}

let failures = 0;
for (const [folder, files] of Object.entries(sources)) {
  for (const [name, url] of Object.entries(files)) {
    const file = join(root, 'assets', folder, name);
    if (existsSync(file) && statSync(file).size > 1000) {
      console.log(`skip  ${folder}/${name} (exists)`);
      continue;
    }
    try {
      const size = await download(url, file);
      console.log(`saved ${folder}/${name} ${(size / 1024 / 1024).toFixed(2)} MB`);
    } catch (err) {
      failures++;
      console.error(`FAIL  ${folder}/${name}: ${err.message}`);
    }
  }
}
if (failures) {
  console.error(`${failures} download(s) failed`);
  process.exit(1);
}
