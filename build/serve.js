import { createServer } from 'node:http';
import { createReadStream, statSync } from 'node:fs';
import { pipeline } from 'node:stream';
import { join, extname, normalize, resolve, sep, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json',
  '.mp4': 'video/mp4',
  '.webp': 'image/webp',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=utf-8',
  '.md': 'text/plain; charset=utf-8',
  '.woff2': 'font/woff2',
};

// Returns { start, end } for a satisfiable single byte range, { invalid: true } for an
// unsatisfiable one (416), or null when the header should be ignored (RFC 7233).
export function parseRange(header, size) {
  const m = /^bytes=(\d*)-(\d*)$/.exec(header || '');
  if (!m || (m[1] === '' && m[2] === '')) return null;
  let start;
  let end;
  if (m[1] === '') {
    const suffix = parseInt(m[2], 10);
    if (suffix === 0) return { invalid: true };
    start = Math.max(size - suffix, 0);
    end = size - 1;
  } else {
    start = parseInt(m[1], 10);
    end = m[2] === '' ? size - 1 : Math.min(parseInt(m[2], 10), size - 1);
  }
  if (start >= size) return { invalid: true };
  if (start > end) return null;
  return { start, end };
}

function statOrNull(file) {
  try {
    return statSync(file, { throwIfNoEntry: false }) || null;
  } catch {
    return null;
  }
}

export function startServer({ dir, port = 0 }) {
  const root = resolve(dir);
  const server = createServer((req, res) => {
    let pathname;
    let url;
    try {
      url = new URL(req.url, 'http://localhost');
      pathname = decodeURIComponent(url.pathname);
    } catch {
      res.writeHead(400, { 'Content-Type': 'text/plain' });
      return res.end('Bad request');
    }
    let file = normalize(join(root, pathname));
    if (file !== root && !file.startsWith(root + sep)) {
      res.writeHead(403, { 'Content-Type': 'text/plain' });
      return res.end('Forbidden');
    }
    let stat = statOrNull(file);
    if (stat && stat.isDirectory()) {
      if (!pathname.endsWith('/')) {
        res.writeHead(301, { Location: `${url.pathname}/${url.search}` });
        return res.end();
      }
      file = join(file, 'index.html');
      stat = statOrNull(file);
    }
    if (!stat || stat.isDirectory()) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      return res.end(`Not found: ${pathname}`);
    }
    const size = stat.size;
    const headers = { 'Content-Type': TYPES[extname(file).toLowerCase()] || 'application/octet-stream', 'Accept-Ranges': 'bytes' };
    const range = parseRange(req.headers.range, size);
    if (range && range.invalid) {
      res.writeHead(416, { 'Content-Range': `bytes */${size}`, 'Content-Length': 0 });
      return res.end();
    }
    if (req.method === 'HEAD') {
      headers['Content-Length'] = size;
      res.writeHead(200, headers);
      return res.end();
    }
    if (range) {
      headers['Content-Range'] = `bytes ${range.start}-${range.end}/${size}`;
      headers['Content-Length'] = range.end - range.start + 1;
      res.writeHead(206, headers);
      return pipeline(createReadStream(file, { start: range.start, end: range.end }), res, () => {});
    }
    headers['Content-Length'] = size;
    res.writeHead(200, headers);
    pipeline(createReadStream(file), res, () => {});
  });
  return new Promise((resolvePromise, reject) => {
    server.on('error', reject);
    server.listen(port, '127.0.0.1', () => {
      const url = `http://127.0.0.1:${server.address().port}`;
      resolvePromise({
        server,
        url,
        close: () => new Promise((done) => {
          server.close(() => done());
          server.closeAllConnections();
        }),
      });
    });
  });
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const here = dirname(fileURLToPath(import.meta.url));
  const dir = process.argv[2] || join(here, '..', 'dist');
  const port = Number(process.argv[3] || 8080);
  startServer({ dir, port })
    .then((s) => console.log(`Serving ${dir} at ${s.url}/ (Ctrl+C to stop)`))
    .catch((err) => {
      console.error(`Could not start the server on port ${port}: ${err.message}`);
      process.exit(1);
    });
}
