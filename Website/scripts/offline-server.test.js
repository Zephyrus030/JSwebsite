import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { afterAll, beforeAll, expect, it } from 'vitest';

const powershell = path.join(
  process.env.WINDIR ?? 'C:\\Windows',
  'System32',
  'WindowsPowerShell',
  'v1.0',
  'powershell.exe',
);

let root;
let server;
let serverUrl;

beforeAll(async () => {
  root = await mkdtemp(path.join(tmpdir(), 'js-building-offline-'));
  await writeFile(path.join(root, 'index.html'), '<main>offline home</main>');
  await writeFile(path.join(root, 'asset.txt'), 'local asset');

  const port = 45000 + Math.floor(Math.random() * 10000);
  const script = path.resolve('offline/serve.ps1');
  server = spawn(powershell, [
    '-NoProfile',
    '-ExecutionPolicy', 'Bypass',
    '-File', script,
    '-Root', root,
    '-Port', String(port),
    '-NoBrowser',
  ]);

  serverUrl = await new Promise((resolve, reject) => {
    let output = '';
    const timeout = setTimeout(() => reject(new Error(`Server did not start: ${output}`)), 5000);
    server.stdout.on('data', (chunk) => {
      output += chunk;
      const match = output.match(/READY (http:\/\/[^\s]+)/);
      if (match) {
        clearTimeout(timeout);
        resolve(match[1]);
      }
    });
    server.stderr.on('data', (chunk) => { output += chunk; });
    server.on('exit', (code) => {
      clearTimeout(timeout);
      reject(new Error(`Server exited with code ${code}: ${output}`));
    });
  });
});

afterAll(async () => {
  server?.kill();
  if (root) await rm(root, { force: true, recursive: true });
});

it('serves SPA routes and local static assets from the package root', async () => {
  const [home, route, asset] = await Promise.all([
    fetch(serverUrl),
    fetch(`${serverUrl}/about`),
    fetch(`${serverUrl}/asset.txt`),
  ]);

  expect(await home.text()).toContain('offline home');
  expect(await route.text()).toContain('offline home');
  expect(await asset.text()).toBe('local asset');
});
