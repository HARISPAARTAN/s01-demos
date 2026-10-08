export function inlineLogo(svg, label) {
  const safeLabel = String(label).replace(/&/g, '&amp;').replace(/"/g, '&quot;');
  return svg
    .replace(/<\?xml[^>]*>\s*/i, '')
    .replace(/<defs>[\s\S]*?<\/defs>/i, '')
    .replace(/\s+class="st0"/g, '')
    .replace(/\s+id="[^"]*"/, '')
    .replace(/<svg\s/i, `<svg role="img" aria-label="${safeLabel}" fill="currentColor" focusable="false" `)
    .trim();
}
