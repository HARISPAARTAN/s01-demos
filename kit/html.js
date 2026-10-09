export function esc(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function paragraphs(text, cls = '') {
  const attr = cls ? ` class="${esc(cls)}"` : '';
  return String(text ?? '')
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) => `<p${attr}>${esc(p)}</p>`)
    .join('\n');
}

export function list(items, cls = '') {
  const attr = cls ? ` class="${esc(cls)}"` : '';
  return `<ul${attr}>${items.map((i) => `<li>${esc(i)}</li>`).join('')}</ul>`;
}

export function document({ lang, title, description, head = '', bodyClass = '', body = '', scripts = '' }) {
  return `<!doctype html>
<html lang="${esc(lang)}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<meta name="robots" content="noindex, nofollow">
${head}
</head>
<body class="${esc(bodyClass)}">
${body}
${scripts}
</body>
</html>
`;
}
