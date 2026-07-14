#!/bin/bash
# Generate social-preview (Open Graph) images: one 1200x630 PNG per theme.
# Palettes are parsed straight from src/styles.css so the cards can't drift
# from the real themes — rerun this script after adding or recoloring a theme.
#
# Messaging apps (iMessage, Slack, Twitter) only render raster og:images, so
# we rasterize SVG templates with rsvg-convert (brew install librsvg), same
# approach as plantiful-website. Output is committed to public/og/.

set -e
cd "$(dirname "$0")/.."
OUT="public/og"
mkdir -p "$OUT"

command -v rsvg-convert >/dev/null || { echo "ERROR: rsvg-convert not found (brew install librsvg)" >&2; exit 1; }

# theme<TAB>bg0<TAB>bg1<TAB>bg2<TAB>accent<TAB>accentText<TAB>back0<TAB>back1 per line.
palettes="$(mktemp)"
trap 'rm -f "$palettes"' EXIT
node -e '
	const fs = require("fs");
	const css = fs.readFileSync("src/styles.css", "utf8");
	// Split into blocks: ":root {...}" (classic) and ":root[data-theme=X] {...}".
	const blocks = {};
	for (const m of css.matchAll(/:root(?:\[data-theme='"'"'([a-z0-9]+)'"'"'\])?\s*{([^}]*)}/g)) {
		const id = m[1] ?? "classic";
		blocks[id] = (blocks[id] ?? "") + m[2]; // space has two :root blocks; concat
	}
	const hexes = (s) => [...(s ?? "").matchAll(/#[0-9a-fA-F]{3,8}/g)].map((h) => h[0]);
	const prop = (block, name) => block.match(new RegExp(`--sp-${name}:\\s*([^;]+);`))?.[1];
	const classic = blocks.classic;
	const rows = [];
	for (const [id, block] of Object.entries(blocks)) {
		if (id === "classic" && rows.length) continue;
		const get = (name) => prop(block, name) ?? prop(classic, name);
		const bg = hexes(get("bg"));
		const back = hexes(get("card-back"));
		const accent = hexes(get("accent"))[0];
		const accentText = hexes(get("accent-text"))[0];
		if (bg.length < 3 || back.length < 2 || !accent || !accentText) {
			throw new Error(`Incomplete palette for theme "${id}"`);
		}
		rows.push([id, bg[0], bg[1], bg[2], accent, accentText, back[0], back[1]].join("\t"));
	}
	if (rows.length < 17) throw new Error(`Only ${rows.length} themes parsed — expected 17+`);
	process.stdout.write(rows.join("\n") + "\n");
' > "$palettes"

# One fanned hand of planning-poker cards (vector — librsvg can't render color
# emoji). Values 3/5/8 face up plus a face-down card in the theme's card-back
# stripes, echoing the in-app deck.
generate_theme() {
	local id="$1" bg0="$2" bg1="$3" bg2="$4" accent="$5" accent_text="$6" back0="$7" back1="$8"
	local file="/tmp/sp-og-${id}.svg"

	cat > "$file" << SVGEOF
<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
	<defs>
		<radialGradient id="felt" cx="50%" cy="-20%" r="120%">
			<stop offset="0%" stop-color="${bg0}"/>
			<stop offset="45%" stop-color="${bg1}"/>
			<stop offset="100%" stop-color="${bg2}"/>
		</radialGradient>
		<pattern id="back" width="17" height="17" patternTransform="rotate(45)" patternUnits="userSpaceOnUse">
			<rect width="17" height="17" fill="${back0}"/>
			<rect y="8.5" width="17" height="8.5" fill="${back1}"/>
		</pattern>
		<filter id="drop" x="-30%" y="-30%" width="160%" height="160%">
			<feDropShadow dx="0" dy="10" stdDeviation="14" flood-color="#000" flood-opacity="0.35"/>
		</filter>
	</defs>
	<rect width="1200" height="630" fill="url(#felt)"/>
	<rect width="1200" height="8" fill="${accent}"/>

	<!-- Fanned hand, right side: face-down card + 3 / 5 / 8 -->
	<g transform="translate(945 330) scale(0.9)" filter="url(#drop)">
		<g transform="rotate(-24) translate(-260 -170)">
			<rect width="230" height="330" rx="20" fill="url(#back)" stroke="#ffffff" stroke-width="10"/>
		</g>
		<g transform="rotate(-8) translate(-190 -180)">
			<rect width="230" height="330" rx="20" fill="#fdfdfb"/>
			<text x="30" y="66" font-family="Avenir Next, Helvetica, sans-serif" font-size="44" font-weight="700" fill="${bg1}">3</text>
			<text x="115" y="205" text-anchor="middle" font-family="Avenir Next, Helvetica, sans-serif" font-size="110" font-weight="700" fill="${bg1}">3</text>
		</g>
		<g transform="rotate(8) translate(-120 -185)">
			<rect width="230" height="330" rx="20" fill="#fdfdfb"/>
			<text x="30" y="66" font-family="Avenir Next, Helvetica, sans-serif" font-size="44" font-weight="700" fill="${bg1}">5</text>
			<text x="115" y="205" text-anchor="middle" font-family="Avenir Next, Helvetica, sans-serif" font-size="110" font-weight="700" fill="${bg1}">5</text>
		</g>
		<g transform="rotate(24) translate(-45 -175)">
			<rect width="230" height="330" rx="20" fill="${accent}"/>
			<text x="30" y="66" font-family="Avenir Next, Helvetica, sans-serif" font-size="44" font-weight="700" fill="${accent_text}">8</text>
			<text x="115" y="205" text-anchor="middle" font-family="Avenir Next, Helvetica, sans-serif" font-size="110" font-weight="700" fill="${accent_text}">8</text>
		</g>
	</g>

	<text x="80" y="300" font-family="Avenir Next, Helvetica, sans-serif" font-size="84" font-weight="800" fill="#ffffff">Story Points</text>
	<text x="80" y="366" font-family="Avenir Next, Helvetica, sans-serif" font-size="34" font-weight="500" fill="rgba(255,255,255,0.82)">Estimate together, in realtime.</text>
	<rect x="80" y="416" width="64" height="6" rx="3" fill="${accent}"/>
</svg>
SVGEOF

	rsvg-convert -w 1200 -h 630 "$file" -o "$OUT/${id}.png"
	echo "✓ ${id}.png"
}

count=0
while IFS=$'\t' read -r id bg0 bg1 bg2 accent accent_text back0 back1; do
	[ -z "$id" ] && continue
	generate_theme "$id" "$bg0" "$bg1" "$bg2" "$accent" "$accent_text" "$back0" "$back1"
	count=$((count + 1))
done < "$palettes"

echo ""
echo "Done! Generated $count OG images in $OUT/."
