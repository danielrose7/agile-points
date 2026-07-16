/**
 * Tiny gettext-style i18n — deliberately no library (zero-runtime-deps
 * grain). Keys are the English source strings; locale modules map them to
 * translations, so a missing entry falls back to readable English and a
 * locale file is a single reviewable "English → your language" dictionary
 * (the friendliest possible community contribution).
 *
 * Vite code-splits each locale via the dynamic import below; English costs
 * nothing. Docs pages and server-sent errors stay English by design.
 */

export const LOCALES = [
	{ id: 'en', label: 'English' },
	{ id: 'es', label: 'Español' },
	{ id: 'de', label: 'Deutsch' },
	{ id: 'fr', label: 'Français' },
	{ id: 'pt', label: 'Português' },
	{ id: 'ja', label: '日本語' },
] as const;

export type LocaleId = (typeof LOCALES)[number]['id'];

const LOCALE_KEY = 'sp:locale';

let messages: Record<string, string> = {};
let pseudo = false;

// Pseudo-locale ('xx', hidden from the picker): pads every string ~40%
// longer with accented lookalikes — German-length layout testing plus a
// t()-coverage detector (unwrapped strings stay plain English and stick
// out). Enable via localStorage sp:locale = 'xx'.
const PSEUDO_MAP: Record<string, string> = {
	a: 'å', e: 'é', i: 'ï', o: 'ø', u: 'ü', y: 'ý',
	A: 'Å', E: 'É', I: 'Ï', O: 'Ø', U: 'Ü', C: 'Ç', c: 'ç', n: 'ñ', N: 'Ñ',
};

function pseudoize(key: string): string {
	let out = '';
	let depth = 0;
	for (const ch of key) {
		// leave interpolation slots (%1) intact; everything else accents
		if (ch === '%') depth = 2;
		out += depth-- > 0 ? ch : (PSEUDO_MAP[ch] ?? ch);
	}
	const pad = '·'.repeat(Math.max(2, Math.round(key.length * 0.2)));
	return `[${pad}${out}${pad}]`;
}

/** Saved choice, else the first browser language we support, else English. */
export function resolveLocale(): LocaleId {
	const saved = localStorage.getItem(LOCALE_KEY);
	if (saved === 'xx') return 'en'; // pseudo rides on English keys
	if (saved && LOCALES.some((l) => l.id === saved)) return saved as LocaleId;
	for (const lang of navigator.languages ?? [navigator.language]) {
		const base = lang.toLowerCase().split('-')[0];
		if (LOCALES.some((l) => l.id === base)) return base as LocaleId;
	}
	return 'en';
}

export function currentLocale(): LocaleId {
	return resolveLocale();
}

/** Persist the choice and reload — the whole app re-renders translated. */
export function setLocale(id: LocaleId): void {
	localStorage.setItem(LOCALE_KEY, id);
	location.reload();
}

/** Load the active locale's dictionary. Awaited once in main.ts. */
export async function initI18n(): Promise<void> {
	pseudo = localStorage.getItem(LOCALE_KEY) === 'xx';
	const locale = resolveLocale();
	// Screen readers and hyphenation key off the document language.
	document.documentElement.lang = locale;
	if (locale === 'en') return;
	try {
		messages = (await import(`./locales/${locale}.ts`)).default as Record<string, string>;
	} catch {
		messages = {}; // fall back to English rather than break the app
	}
}

/** Translate; %1/%2/… interpolate args. Unknown keys pass through. */
export function t(key: string, ...args: Array<string | number>): string {
	let out = pseudo ? pseudoize(key) : (messages[key] ?? key);
	args.forEach((a, i) => {
		out = out.replaceAll(`%${i + 1}`, String(a));
	});
	return out;
}

/** Plural-aware translate: picks the right key via native Intl.PluralRules
 *  (French counts 0 as singular; Japanese has no plural — CLDR knows),
 *  then interpolates the count as %1. */
export function tn(count: number, one: string, other: string, ...rest: Array<string | number>): string {
	const rules = new Intl.PluralRules(resolveLocale());
	return t(rules.select(count) === 'one' ? one : other, fmtNum(count), ...rest);
}

/** Locale-correct number formatting (4.5 → "4,5" in de/es/fr/pt). */
export function fmtNum(n: number): string {
	return new Intl.NumberFormat(resolveLocale()).format(n);
}

/** "2 min. ago" → locale-correct relative time ("vor 2 Min.", "hace 2 min").
 *  style 'short', not 'narrow': French narrow renders "-48 min", which
 *  reads as a negative number, not a time. */
export function timeAgo(ts: number): string {
	const rtf = new Intl.RelativeTimeFormat(resolveLocale(), { numeric: 'auto', style: 'short' });
	const mins = Math.round((ts - Date.now()) / 60_000);
	if (mins > -1) return rtf.format(0, 'minute');
	if (mins > -60) return rtf.format(mins, 'minute');
	const hours = Math.round(mins / 60);
	if (hours > -24) return rtf.format(hours, 'hour');
	return rtf.format(Math.round(hours / 24), 'day');
}
