import {
	Group,
	Mesh,
	BoxGeometry,
	CylinderGeometry,
	SphereGeometry,
	TorusGeometry,
	PlaneGeometry,
	TubeGeometry,
	LatheGeometry,
	Vector2,
	CatmullRomCurve3,
	MeshStandardNodeMaterial,
	TextureLoader,
	CanvasTexture,
	AdditiveBlending,
	DoubleSide,
	SRGBColorSpace,
	Vector3,
	Color,
} from 'three/webgpu';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { PALETTE, laptopScreen, terminalScreen, whiteboardTexture, phoneScreen, rng } from './textures.js';

const mat = (color, roughness = 0.4, metalness = 0, extra = {}) =>
	new MeshStandardNodeMaterial({ color, roughness, metalness, ...extra });

const M = {
	clay: mat(PALETTE.clay, 0.32),
	clayMatte: mat('#e8ebec', 0.7),
	teal: mat(PALETTE.teal, 0.4),
	tealSoft: mat(PALETTE.tealSoft, 0.5),
	peach: mat(PALETTE.peach, 0.5),
	amber: mat(PALETTE.amber, 0.45),
	rust: mat(PALETTE.rust, 0.55),
	ink: mat('#26343a', 0.45),
	chrome: mat('#e3e8ea', 0.1, 1),
	darkChrome: mat('#8b979c', 0.2, 1),
};

function screenMaterial(map, intensity = 1) {
	return new MeshStandardNodeMaterial({ color: '#000', roughness: 0.25, emissive: '#fff', emissiveMap: map, emissiveIntensity: intensity });
}

function mesh(geo, material, { pos, rot, shadow = true } = {}) {
	const m = new Mesh(geo, material);
	if (pos) m.position.set(...pos);
	if (rot) m.rotation.set(...rot);
	m.castShadow = m.receiveShadow = shadow;
	return m;
}

const rbox = (w, h, d, r = 0.01) => new RoundedBoxGeometry(w, h, d, 3, r);

function place(group, [x, y, z], ry = 0) {
	group.position.set(x, y, z);
	group.rotation.y = ry;
	return group;
}

// ---------------------------------------------------------------- items

function photo() {
	const g = new Group();
	g.add(mesh(rbox(0.3, 0.37, 0.03, 0.012), M.clay, { pos: [0, 0.2, 0] }));
	const tex = new TextureLoader().load(`${import.meta.env.BASE_URL}img/jhon.jpeg`);
	tex.colorSpace = SRGBColorSpace;
	g.add(mesh(new PlaneGeometry(0.24, 0.24), mat('#fff', 0.6, 0, { map: tex }), { pos: [0, 0.22, 0.016], shadow: false }));
	g.add(mesh(new BoxGeometry(0.24, 0.04, 0.002), M.peach, { pos: [0, 0.07, 0.016], shadow: false }));
	g.add(mesh(new BoxGeometry(0.03, 0.3, 0.02), M.clayMatte, { pos: [0, 0.14, -0.08], rot: [-0.45, 0, 0] }));
	return { group: place(g, [1.46, 0, -0.5], -0.35), view: { pos: [1.2, 0.5, 0.25], look: [1.44, 0.2, -0.5] } };
}

function laptop() {
	const g = new Group();
	const screen = laptopScreen();
	g.add(mesh(rbox(0.52, 0.022, 0.36, 0.01), M.clay, { pos: [0, 0.011, 0] }));
	g.add(mesh(new BoxGeometry(0.44, 0.002, 0.16), M.clayMatte, { pos: [0, 0.023, -0.05] }));
	g.add(mesh(new BoxGeometry(0.14, 0.002, 0.08), M.clayMatte, { pos: [0, 0.023, 0.11] }));
	const lid = new Group();
	lid.position.set(0, 0.022, -0.18);
	lid.rotation.x = -0.28;
	lid.add(mesh(rbox(0.52, 0.34, 0.014, 0.008), M.clay, { pos: [0, 0.17, 0] }));
	lid.add(mesh(new PlaneGeometry(0.48, 0.3), screenMaterial(screen.texture), { pos: [0, 0.172, 0.0075], shadow: false }));
	g.add(lid);
	return {
		group: place(g, [-0.92, 0, 0.12], 0.35),
		view: { pos: [-0.72, 0.62, 0.98], look: [-0.92, 0.15, 0.05] },
		update: (t) => screen.update(t),
	};
}

