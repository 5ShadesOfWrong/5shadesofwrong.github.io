# Explanation Wrongness — companion site

A one-page, scroll-driven companion to the paper
**"5(0) Shades of Wrong: Disentangling the Wrongness of AI Explanations"**.

The site introduces the paper's framework — the three lenses of explanation
wrongness (**Coherence**, **Validity**, **Faithfulness**) and the six
archetypes from the Perfect Explainer to the Hallucinator — in a visual,
interactive way for readers, conference audiences, and anyone interested in
explainable AI (XAI).

**Live:** <https://5shadesofwrong.github.io/>

## Built with

- [Astro](https://astro.build) — static output, zero JS by default
- Vanilla TypeScript islands (no React/Vue runtime)
- Hand-rolled CSS design system (`src/styles/tokens.css`)

## Development

Requires **Node ≥ 22.22** (or use the included dev container — see
`.devcontainer/` at the repository root).

```bash
npm install     # once
npm run dev     # dev server → http://localhost:4321
npm run build   # static build → ./dist
npm run preview # serve the production build locally
```

## Project structure

```
src/
├── components/   # page sections (Hero, PipelineFlow, ThreeLenses, …)
├── data/         # paper content as typed JSON (lenses, archetypes, …)
├── layouts/      # BaseLayout.astro (head, meta, global styles)
├── pages/        # index.astro — the one page · 404.astro
├── schemas/      # TS types + build-time validation of the data files
├── scripts/      # vanilla TS islands (reveal, presenter, navrail, …)
└── styles/       # tokens.css (design tokens), base.css, components.css
public/
├── logos/        # partner institution logos
└── favicon.svg
```

## Content editing

All paper content lives in `src/data/*.json` — adding a scenario or tweaking
a definition is a data edit, never a code edit. The schemas in
`src/schemas/` validate the data at build time (run
`npx tsx src/schemas/validate.ts` to check manually).

## Deployment

GitHub Pages via the workflow at `.github/workflows/deploy.yml` (repository
root). See `../SETUP.md` for the full runbook.
