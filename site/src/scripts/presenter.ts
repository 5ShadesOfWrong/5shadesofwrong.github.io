/**
 * presenter.ts — presenter mode toggle (PresenterToggle.astro)
 * ------------------------------------------------------------
 * Toggles `data-presenter="true"` on <html> and persists the choice.
 * BaseLayout applies the stored state pre-paint; this module flips it.
 *
 * Effects of presenter mode:
 *   - tokens.css: larger type/spacing (projection-friendly)
 *   - scenario.ts: cards switch to click-to-reveal (no scroll spoilers)
 *
 * Security: fixed storage key, bare string value, no DOM injection.
 */

const STORAGE_KEY = 'shade-presenter';

function apply(html: HTMLElement, on: boolean): void {
	if (on) {
		html.dataset.presenter = 'true';
	} else {
		delete html.dataset.presenter;
	}
}

function syncButtons(on: boolean): void {
	for (const btn of document.querySelectorAll<HTMLButtonElement>('[data-presenter-toggle]')) {
		btn.setAttribute('aria-pressed', String(on));
	}
}

function init(): void {
	const html = document.documentElement;

	// Sync button state with the pre-paint bootstrap in BaseLayout.
	const initiallyOn = html.dataset.presenter === 'true';
	syncButtons(initiallyOn);

	for (const btn of document.querySelectorAll<HTMLButtonElement>('[data-presenter-toggle]')) {
		btn.addEventListener('click', () => {
			const next = html.dataset.presenter !== 'true';
			apply(html, next);
			syncButtons(next);
			try {
				localStorage.setItem(STORAGE_KEY, String(next));
			} catch {
				/* storage unavailable — mode still applies for this session */
			}
		});
	}
}

if (document.querySelector('[data-presenter-toggle]')) {
	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', init, { once: true });
	} else {
		init();
	}
}

export {};
