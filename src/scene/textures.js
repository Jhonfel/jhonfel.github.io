import { CanvasTexture, SRGBColorSpace, RepeatWrapping } from 'three/webgpu';

// Palette taken from the STEINS;GATE RE:BOOT opening: white clay, deep teal, peach pixels.
export const PALETTE = {
	paper: '#eceeef',
	clay: '#f4f5f6',
	ink: '#1d2b30',
	teal: '#2b6677',
	tealDeep: '#1b596a',
	tealSoft: '#75adc0',
	peach: '#f9b989',
	amber: '#d3986a',
	rust: '#83532b',
};

const MONO = '"IBM Plex Mono", "JetBrains Mono", ui-monospace, monospace';
const SANS = '"Jost", "Futura", system-ui, sans-serif';

function canvas(w, h) {
	const c = document.createElement('canvas');
	c.width = w;
	c.height = h;
	return [c, c.getContext('2d')];
}

function texture(c, { repeat, color = true } = {}) {
	const t = new CanvasTexture(c);
	if (color) t.colorSpace = SRGBColorSpace;
	t.anisotropy = 8;
	if (repeat) {
		t.wrapS = t.wrapT = RepeatWrapping;
		t.repeat.set(...repeat);
	}
	return t;
}

// Deterministic noise so every visit draws the same textures.
export function rng(seed) {
	return () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
}

// Floor/bench tiles: pale panels with thin seams, like the opening's floor.
export function tileTexture({ size = 1024, cells = 4, seam = PALETTE.tealSoft, dots = false, repeat } = {}) {
	const [c, g] = canvas(size, size);
	g.fillStyle = PALETTE.clay;
	g.fillRect(0, 0, size, size);
	const step = size / cells;
	g.strokeStyle = seam;
	g.globalAlpha = 0.35;
	g.lineWidth = 2;
	for (let i = 0; i <= cells; i++) {
		g.beginPath();
		g.moveTo(i * step, 0);
		g.lineTo(i * step, size);
		g.moveTo(0, i * step);
		g.lineTo(size, i * step);
		g.stroke();
	}
	g.globalAlpha = 0.12;
	g.lineWidth = 1;
	for (let i = 0; i <= cells * 4; i++) {
		g.beginPath();
		g.moveTo((i * step) / 4, 0);
		g.lineTo((i * step) / 4, size);
		g.moveTo(0, (i * step) / 4);
		g.lineTo(size, (i * step) / 4);
		g.stroke();
	}
	if (dots) {
		g.globalAlpha = 0.4;
		g.fillStyle = PALETTE.teal;
		for (let x = step / 8; x < size; x += step / 4)
			for (let y = step / 8; y < size; y += step / 4) {
				g.beginPath();
				g.arc(x, y, 2.2, 0, Math.PI * 2);
				g.fill();
			}
	}
	g.globalAlpha = 1;
	return texture(c, { repeat });
}

