import { spawn } from 'node:child_process';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const output = resolve(root, '.qa');
await mkdir(output, { recursive: true });
const browserPath = process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const browser = spawn(browserPath, ['--headless=new', '--no-sandbox', '--disable-gpu-sandbox', '--disable-gpu', '--disable-software-rasterizer', '--no-first-run', '--no-default-browser-check', '--disable-background-networking', '--remote-debugging-port=0', `--user-data-dir=${resolve(output, 'verification-profile')}`, 'about:blank'], { windowsHide: true, stdio: ['ignore', 'ignore', 'pipe'] });
let socket;
const timeout = setTimeout(() => { console.error('Browser verification timed out.'); browser.kill(); process.exitCode = 1; }, 45000);
try {
  const endpoint = await new Promise((accept, reject) => {
    let log = '';
    browser.stderr.on('data', chunk => { log += chunk; const match = log.match(/DevTools listening on (ws:\/\/[^\s]+)/); if (match) accept(match[1]); });
    browser.on('error', reject);
    browser.on('exit', code => reject(new Error(`Browser stopped before debugging became available: ${code}`)));
  });
  socket = new WebSocket(endpoint);
  await new Promise((accept, reject) => { socket.addEventListener('open', accept, { once: true }); socket.addEventListener('error', reject, { once: true }); });
  let sequence = 0;
  const pending = new Map();
  const exceptions = [];
  socket.addEventListener('message', event => {
    const message = JSON.parse(event.data);
    if (message.id && pending.has(message.id)) {
      const request = pending.get(message.id); pending.delete(message.id);
      message.error ? request.reject(new Error(message.error.message)) : request.accept(message.result);
    }
    if (message.method === 'Runtime.exceptionThrown') exceptions.push(message.params.exceptionDetails.text);
  });
  function send(method, params = {}, sessionId) {
    return new Promise((accept, reject) => { const id = ++sequence; pending.set(id, { accept, reject }); socket.send(JSON.stringify({ id, method, params, sessionId })); });
  }
  const target = await send('Target.createTarget', { url: 'about:blank' });
  const { sessionId } = await send('Target.attachToTarget', { targetId: target.targetId, flatten: true });
  const call = (method, params) => send(method, params, sessionId);
  await call('Page.enable');
  await call('Runtime.enable');
  async function evaluate(expression) {
    const result = await call('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
    if (result.exceptionDetails) throw new Error(result.exceptionDetails.text);
    return result.result.value;
  }
  await call('Emulation.setDeviceMetricsOverride', { width: 1440, height: 1000, deviceScaleFactor: 1, mobile: false });
  await call('Page.navigate', { url: 'http://127.0.0.1:4173/' });
  for (let attempt = 0; attempt < 30; attempt++) {
    if (await evaluate('document.readyState === "complete" && Boolean(document.querySelector(".hero"))')) break;
    await new Promise(accept => setTimeout(accept, 150));
  }
  await evaluate('document.fonts.ready');
  await evaluate('Promise.all(document.getAnimations().map(animation => animation.finished.catch(() => {})))');
  assert.equal(await evaluate('document.querySelector("h1").textContent.includes("possibilities")'), true);
  assert.equal(await evaluate('document.documentElement.scrollWidth <= innerWidth'), true, 'Desktop horizontal overflow');
  const desktop = await call('Page.captureScreenshot', { format: 'png' });
  await writeFile(resolve(output, 'desktop.png'), Buffer.from(desktop.data, 'base64'));
  await evaluate('document.querySelector("#tab-primary").click()');
  assert.equal(await evaluate('document.querySelector("#stage-title").textContent'), 'Ready for a bigger world');
  assert.equal(await evaluate('document.querySelector("#learning-panel").getAttribute("aria-labelledby")'), 'tab-primary');
  await evaluate('document.querySelector(".learning-detail [data-enquire]").click()');
  assert.equal(await evaluate('document.querySelector("#enquiry-dialog").open'), true);
  assert.equal(await evaluate('document.querySelector("#class-interest").value'), 'Primary');
  await evaluate('new Promise(accept => { const dialog = document.querySelector("#enquiry-dialog"); dialog.addEventListener("close", accept, { once: true }); dialog.querySelector("[data-close]").click(); })');
  assert.equal(await evaluate('document.body.classList.contains("dialog-open")'), false);
  await evaluate('document.querySelector("[data-gallery=poster]").click()');
  assert.equal(await evaluate('document.querySelector("#gallery-dialog").open && document.querySelector("#gallery-image").src.includes("admissions-poster")'), true);
  await evaluate('new Promise(accept => { const dialog = document.querySelector("#gallery-dialog"); dialog.addEventListener("close", accept, { once: true }); dialog.close(); })');
  await evaluate('document.querySelector("[data-privacy]").click()');
  assert.equal(await evaluate('document.querySelector("#privacy-dialog").open'), true);
  await evaluate('new Promise(accept => { const dialog = document.querySelector("#privacy-dialog"); dialog.addEventListener("close", accept, { once: true }); dialog.close(); })');
  await call('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 1, mobile: true });
  await evaluate('window.scrollTo(0, 0)');
  assert.equal(await evaluate('document.documentElement.scrollWidth <= innerWidth'), true, 'Mobile horizontal overflow');
  await evaluate('document.querySelector(".menu-toggle").click()');
  assert.equal(await evaluate('document.querySelector(".menu-toggle").getAttribute("aria-expanded")'), 'true');
  await evaluate('document.querySelector("#site-navigation a").click()');
  assert.equal(await evaluate('document.querySelector(".menu-toggle").getAttribute("aria-expanded")'), 'false');
  await evaluate('window.scrollTo({top: 0, behavior: "instant"})');
  const mobile = await call('Page.captureScreenshot', { format: 'png' });
  await writeFile(resolve(output, 'mobile.png'), Buffer.from(mobile.data, 'base64'));
  assert.equal(exceptions.length, 0, `Browser errors: ${exceptions.join(', ')}`);
  console.log('Browser checks passed: desktop/mobile layout, stage tabs, admissions, gallery, privacy and mobile menu. Screenshots saved to .qa/.');
} catch (error) {
  console.error(error.message); process.exitCode = 1;
} finally {
  clearTimeout(timeout); socket?.close(); browser.kill();
}
