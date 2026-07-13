import { css } from 'lit';

/**
 * Shadow roots don't inherit document-level rules, so every component needs
 * its own box-sizing reset — a global `* { box-sizing: border-box }` in
 * styles.css never reaches in here.
 */
export const baseStyles = css`
	*,
	*::before,
	*::after {
		box-sizing: border-box;
	}
`;