// Wall panel with HUD fragments: numbered captions, rings and dot grids.
export function hudWallTexture() {
	const [c, g] = canvas(2048, 1024);
	const r = rng(21);
	g.fillStyle = PALETTE.paper;
	g.fillRect(0, 0, 2048, 1024);
	// peach / teal pixel clusters
	for (let k = 0; k < 7; k++) {
		const cx = r() * 2048;
		const cy = r() * 1024;
		for (let i = 0; i < 40; i++) {
			const s = 24;
			const x = Math.round((cx + (r() - 0.5) * 300) / s) * s;
			const y = Math.round((cy + (r() - 0.5) * 180) / s) * s;
			const p = r();
			g.fillStyle = p < 0.55 ? PALETTE.peach : p < 0.8 ? PALETTE.tealSoft : PALETTE.teal;
			g.globalAlpha = 0.25 + r() * 0.5;
			g.fillRect(x, y, s, s);
		}
	}
	g.globalAlpha = 1;
	g.strokeStyle = PALETTE.teal;
	g.fillStyle = PALETTE.teal;
	g.lineWidth = 2;
	const captions = [
		['03.', 'Time leap', 'machine'],
		['07.', 'Divergence', 'meter'],
		['08.', 'Worldline', 'theory'],
	];
	captions.forEach(([n, a, b], i) => {
		const x = 120 + i * 640;
		const y = 820;
		g.font = `300 56px ${SANS}`;
		g.fillText(n, x, y);
		g.font = `28px ${SANS}`;
		g.fillText(a, x, y + 40);
		g.fillText(b, x, y + 72);
	});
	// rings
	for (const [x, y, rad] of [[1720, 300, 110], [380, 260, 70]]) {
		g.globalAlpha = 0.6;
		for (const f of [1, 0.72, 0.3]) {
			g.beginPath();
			g.arc(x, y, rad * f, 0, Math.PI * 2);
			g.stroke();
		}
		g.beginPath();
		g.moveTo(x - rad * 1.4, y);
		g.lineTo(x + rad * 1.4, y);
		g.moveTo(x, y - rad * 1.4);
		g.lineTo(x, y + rad * 1.4);
		g.stroke();
	}
	// dot grid
	g.globalAlpha = 0.55;
	for (let i = 0; i < 6; i++)
		for (let j = 0; j < 4; j++) {
			g.beginPath();
			g.arc(1180 + i * 34, 140 + j * 34, 7, 0, Math.PI * 2);
			g.stroke();
		}
	// vertical tiny text
	g.globalAlpha = 0.5;
	g.save();
	g.translate(60, 80);
	g.rotate(Math.PI / 2);
	g.font = `22px ${MONO}`;
	g.fillText('ENDLESS APOPTOSIS · PARADOX MELTDOWN · 1.048596', 0, 0);
	g.restore();
	g.globalAlpha = 1;
	return texture(c);
}

export function whiteboardTexture() {
	const [c, g] = canvas(1536, 896);
	g.fillStyle = '#fbfcfc';
	g.fillRect(0, 0, 1536, 896);
	// faint ghost of erased marker
	const r = rng(11);
	for (let i = 0; i < 30; i++) {
		g.fillStyle = `rgba(43,102,119,${r() * 0.03})`;
		g.beginPath();
		g.ellipse(r() * 1536, r() * 896, 80 + r() * 200, 20 + r() * 50, r() * 3, 0, Math.PI * 2);
		g.fill();
	}
	const ink = PALETTE.teal;
	g.fillStyle = ink;
	g.font = `300 34px ${SANS}`;
	g.fillText('04.', 70, 90);
	g.font = `400 64px ${SANS}`;
	g.fillText('Sistemas Inteligentes', 70, 160);
	g.strokeStyle = PALETTE.amber;
	g.lineWidth = 4;
	g.beginPath();
	g.moveTo(70, 184);
	g.lineTo(640, 184);
	g.stroke();

	const layers = [3, 5, 5, 2];
	const nodes = layers.map((n, li) =>
		Array.from({ length: n }, (_, i) => [140 + li * 190, 500 + (i - (n - 1) / 2) * 92]),
	);
	g.strokeStyle = 'rgba(43,102,119,.3)';
	g.lineWidth = 2;
	for (let li = 0; li < nodes.length - 1; li++)
		for (const a of nodes[li])
			for (const b of nodes[li + 1]) {
				g.beginPath();
				g.moveTo(...a);
				g.lineTo(...b);
				g.stroke();
			}
	for (const [li, layer] of nodes.entries())
		for (const [x, y] of layer) {
			g.fillStyle = li === 0 ? PALETTE.peach : li === nodes.length - 1 ? PALETTE.teal : '#fbfcfc';
			g.strokeStyle = ink;
			g.lineWidth = 3.5;
			g.beginPath();
			g.arc(x, y, 22, 0, Math.PI * 2);
			g.fill();
			g.stroke();
		}

	g.fillStyle = ink;
	g.font = `40px ${MONO}`;
	g.fillText('ŷ = σ(W₂·ReLU(W₁x + b₁) + b₂)', 820, 290);
	g.fillText('L = −Σ y log ŷ', 820, 380);
	g.fillText('θ ← θ − η∇L', 820, 470);
	g.font = `34px ${SANS}`;
	g.fillStyle = PALETTE.rust;
	g.fillText('búsqueda · lógica · aprendizaje', 820, 575);
	g.strokeStyle = ink;
	g.lineWidth = 3;
	g.beginPath();
	g.moveTo(830, 660);
	g.lineTo(830, 840);
	g.lineTo(1420, 840);
	g.stroke();
	g.strokeStyle = PALETTE.amber;
	g.beginPath();
	for (let i = 0; i <= 60; i++) {
		const x = 840 + i * 9.5;
		const y = 830 - 160 * Math.exp(-i / 12) - 8 + Math.sin(i * 1.7) * 4;
		i ? g.lineTo(x, y) : g.moveTo(x, y);
	}
	g.stroke();
	return texture(c);
}

