/** SPA navigation — separate module so components don't import main.ts
 *  (main uses top-level await for i18n; a static back-edge would cycle). */
export function navigate(path: string): void {
	history.pushState(null, '', path);
	window.dispatchEvent(new PopStateEvent('popstate'));
}
