import { LitElement, html, css } from 'lit';
import { baseStyles } from './base-styles';
import type { DeckCard, RoomSettings } from '../../shared/types';
import { DECK_PRESETS, THEMES } from '../../shared/types';
import { t } from '../i18n';

type Tab = 'general' | 'theme' | 'features';

/** Owner-only settings editor. Edits a local draft; emits `save` with the result. */
class SettingsPanel extends LitElement {
	static properties = {
		settings: { attribute: false },
		historyCount: { attribute: false },
		accessCode: { attribute: false },
		draft: { state: true },
		tab: { state: true },
		showGroups: { state: true },
	};

	settings: RoomSettings | null = null;
	/** how many recorded rounds exist — drives the "Clear history" button */
	historyCount = 0;
	/** current room code ('' = open room); changes apply immediately */
	accessCode = '';
	draft: RoomSettings | null = null;
	tab: Tab = 'general';
	/** Group column is progressive disclosure: hidden until asked for,
	 *  except when the deck already uses groups. */
	showGroups = false;

	willUpdate(changed: Map<string, unknown>): void {
		if (changed.has('settings') && this.settings && !this.draft) {
			this.draft = structuredClone(this.settings);
			this.showGroups = this.draft.deck.some((c) => c.group);
		}
	}

	static styles = [
		baseStyles,
		css`
		:host {
			display: block;
		}
		.panel {
			background: var(--sp-surface);
			color: var(--sp-surface-text);
			border-radius: var(--sp-radius);
			padding: 22px;
			box-shadow: 0 18px 44px rgba(0, 0, 0, 0.3);
			margin-top: 18px;
		}
		h3 {
			margin: 0 0 14px;
		}
		.tabs {
			display: flex;
			gap: 2px;
			border-bottom: 2px solid var(--sp-divider);
			margin-bottom: 6px;
		}
		.tab {
			padding: 9px 14px;
			border: none;
			background: none;
			font: inherit;
			font-weight: 600;
			color: var(--sp-muted);
			border-bottom: 2px solid transparent;
			margin-bottom: -2px;
			cursor: pointer;
		}
		.tab:hover {
			color: var(--sp-surface-text);
		}
		.tab.active {
			color: var(--sp-surface-text);
			border-bottom-color: var(--sp-accent);
		}
		label.field {
			display: block;
			font-size: 0.8rem;
			text-transform: uppercase;
			letter-spacing: 0.08em;
			color: var(--sp-muted);
			margin: 16px 0 6px;
		}
		input[type='text'] {
			padding: 9px 10px;
			border: 1px solid var(--sp-border);
			border-radius: 8px;
			font: inherit;
		}
		.room-name {
			width: 100%;
		}
		.presets {
			display: flex;
			gap: 8px;
			flex-wrap: wrap;
		}
		.theme-group-title {
			font-size: 0.72rem;
			text-transform: uppercase;
			letter-spacing: 0.08em;
			color: var(--sp-muted);
			margin: 14px 0 6px;
		}
		.theme-grid {
			display: grid;
			grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
			gap: 6px;
		}
		.theme-chip {
			text-align: left;
			padding: 8px 10px;
			border: 1px solid var(--sp-border);
			border-radius: 8px;
			background: var(--sp-btn-bg);
			color: var(--sp-surface-text);
			font: inherit;
			font-size: 0.88rem;
			cursor: pointer;
			white-space: nowrap;
			overflow: hidden;
			text-overflow: ellipsis;
		}
		.theme-chip:hover {
			border-color: var(--sp-accent);
		}
		.theme-chip.active {
			border-color: var(--sp-accent);
			background: var(--sp-highlight);
			font-weight: 700;
		}
		.row {
			display: grid;
			grid-template-columns: 1fr 1fr 34px 34px 34px;
			gap: 6px;
			align-items: center;
			margin-bottom: 8px;
		}
		.row.grouped {
			grid-template-columns: 1fr 1fr 1fr 34px 34px 34px;
		}
		.btn.ghost {
			background: none;
			border-style: dashed;
			color: var(--sp-muted);
			margin-left: 8px;
		}
		.btn.ghost:hover {
			color: var(--sp-surface-text);
			border-color: var(--sp-accent);
		}
		.row input {
			min-width: 0;
		}
		.row.head {
			margin-bottom: 4px;
			font-size: 0.78rem;
			font-weight: 700;
			text-transform: uppercase;
			letter-spacing: 0.06em;
			color: var(--sp-muted);
		}
		.row button {
			border: 1px solid var(--sp-border);
			background: var(--sp-btn-bg);
			border-radius: 8px;
			padding: 8px 6px;
			cursor: pointer;
		}
		.hint {
			font-size: 0.83rem;
			color: var(--sp-muted);
			margin: 6px 0 0;
		}
		.btn {
			padding: 10px 16px;
			border-radius: 10px;
			border: 1px solid var(--sp-border);
			background: var(--sp-btn-bg);
			font-weight: 600;
			cursor: pointer;
		}
		.btn.primary {
			background: var(--sp-accent);
			border-color: var(--sp-accent);
			color: var(--sp-accent-text);
		}
		.actions {
			display: flex;
			gap: 10px;
			margin-top: 20px;
			border-top: 1px solid var(--sp-divider);
			padding-top: 16px;
		}
		.check {
			display: flex;
			align-items: center;
			gap: 8px;
			margin-top: 14px;
		}
		.btn.danger {
			background: var(--sp-error-bg);
			border-color: var(--sp-danger-soft);
			color: var(--sp-error-text);
		}
		.history-clear {
			margin: 10px 0 0 26px;
			font-size: 0.85rem;
			padding: 7px 12px;
		}
		.code-row {
			display: flex;
			align-items: center;
			gap: 10px;
			margin: 8px 0 4px 26px;
		}
		.access-code {
			font-family: ui-monospace, monospace;
			font-size: 1.15rem;
			font-weight: 700;
			letter-spacing: 0.25em;
			background: var(--sp-highlight-strong);
			border-radius: 8px;
			padding: 6px 12px;
		}
		.btn.small-btn {
			font-size: 0.85rem;
			padding: 7px 12px;
		}
		.check.sub {
			margin: 6px 0 0 26px;
			color: var(--sp-muted);
			font-size: 0.9rem;
		}
		input.seconds {
			width: 76px;
			padding: 6px 8px;
			border: 1px solid var(--sp-border);
			border-radius: 8px;
			font: inherit;
		}
		`,
	];