function whiteboard() {
	const g = new Group();
	g.add(mesh(rbox(1.34, 0.8, 0.03, 0.012), M.clay, { pos: [0, 0, 0] }));
	g.add(mesh(new PlaneGeometry(1.28, 0.74), mat('#fff', 0.35, 0, { map: whiteboardTexture() }), { pos: [0, 0, 0.016], shadow: false }));
	g.add(mesh(rbox(0.9, 0.025, 0.06, 0.008), M.clay, { pos: [0, -0.42, 0.03] }));
	g.add(mesh(new CylinderGeometry(0.009, 0.009, 0.12, 12), M.teal, { pos: [-0.2, -0.4, 0.04], rot: [0, 0, Math.PI / 2] }));
	g.add(mesh(new CylinderGeometry(0.009, 0.009, 0.12, 12), M.amber, { pos: [-0.04, -0.4, 0.045], rot: [0, 0.2, Math.PI / 2] }));
	return { group: place(g, [-0.55, 0.72, -0.98]), view: { pos: [-0.55, 0.82, 0.8], look: [-0.55, 0.7, -0.98] } };
}

function books() {
	const g = new Group();
	const r = rng(4);
	const colors = [M.teal, M.clay, M.peach, M.rust, M.tealSoft, M.clay, M.amber];
	let y = 0;
	for (let i = 0; i < 3; i++) {
		const h = 0.035 + r() * 0.02;
		const b = mesh(rbox(0.28 - i * 0.02, h, 0.21 - i * 0.01, 0.006), colors[i], { pos: [0, y + h / 2, 0], rot: [0, (r() - 0.5) * 0.3, 0] });
		g.add(b);
		y += h;
	}
	let x = -0.02;
	for (let i = 0; i < 6; i++) {
		const w = 0.03 + r() * 0.025;
		const h = 0.22 + r() * 0.08;
		x += w / 2 + 0.003;
		const tilt = i === 5 ? -0.28 : 0;
		const b = mesh(rbox(w, h, 0.18, 0.005), colors[(i + 3) % colors.length], {
			pos: [0.2 + x + (tilt ? 0.03 : 0), h / 2 - (tilt ? 0.01 : 0), -0.02],
			rot: [0, 0, tilt],
		});
		g.add(b);
		x += w / 2;
	}
	return { group: place(g, [-1.42, 0, -0.42], 0.25), view: { pos: [-1.78, 0.62, 0.42], look: [-1.36, 0.13, -0.42] } };
}

function monitor() {
	const g = new Group();
	const screen = terminalScreen();
	g.add(mesh(rbox(0.26, 0.018, 0.18, 0.008), M.clay, { pos: [0, 0.009, 0] }));
	g.add(mesh(rbox(0.05, 0.3, 0.03, 0.01), M.clay, { pos: [0, 0.16, -0.04] }));
	g.add(mesh(rbox(0.76, 0.5, 0.03, 0.014), M.clay, { pos: [0, 0.48, -0.01] }));
	g.add(mesh(new PlaneGeometry(0.72, 0.46), screenMaterial(screen.texture), { pos: [0, 0.48, 0.0055], shadow: false }));
	g.add(mesh(new BoxGeometry(0.1, 0.006, 0.002), M.peach, { pos: [0, 0.244, 0.006], shadow: false }));
	return {
		group: place(g, [0.88, 0, -0.52], -0.3),
		view: { pos: [1.06, 0.62, 0.8], look: [0.86, 0.36, -0.5] },
		update: (t) => screen.update(t),
	};
}

