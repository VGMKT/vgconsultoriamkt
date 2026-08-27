import { createReadStream, promises as fs } from 'node:fs';
import { createServer } from 'node:http';
import { extname, join, normalize, posix, relative, resolve } from 'node:path';
import { performance } from 'node:perf_hooks';
import { fileURLToPath } from 'node:url';

const artifactRoot = resolve(fileURLToPath(new URL('..', import.meta.url)));
const distRoot = resolve(artifactRoot, 'dist/public');
const budgetPath = resolve(artifactRoot, 'performance-budget.json');
const reportPath = process.env.PERF_AUDIT_REPORT
  ? resolve(process.env.PERF_AUDIT_REPORT)
  : resolve(artifactRoot, '.performance/performance-report.json');

const MIME_TYPES = {
  '.css': 'text/css; charset=utf-8',
  '.gif': 'image/gif',
  '.html': 'text/html; charset=utf-8',
  '.ico': 'image/x-icon',
  '.jpeg': 'image/jpeg',
  '.jpg': 'image/jpeg',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
};

const readJson = async (path) => JSON.parse(await fs.readFile(path, 'utf8'));

function staticServer(root) {
  return createServer(async (request, response) => {
    try {
      const requestPath = decodeURIComponent(new URL(request.url ?? '/', 'http://localhost').pathname);
      const requested = normalize(join(root, requestPath));
      const relativePath = relative(root, requested);

      if (relativePath.startsWith('..') || relativePath.includes(`..${'/'}`)) {
        response.writeHead(403);
        response.end('Forbidden');
        return;
      }

      let filePath = requested;
      const requestedStat = await fs.stat(filePath).catch(() => null);
      if (requestedStat?.isDirectory() || !requestedStat) {
        filePath = join(requested, 'index.html');
      }

      const fileStat = await fs.stat(filePath).catch(() => null);
      if (!fileStat?.isFile()) {
        response.writeHead(404);
        response.end('Not found');
        return;
      }

      response.writeHead(200, {
        'Cache-Control': 'no-store',
        'Content-Length': fileStat.size,
        'Content-Type': MIME_TYPES[extname(filePath)] ?? 'application/octet-stream',
      });
      createReadStream(filePath).pipe(response);
    } catch {
      response.writeHead(400);
      response.end('Bad request');
    }
  });
}

async function listen(server) {
  await new Promise((resolveListen, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', resolveListen);
  });
  const { port } = server.address();
  return `http://127.0.0.1:${port}`;
}

function localResourceUrls(html) {
  const urls = new Set();
  const addMatches = (pattern) => {
    for (const match of html.matchAll(pattern)) {
      if (match[1]?.startsWith('/')) urls.add(match[1]);
    }
  };

  addMatches(/\bcomponent-url="([^"]+)"/g);
  addMatches(/\brenderer-url="([^"]+)"/g);
  addMatches(/<link\b[^>]*\brel="stylesheet"[^>]*\bhref="([^"]+)"/g);
  addMatches(/<link\b[^>]*\bhref="([^"]+)"[^>]*\brel="stylesheet"/g);
  return [...urls];
}

function blockingStylesheets(html) {
  const head = html.match(/<head\b[^>]*>([\s\S]*?)<\/head>/i)?.[1] ?? '';
  const urls = new Set();
  const addMatches = (pattern) => {
    for (const match of head.matchAll(pattern)) {
      if (match[1]?.startsWith('/')) urls.add(match[1]);
    }
  };

  addMatches(/<link\b[^>]*\brel="stylesheet"[^>]*\bhref="([^"]+)"/g);
  addMatches(/<link\b[^>]*\bhref="([^"]+)"[^>]*\brel="stylesheet"/g);
  return [...urls];
}

