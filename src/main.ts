import { LitElement, html } from 'lit';
import { keyed } from 'lit/directives/keyed.js';
import { initI18n } from './i18n';

// Load the locale dictionary before any component renders (top-level await;
// English resolves instantly). Components import ./i18n and call t().
await initI18n();
await Promise.all([import('./components/home-page'), import('./components/room-page')]);

class AppRoot extends LitElement {
	static properties = {
		path: { state: true },
	};

	path = location.pathname;

	connectedCallback(): void {
		super.connectedCallback();
		window.addEventListener('popstate', this.onPopState);
	}

	disconnectedCallback(): void {
		super.disconnectedCallback();
		window.removeEventListener('popstate', this.onPopState);
	}

	private onPopState = () => {
		this.path = location.pathname;
	};

	render() {
		const roomMatch = this.path.match(/^\/room\/([a-z0-9-]{1,64})$/);
		if (roomMatch) {
			// keyed: switching rooms must create a fresh element (new socket,
			// timers, theme) rather than patching roomId on the old one.
			return keyed(roomMatch[1], html`<points-room .roomId=${roomMatch[1]}></points-room>`);
		}
		// Anything else that isn't the front door is a lost URL — let the home
		// page own the "404, but you could make this a room" experience.
		return html`<points-home .lostPath=${this.path === '/' ? '' : this.path}></points-home>`;
	}
}

customElements.define('points-app', AppRoot);
