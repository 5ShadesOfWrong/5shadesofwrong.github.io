/**
 * scenario.ts — interactions for ScenarioPractice.astro
 * ------------------------------------------------------
 * 1. Tab switching between scenario sets (ARIA tabs; keyboard arrow support).
 * 2. Presenter-mode behavior: when html[data-presenter] is on, all reveal
 *    blocks collapse by default (click-to-reveal during talks). In reader
 *    mode the first block stays open (matches the server-rendered state).
 *
 * Security: only toggles existing attributes/elements; no dynamic HTML, no
 * innerHTML, no eval. State lives in ARIA attributes and the DOM.
 */

/* ---------------- Tabs ---------------- */

function initTabs(): void {
	const tabs = Array.from(document.querySelectorAll<HTMLButtonElement>('[role="tab"][data-tab]'));
	if (tabs.length === 0) return;

	const panels = new Map<string, HTMLElement>();
	for (const panel of document.querySelectorAll<HTMLElement>('[data-panel]')) {
		const key = panel.dataset.panel ?? '';
		panels.set(key, panel);
	}

	const activate = (tab: HTMLButtonElement) => {
		const key = tab.dataset.tab ?? '';
		for (const t of tabs) {
			const selected = t === tab;
			t.setAttribute('aria-selected', String(selected));
			t.classList.toggle('active', selected);
		}
		for (const [panelKey, panel] of panels) {
			panel.hidden = panelKey !== key;
		}
	};

	for (const tab of tabs) {
		tab.addEventListener('click', () => activate(tab));
		tab.addEventListener('keydown', (event) => {
			// Left/Right arrow navigation per WAI-ARIA tabs pattern.
			if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
			const idx = tabs.indexOf(tab);
			const delta = event.key === 'ArrowRight' ? 1 : -1;
			const next = tabs[(idx + delta + tabs.length) % tabs.length];
			next.focus();
			activate(next);
			event.preventDefault();
		});
	}
}

/* ---------------- Presenter-mode reveal behavior ---------------- */

function applyPresenterReveal(): void {
	const presenterOn = document.documentElement.dataset.presenter === 'true';
	// In presenter mode: collapse every block so nothing is spoiled on screen.
	// In reader mode: keep the server-rendered defaults (block 1 open).
	for (const details of document.querySelectorAll<HTMLDetailsElement>('.scenario-card details.block')) {
		details.open = !presenterOn && details.dataset.defaultOpen !== undefined;
	}
}

function initReveal(): void {
	applyPresenterReveal();
	// Re-apply when presenter mode is toggled (presenter.ts flips the attribute).
	const observer = new MutationObserver(() => applyPresenterReveal());
	observer.observe(document.documentElement, {
		attributes: true,
		attributeFilter: ['data-presenter'],
	});
}

/* ---------------- Button-gated assessment (user review 2026-10-19) ---------------- */

/**
 * The assessment only runs when the user clicks "Show my assessment".
 * No backend: the verdict is computed client-side from the user's own
 * selections — the site does not know official answers (open decision #4),
 * so it reflects their input back and points them to the archetypes.
 */
function initAssessment(): void {
	const cards = document.querySelectorAll<HTMLElement>('.scenario-card');

	for (const card of cards) {
		const button = card.querySelector<HTMLButtonElement>('[data-assess-btn]');
		const hint = card.querySelector<HTMLElement>('[data-ranking-hint]');
		const panel = card.querySelector<HTMLElement>('[data-assessment]');
		const verdictEl = card.querySelector<HTMLElement>('[data-assessment-verdict]');
		const detailEl = card.querySelector<HTMLElement>('[data-assessment-detail]');
		const selects = Array.from(card.querySelectorAll<HTMLSelectElement>('select[data-rank]'));
		if (!button || !panel || !verdictEl || !detailEl || selects.length === 0) continue;

		button.addEventListener('click', () => {
			const values = selects.map((s) => Number(s.value));
			const allAnswered = values.every((v) => Number.isFinite(v) && v >= 1 && v <= 6);

			if (!allAnswered) {
				// Nudge: show the hint, shake the button slightly.
				hint?.removeAttribute('hidden');
				return;
			}
			hint?.setAttribute('hidden', '');

			const avg = values.reduce((a, b) => a + b, 0) / values.length;
			const worst = Math.max(...values);
			const best = Math.min(...values);

			let verdict: string;
			if (avg <= 2) {
				verdict = 'You rate this explanation as largely sound.';
			} else if (avg >= 5) {
				verdict = 'You rate this explanation as deeply wrong.';
			} else {
				verdict = 'You rate this explanation as partially wrong.';
			}

			// Point out the most suspicious dimension (highest rank).
			const labels = ['coherence', 'validity', 'faithfulness'];
			const worstIdx = values.indexOf(worst);
			let detail = `Average rating: ${avg.toFixed(1)} / 6.`;
			if (worst >= 4 && worst > best) {
				detail += ` Your biggest concern: ${labels[worstIdx]} (ranked ${worst}).`;
			}

			verdictEl.textContent = verdict;
			detailEl.textContent = detail;
			panel.removeAttribute('hidden');

			// Card tint: green when sound, red when wrong, none in between.
			card.classList.toggle('rank-good', avg <= 2.5);
			card.classList.toggle('rank-bad', avg >= 4.5);

			// Move focus to the response for keyboard/screen-reader users.
			panel.focus?.();
		});
	}
}

function init(): void {
	initTabs();
	initReveal();
	initAssessment();
}

if (document.querySelector('.scenario-card, [role="tab"][data-tab]')) {
	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', init, { once: true });
	} else {
		init();
	}
}

export {};