function screenFrame(g, w, h, title, dark = false) {
	g.fillStyle = dark ? '#0b1316' : '#f7f8f8';
	g.fillRect(0, 0, w, h);
	g.fillStyle = dark ? '#132329' : '#e4e8e9';
	g.fillRect(0, 0, w, 44);
	g.fillStyle = dark ? PALETTE.tealSoft : PALETTE.teal;
	g.font = `20px ${MONO}`;
	g.fillText(title, 24, 29);
	g.fillStyle = PALETTE.peach;
	g.fillRect(w - 44, 14, 16, 16);
	g.fillStyle = PALETTE.tealSoft;
	g.fillRect(w - 68, 14, 16, 16);
}

// Screens return { texture, update(t) }; update only redraws when the frame changes.
export function laptopScreen() {
	const [c, g] = canvas(1024, 640);
	const tex = texture(c);
	const lines = [
		[['#83532b', 'for '], ['#1d2b30', 'epoch '], ['#83532b', 'in '], ['#2b6677', 'range'], ['#1d2b30', '(epochs):']],
		[['#1d2b30', '    loss = '], ['#2b6677', 'train_step'], ['#1d2b30', '(model, batch)']],
		[['#1d2b30', '    metrics.'], ['#2b6677', 'log'], ['#1d2b30', '(loss=loss)']],
	];
	let last = -1;
	function draw(step) {
		screenFrame(g, 1024, 640, 'train.py');
		g.font = `24px ${MONO}`;
		lines.forEach((line, i) => {
			let x = 36;
			for (const [col, s] of line) {
				g.fillStyle = col;
				g.fillText(s, x, 100 + i * 38);
				x += g.measureText(s).width;
			}
		});
		const px = 60;
		const py = 290;
		const pw = 900;
		const ph = 280;
		g.strokeStyle = 'rgba(43,102,119,.18)';
		g.lineWidth = 1;
		for (let i = 0; i <= 4; i++) {
			g.beginPath();
			g.moveTo(px, py + (ph * i) / 4);
			g.lineTo(px + pw, py + (ph * i) / 4);
			g.stroke();
		}
		const n = Math.min(step, 120);
		const curve = (i) => py + ph - ph * (0.12 + 0.82 * Math.exp(-i / 22)) + Math.sin(i * 1.3) * 5 * Math.exp(-i / 60);
		for (const [col, off] of [[PALETTE.amber, 0], [PALETTE.teal, 0.07]]) {
			g.strokeStyle = col;
			g.lineWidth = 3.5;
			g.beginPath();
			for (let i = 0; i <= n; i++) {
				const yy = curve(i) - off * ph * (1 - Math.exp(-i / 40));
				i ? g.lineTo(px + (i / 120) * pw, yy) : g.moveTo(px, yy);
			}
			g.stroke();
		}
		g.fillStyle = PALETTE.teal;
		g.font = `20px ${MONO}`;
		g.fillText(`epoch ${String(n).padStart(3, '0')}   val_auc ${(0.71 + 0.22 * (1 - Math.exp(-n / 30))).toFixed(3)}`, px, py - 18);
		tex.needsUpdate = true;
	}
	return {
		texture: tex,
		update(t) {
			const step = Math.floor((t * 14) % 160);
			if (step !== last) draw((last = step));
		},
	};
}

