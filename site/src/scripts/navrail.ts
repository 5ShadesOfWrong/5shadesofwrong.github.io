/**
 * navrail.ts — scroll-spy + mobile progress bar for NavRail.astro
 * ---------------------------------------------------------------
 * - Marks the dot of the section currently in view (aria-current).
 * - Updates the mobile progress bar width (0–100% of page scroll).
 *
 * Performance: one passive scroll listener + rAF throttle; IntersectionObserver
 * for section detection (no layout reads in the scroll handler).
 *
 * Security: reads/writes only attributes on existing elements; no dynamic HTML.
 */

interface SectionRef {
	id: string;
	label: string;
}

/** Section registry — must mirror index.astro (kept in sync via data attributes). */
function getSections(): SectionRef[] {
	const dots = document.querySelectorAll<HTMLAnchorElement>('[data-navrail-dot]');
	return Array.from(dots).map((a) => ({
		id: (a.getAttribute('href') ?? '').replace('#', ''),
		label: a.getAttribute('aria-label') ?? '',
	}));
}

function setupScrollSpy(sections: SectionRef[]): void {
	const dots = new Map<string, HTMLAnchorElement>();
	for (const a of document.querySelectorAll<HTMLAnchorElement>('[data-navrail-dot]')) {
		const id = (a.getAttribute('href') ?? '').replace('#', '');
		dots.set(id, a);
	}

	const setActive = (id: string) => {
		for (const [key, dot] of dots) {
			if (key === id) {
				dot.setAttribute('aria-current', 'true');
			} else {
				dot.removeAttribute('aria-current');
			}
		}
	};

	/*
	 * Scroll-spy v2 (bugfix): the IntersectionObserver approach picked the
	 * "most visible" section, which jumped ahead when a tall section was still
	 * entering the viewport (user saw section 2 lit while reading section 1).
	 *
	 * New approach — deterministic and matching reader perception:
	 * the active section is the LAST section whose top edge has crossed a
	 * "focus line" at 35% of the viewport height. Computed from cached
	 * offsetTops on scroll (rAF-throttled), so it can never skip ahead.
	 */
	const FOCUS_LINE_RATIO = 0.35;

	// Cache section tops; recompute on resize (layout changes invalidate them).
	let tops: { id: string; top: number }[] = [];
	const measure = () => {
		tops = sections
			.map((s) => {
				const el = document.getElementById(s.id);
				return el ? { id: s.id, top: el.offsetTop } : null;
			})
			.filter((t): t is { id: string; top: number } => t !== null);
		tops.sort((a, b) => a.top - b.top);
	};
	measure();
	window.addEventListener('resize', measure, { passive: true });

	let ticking = false;
	const update = () => {
		ticking = false;
		if (tops.length === 0) return;

		const focusLine = window.scrollY + window.innerHeight * FOCUS_LINE_RATIO;

		// Last section whose top is above the focus line = the one being read.
		let activeId = tops[0].id;
		for (const t of tops) {
			if (t.top <= focusLine) activeId = t.id;
			else break;
		}

		// Bottom of page: always light the last section.
		if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2) {
			activeId = tops[tops.length - 1].id;
		}

		setActive(activeId);
	};

	window.addEventListener(
		'scroll',
		() => {
			if (!ticking) {
				ticking = true;
				requestAnimationFrame(update);
			}
		},
		{ passive: true }
	);
	update();
}

function setupProgressBar(): void {
	const fill = document.querySelector<HTMLElement>('[data-navrail-progress]');
	if (!fill) return;

	let ticking = false;
	const update = () => {
		ticking = false;
		const doc = document.documentElement;
		const max = doc.scrollHeight - window.innerHeight;
		const ratio = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
		fill.style.width = `${(ratio * 100).toFixed(2)}%`;
	};

	window.addEventListener(
		'scroll',
		() => {
			if (!ticking) {
				ticking = true;
				requestAnimationFrame(update);
			}
		},
		{ passive: true }
	);
	update();
}

function init(): void {
	const sections = getSections();
	if (sections.length > 0) setupScrollSpy(sections);
	setupProgressBar();
}

// Guard: script may be bundled once but the component can be absent (404 page).
if (document.querySelector('.navrail')) {
	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', init, { once: true });
	} else {
		init();
	}
}

export {};
