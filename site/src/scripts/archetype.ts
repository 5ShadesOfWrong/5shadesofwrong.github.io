/**
 * archetype.ts — one-at-a-time viewer for ArchetypeViewer.astro
 * --------------------------------------------------------------
 * Controls the archetype stage: prev/next buttons, dot indicators, counter,
 * and keyboard arrow navigation when the viewer has focus. Without JS, all
 * six archetypes render stacked (server-rendered `hidden` attributes are the
 * single source of truth this script flips).
 *
 * Security: attribute/class toggles only; no dynamic HTML, no injection.
 */

function init(): void {
	const cards = Array.from(document.querySelectorAll<HTMLElement>('[data-archetype]'));
	const dots = Array.from(document.querySelectorAll<HTMLButtonElement>('[data-viewer-dot]'));
	const prevBtn = document.querySelector<HTMLButtonElement>('[data-viewer-prev]');
	const nextBtn = document.querySelector<HTMLButtonElement>('[data-viewer-next]');
	const counter = document.querySelector<HTMLElement>('[data-viewer-counter]');
	if (cards.length === 0) return;

	let index = 0;

	const show = (next: number) => {
		index = (next + cards.length) % cards.length;
		cards.forEach((card, i) => {
			card.hidden = i !== index;
			if (i === index) {
				card.setAttribute('aria-hidden', 'false');
			} else {
				card.setAttribute('aria-hidden', 'true');
			}
		});
		dots.forEach((dot, i) => {
			const active = i === index;
			dot.classList.toggle('active', active);
			if (active) {
				dot.setAttribute('aria-current', 'true');
			} else {
				dot.removeAttribute('aria-current');
			}
		});
		if (counter) counter.textContent = `${index + 1} / ${cards.length}`;
	};

	prevBtn?.addEventListener('click', () => show(index - 1));
	nextBtn?.addEventListener('click', () => show(index + 1));
	for (const [i, dot] of dots.entries()) {
		dot.addEventListener('click', () => show(i));
	}

	// Jump to a specific archetype from elsewhere on the page (e.g. the hero
	// shade chips dispatch `shade:show` with the archetype id — user review
	// 2026-11-02). Falls back to the first card if the id is unknown.
	window.addEventListener('shade:show', ((event: CustomEvent<{ id: string }>) => {
		const target = cards.findIndex((card) => card.id === `archetype-${event.detail.id}`);
		show(target >= 0 ? target : 0);
	}) as EventListener);

	// Keyboard navigation scoped to the viewer region (doesn't hijack page arrows).
	const viewer = document.querySelector<HTMLElement>('.viewer');
	viewer?.addEventListener('keydown', (event) => {
		if (event.key === 'ArrowLeft') {
			show(index - 1);
			event.preventDefault();
		} else if (event.key === 'ArrowRight') {
			show(index + 1);
			event.preventDefault();
		}
	});

	show(0);
}

if (document.querySelector('[data-archetype]')) {
	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', init, { once: true });
	} else {
		init();
	}
}

export {};
