import { chromium } from 'playwright';

export async function launchBrowser() {
  const errors = [];
  for (const channel of ['chrome', 'msedge']) {
    try {
      return await chromium.launch({ channel, headless: true });
    } catch (err) {
      errors.push(`${channel}: ${String(err.message).split('\n')[0]}`);
    }
  }
  try {
    return await chromium.launch({ headless: true });
  } catch (err) {
    errors.push(`bundled chromium: ${String(err.message).split('\n')[0]}`);
  }
  throw new Error(`No browser available for Playwright:\n${errors.join('\n')}`);
}
