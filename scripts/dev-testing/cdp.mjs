// Tiny Chrome DevTools Protocol driver (headless Chrome, Node's built-in WebSocket).
// Usage: import { launch } from './cdp.mjs'; const c = await launch(); ... await c.close();
import { spawn } from 'node:child_process';
import { mkdtemp, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';

const CHROME = process.env.BROWSER || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export async function launch({ width = 1280, height = 860, port = 9333, mobile = false, dpr = Number(process.env.DPR || 1) } = {}) {
  const dir = await mkdtemp(path.join(tmpdir(), 'cdp-'));
  const proc = spawn(CHROME, [
    ...(process.env.HEADFUL ? [] : ['--headless=new']), `--remote-debugging-port=${port}`, `--user-data-dir=${dir}`,
    `--window-size=${width},${height}`, '--hide-scrollbars', '--no-first-run', ...(process.env.HEADFUL ? ['--window-position=40,40', '--disable-backgrounding-occluded-windows', '--disable-renderer-backgrounding', '--disable-background-timer-throttling'] : []), '--disable-gpu-vsync', 'about:blank',
  ], { stdio: 'ignore' });
  let version;
  for (let i = 0; i < 60; i++) {
    try { version = await (await fetch(`http://127.0.0.1:${port}/json/version`)).json(); break; } catch { await sleep(200); }
  }
  if (!version) throw new Error('Chrome did not start');
  const targets = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
  const page = targets.find((t) => t.type === 'page');
  const ws = new WebSocket(page.webSocketDebuggerUrl);
  await new Promise((r) => (ws.onopen = r));
  let id = 0;
  const pending = new Map();
  const listeners = [];
  ws.onmessage = (m) => {
    const msg = JSON.parse(m.data);
    if (msg.id && pending.has(msg.id)) { pending.get(msg.id)(msg); pending.delete(msg.id); }
    else listeners.forEach((fn) => fn(msg));
  };
  const send = (method, params = {}) => new Promise((resolve, reject) => {
    const mid = ++id;
    pending.set(mid, (msg) => (msg.error ? reject(new Error(`${method}: ${msg.error.message}`)) : resolve(msg.result)));
    ws.send(JSON.stringify({ id: mid, method, params }));
  });
  await send('Page.enable');
  await send('Runtime.enable');
  if (!process.env.HEADFUL) await send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: dpr, mobile });
  const api = {
    send,
    on(fn) { listeners.push(fn); },
    async goto(url, wait = 1500) { await send('Page.navigate', { url }); await sleep(wait); },
    async eval(expr) {
      const r = await send('Runtime.evaluate', { expression: expr, awaitPromise: true, returnByValue: true });
      if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description || r.exceptionDetails.text);
      return r.result.value;
    },
    async shot(file, clip) {
      const r = await send('Page.captureScreenshot', { format: 'jpeg', quality: 70, ...(clip ? { clip: { ...clip, scale: 1 } } : {}) });
      await writeFile(file, Buffer.from(r.data, 'base64'));
    },
    async click(x, y) {
      for (const type of ['mouseMoved', 'mousePressed', 'mouseReleased'])
        await send('Input.dispatchMouseEvent', { type, x, y, button: 'left', clickCount: 1 });
    },
    sleep,
    async close() { try { await send('Browser.close'); } catch {} proc.kill(); },
  };
  return api;
}