function stethoscope() {
	const g = new Group();
	const tube = new CatmullRomCurve3(
		[
			[0, 0.02, 0],
			[-0.08, 0.012, -0.08],
			[-0.02, 0.012, -0.2],
			[0.12, 0.012, -0.22],
			[0.2, 0.012, -0.12],
			[0.16, 0.014, -0.02],
			[0.24, 0.016, 0.05],
		].map((p) => new Vector3(...p)),
	);
	g.add(mesh(new TubeGeometry(tube, 120, 0.009, 12), M.teal));
	for (const side of [-1, 1]) {
		const arm = new CatmullRomCurve3(
			[
				[0.24, 0.016, 0.05],
				[0.27 + side * 0.03, 0.014, 0.1],
				[0.3 + side * 0.07, 0.012, 0.18],
				[0.32 + side * 0.06, 0.012, 0.23],
			].map((p) => new Vector3(...p)),
		);
		g.add(mesh(new TubeGeometry(arm, 40, 0.005, 10), M.chrome));
		const tip = mesh(new SphereGeometry(0.013, 16, 12), M.clay, { pos: [0.32 + side * 0.06, 0.014, 0.235] });
		g.add(tip);
	}
	g.add(mesh(new SphereGeometry(0.016, 16, 12), M.chrome, { pos: [0.24, 0.016, 0.05] }));
	// chest piece
	g.add(mesh(new CylinderGeometry(0.05, 0.052, 0.022, 40), M.chrome, { pos: [0, 0.011, 0] }));
	g.add(mesh(new CylinderGeometry(0.046, 0.046, 0.003, 40), M.clay, { pos: [0, 0.023, 0] }));
	g.add(mesh(new CylinderGeometry(0.01, 0.01, 0.05, 16), M.chrome, { pos: [-0.03, 0.018, -0.03], rot: [Math.PI / 2, 0, Math.PI / 4] }));
	return { group: place(g, [0.5, 0, 0.3], 0.3), view: { pos: [0.62, 0.78, 0.98], look: [0.6, 0.02, 0.26] } };
}

function pcb() {
	const g = new Group();
	const leds = [];
	g.add(mesh(rbox(0.36, 0.012, 0.24, 0.004), mat(PALETTE.tealDeep, 0.35), { pos: [0, 0.006, 0] }));
	// traces
	const trace = mat('#c9a268', 0.3, 0.8);
	for (let i = 0; i < 7; i++) g.add(mesh(new BoxGeometry(0.2, 0.001, 0.003), trace, { pos: [0.04, 0.0125, -0.09 + i * 0.03], shadow: false }));
	g.add(mesh(rbox(0.08, 0.012, 0.08, 0.003), M.ink, { pos: [-0.09, 0.018, -0.02] }));
	g.add(mesh(rbox(0.05, 0.01, 0.03, 0.002), M.ink, { pos: [0.06, 0.017, -0.07] }));
	g.add(mesh(rbox(0.05, 0.01, 0.03, 0.002), M.ink, { pos: [0.06, 0.017, 0.0] }));
	// header pins
	for (let i = 0; i < 12; i++) g.add(mesh(new BoxGeometry(0.005, 0.02, 0.005), M.chrome, { pos: [-0.15 + i * 0.012, 0.022, 0.1], shadow: false }));
	// LEDs
	for (let i = 0; i < 6; i++) {
		const color = new Color(i % 2 ? '#ff9a55' : '#4fd6e8');
		const m = new MeshStandardNodeMaterial({ color: '#fff', emissive: color, emissiveIntensity: 3, roughness: 0.2 });
		const led = mesh(new SphereGeometry(0.009, 16, 8), m, { pos: [0.02 + i * 0.024, 0.02, 0.06] });
		g.add(led);
		leds.push(m);
	}
	// soldering iron in its holder
	const iron = new Group();
	iron.add(mesh(new CylinderGeometry(0.03, 0.04, 0.02, 24), M.clay, { pos: [0, 0.01, 0] }));
	iron.add(mesh(new TorusGeometry(0.02, 0.004, 8, 24), M.darkChrome, { pos: [0, 0.07, 0], rot: [0.9, 0, 0] }));
	iron.add(mesh(new CylinderGeometry(0.004, 0.004, 0.08, 8), M.darkChrome, { pos: [0, 0.04, 0] }));
	const pen = new Group();
	pen.position.set(0, 0.07, 0);
	pen.rotation.x = 0.9;
	pen.add(mesh(new CylinderGeometry(0.014, 0.012, 0.12, 20), M.clay, { pos: [0, 0.07, 0] }));
	pen.add(mesh(new CylinderGeometry(0.014, 0.014, 0.01, 20), M.peach, { pos: [0, 0.01, 0] }));
	pen.add(mesh(new CylinderGeometry(0.006, 0.002, 0.07, 12), M.chrome, { pos: [0, -0.03, 0] }));
	iron.add(pen);
	iron.position.set(-0.28, 0, 0.06);
	g.add(iron);
	return {
		group: place(g, [-0.28, 0, 0.36], -0.1),
		view: { pos: [-0.24, 0.62, 1.05], look: [-0.36, 0.03, 0.36] },
		update(t) {
			leds.forEach((m, i) => (m.emissiveIntensity = 0.4 + 3.5 * Math.max(0, Math.sin(t * 3 - i * 0.7))));
		},
	};
}