	render() {
		const d = this.draft;
		if (!d) return html``;
		const tabs: Array<[Tab, string]> = [
			['general', 'General'],
			['theme', 'Theme'],
			['features', 'Features'],
		];
		return html`
			<div class="panel">
				<h3>${t('Room settings')}</h3>
				<div class="tabs" role="tablist">
					${tabs.map(
						([id, label]) => html`
							<button
								class="tab ${this.tab === id ? 'active' : ''}"
								role="tab"
								aria-selected=${this.tab === id}
								@click=${() => (this.tab = id)}
							>
								${t(label)}
							</button>
						`,
					)}
				</div>
				${this.tab === 'general' ? this.renderGeneral(d) : ''}
				${this.tab === 'theme' ? this.renderTheme(d) : ''}
				${this.tab === 'features' ? this.renderFeatures(d) : ''}
				<div class="actions">
					<button class="btn primary" @click=${this.save}>${t('Save settings')}</button>
					<button class="btn" @click=${() => this.dispatchEvent(new CustomEvent('close'))}>${t('Cancel')}</button>
				</div>
			</div>
		`;
	}

	private renderGeneral(d: RoomSettings) {
		return html`
			<label class="field">${t('Room name')}</label>
			<input
				type="text"
				class="room-name"
				placeholder=${t('e.g. Plantiful web team')}
				.value=${d.roomName}
				@input=${(e: InputEvent) => this.patch({ roomName: (e.target as HTMLInputElement).value })}
			/>

			<label class="field">${t('Point values')}</label>
			<div class="presets">
				${Object.entries(DECK_PRESETS).map(
					([key, deck]) => html`
						<button class="btn" @click=${() => this.patch({ deck: deck.map((c) => ({ ...c })) })}>
							${key === 'fibonacci' ? t('Fibonacci') : key === 'tshirt' ? t('T-shirt') : t('Powers of 2')}
						</button>
					`,
				)}
			</div>
			<div style="margin-top:12px">
				<div class="row head ${this.showGroups ? 'grouped' : ''}">
					<span>${t('Label')}</span>
					<span>${t('Value')}</span>
					${this.showGroups ? html`<span>${t('Group')}</span>` : ''}
				</div>
				${d.deck.map(
					(card, i) => html`
						<div class="row ${this.showGroups ? 'grouped' : ''}">
							<input
								type="text"
								placeholder=${t('Label')}
								.value=${card.label}
								@input=${(e: InputEvent) => this.patchCard(i, { label: (e.target as HTMLInputElement).value })}
							/>
							<input
								type="text"
								placeholder=${t('Value')}
								.value=${card.value}
								@input=${(e: InputEvent) => this.patchCard(i, { value: (e.target as HTMLInputElement).value })}
							/>
							${this.showGroups
								? html`<input
										type="text"
										placeholder="—"
										title=${t('Cards sharing a group render as a labeled cluster in the voting hand')}
										.value=${card.group ?? ''}
										@input=${(e: InputEvent) => this.patchCard(i, { group: (e.target as HTMLInputElement).value })}
									/>`
								: ''}
							<button title=${t('Move up')} ?disabled=${i === 0} @click=${() => this.moveCard(i, -1)}>⬆︎</button>
							<button title=${t('Move down')} ?disabled=${i === d.deck.length - 1} @click=${() => this.moveCard(i, 1)}>⬇︎</button>
							<button title=${t('Remove')} @click=${() => this.removeCard(i)}>✕</button>
						</div>
					`,
				)}
				<button class="btn" @click=${this.addCard}>+ ${t('Add value')}</button>
				${!this.showGroups
					? html`
							<button
								class="btn ghost"
								title=${t('Cluster cards under labels in the voting hand — e.g. severity tiers in a triage room')}
								@click=${() => (this.showGroups = true)}
							>
								+ ${t('Groups')}
							</button>
						`
					: html`
							<p class="hint">
								${t('Cards sharing a Group render as a labeled cluster in the voting hand (e.g. severity tiers in a triage room). Leave blank for one flat hand.')}
							</p>
						`}
			</div>
		`;
	}

