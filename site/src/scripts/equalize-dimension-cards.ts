/**
 * equalize-dimension-cards.ts — lock the "Three Dimensions" card heights
 * ------------------------------------------------------------------------
 * Progressive enhancement ONLY: without JS, the three cards just use their
 * own natural (slightly uneven) heights — never broken, just less polished.
 *
 * The three dimension cards (`#three-dimensions .dimension-col`) should look
 * the same height while all three are collapsed. CSS grid's `align-items`
 * can't do this without also re-stretching every card whenever ANY one of
 * them opens its "More negative examples" <details> — which previously
 * made clicking one toggle visibly resize the OTHER (still collapsed)
 * cards too (user review 2026-11-02). Fix: measure the natural collapsed
 * height once and lock it in as `min-height`, so opening one card only
 * grows that card — the others stay pinned at the original height.
 */

const MIN_WIDTH_QUERY = '(min-width: 1001px)'; // matches the CSS stacked-layout breakpoint

function naturalHeight(el: HTMLElement): number {
	// Ignore any min-height we previously applied so we measure the card's
	// own intrinsic content height, not the locked-in value.
	const prevMinHeight = el.style.minHeight;
	el.style.minHeight = '';
	const height = el.getBoundingClientRect().height;
	el.style.minHeight = prevMinHeight;
	return height;
}

function equalize(grid: HTMLElement, cards: HTMLElement[]): void {
	if (!window.matchMedia(MIN_WIDTH_QUERY).matches) {
		// Single-column stacked layout — no shared row to equalize.
		grid.style.removeProperty('--dimension-min-height');
		return;
	}

	// Only measure cards that are currently collapsed, so an already-open
	// card's inflated height never becomes the new shared baseline.
	const closedCards = cards.filter((el) => !el.querySelector('details[open]'));
	const source = closedCards.length > 0 ? closedCards : cards;
	const max = Math.max(...source.map(naturalHeight));

	grid.style.setProperty('--dimension-min-height', `${Math.ceil(max)}px`);
}

function init(): void {
	const grid = document.querySelector<HTMLElement>('.dimension-cards');
	const cards = Array.from(document.querySelectorAll<HTMLElement>('.dimension-cards .dimension-col'));
	if (!grid || cards.length === 0) return;

	equalize(grid, cards);

	let resizeTimer: ReturnType<typeof setTimeout> | undefined;
	window.addEventListener('resize', () => {
		clearTimeout(resizeTimer);
		resizeTimer = setTimeout(() => equalize(grid, cards), 150);
	});
}

if (document.readyState === 'loading') {
	document.addEventListener('DOMContentLoaded', init, { once: true });
} else {
	init();
}

export {};