function phone() {
	const g = new Group();
	g.add(mesh(rbox(0.085, 0.01, 0.17, 0.008), M.clay, { pos: [0, 0.005, 0] }));
	g.add(mesh(new PlaneGeometry(0.075, 0.155), screenMaterial(phoneScreen(), 0.8), { pos: [0, 0.0105, 0], rot: [-Math.PI / 2, 0, 0], shadow: false }));
	return { group: place(g, [0.1, 0, 0.58], -0.5), view: { pos: [0.1, 0.6, 1.1], look: [0.1, 0.0, 0.55] } };
}

// SamiBot: the waiter robot from the startup I co-founded. White body, three trays with LED strips,
// a rear column and a lid on top. It drives a small loop in its corner carrying a plate and a cup.
function samibot() {
	const g = new Group();
	const body = new Group();
	g.add(body);
	const led = new MeshStandardNodeMaterial({ color: '#fff', emissive: '#4fd6e8', emissiveIntensity: 2.2, roughness: 0.3 });
	const ledWarm = new MeshStandardNodeMaterial({ color: '#fff', emissive: '#ffae6b', emissiveIntensity: 2.2, roughness: 0.3 });

	// base: rounded drum
	const profile = [
		[0, 0], [0.07, 0], [0.078, 0.006], [0.08, 0.02], [0.08, 0.09], [0.074, 0.105], [0, 0.105],
	].map(([x, y]) => new Vector2(x, y));
	body.add(mesh(new LatheGeometry(profile, 48), M.clay));
	body.add(mesh(rbox(0.05, 0.035, 0.01, 0.004), M.ink, { pos: [0, 0.045, 0.076] }));
	body.add(mesh(new TorusGeometry(0.079, 0.0025, 8, 64), led, { pos: [0, 0.012, 0], rot: [Math.PI / 2, 0, 0], shadow: false }));

	// rear column, slightly curved like the real one
	const spine = new CatmullRomCurve3([[0, 0.1, -0.058], [0, 0.22, -0.066], [0, 0.34, -0.058]].map((p) => new Vector3(...p)));
	body.add(mesh(new TubeGeometry(spine, 20, 0.022, 16), M.clay));

	// trays: white rim, dark top, LED strip on the front edge
	const trayProfile = [[0, 0], [0.07, 0], [0.078, 0.004], [0.078, 0.01], [0, 0.01]].map(([x, y]) => new Vector2(x, y));
	[0.15, 0.225, 0.3].forEach((y, i) => {
		body.add(mesh(new LatheGeometry(trayProfile, 48), M.clay, { pos: [0, y, 0] }));
		body.add(mesh(new CylinderGeometry(0.068, 0.068, 0.002, 48), M.ink, { pos: [0, y + 0.011, 0] }));
		const strip = mesh(new TorusGeometry(0.078, 0.002, 6, 32, Math.PI * 0.7), i === 1 ? ledWarm : led, { shadow: false });
		strip.position.y = y + 0.002;
		strip.rotation.set(Math.PI / 2, 0, Math.PI * 0.15);
		body.add(strip);
	});

	// lid with a camera
	body.add(mesh(rbox(0.13, 0.03, 0.15, 0.012), M.clay, { pos: [0, 0.355, 0.005] }));
	body.add(mesh(new SphereGeometry(0.008, 16, 8), M.ink, { pos: [0, 0.358, 0.08] }));

	// cargo on the middle tray
	body.add(mesh(new CylinderGeometry(0.035, 0.028, 0.006, 32), mat('#fff', 0.3), { pos: [-0.012, 0.239, 0.01] }));
	body.add(mesh(new CylinderGeometry(0.02, 0.018, 0.012, 24), M.amber, { pos: [-0.012, 0.248, 0.01] }));
	body.add(mesh(new CylinderGeometry(0.012, 0.01, 0.035, 20), M.clay, { pos: [0.042, 0.254, -0.02] }));

	g.scale.setScalar(1.3);
	const center = new Vector3(1.2, 0, 0.26);
	return {
		group: place(g, center.toArray()),
		view: { pos: [0.95, 0.62, 1.05], look: [1.2, 0.22, 0.26] },
		update(t) {
			// slow ellipse, facing where it's going, with a little bob on the trays
			const a = t * 0.25;
			g.position.set(center.x + Math.sin(a) * 0.07, 0, center.z + Math.cos(a) * 0.12);
			g.rotation.y = Math.atan2(Math.cos(a) * 0.07, -Math.sin(a) * 0.12);
			body.rotation.z = Math.sin(t * 6) * 0.004;
		},
	};
}