	private renderTheme(d: RoomSettings) {
		// Grouped grid instead of one long button row — scales past 25 themes.
		const yearRound = new Set(['classic', 'space', 'surf', 'birthday', 'nightclub']);
		const groups: Array<[string, ReadonlyArray<(typeof THEMES)[number]>]> = [
			[t('Year-round'), THEMES.filter((th) => yearRound.has(th.id))],
			[t('Seasonal calendar'), THEMES.filter((th) => !yearRound.has(th.id) && !('region' in th))],
			[t('Regional celebrations'), THEMES.filter((th) => 'region' in th)],
		];
		return html`
			<label class="field">${t('Theme')}</label>
			<div class="presets">
				<button
					class="btn ${d.theme === 'seasonal' ? 'primary' : ''}"
					title=${t('Follows the calendar — the room re-themes itself as holidays approach')}
					@click=${() => this.patch({ theme: 'seasonal' })}
				>
					🗓 ${t('Seasonal (auto)')}
				</button>
			</div>
			${groups.map(
				([title, themes]) => html`
					<div class="theme-group-title">${title}</div>
					<div class="theme-grid">
						${themes.map(
							(th) => html`
								<button
									class="theme-chip ${d.theme === th.id ? 'active' : ''}"
									@click=${() => this.patch({ theme: th.id })}
								>
									${th.label}
								</button>
							`,
						)}
					</div>
				`,
			)}
		`;
	}

	private renderFeatures(d: RoomSettings) {
		return html`
			<label class="check">
				<input
					type="checkbox"
					.checked=${!!this.accessCode}
					@change=${(e: Event) =>
						this.dispatchEvent(
							new CustomEvent('set-code', { detail: { enabled: (e.target as HTMLInputElement).checked } }),
						)}
				/>
				🔒 ${t('Require a room code (applies immediately; invite links carry it)')}
			</label>
			${this.accessCode
				? html`
						<div class="code-row">
							<code class="access-code">${this.accessCode}</code>
							<button
								class="btn small-btn"
								title=${t('Generate a new code (the old one stops working; people already here stay)')}
								@click=${() => this.dispatchEvent(new CustomEvent('set-code', { detail: { enabled: true } }))}
							>
								↻ ${t('New code')}
							</button>
						</div>
					`
				: ''}
			${this.renderFeatureToggles(d)}
		`;
	}

