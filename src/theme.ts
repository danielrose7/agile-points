import type { ThemeId } from '../shared/types';
import { seasonalTheme } from '../shared/types';
import { resolveLocale } from './i18n';

/**
 * Swap the document theme, animated with the View Transitions API where
 * available (falls back to an instant swap). Optionally caches the theme
 * per room so the head's blocking script (see index.html) can paint the
 * right colors on the first frame of the next visit — no FART.
 */
export function applyTheme(theme: string, cacheRoomId?: string): void {
	if (cacheRoomId) localStorage.setItem(`sp:theme:${cacheRoomId}`, theme);
	const root = document.documentElement;
	if (root.dataset.theme === theme) return;
	const swap = () => {
		root.dataset.theme = theme;
	};
	const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
	if (!reduceMotion && 'startViewTransition' in document) {
		(document as Document & { startViewTransition(cb: () => void): unknown }).startViewTransition(swap);
	} else {
		swap();
	}
}

export function todaysTheme(): ThemeId {
	return seasonalTheme(new Date(), resolveLocale());
}