// Nixie clock at the foot of the monitor, like the one under my real screen. Shows the visitor's local time;
// clicking it runs the digit cycle real nixie clocks use against cathode poisoning.
function nixieDigit() {
	const c = document.createElement('canvas');
	c.width = 96;
	c.height = 160;
	const g = c.getContext('2d');
	const tex = new CanvasTexture(c);
	tex.colorSpace = SRGBColorSpace;
	let shown = null;
	return {
		tex,
		set(d) {
			if (d === shown) return;
			shown = d;
			g.clearRect(0, 0, 96, 160);
			g.fillStyle = '#000';
			g.fillRect(0, 0, 96, 160);
			g.font = '300 128px Jost, sans-serif';
			g.textAlign = 'center';
			g.textBaseline = 'middle';
			g.lineWidth = 3;
			// the unlit cathodes stacked behind
			g.strokeStyle = 'rgba(255,140,60,.1)';
			for (const n of '0123456789') g.strokeText(n, 48, 84);
			// the lit one
			g.shadowColor = '#ff6a1a';
			g.shadowBlur = 14;
			g.strokeStyle = '#ff7f30';
			g.lineWidth = 6;
			g.strokeText(d, 48, 84);
			g.shadowBlur = 0;
			g.strokeStyle = '#ffc89a';
			g.lineWidth = 2;
			g.strokeText(d, 48, 84);
			tex.needsUpdate = true;
		},
	};
}