export function terminalScreen() {
	const [c, g] = canvas(1024, 768);
	const tex = texture(c);
	const script = [
		['$ ', 'hyprctl monitors | grep HEADLESS'],
		['', 'Monitor HEADLESS-1: 2560x1600@120 HDR'],
		['$ ', 'systemctl --user start sunshine'],
		['', '[info] Client: 2560x1600 @ 120 Hz, HDR10'],
		['', '[info] Encoder: av1_nvenc 10-bit, BT.2020 PQ'],
		['', '[info] Streaming started'],
		['$ ', 'uname -sr'],
		['', 'Linux 7.2.7-arch1-1'],
		['$ ', ''],
	];
	const total = script.reduce((a, [, s]) => a + s.length + 8, 0);
	let last = '';
	function draw(chars, blink) {
		screenFrame(g, 1024, 768, 'foot — ~/sunshine-hyprland-virtual-display');
		g.font = `26px ${MONO}`;
		let left = chars;
		let y = 100;
		for (const [prompt, text] of script) {
			if (left <= 0) break;
			const shown = prompt ? text.slice(0, Math.max(0, left)) : left >= text.length ? text : '';
			g.fillStyle = PALETTE.amber;
			g.fillText(prompt, 30, y);
			g.fillStyle = prompt ? PALETTE.ink : text.startsWith('[info]') ? PALETTE.teal : '#5d7178';
			g.fillText(shown, 30 + g.measureText(prompt).width, y);
			if (blink && (left < text.length + 8 || !text)) {
				g.fillStyle = PALETTE.teal;
				g.fillRect(30 + g.measureText(prompt + shown).width + 4, y - 22, 14, 28);
			}
			left -= text.length + 8;
			y += 60;
		}
		tex.needsUpdate = true;
	}
	return {
		texture: tex,
		update(t) {
			const chars = Math.floor((t * 22) % (total + 90));
			const blink = Math.floor(t * 2) % 2 === 0;
			const key = `${chars}|${blink}`;
			if (key !== last) {
				last = key;
				draw(chars, blink);
			}
		},
	};
}

export function phoneScreen() {
	const [c, g] = canvas(360, 720);
	g.fillStyle = '#f7f8f8';
	g.fillRect(0, 0, 360, 720);
	const r = rng(5);
	for (let i = 0; i < 26; i++) {
		const p = r();
		g.fillStyle = p < 0.6 ? PALETTE.peach : PALETTE.tealSoft;
		g.globalAlpha = 0.3 + r() * 0.5;
		g.fillRect(Math.floor(r() * 12) * 30, 260 + Math.floor(r() * 5) * 30, 30, 30);
	}
	g.globalAlpha = 1;
	g.fillStyle = PALETTE.teal;
	g.textAlign = 'center';
	g.font = `300 84px ${SANS}`;
	g.fillText('1.048', 180, 150);
	g.font = `22px ${MONO}`;
	g.fillText('@Jhonfel', 180, 196);
	['in', 'gh', '@'].forEach((label, i) => {
		const x = 80 + i * 100;
		g.fillStyle = i === 2 ? PALETTE.amber : PALETTE.teal;
		g.beginPath();
		g.roundRect(x - 34, 540, 68, 68, 20);
		g.fill();
		g.fillStyle = '#fff';
		g.font = `500 30px ${SANS}`;
		g.fillText(label, x, 585);
	});
	return texture(c);
}
