const fs = require("fs");
const path = require("path");

const projectRoot = process.cwd();
const srcRoot = path.join(projectRoot, "src");

const exts = [".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs"];
const assetExts = [".css", ".scss", ".sass", ".less", ".png", ".jpg", ".jpeg", ".webp", ".svg", ".gif", ".ico"];

function walk(dir) {
  let res = [];
  const items = fs.readdirSync(dir, { withFileTypes: true });
  for (const it of items) {
    const full = path.join(dir, it.name);
    if (it.isDirectory()) {
      // skip node_modules-like folders inside src if any
      if (it.name === "node_modules") continue;
      res = res.concat(walk(full));
    } else {
      if (exts.includes(path.extname(it.name))) res.push(full);
    }
  }
  return res;
}

function uniq(arr) {
  return Array.from(new Set(arr));
}

function add(map, key, fromFile) {
  if (!map[key]) map[key] = new Set();
  map[key].add(fromFile);
}

function fileExistsAny(basePath) {
  // If spec already has extension
  if (fs.existsSync(basePath) && fs.statSync(basePath).isFile()) return true;

  // Try extensions
  for (const e of exts) {
    const p = basePath + e;
    if (fs.existsSync(p) && fs.statSync(p).isFile()) return true;
  }

  // Try directory index.*
  if (fs.existsSync(basePath) && fs.statSync(basePath).isDirectory()) {
    for (const e of exts) {
      const p = path.join(basePath, "index" + e);
      if (fs.existsSync(p) && fs.statSync(p).isFile()) return true;
    }
  }

  // Try asset imports
  for (const e of assetExts) {
    const p = basePath + e;
    if (fs.existsSync(p) && fs.statSync(p).isFile()) return true;
  }

  return false;
}

function resolveLocal(spec, fromFile) {
  // Alias @/ -> src/
  if (spec.startsWith("@/")) {
    return path.join(srcRoot, spec.slice(2));
  }
  // Relative
  if (spec.startsWith("./") || spec.startsWith("../")) {
    return path.resolve(path.dirname(fromFile), spec);
  }
  return null;
}

function isLocalLike(spec) {
  return spec.startsWith("@/") || spec.startsWith("./") || spec.startsWith("../");
}

function isIgnorable(spec) {
  // ignore next internal virtual modules, etc. (add here if needed)
  return spec.startsWith("node:") || spec.startsWith("virtual:") || spec === "";
}

function canResolvePackage(spec) {
  try {
    require.resolve(spec, { paths: [projectRoot] });
    return true;
  } catch {
    return false;
  }
}

// Extract import specifiers (simple regex pass)
const importRegexes = [
  /\bimport\s+[^'"]*?\s+from\s+["']([^"']+)["']/g,     // import x from 'y'
  /\bimport\s+["']([^"']+)["']/g,                      // import 'y'
  /\bimport\(\s*["']([^"']+)["']\s*\)/g,               // import('y')
  /\brequire\(\s*["']([^"']+)["']\s*\)/g               // require('y')
];

const files = walk(srcRoot);

const missingLocal = {};
const missingPkgs = {};
const allImports = new Set();

for (const f of files) {
  const text = fs.readFileSync(f, "utf8");

  for (const rx of importRegexes) {
    rx.lastIndex = 0;
    let m;
    while ((m = rx.exec(text)) !== null) {
      const spec = (m[1] || "").trim();
      if (isIgnorable(spec)) continue;
      allImports.add(spec);

      if (isLocalLike(spec)) {
        const resolved = resolveLocal(spec, f);
        if (!resolved || !fileExistsAny(resolved)) {
          add(missingLocal, spec, path.relative(projectRoot, f));
        }
      } else {
        // treat as package
        if (!canResolvePackage(spec)) {
          add(missingPkgs, spec, path.relative(projectRoot, f));
        }
      }
    }
  }
}

function formatSection(title, obj) {
  const keys = Object.keys(obj).sort();
  let out = `\n${title} (${keys.length})\n`;
  out += "-".repeat(60) + "\n";
  for (const k of keys) {
    const from = Array.from(obj[k]).sort();
    out += `- ${k}\n`;
    for (const f of from.slice(0, 15)) out += `    • ${f}\n`;
    if (from.length > 15) out += `    • ...and ${from.length - 15} more\n`;
  }
  return out;
}

let report = "";
report += "BETTERME PROJECT AUDIT: Missing Imports Report\n";
report += "Generated at: " + new Date().toISOString() + "\n";
report += "Project root: " + projectRoot + "\n";
report += "Scanned files: " + files.length + "\n";
report += "Total unique import specifiers found: " + allImports.size + "\n";

report += formatSection("MISSING LOCAL MODULES", missingLocal);
report += formatSection("MISSING NPM PACKAGES", missingPkgs);

fs.writeFileSync(path.join(projectRoot, "missing-imports-report.txt"), report, "utf8");
console.log(report);
