// @ts-check
import { defineConfig } from 'astro/config';

/**
 * Astro configuration — Shade Page ("Explanation Wrongness" companion site)
 *
 * GitHub Pages PROJECT site: the repository is `5ShadesOfWrong/5Shades_Page`,
 * so Pages serves the site at https://5shadesofwrong.github.io/5Shades_Page/
 * (the root URL only works for a repo named `<user>.github.io`). `base` MUST
 * match the repository name — every asset URL is generated relative to it.
 */
export default defineConfig({
	site: 'https://5shadesofwrong.github.io',
	base: '/',

	// Security hardening (project constraint): Astro auto-escapes expressions by
	// default. Never use `set:html` on dynamic data. Predictable URL handling:
	trailingSlash: 'ignore',
});