	private renderFeatureToggles(d: RoomSettings) {
		return html`
			<label class="check">
				<input
					type="checkbox"
					.checked=${d.autoReveal}
					@change=${(e: Event) => this.patch({ autoReveal: (e.target as HTMLInputElement).checked })}
				/>
				${t('Reveal automatically when everyone has voted')}
			</label>

			<label class="check">
				<input
					type="checkbox"
					.checked=${d.timerSounds ?? true}
					@change=${(e: Event) => this.patch({ timerSounds: (e.target as HTMLInputElement).checked })}
				/>
				${t('Timer chimes at 5 & 10 minutes (room-wide; anyone can mute for themselves)')}
			</label>

			<label class="check">
				<input
					type="checkbox"
					.checked=${d.countdown ?? true}
					@change=${(e: Event) => this.patch({ countdown: (e.target as HTMLInputElement).checked })}
				/>
				${t('Voting countdown button (votes reveal automatically at zero)')}
			</label>
			${(d.countdown ?? true)
				? html`
						<label class="check sub">
							<input
								type="number"
								class="seconds"
								min="5"
								max="600"
								.value=${String(d.countdownSeconds ?? 60)}
								@input=${(e: InputEvent) =>
									this.patch({ countdownSeconds: Number((e.target as HTMLInputElement).value) || 60 })}
							/>
							${t('seconds')}
						</label>
					`
				: ''}

			<label class="check">
				<input
					type="checkbox"
					.checked=${d.ticketQueue ?? true}
					@change=${(e: Event) => this.patch({ ticketQueue: (e.target as HTMLInputElement).checked })}
				/>
				${t('Ticket queue (“Up next” panel and API imports)')}
			</label>

			<label class="check">
				<input
					type="checkbox"
					.checked=${d.freshClock ?? true}
					@change=${(e: Event) => this.patch({ freshClock: (e.target as HTMLInputElement).checked })}
				/>
				${t('Restart the round clock when the first person returns to an empty room')}
			</label>

			<label class="check">
				<input
					type="checkbox"
					.checked=${d.awayVotes ?? true}
					@change=${(e: Event) => this.patch({ awayVotes: (e.target as HTMLInputElement).checked })}
				/>
				${t('Count away votes (vote, close the tab, still count — seat shows 💤)')}
			</label>

			<label class="check">
				<input
					type="checkbox"
					.checked=${d.anonymousVotes ?? false}
					@change=${(e: Event) => this.patch({ anonymousVotes: (e.target as HTMLInputElement).checked })}
				/>
				${t('Anonymous voting (reveal shows counts and stats, never who voted what)')}
			</label>

			<label class="check">
				<input
					type="checkbox"
					.checked=${d.voteStats ?? true}
					@change=${(e: Event) => this.patch({ voteStats: (e.target as HTMLInputElement).checked })}
				/>
				${t('Vote statistics on reveal (average, agreement %, distribution chart)')}
			</label>

			<label class="check">
				<input
					type="checkbox"
					.checked=${d.agentPrompts ?? true}
					@change=${(e: Event) => this.patch({ agentPrompts: (e.target as HTMLInputElement).checked })}
				/>
				${t('“Use your agent” prompts in the queue and history panels (Linear/Jira/GitHub samples)')}
			</label>

			<label class="check">
				<input
					type="checkbox"
					.checked=${d.keepHistory ?? true}
					@change=${(e: Event) => this.patch({ keepHistory: (e.target as HTMLInputElement).checked })}
				/>
				${t('Keep round history (story, votes, and duration of finished rounds)')}
			</label>
			${this.historyCount > 0
				? html`
						<button class="btn danger history-clear" @click=${this.clearHistory}>
							${t('Clear history')} (${this.historyCount})
						</button>
					`
				: ''}
		`;
	}

	private patch(partial: Partial<RoomSettings>): void {
		if (this.draft) this.draft = { ...this.draft, ...partial };
	}

	private patchCard(i: number, partial: Partial<DeckCard>): void {
		if (!this.draft) return;
		const deck = this.draft.deck.map((c, j) => (j === i ? { ...c, ...partial } : c));
		this.draft = { ...this.draft, deck };
	}

	private moveCard(i: number, delta: number): void {
		if (!this.draft) return;
		const deck = [...this.draft.deck];
		const j = i + delta;
		if (j < 0 || j >= deck.length) return;
		[deck[i], deck[j]] = [deck[j], deck[i]];
		this.draft = { ...this.draft, deck };
	}

	private removeCard(i: number): void {
		if (!this.draft) return;
		this.draft = { ...this.draft, deck: this.draft.deck.filter((_, j) => j !== i) };
	}

	private addCard = (): void => {
		if (!this.draft) return;
		this.draft = { ...this.draft, deck: [...this.draft.deck, { label: '', value: '' }] };
	};

	private clearHistory = (): void => {
		this.dispatchEvent(new CustomEvent('clear-history'));
	};

	private save = (): void => {
		if (!this.draft) return;
		const deck = this.draft.deck
			.map((c) => ({ label: c.label.trim(), value: c.value.trim(), group: c.group?.trim() || undefined }))
			.filter((c) => c.label && c.value);
		this.dispatchEvent(new CustomEvent('save', { detail: { ...this.draft, deck } }));
	};
}

customElements.define('points-settings', SettingsPanel);
