import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const lecturesDir = path.join(rootDir, 'lectures');
const distDir = path.join(rootDir, 'dist');

// Read repository name or base path from args / env / default
// Usage: node scripts/build-all.mjs [--base /repo-name/]
const baseArg = process.argv.find(arg => arg.startsWith('--base='));
let repoBase = baseArg ? baseArg.split('=')[1] : null;
if (!repoBase) {
  const baseIdx = process.argv.indexOf('--base');
  if (baseIdx !== -1 && process.argv[baseIdx + 1]) {
    repoBase = process.argv[baseIdx + 1];
  }
}
if (!repoBase) {
  repoBase = process.env.BASE_PATH || '/sde_wise26_27/';
}

// Ensure base starts and ends with '/'
if (!repoBase.startsWith('/')) repoBase = '/' + repoBase;
if (!repoBase.endsWith('/')) repoBase = repoBase + '/';

console.log(`Building all lectures with repo base: "${repoBase}"...`);

// Ensure clean dist directory
if (fs.existsSync(distDir)) {
  fs.rmSync(distDir, { recursive: true, force: true });
}
fs.mkdirSync(distDir, { recursive: true });

// Discover lectures
const entries = fs.readdirSync(lecturesDir, { withFileTypes: true });
const lectures = [];

for (const entry of entries) {
  if (entry.isDirectory()) {
    const lecturePath = path.join(lecturesDir, entry.name);
    const slidesPath = path.join(lecturePath, 'slides.md');
    if (fs.existsSync(slidesPath)) {
      // Extract title from frontmatter if possible
      let title = entry.name;
      const content = fs.readFileSync(slidesPath, 'utf-8');
      const titleMatch = content.match(/^title:\s*(.+)$/m);
      if (titleMatch) {
        title = titleMatch[1].trim().replace(/^['"]|['"]$/g, '');
      }
      lectures.push({ name: entry.name, path: lecturePath, title });
    }
  }
}

// Build each lecture
for (const lecture of lectures) {
  const lectureBase = `${repoBase}${lecture.name}/`;
  const outDir = path.resolve(distDir, lecture.name);
  console.log(`\n--> Building lecture "${lecture.name}" (${lecture.title})`);
  console.log(`    Base: ${lectureBase}`);
  console.log(`    Out:  ${outDir}`);

  execSync(`npx slidev build slides.md --without-notes --base "${lectureBase}" --out "${outDir}"`, {
    cwd: lecture.path,
    stdio: 'inherit',
  });
}

// Generate landing page dist/index.html
const lectureLinksHtml = lectures
  .map(
    (l, idx) => `
    <li class="lecture-item">
      <div class="lecture-number">Lecture ${idx + 1}</div>
      <div class="lecture-details">
        <a class="lecture-title" href="./${l.name}/">${l.title}</a>
        <div class="lecture-slug">${l.name}</div>
      </div>
      <a class="view-btn" href="./${l.name}/">Open Slides &rarr;</a>
    </li>`
  )
  .join('\n');

const portalHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Scalable Data Engineering — WiSe 2026/27</title>
  <style>
    :root {
      --db-navy: #002557;
      --db-blue: #0c3875;
      --db-cyan: #00839e;
      --bg: #f8fafc;
      --card-bg: #ffffff;
      --text: #0f172a;
      --text-muted: #64748b;
      --border: #e2e8f0;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      background: var(--bg);
      color: var(--text);
      line-height: 1.5;
      padding: 3rem 1.5rem;
    }
    .container {
      max-width: 800px;
      margin: 0 auto;
    }
    header {
      margin-bottom: 2.5rem;
      border-bottom: 2px solid var(--db-navy);
      padding-bottom: 1.5rem;
    }
    .eyebrow {
      text-transform: uppercase;
      letter-spacing: 0.1em;
      font-size: 0.85rem;
      font-weight: 700;
      color: var(--db-cyan);
      margin-bottom: 0.5rem;
    }
    h1 {
      font-size: 2.25rem;
      color: var(--db-navy);
      font-weight: 800;
      letter-spacing: -0.02em;
    }
    p.subtitle {
      color: var(--text-muted);
      margin-top: 0.5rem;
      font-size: 1.1rem;
    }
    .lectures-list {
      list-style: none;
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
    .lecture-item {
      background: var(--card-bg);
      border: 1px solid var(--border);
      border-radius: 8px;
      padding: 1.25rem 1.5rem;
      display: flex;
      align-items: center;
      gap: 1.5rem;
      transition: all 0.2s ease;
      box-shadow: 0 1px 3px rgba(0,0,0,0.05);
    }
    .lecture-item:hover {
      border-color: var(--db-cyan);
      box-shadow: 0 4px 12px rgba(0, 131, 158, 0.12);
      transform: translateY(-1px);
    }
    .lecture-number {
      font-weight: 700;
      font-size: 0.85rem;
      color: var(--db-cyan);
      background: rgba(0, 131, 158, 0.1);
      padding: 0.35rem 0.75rem;
      border-radius: 6px;
      white-space: nowrap;
    }
    .lecture-details {
      flex: 1;
    }
    .lecture-title {
      font-size: 1.15rem;
      font-weight: 600;
      color: var(--db-navy);
      text-decoration: none;
    }
    .lecture-title:hover {
      text-decoration: underline;
    }
    .lecture-slug {
      font-size: 0.85rem;
      color: var(--text-muted);
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      margin-top: 0.2rem;
    }
    .view-btn {
      display: inline-flex;
      align-items: center;
      padding: 0.5rem 1rem;
      background: var(--db-navy);
      color: #fff;
      font-size: 0.9rem;
      font-weight: 600;
      text-decoration: none;
      border-radius: 6px;
      transition: background 0.2s ease;
      white-space: nowrap;
    }
    .view-btn:hover {
      background: var(--db-blue);
    }
    footer {
      margin-top: 3rem;
      padding-top: 1.5rem;
      border-top: 1px solid var(--border);
      color: var(--text-muted);
      font-size: 0.85rem;
      text-align: center;
    }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <div class="eyebrow">TU Dresden &bull; Database Research Group</div>
      <h1>Scalable Data Engineering</h1>
      <p class="subtitle">Winter Semester 2026/27 &bull; Lecture Slide Decks</p>
    </header>

    <main>
      <ul class="lectures-list">
        ${lectureLinksHtml}
      </ul>
    </main>

    <footer>
      Powered by <a href="https://sli.dev/" target="_blank" rel="noopener" style="color: inherit;">Slidev</a>
    </footer>
  </div>
</body>
</html>
`;

fs.writeFileSync(path.join(distDir, 'index.html'), portalHtml, 'utf-8');
console.log(`\nGenerated root portal at ${path.join(distDir, 'index.html')}`);
console.log('Build complete!\n');
