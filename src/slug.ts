import { resolveLocale, type LocaleId } from './i18n';

/**
 * Room slugs are URLs (server enforces [a-z0-9-]), so every word list is
 * ASCII-safe by construction: no accents or umlauts — words that need them
 * don't make the list — and Japanese is romaji. Slugs generate in the
 * creator's language; for everyone else it's just the room's name.
 */
interface SlugWords {
	adjectives: string[];
	colors: string[];
	animals: string[];
}

const WORDS: Record<LocaleId, SlugWords> = {
	en: {
		adjectives: [
			'brave', 'calm', 'daring', 'eager', 'fancy', 'gentle', 'happy', 'jolly',
			'keen', 'lucky', 'mellow', 'nimble', 'plucky', 'quick', 'snappy', 'witty',
		],
		colors: [
			'amber', 'aqua', 'blue', 'coral', 'crimson', 'gold', 'green', 'indigo',
			'ivory', 'jade', 'lime', 'magenta', 'navy', 'olive', 'pink', 'teal',
		],
		animals: [
			'badger', 'bison', 'crane', 'dingo', 'falcon', 'fox', 'gecko', 'heron',
			'ibex', 'koala', 'lemur', 'lynx', 'marmot', 'otter', 'panda', 'wombat',
		],
	},
	es: {
		adjectives: [
			'valiente', 'sereno', 'audaz', 'feliz', 'listo', 'amable', 'bravo', 'noble',
			'veloz', 'astuto', 'alegre', 'tenaz', 'sabio', 'firme', 'vivo', 'suave',
		],
		colors: [
			'oro', 'azul', 'coral', 'jade', 'rosa', 'verde', 'anil', 'plata',
			'cobre', 'lima', 'marfil', 'oliva', 'vino', 'arena', 'perla', 'menta',
		],
		animals: [
			'nutria', 'zorro', 'lince', 'panda', 'koala', 'puma', 'jaguar', 'llama',
			'lobo', 'oso', 'mono', 'pato', 'ciervo', 'gato', 'bisonte', 'iguana',
		],
	},
	de: {
		adjectives: [
			'tapfer', 'ruhig', 'mutig', 'flink', 'froh', 'munter', 'schlau', 'witzig',
			'flott', 'sanft', 'wach', 'fix', 'brav', 'heiter', 'clever', 'wacker',
		],
		colors: [
			'gold', 'blau', 'rot', 'rosa', 'mint', 'jade', 'indigo', 'ocker',
			'lila', 'beige', 'petrol', 'silber', 'kupfer', 'koralle', 'oliv', 'azur',
		],
		animals: [
			'fuchs', 'otter', 'dachs', 'luchs', 'panda', 'koala', 'falke', 'reiher',
			'gecko', 'lemur', 'wombat', 'bison', 'kranich', 'igel', 'biber', 'marder',
		],
	},
	fr: {
		adjectives: [
			'brave', 'calme', 'agile', 'gai', 'malin', 'vif', 'doux', 'fier',
			'sage', 'hardi', 'leste', 'alerte', 'subtil', 'tenace', 'loyal', 'franc',
		],
		colors: [
			'or', 'bleu', 'corail', 'jade', 'rose', 'vert', 'indigo', 'ivoire',
			'mauve', 'ocre', 'perle', 'rubis', 'ambre', 'menthe', 'sable', 'azur',
		],
		animals: [
			'renard', 'loutre', 'blaireau', 'lynx', 'panda', 'koala', 'faucon', 'castor',
			'bison', 'gecko', 'ibis', 'loup', 'ours', 'cerf', 'aigle', 'grue',
		],
	},
	pt: {
		adjectives: [
			'bravo', 'calmo', 'feliz', 'esperto', 'veloz', 'sagaz', 'manso', 'forte',
			'leve', 'doce', 'firme', 'vivo', 'alegre', 'nobre', 'astuto', 'zeloso',
		],
		colors: [
			'ouro', 'azul', 'coral', 'jade', 'rosa', 'verde', 'anil', 'prata',
			'cobre', 'lima', 'marfim', 'oliva', 'vinho', 'areia', 'cinza', 'menta',
		],
		animals: [
			'lontra', 'raposa', 'texugo', 'lince', 'panda', 'coala', 'tucano', 'arara',
			'tatu', 'capivara', 'mico', 'lobo', 'urso', 'veado', 'ema', 'quati',
		],
	},
	ja: {
		// Romaji — slugs must be ASCII, and these stay easy to say aloud.
		adjectives: [
			'genki', 'hayai', 'tsuyoi', 'yasashii', 'akarui', 'shizuka', 'yukai', 'sunao',
			'tanoshii', 'kimama', 'nonbiri', 'majime', 'kashikoi', 'kibin', 'karui', 'yutaka',
		],
		colors: [
			'kin', 'gin', 'aka', 'ao', 'midori', 'murasaki', 'momo', 'sora',
			'kon', 'beni', 'ruri', 'sango', 'cha', 'mizu', 'fuji', 'sakura',
		],
		animals: [
			'kitsune', 'usagi', 'tanuki', 'kuma', 'tora', 'taka', 'tsuru', 'kame',
			'saru', 'neko', 'inu', 'risu', 'kawauso', 'shika', 'panda', 'koara',
		],
	},
};

function pick(list: string[]): string {
	return list[crypto.getRandomValues(new Uint32Array(1))[0] % list.length];
}

export function generateRoomSlug(): string {
	const words = WORDS[resolveLocale()] ?? WORDS.en;
	return `${pick(words.adjectives)}-${pick(words.colors)}-${pick(words.animals)}`;
}