function publicEntrypoints(html) {
  const urls = new Set();
  for (const pattern of [/\bcomponent-url="([^"]+)"/g, /\brenderer-url="([^"]+)"/g]) {
    for (const match of html.matchAll(pattern)) {
      if (match[1]?.startsWith('/')) urls.add(match[1]);
    }
  }
  return [...urls];
}

function localImports(resourcePath, source) {
  const imports = new Set();
  const importPattern = /(?:\bfrom\s*|\bimport\s*\()\s*["'`]([^"'`]+)["'`]/g;
  for (const match of source.matchAll(importPattern)) {
    if (!match[1]?.startsWith('.')) continue;
    const importedPath = posix.normalize(
      posix.join(posix.dirname(resourcePath), match[1]),
    );
    if (importedPath.startsWith('/')) imports.add(importedPath);
  }
  return [...imports];
}

async function collectPublicEntrypointResources(
  baseUrl,
  entrypointUrls,
  resourceByPath,
  userAgent,
) {
  const resources = [];
  const pending = [...entrypointUrls];
  const visited = new Set();

  while (pending.length) {
    const resourcePath = pending.shift();
    if (!resourcePath || visited.has(resourcePath)) continue;
    visited.add(resourcePath);

    const resource =
      resourceByPath.get(resourcePath) ??
      (await fetchResource(baseUrl, resourcePath, userAgent));
    if (!resource.ok) {
      throw new Error(`${resourcePath} retornou HTTP ${resource.status}`);
    }
    resourceByPath.set(resourcePath, resource);
    resources.push({ path: resourcePath, ...resource });

    if (resourcePath.endsWith('.js')) {
      const source = Buffer.from(resource.body).toString('utf8');
      pending.push(...localImports(resourcePath, source));
    }
  }

  return resources;
}

async function fetchResource(baseUrl, resourcePath, userAgent) {
  const start = performance.now();
  const response = await fetch(new URL(resourcePath, `${baseUrl}/`), {
    headers: { 'user-agent': userAgent },
  });
  const firstByteMs = performance.now() - start;
  const body = await response.arrayBuffer();
  return {
    body,
    bytes: body.byteLength,
    firstByteMs: Number(firstByteMs.toFixed(1)),
    ok: response.ok,
    status: response.status,
    totalMs: Number((performance.now() - start).toFixed(1)),
  };
}

async function auditPage(baseUrl, page, profile, budgets) {
  const document = await fetchResource(baseUrl, page.path, profile.userAgent);
  if (!document.ok) {
    throw new Error(`${page.path} retornou HTTP ${document.status}`);
  }

  const html = Buffer.from(document.body).toString('utf8');
  const entrypointUrls = publicEntrypoints(html);
  const blockingCssUrls = blockingStylesheets(html);
  if (!entrypointUrls.length) {
    throw new Error(`${page.path} não expõe um entrypoint público de hidratação`);
  }
  const criticalUrls = localResourceUrls(html);
  const resources = await Promise.all(
    criticalUrls.map(async (resourcePath) => ({
      path: resourcePath,
      ...(await fetchResource(baseUrl, resourcePath, profile.userAgent)),
    })),
  );
  const resourceByPath = new Map(resources.map((resource) => [resource.path, resource]));
  const entrypointResources = await collectPublicEntrypointResources(
    baseUrl,
    entrypointUrls,
    resourceByPath,
    profile.userAgent,
  );
  const blockingCssResources = blockingCssUrls.map((path) => resourceByPath.get(path)).filter(Boolean);
  const publicEntrypointBytes = entrypointResources.reduce((sum, resource) => sum + resource.bytes, 0);
  const blockingCssBytes = blockingCssResources.reduce((sum, resource) => sum + resource.bytes, 0);
  const criticalResourceLoadMs = resources.reduce(
    (max, resource) => Math.max(max, resource.totalMs),
    0,
  );

  const metrics = {
    documentBytes: document.bytes,
    documentFirstByteMs: document.firstByteMs,
    documentLoadMs: document.totalMs,
    publicEntrypointBytes,
    publicEntrypointKiB: Number((publicEntrypointBytes / 1024).toFixed(1)),
    publicEntrypoints: entrypointResources.map(({ path, bytes }) => ({ bytes, path })),
    blockingCssBytes,
    blockingCssKiB: Number((blockingCssBytes / 1024).toFixed(1)),
    blockingCssRequests: blockingCssResources.length,
    blockingStylesheets: blockingCssResources.map(({ bytes, path }) => ({ bytes, path })),
    criticalResourceBytes: resources.reduce((sum, resource) => sum + resource.bytes, 0),
    criticalResourceLoadMs: Number(criticalResourceLoadMs.toFixed(1)),
    criticalResourceRequests: resources.length,
  };

  const checks = [
    ['publicEntrypointBytes', metrics.publicEntrypointBytes, budgets.publicEntrypointBytes],
    ['blockingCssBytes', metrics.blockingCssBytes, budgets.blockingCssBytes],
    ['blockingCssRequests', metrics.blockingCssRequests, budgets.blockingCssRequests],
    ['documentBytes', metrics.documentBytes, budgets.documentBytes],
    ['documentLoadMs', metrics.documentLoadMs, budgets.documentLoadMs],
    ['criticalResourceLoadMs', metrics.criticalResourceLoadMs, budgets.criticalResourceLoadMs],
  ].map(([metric, value, budget]) => ({
    metric,
    value,
    budget,
    passed: value <= budget,
  }));

  return {
    page: page.name,
    path: page.path,
    profile: profile.name,
    viewport: profile.viewport,
    metrics,
    checks,
    passed: checks.every((check) => check.passed),
  };
}

function printReport(report) {
  console.log('\nPerformance audit — VG Marketing');
  console.log('Gate: entrypoint público, CSS bloqueante, documento e recursos críticos\n');

  for (const result of report.results) {
    const status = result.passed ? 'PASS' : 'FAIL';
    console.log(
      `${status} ${result.profile.padEnd(7)} ${result.path.padEnd(34)} ` +
        `JS ${(result.metrics.publicEntrypointKiB + ' KiB').padStart(10)} | ` +
        `CSS ${(result.metrics.blockingCssKiB + ' KiB').padStart(10)} | ` +
        `doc ${result.metrics.documentLoadMs} ms | ` +
        `critical ${result.metrics.criticalResourceLoadMs} ms`,
    );
    for (const check of result.checks.filter(({ passed }) => !passed)) {
      console.error(
        `  Regra excedida: ${check.metric} = ${check.value}; limite = ${check.budget}`,
      );
    }
  }

  console.log(`\nRelatório JSON: ${reportPath}`);
  console.log(report.passed ? 'Performance gate aprovado.' : 'Performance gate reprovado.');
}

async function main() {
  const budget = await readJson(budgetPath);
  const server = staticServer(distRoot);
  const baseUrl = await listen(server);

  try {
    const results = [];
    for (const page of budget.pages) {
      for (const profile of budget.profiles) {
        results.push(await auditPage(baseUrl, page, profile, budget.budgets));
      }
    }

    const report = {
      generatedAt: new Date().toISOString(),
      source: 'dist/public',
      measurement: 'build estático + requisições HTTP locais; perfis desktop/mobile registrados no relatório',
      baseUrl,
      budgets: budget.budgets,
      pages: budget.pages,
      profiles: budget.profiles.map(({ name, viewport }) => ({ name, viewport })),
      results,
      passed: results.every(({ passed }) => passed),
    };

    await fs.mkdir(resolve(reportPath, '..'), { recursive: true });
    await fs.writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`);
    printReport(report);

    if (!report.passed) process.exitCode = 1;
  } finally {
    await new Promise((resolveClose) => server.close(resolveClose));
  }
}

try {
  await main();
} catch (error) {
  console.error(`Performance audit não executado: ${error.message}`);
  process.exitCode = 1;
}