export function nixieClock() {
	const g = new Group();
	g.scale.setScalar(1.4);
	const glass = new MeshStandardNodeMaterial({ color: '#e8d9c8', roughness: 0.04, metalness: 0, transparent: true, opacity: 0.3, depthWrite: false });
	const anode = mat('#120d0b', 0.85, 0, { side: DoubleSide });
	const neon = new MeshStandardNodeMaterial({ color: '#000', emissive: '#ff7a2a', emissiveIntensity: 3 });
	g.add(mesh(rbox(0.34, 0.028, 0.075, 0.008), M.clay, { pos: [0, 0.014, 0] }));
	g.add(mesh(new BoxGeometry(0.3, 0.004, 0.002), M.teal, { pos: [0, 0.014, 0.0385], shadow: false }));

	const digits = [];
	const xs = [-0.135, -0.093, -0.023, 0.019, 0.089, 0.131];
	for (const x of xs) {
		const d = nixieDigit();
		const face = new MeshStandardNodeMaterial({
			color: '#000',
			emissive: '#fff',
			emissiveMap: d.tex,
			emissiveIntensity: 4.5,
			transparent: true,
			blending: AdditiveBlending,
			depthWrite: false,
		});
		g.add(mesh(new CylinderGeometry(0.0175, 0.0175, 0.006, 24), M.chrome, { pos: [x, 0.031, 0] }));
		// dark anode mesh behind the cathodes, so the orange glow has something to read against
		g.add(mesh(new CylinderGeometry(0.0165, 0.0165, 0.056, 24, 1, true, Math.PI / 2, Math.PI), anode, { pos: [x, 0.064, 0], shadow: false }));
		g.add(mesh(new PlaneGeometry(0.026, 0.044), face, { pos: [x, 0.062, 0.002], shadow: false }));
		g.add(mesh(new CylinderGeometry(0.017, 0.017, 0.07, 24, 1, true), glass, { pos: [x, 0.069, 0], shadow: false }));
		g.add(mesh(new SphereGeometry(0.017, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2), glass, { pos: [x, 0.104, 0], shadow: false }));
		g.add(mesh(new SphereGeometry(0.003, 8, 6), glass, { pos: [x, 0.123, 0], shadow: false }));
		digits.push(d);
	}
	const colons = [];
	for (const x of [-0.058, 0.054])
		for (const y of [0.05, 0.072]) {
			const dot = mesh(new SphereGeometry(0.0035, 12, 8), neon, { pos: [x, y, 0], shadow: false });
			g.add(dot);
			colons.push(dot);
		}

	let cycleUntil = -1;
	let clock = 0;
	const pad = (n) => String(n).padStart(2, '0');
	return {
		group: place(g, [0.82, 0, -0.33], -0.3),
		poke() {
			cycleUntil = clock + 2.2;
		},
		update(t) {
			clock = t;
			if (t < cycleUntil) {
				// every tube walks through its cathodes, tubes slightly out of phase
				const step = Math.floor(t * 18);
				digits.forEach((d, i) => d.set(String((step + i * 3) % 10)));
				colons.forEach((c) => (c.visible = true));
				return;
			}
			const now = new Date();
			const str = pad(now.getHours()) + pad(now.getMinutes()) + pad(now.getSeconds());
			digits.forEach((d, i) => d.set(str[i]));
			const on = now.getMilliseconds() < 500;
			colons.forEach((c) => (c.visible = on));
		},
	};
}

// Metal Upa, the chrome capsule toy from STEINS;GATE. Decoration; it wobbles when clicked.
export function metalUpa() {
	const g = new Group();
	const body = new Group();
	body.position.y = 0.065;
	body.add(mesh(new SphereGeometry(0.065, 48, 32), M.chrome));
	for (const s of [-1, 1]) {
		body.add(mesh(new CylinderGeometry(0.022, 0.02, 0.03, 20), M.chrome, { pos: [s * 0.04, 0.055, -0.005], rot: [0, 0, -s * 0.5] }));
		body.add(mesh(new TorusGeometry(0.017, 0.005, 10, 24), M.darkChrome, { pos: [s * 0.024, 0.02, 0.058], rot: [0, s * 0.35, 0] }));
		body.add(mesh(new SphereGeometry(0.01, 16, 12), M.ink, { pos: [s * 0.024, 0.02, 0.058] }));
	}
	body.add(mesh(new TorusGeometry(0.066, 0.003, 8, 64), M.darkChrome, { rot: [Math.PI / 2, 0, 0] }));
	g.add(body);
	let wobble = 0;
	return {
		group: place(g, [0.84, 0, 0.64], -0.5),
		poke() {
			wobble = 1;
		},
		update(t, dt) {
			wobble = Math.max(0, wobble - dt * 0.7);
			body.rotation.z = Math.sin(t * 18) * 0.35 * wobble * wobble;
			body.position.y = 0.065 + Math.abs(Math.sin(t * 9)) * 0.03 * wobble;
		},
	};
}

export const BUILDERS = { photo, laptop, board: whiteboard, books, monitor, stethoscope, pcb, samibot, phone };
