# SETUP.md — Environment Setup, Step by Step
### Shade Page · "Tutorial on Explanation Wrongness" companion site

> **Purpose:** every dependency and command needed to go from a fresh machine to a running dev environment — **before any coding starts**.
> **Policy:** nothing here is executed automatically. Run each step yourself (or ask the assistant to run it explicitly).
> **Status of this machine (updated 2026-10-19):** Python 3.12.3 ✅ · git ✅ · Node **v18.19.1** ❌ (too old — current `create-astro@5.3.0` requires **≥ 22.22.0**; upgrade needed, see Step 1) · npm 9.2.0 (becomes 10.x with Node 22) · `.venv` with pypdf/pdfreader ✅

---

## Overview of the toolchain

| Layer | Tool | Why it's needed | Status |
|---|---|---|---|
| Runtime | **Node.js ≥ 22.22** (LTS) | Current Astro toolchain (`create-astro@5.3.0`) hard-requires it | ❌ upgrade from v18.19.1 |
| Package manager | **npm** (bundled with Node) | Install project dependencies, run scripts | ⬜ 10.x comes with Node 22 |
| Site framework | **astro** | Static site generation, component model, MDX | ⬜ `npm install` (project step) |
| Content | Markdown + content collections | Paper content as editable data files | ⬜ included in Astro |
| Scroll/motion | **GSAP + ScrollTrigger** (optional) | Pinned sections, diagram draw-on-scroll | ⬜ `npm install` (project step) |
| Version control | **git** | Already available | ✅ |
| PDF tooling (utility only) | **pypdf**, **pdfreader** | One-off extraction of the paper text → content files | ✅ already in `.venv` |
> The Python venv is **not** part of the website runtime — it's a utility environment used to extract paper content into Markdown/JSON. Keep it separate from the Node project.

---

## Step 1 — Install Node.js 22 (required, machine-level) — ❌ BLOCKING

> **This machine has Node v18.19.1 — too old.** The scaffold failed with:
> `create-astro@5.3.0 required: { node: '>=22.22.0' }`.
> **Action needed:** install Node 22 (options below), then re-run Step 2.

Current Astro tooling requires **Node ≥ 22.22.0** (LTS). Node 18/20 are no longer supported by the latest `create-astro`.

**Option 1 — nvm (recommended; no sudo, per-user, keeps apt Node untouched):**
```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
# restart the shell, then:
nvm install 22
nvm use 22
nvm alias default 22
```

**Option 2 — NodeSource apt repo (system-wide, needs sudo):**
```bash
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt-get install -y nodejs
```

**Option 3 — plain apt (NOT recommended):**
```bash
sudo apt-get update
sudo apt-get install -y nodejs npm
```
> ⚠️ Ubuntu noble's apt Node is v18.x — **does not meet the requirement**. Use Option 1 or 2.

**Verify:**
```bash
node --version   # expect v22.x
npm --version    # expect 10.x
```

---

## Step 2 — Scaffold the Astro project (project-level)

Run from `/home/joomarcoscampos/projects/shade_page`:

```bash
# non-interactive (recommended — the CLI asks prompts otherwise, e.g. "directory not empty, continue?"):
npm create astro@latest . -- --template minimal --typescript strict --no-install --no-git --yes
```

Flags explained:
- `.` → scaffold into the current folder (it already contains the PDF + docs)
- `--template minimal` → clean base, no blog boilerplate to delete
- `--typescript strict` → typed content collections & config
- `--no-install --no-git` → we review before installing; git repo already exists at workspace level
- `--yes` → accept defaults without interactive prompts

> ⚠️ **Troubleshooting:** `create-astro` is interactive by default. If you cancel it at a prompt (Ctrl+C) **no files are written** — `package.json` will not exist. Re-run with `--yes`.

**Verify before Step 3:**
```bash
ls -la package.json     # file must exist
cat package.json        # must list "astro" under "dependencies"
```

---

## Step 3 — Install project dependencies

```bash
npm install          # installs astro + tooling from package.json
```

Then the optional motion library (only if/when Phase 3 needs it — Phase 1 uses vanilla IntersectionObserver):
```bash
npm install gsap
```

**Verify:**
```bash
npx astro --version
```

---

## Step 4 — Dev/build scripts (created by scaffold; for reference)

