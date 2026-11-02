/**
 * reveal.ts — scroll-triggered reveal animations (Phase 3 foundation)
 * --------------------------------------------------------------------
 * Progressive enhancement ONLY: content is fully visible by default in the
 * server-rendered HTML. This script adds a class that *hides then reveals*
 * elements as they enter the viewport — and only when the browser supports
 * IntersectionObserver and the user has not requested reduced motion.
 *
 * Usage: add `data-reveal` to elements (optionally `data-reveal-delay="1|2|3"`
 * for stagger). Without JS or with reduced motion, nothing is ever hidden.
 *
 * Security: attribute/class toggles only; no dynamic content, no injection.
 */

const REVEAL_CLASS = 'reveal-init'; // applied by JS, styled in components.css
const REVEALED_CLASS = 'reveal-in';

function prefersReducedMotion(): boolean {
	return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function init(): void {
	const targets = document.querySelectorAll<HTMLElement>('[data-reveal]');
	if (targets.length === 0) return;

	// Graceful degradation: skip entirely for reduced motion or old browsers.
	if (prefersReducedMotion() || !('IntersectionObserver' in window)) return;

	// 1) Hide targets (class added by JS only — no-JS users never see this).
	for (const el of targets) {
		el.classList.add(REVEAL_CLASS);
	}

	// 2) Reveal as they enter the viewport (once). A slightly earlier trigger
	//    (-15% bottom margin) makes elements start moving while still entering,
	//    so the pop is visible rather than happening off-screen.
	const observer = new IntersectionObserver(
		(entries, obs) => {
			for (const entry of entries) {
				if (!entry.isIntersecting) continue;
				const el = entry.target as HTMLElement;
				const delay = Number(el.dataset.revealDelay ?? '0');
				// Stagger via transition-delay, not setTimeout (keeps rAF in sync).
				el.style.transitionDelay = `${delay * 110}ms`;
				el.classList.add(REVEALED_CLASS);
				obs.unobserve(el); // reveal once; never re-hide

				// Clear the inline delay once the reveal transition finishes —
				// otherwise it lingers and also delays unrelated transitions on
				// the same element (e.g. hover effects), making them feel
				// sluggish long after the reveal itself is done (user review
				// 2026-11-02).
				el.addEventListener(
					'transitionend',
					() => {
						el.style.transitionDelay = '';
					},
					{ once: true }
				);
			}
		},
		{ rootMargin: '0px 0px -15% 0px', threshold: 0.05 }
	);

	for (const el of targets) {
		observer.observe(el);
	}

	// 3) Safety net: if something goes wrong (observer never fires), reveal all
	//    after a timeout so content can never stay hidden.
	window.setTimeout(() => {
		for (const el of targets) {
			el.classList.add(REVEALED_CLASS);
		}
	}, 4000);
}

if (document.querySelector('[data-reveal]')) {
	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', init, { once: true });
	} else {
		init();
	}
}

export {};
