/**
 * Post-build step for the Facebook Instant Games bundle.
 *
 * Next.js emits, for every CSS file, BOTH a render-blocking
 * `<link rel="stylesheet">` AND a redundant `<link rel="preload" as="style">`.
 * Inside Facebook's instant-bundle proxy the browser cannot reconcile the
 * preload with the stylesheet request, so it logs:
 *   "The resource ... was preloaded using link preload but not used ..."
 *
 * The stylesheet links already load the CSS at top priority, so the preload
 * hints add no value here. We strip only the `as="style"` preloads (CSS),
 * leaving every stylesheet link and any non-CSS preload untouched.
 */
const fs = require("fs");
const path = require("path");

const OUT_DIR = path.join(__dirname, "..", "out");
// Matches a self-closing <link rel="preload" ... as="style" ...> in any attribute order.
const CSS_PRELOAD =
  /<link\b(?=[^>]*\brel="preload")(?=[^>]*\bas="style")[^>]*\/?>/g;

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(full);
    } else if (entry.name.endsWith(".html")) {
      const html = fs.readFileSync(full, "utf8");
      const stripped = html.replace(CSS_PRELOAD, "");
      if (stripped !== html) {
        const removed = (html.match(CSS_PRELOAD) || []).length;
        fs.writeFileSync(full, stripped);
        console.log(
          `strip-css-preload: removed ${removed} CSS preload link(s) from ${path.relative(
            OUT_DIR,
            full,
          )}`,
        );
      }
    }
  }
}

if (!fs.existsSync(OUT_DIR)) {
  console.error(
    `strip-css-preload: ${OUT_DIR} not found — run "next build" first.`,
  );
  process.exit(1);
}

walk(OUT_DIR);
