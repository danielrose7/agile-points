const ADJECTIVES = [
	'brave', 'calm', 'daring', 'eager', 'fancy', 'gentle', 'happy', 'jolly',
	'keen', 'lucky', 'mellow', 'nimble', 'plucky', 'quick', 'snappy', 'witty',
];
const COLORS = [
	'amber', 'aqua', 'blue', 'coral', 'crimson', 'gold', 'green', 'indigo',
	'ivory', 'jade', 'lime', 'magenta', 'navy', 'olive', 'pink', 'teal',
];
const ANIMALS = [
	'badger', 'bison', 'crane', 'dingo', 'falcon', 'fox', 'gecko', 'heron',
	'ibex', 'koala', 'lemur', 'lynx', 'marmot', 'otter', 'panda', 'wombat',
];

function pick(list: string[]): string {
	return list[crypto.getRandomValues(new Uint32Array(1))[0] % list.length];
}

export function generateRoomSlug(): string {
	return `${pick(ADJECTIVES)}-${pick(COLORS)}-${pick(ANIMALS)}`;
}