```bash
npm run dev      # dev server at http://localhost:4321
npm run build    # static build into ./dist
npm run preview  # serve the production build locally
```

---

## Step 5 — GitHub Pages deployment (runbook)

> **Repo layout this runbook assumes** (matches what you are pushing):
> `.devcontainer/` · `site/` · `.github/` · `SETUP.md`
> The workflows live at the **repository root** `.github/workflows/` — GitHub
> only reads them from there, not from inside `site/`.

### 5.1 — Push the repository

```bash
cd /home/joomarcoscampos/projects/shade_page
git init
git add .devcontainer site .github SETUP.md
git commit -m "v1: Explanation Wrongness companion site"
git remote add origin https://github.com/<username>/<repo-name>.git
git branch -M main
git push -u origin main
```

### 5.2 — Point the config at your real URL

Edit `site/astro.config.mjs` (already set for the user-site deployment):

```js
site: 'https://5shadesofwrong.github.io',
base: '/',   // user site → served at the domain root, no subpath
```

Commit and push this change too — the deploy workflow builds with these values.

### 5.3 — Enable Pages from Actions (one-time, on github.com)

**repo → Settings → Pages → Build and deployment → Source: "GitHub Actions"**

### 5.4 — Deploy

Push to `main` (or **Actions → Deploy to GitHub Pages → Run workflow**).
The root workflow (`.github/workflows/deploy.yml`) will:

1. `npm ci` inside `site/` (locked dependencies)
2. **Validate data schemas** (`site/src/schemas/validate.ts`) — bad data fails the deploy
3. `npm run build` → publishes `site/dist` to Pages

A second workflow (`ci.yml`) runs on PRs: `npm audit --audit-level=high`
(the project's security constraint) + schema validation + build check.

### 5.5 — Verify

- Site live at `https://5shadesofwrong.github.io/`
- Paper PDF link + logos work (BASE_URL-resolved, subpath-safe)
- Nav rail dots track scrolling; presenter toggle persists across reloads

### 5.6 — Before announcing (checklist)

- [ ] Fill real values in `site/src/data/site.json`: authors, contact, paper `file`/`venue`, BibTeX
- [ ] Add `site/public/og-image.png` (1200×630) — social sharing card
- [ ] `npm audit` clean locally
- [ ] Lighthouse pass (Performance/Accessibility ≥ 90) on the deployed URL
- [ ] Custom domain (optional): add CNAME file + DNS record, then update `site` in astro.config.mjs

---

## Step 6 — Python utility environment (already done ✅)

The user already created `.venv` with the extraction libraries. For reproducibility on other machines, the pinned dependencies are in `requirements.txt`:

```bash
python3 -m venv .venv
.venv/bin/pip install -r requirements.txt
```

Used only for: `50Shades_Tutorial_Scenario_Drafting.pdf` → Markdown/JSON content files. Not needed to build or serve the site.

---

## Step 7 — Editor tooling (recommended, not required)

- **VS Code extensions:** `astro-build.astro-vscode` (syntax + IntelliSense), `dbaeumer.vscode-eslint` + `esbenp.prettier-vscode` (formatting).
- Add `.vscode/extensions.json` recommending them (done during scaffold).

---

## Post-setup checklist

- [ ] `node --version` ≥ 22.22 → currently **v18.19.1 ❌ (upgrade needed)**
- [ ] `npm --version` → 10.x (comes with Node 22)
- [ ] Astro project scaffolded in `shade_page/`
- [ ] `npm install` completed without errors
- [ ] `npm run dev` serves the starter page
- [ ] `.venv` + `requirements.txt` present for PDF extraction utilities
- [ ] `.gitignore` covers `node_modules/`, `dist/`, `.astro/` (`.venv/` optional — decide with team)

---

## Dependency summary (what will end up in `package.json`)

| Package | Purpose | Phase |
|---|---|---|
| `astro` | Site framework, build, dev server | 1 |
| `@astrojs/mdx` (optional) | Rich Markdown with embedded components | 1–2 |
| `gsap` (optional) | ScrollTrigger choreography | 3 |
| `@astrojs/sitemap` (optional) | SEO sitemap | 4 |

No runtime JS framework (React/Vue) is needed — Astro components + vanilla JS islands keep the page fast.
