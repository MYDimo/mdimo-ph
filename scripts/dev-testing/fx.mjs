// Minimal Firefox driver over WebDriver BiDi (Node's built-in WebSocket).
import { spawn } from 'node:child_process';
import { mkdtemp, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';

const FIREFOX = '/Applications/Firefox.app/Contents/MacOS/firefox';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export async function launchFx({ width = 1440, height = 800, port = 9222, headless = false } = {}) {
  const dir = await mkdtemp(path.join(tmpdir(), 'fx-'));
  const proc = spawn(FIREFOX, [
    '--remote-debugging-port=' + port, '--profile', dir, '--no-remote', '--new-instance',
    ...(headless ? ['--headless'] : []), '--width', String(width), '--height', String(height), 'about:blank',
  ], { stdio: 'ignore' });

  let ws;
  let lastErr; for (let i = 0; i < 200; i++) {
    try {
      ws = new WebSocket(`ws://127.0.0.1:${port}/session`);
      await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });
      break;
    } catch (e) { lastErr = e; ws = null; await sleep(300); }
  }
  if (!ws) throw new Error("Firefox BiDi did not start: " + (lastErr && (lastErr.message || lastErr.type)));
  let id = 0;
  const pending = new Map();
  ws.onmessage = (m) => {
    const msg = JSON.parse(m.data);
    if (msg.id && pending.has(msg.id)) { pending.get(msg.id)(msg); pending.delete(msg.id); }
  };
  const send = (method, params = {}) => new Promise((resolve, reject) => {
    const mid = ++id;
    pending.set(mid, (msg) => (msg.type === 'error' ? reject(new Error(`${method}: ${msg.error} ${msg.message}`)) : resolve(msg.result)));
    ws.send(JSON.stringify({ id: mid, method, params }));
  });
  await send('session.new', { capabilities: { alwaysMatch: {} } });
  const tree = await send('browsingContext.getTree', {});
  const context = tree.contexts[0].context;
  try { await send('browsingContext.setViewport', { context, viewport: { width, height } }); } catch {}

  const api = {
    send, sleep, context,
    async goto(url, wait = 1500) { await send('browsingContext.navigate', { context, url, wait: 'complete' }); await sleep(wait); },
    // Evaluate JS; return value is JSON-stringified in the page and parsed here.
    async eval(expr) {
      const r = await send('script.evaluate', {
        expression: `(async () => JSON.stringify(await (${expr})))()`, target: { context }, awaitPromise: true, resultOwnership: 'none',
      });
      if (r.type === 'exception') throw new Error(r.exceptionDetails?.text || 'script exception');
      return r.result.value === undefined ? undefined : JSON.parse(r.result.value);
    },
    async shot(file) {
      const r = await send('browsingContext.captureScreenshot', { context, origin: 'viewport', format: { type: 'image/jpeg', quality: 0.7 } });
      await writeFile(file, Buffer.from(r.data, 'base64'));
    },
    async click(x, y) {
      await send('input.performActions', { context, actions: [{ type: 'pointer', id: 'mouse', parameters: { pointerType: 'mouse' }, actions: [
        { type: 'pointerMove', x, y }, { type: 'pointerDown', button: 0 }, { type: 'pointerUp', button: 0 },
      ] }] });
    },
    async close() { try { await send('browser.close'); } catch {} proc.kill(); },
  };
  return api;
}
