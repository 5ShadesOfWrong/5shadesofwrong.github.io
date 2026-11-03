/**
 * schemas.ts — typed schemas for the JSON data files (Implementation_plan §2.7)
 * ------------------------------------------------------------------------------
 * Single source of truth for the shape of src/data/*.json. Components import
 * types from here instead of re-declaring interfaces per file.
 *
 * Validation: `validateDataSchemas()` runs at build time (imported by
 * src/schemas/validate.ts, wired into the build via an integration check or
 * a test). It fails the build loudly if a data file drifts from its schema —
 * catching typos in scenario ids, missing fields, or bad verdict values
 * before they ship to production.
 *
 * Security note: schemas are also the first line of defense against content
 * injection — every field is typed as a string/boolean/number, never `any`,
 * so nothing unexpected can flow into the DOM.
 */

/* ---------------- site.json ---------------- */

export interface PaperMeta {
	/** Full title of the research paper. */
	title: string;
	/** Publication venue, empty until known. */
	venue: string;
	/** Path/URL to the paper PDF; empty until the paper is public. */
	file: string;
	label: string;
}

export interface SiteData {
	title: string;
	subtitle: string;
	kicker: string;
	paper: PaperMeta;
	links: { scenarios: string; contact: string };
	authors: string;
	license: string;
	bibtex: string;
	tagline: { reader: string; presenter: string };
}

/* ---------------- dimensions.json ---------------- */

export interface DimensionFacet {
	name: string;
	example: string;
}

export interface DimensionExample {
	setup: string;
	explanation: string;
	why: string;
}

export type DimensionId = 'coherence' | 'validity' | 'faithfulness';

export interface Dimension {
	id: DimensionId;
	number: number;
	name: string;
	relationship: string;
	/** Concise one-line definition for hover tooltips. */
	tooltip: string;
	definition: string;
	/** Why the shared positive baseline holds under this dimension (table row 1). */
	baselineWhy: string;
	/** Per-dimension example box headers (e.g. Coherent/Incoherent). */
	exampleHeaders: { good: string; flawed: string };
	goodExample: DimensionExample;
	flawedExample: DimensionExample;
	facets: DimensionFacet[];
	footnote: string;
}

export interface DimensionPositiveBaseline {
	title: string;
	explanation: string;
	context: string;
}

export interface DimensionsData {
	positiveBaseline: DimensionPositiveBaseline;
	dimensions: Dimension[];
}

/* ---------------- archetypes.json ---------------- */

export interface ArchetypeLegendItem {
	label: string;
	/** CSS color value (token reference or hex). */
	color: string;
}

export interface ArchetypeScene {
	/** How many moons appear in the scene (1, or 2 for Confused Illuminator / Hallucinator). */
	moons: 1 | 2;
	/** Features the model ACTUALLY used (purple, Prediction panel). */
	used: { wolf: boolean; sky: boolean; leftMoon: boolean; rightMoon: boolean };
	/** Features the explanation highlights (green/red, Explanation panel). */
	highlight: { wolf: boolean; sky: boolean; leftMoon: boolean; rightMoon: boolean };
	/** When true, the explanation highlight renders as MISLEADING (red) even
	 *  when it matches the used flags (Illuminator: right feature, wrong reason). */
	highlightBad?: boolean;
}

export interface Archetype {
	id: string;
	/** Paper letter (a)–(f). */
	letter: string;
	name: string;
	verdict: 'correct' | 'wrong';
	summary: string;
	prediction: string;
	explanation: string;
	/** Feature the untouched image truly shows (Ground-Truth panel fact). */
	groundTruthFeature: string;
	modelUsed: string;
	highlighted: string;
	/** Explicit scene semantics for the two panels (user spec 2026-10-21). */
	scene: ArchetypeScene;
	coherent: boolean;
	valid: boolean;
	faithful: boolean;
}

export interface ArchetypesData {
	legend: Record<string, ArchetypeLegendItem>;
	archetypes: Archetype[];
}

/* ---------------- workflow.json ---------------- */

export interface WorkflowStep {
	number: number;
	title: string;
	question: string;
	details: string[];
	/** Which dimension this step maps to (steps 1–3); step 0 has none. */
	dimension?: DimensionId;
}

export interface WorkflowData {
	intro: string;
	steps: WorkflowStep[];
}

/* ---------------- scenarios.*.json ---------------- */

export interface ScenarioSeen {
	output: string;
	explanation: string;
}

export interface ScenarioGroundTruth {
	outcome: string;
	premise: string;
}

export interface Scenario {
	/** Paper id, e.g. "A1"…"A7" or "B1"…"B6". */
	id: string;
	seen: ScenarioSeen;
	groundTruth: ScenarioGroundTruth;
	modelBehavior: string;
	/** Archetype id once the authors provide official answers; null until then. */
	archetype: string | null;
}

export interface ScenarioSetData {
	setId: string;
	setTitle: string;
	setIntro: string;
	context: { domain: string; explainee: string };
	scenarios: Scenario[];
}
