import { LitElement, html } from 'lit';
import './components/home-page';
import './components/room-page';

export function navigate(path: string): void {
	history.pushState(null, '', path);
	window.dispatchEvent(new PopStateEvent('popstate'));
}

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
			return html`<points-room .roomId=${roomMatch[1]}></points-room>`;
		}
		return html`<points-home></points-home>`;
	}
}

customElements.define('points-app', AppRoot);
