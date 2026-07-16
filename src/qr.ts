/**
 * Invite-QR encoding via lean-qr (~2 KB gzipped) — a deliberate exception
 * to the lean-deps rule: QR encoding (Reed-Solomon, masking, format bits)
 * is exactly the kind of fiddly, fully-solved problem a tiny tested
 * library beats a vendored rewrite at. Loaded lazily: the chunk only
 * downloads the first time someone opens the QR panel.
 */
export async function encodeQR(text: string): Promise<boolean[][]> {
	const { generate } = await import('lean-qr');
	const code = generate(text);
	const out: boolean[][] = [];
	for (let y = 0; y < code.size; y++) {
		const row: boolean[] = [];
		for (let x = 0; x < code.size; x++) row.push(!!code.get(x, y));
		out.push(row);
	}
	return out;
}
