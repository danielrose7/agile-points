import { css } from 'lit';

/**
 * Shadow roots don't inherit document-level rules, so every component needs
 * its own box-sizing reset — a global `* { box-sizing: border-box }` in
 * styles.css never reaches in here.
 */
export const baseStyles = css`
	/* \`*\` never matches the shadow host itself — reset it explicitly, or
	   host padding stacks on top of 100vh-style sizing and causes overflow. */
	:host {
		box-sizing: border-box;
	}
	*,
	*::before,
	*::after {
		box-sizing: border-box;
	}
	/* Form controls don't inherit text color — the UA supplies one, and iOS
	   Safari in system dark mode picks WHITE buttontext even on our light
	   panels (invisible labels that read as disabled). Inherit from the
	   surrounding surface instead; buttons that want their own color
	   (.primary etc.) still set it explicitly. */
	button,
	input,
	select,
	textarea {
		color: inherit;
	}
`;
