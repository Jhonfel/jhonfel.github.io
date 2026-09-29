import { Fn, uniform, screenUV, screenSize, floor, hash, vec2, vec4, mix, step, select, color } from 'three/tsl';
import { PALETTE } from './textures.js';

// "Worldline shift": a short glitch in the post-processing chain when a section opens or closes,
// like the RE:BOOT opening breaking into peach/teal pixels. The screen is cut into cells; some cells
// turn into flat pixels, whole rows of cells slide sideways, and the colour channels split a little.
// `amount` goes 0 -> 1 -> 0 over ~0.7 s every time it's triggered.
export function worldlineShift(sceneColor, glow) {
	const amount = uniform(0);
	const seed = uniform(0);
	const cellPx = uniform(26 * Math.min(devicePixelRatio, 2));

	const peach = color(PALETTE.peach);
	const tealSoft = color(PALETTE.tealSoft);
	const teal = color(PALETTE.teal);

	const node = Fn(() => {
		const cell = floor(screenUV.mul(screenSize.div(cellPx)));
		const id = cell.x.add(cell.y.mul(997.0)).add(seed);
		const r = hash(id);
		const pick = hash(id.add(13.1));

		// rows of cells slide sideways
		const row = hash(cell.y.add(seed.mul(3.1)));
		const slide = row.sub(0.5).mul(0.14).mul(step(row, amount.mul(0.6))).mul(amount);
		const uv = screenUV.add(vec2(slide, 0));

		// colour channels drift apart
		const split = vec2(amount.mul(0.005), 0);
		const base = vec4(
			sceneColor.sample(uv.add(split)).r,
			sceneColor.sample(uv).g,
			sceneColor.sample(uv.sub(split)).b,
			1,
		).add(glow);

		// some cells become flat pixels in the opening's colours
		const tile = select(pick.lessThan(0.5), peach, select(pick.lessThan(0.8), tealSoft, teal));
		// clustered like the opening: coarse 6x6-cell patches decide how dense each area gets
		const patch = floor(cell.div(6.0));
		const density = hash(patch.x.add(patch.y.mul(131.0)).add(seed.mul(0.37))).pow(2.0);
		const on = step(r, amount.mul(density).mul(0.95));
		return vec4(mix(base.rgb, tile, on.mul(0.92)), 1);
	})();

	let age = 10;
	// ?shift=0.8 freezes the effect at that strength (for checking it)
	const pinned = Number(new URLSearchParams(location.search).get('shift')) || 0;
	const RISE = 0.16;
	const FALL = 0.55;
	return {
		node,
		trigger() {
			age = 0;
			seed.value = Math.random() * 1000;
		},
		update(dt) {
			age += dt;
			amount.value = pinned || (age < RISE ? age / RISE : Math.max(0, 1 - (age - RISE) / FALL) ** 2);
		},
	};
}
