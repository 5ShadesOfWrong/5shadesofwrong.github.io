/**
 * bibtex.ts — copy-citation button for SiteFooter.astro
 * ------------------------------------------------------
 * Copies the BibTeX entry via the Clipboard API. Falls back to a hidden
 * textarea + execCommand for older browsers (both are user-gesture driven).
 *
 * Security: the copied text is read from the page's own <pre> (trusted static
 * content) — never from URL params or user input. No DOM injection.
 */

function fallbackCopy(text: string): boolean {
	const ta = document.createElement('textarea');
	ta.value = text;
	ta.setAttribute('readonly', '');
	ta.style.position = 'fixed';
	ta.style.left = '-9999px';
	document.body.appendChild(ta);
	ta.select();
	let ok = false;
	try {
		ok = document.execCommand('copy');
	} catch {
		ok = false;
	}
	document.body.removeChild(ta);
	return ok;
}

async function copyText(text: string): Promise<boolean> {
	if (navigator.clipboard?.writeText) {
		try {
			await navigator.clipboard.writeText(text);
			return true;
		} catch {
			/* fall through to legacy path */
		}
	}
	return fallbackCopy(text);
}

function init(): void {
	const source = document.querySelector<HTMLPreElement>('[data-bibtex-source]');
	const button = document.querySelector<HTMLButtonElement>('[data-bibtex-copy]');
	const status = document.querySelector<HTMLElement>('[data-bibtex-status]');
	if (!source || !button || !status) return;

	button.addEventListener('click', async () => {
		const ok = await copyText(source.textContent ?? '');
		status.textContent = ok ? 'Copied!' : 'Copy failed — select the text manually.';
		// Clear the status after a moment so screen readers re-announce on next copy.
		window.setTimeout(() => {
			status.textContent = '';
		}, 2500);
	});
}

if (document.querySelector('[data-bibtex-copy]')) {
	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', init, { once: true });
	} else {
		init();
	}
}

export {};
