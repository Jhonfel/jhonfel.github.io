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
	ExtrudeGeometry,
	Shape,
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
	Matrix4,
	RingGeometry,
	MeshPhysicalNodeMaterial,
} from 'three/webgpu';
import { texture, uv, time, sin, fract, smoothstep, float, vec3, min, hash, floor, step, color, fwidth } from 'three/tsl';
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

// Monitor screen as a small TSL shader over the light terminal: faint scanlines, a slow band rolling
// down, a touch of flicker and slightly darker corners. Kept at or under 1.0 so it doesn't bloom.
function crtMaterial(map) {
	const m = new MeshStandardNodeMaterial({ roughness: 0.3 });
	const tex = texture(map, uv());
	// scanlines fade out when a line is thinner than ~a pixel on screen, so there's no moiré from afar
	const lines = uv().y.mul(150);
	const fade = float(1).sub(smoothstep(0.25, 0.6, fwidth(lines)));
	const scan = sin(lines.mul(Math.PI * 2)).mul(0.5).add(0.5).mul(0.07).mul(fade).add(float(1).sub(fade.mul(0.07)));
	const band = smoothstep(0.9, 1.0, fract(uv().y.add(time.mul(0.13)))).mul(0.05);
	const flicker = sin(time.mul(113.0)).mul(0.01).add(0.99);
	const d = uv().sub(0.5).length();
	const vignette = float(1).sub(d.mul(d).mul(0.5));
	m.colorNode = vec3(0);
	m.emissiveNode = min(tex.rgb.mul(scan).mul(vignette).mul(flicker).sub(band), 0.98);
	return m;
}

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
	// Everything sits on a rocker hinged at the back edge of the stand, so the arm can knock it back
	// and it springs forward again.
	const HINGE_Z = -0.09;
	const rocker = new Group();
	rocker.position.z = HINGE_Z;
	g.add(rocker);
	const body = new Group();
	body.position.z = -HINGE_Z;
	rocker.add(body);
	body.add(mesh(rbox(0.26, 0.018, 0.18, 0.008), M.clay, { pos: [0, 0.009, 0] }));
	body.add(mesh(rbox(0.05, 0.3, 0.03, 0.01), M.clay, { pos: [0, 0.16, -0.04] }));
	body.add(mesh(rbox(0.76, 0.5, 0.03, 0.014), M.clay, { pos: [0, 0.48, -0.01] }));
	body.add(mesh(new PlaneGeometry(0.72, 0.46), crtMaterial(screen.texture), { pos: [0, 0.48, 0.0055], shadow: false }));
	body.add(mesh(new BoxGeometry(0.1, 0.006, 0.002), M.peach, { pos: [0, 0.244, 0.006], shadow: false }));

	let tilt = 0; // radians, positive = leaning back
	let spin = 0;
	const inv = new Matrix4();
	const p = new Vector3();
	return {
		group: place(g, [0.88, 0, -0.52], -0.3),
		view: { pos: [1.06, 0.62, 0.8], look: [0.86, 0.36, -0.5] },
		/** world points of the arm; returns how deep the deepest one is inside the screen (m) */
		collide(points) {
			inv.copy(g.matrixWorld).invert();
			let depth = 0;
			for (const wp of points) {
				p.copy(wp).applyMatrix4(inv);
				// screen panel (front face near z = 0.005), padded by the arm's thickness
				if (Math.abs(p.x) < 0.42 && p.y > 0.2 && p.y < 0.76 && p.z < 0.055 && p.z > -0.06) depth = Math.max(depth, 0.055 - p.z);
			}
			if (depth > 0) spin += Math.min(depth, 0.08) * 45;
			return depth;
		},
		update(t, dt) {
			screen.update(t);
			// damped spring back to upright, with a hard stop so it can't tip over
			spin += (-140 * tilt - 5 * spin) * dt;
			tilt += spin * dt;
			if (tilt > 0.35) (tilt = 0.35), (spin = -Math.abs(spin) * 0.4);
			if (tilt < -0.06) (tilt = -0.06), (spin = Math.abs(spin) * 0.3);
			rocker.rotation.x = -tilt;
		},
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

// SamiBot, the waiter robot from the startup I co-founded, modelled after the real one:
// silver drum base (its black top is the lowest tray), a wide curved rear shell, two D-shaped trays
// with an LED strip on the front edge, and a rounded hood with a camera. It drives a small loop.
function samibotDecal() {
	const c = document.createElement('canvas');
	c.width = 512;
	c.height = 256;
	const g = c.getContext('2d');
	g.clearRect(0, 0, 512, 256);
	g.fillStyle = '#4a5053';
	g.font = '400 30px Jost, sans-serif';
	g.textAlign = 'center';
	g.letterSpacing = '8px';
	g.fillText('SAMIBOT', 256, 44);
	// service hatch: black outline with stripes
	g.strokeStyle = '#1b1e20';
	g.lineWidth = 5;
	g.strokeRect(206, 110, 100, 120);
	g.lineWidth = 6;
	for (const y of [140, 160]) {
		g.beginPath();
		g.moveTo(222, y);
		g.lineTo(290, y);
		g.stroke();
	}
	g.strokeRect(222, 180, 68, 34);
	const t = new CanvasTexture(c);
	t.colorSpace = SRGBColorSpace;
	return t;
}

function samibot() {
	// Opened up for repairs: chassis on a test stand with the wheels in the air, electronics and cables out,
	// the rear frame with one tray still mounted, and the removed shell and second tray on the bench.
	const g = new Group();
	const R = 0.085;
	const silver = mat('#dfe2e4', 0.32, 0.35);
	const alu = mat('#aab2b6', 0.35, 0.8);
	const black = mat('#1c1f22', 0.9);
	const rubber = mat('#222527', 0.85);
	const ledTeal = new MeshStandardNodeMaterial({ color: '#fff', emissive: '#3fe0d0', emissiveIntensity: 3 });
	const ledRed = new MeshStandardNodeMaterial({ color: '#fff', emissive: '#ff3030', emissiveIntensity: 3 });
	const wire = (pts, color, r = 0.0022) =>
		mesh(new TubeGeometry(new CatmullRomCurve3(pts.map((p) => new Vector3(...p))), 48, r, 8), mat(color, 0.55));

	// test stand + chassis plate
	g.add(mesh(rbox(0.12, 0.03, 0.08, 0.006), M.clayMatte, { pos: [0, 0.015, 0] }));
	const plateY = 0.046;
	g.add(mesh(new CylinderGeometry(R, R, 0.006, 64), alu, { pos: [0, plateY, 0] }));

	// differential drive wheels (spinning on the stand) and casters
	const wheels = [];
	for (const x of [-0.079, 0.079]) {
		const w = new Group();
		w.position.set(x, 0.032, 0);
		w.add(mesh(new CylinderGeometry(0.028, 0.028, 0.014, 32), rubber, { rot: [0, 0, Math.PI / 2] }));
		w.add(mesh(new CylinderGeometry(0.017, 0.017, 0.016, 24), silver, { rot: [0, 0, Math.PI / 2] }));
		for (let k = 0; k < 5; k++)
			w.add(mesh(new BoxGeometry(0.017, 0.003, 0.004), alu, { pos: [Math.sign(x) * 0.0005, 0, 0], rot: [(k / 5) * Math.PI, 0, 0], shadow: false }));
		g.add(w);
		wheels.push(w);
	}
	for (const z of [-0.066, 0.066]) g.add(mesh(new SphereGeometry(0.008, 12, 8), black, { pos: [0, 0.037, z] }));

	// electronics on the plate
	const top = plateY + 0.003;
	g.add(mesh(rbox(0.09, 0.034, 0.042, 0.004), mat('#263540', 0.6), { pos: [0, top + 0.017, -0.03] }));
	g.add(mesh(new BoxGeometry(0.06, 0.012, 0.0005), M.peach, { pos: [0, top + 0.02, -0.0088], shadow: false }));
	g.add(mesh(new BoxGeometry(0.052, 0.004, 0.036), mat(PALETTE.tealDeep, 0.4), { pos: [-0.045, top + 0.006, 0.036] }));
	for (let k = 0; k < 6; k++) g.add(mesh(new BoxGeometry(0.03, 0.014, 0.0015), alu, { pos: [-0.045, top + 0.015, 0.024 + k * 0.005] }));
	g.add(mesh(new BoxGeometry(0.046, 0.004, 0.03), mat('#2f7a52', 0.4), { pos: [0.045, top + 0.006, 0.038] }));
	g.add(mesh(new BoxGeometry(0.014, 0.008, 0.012), M.chrome, { pos: [0.062, top + 0.012, 0.048] }));
	g.add(mesh(new BoxGeometry(0.012, 0.006, 0.01), M.chrome, { pos: [0.062, top + 0.011, 0.03] }));
	const status = mesh(new SphereGeometry(0.0025, 8, 6), ledRed, { pos: [0.03, top + 0.01, 0.05], shadow: false });
	g.add(status);

	// lidar: fixed base, spinning head with a window
	g.add(mesh(new CylinderGeometry(0.018, 0.019, 0.014, 32), black, { pos: [0, top + 0.012, 0.062] }));
	const lidar = new Group();
	lidar.position.set(0, top + 0.026, 0.062);
	lidar.add(mesh(new CylinderGeometry(0.016, 0.016, 0.013, 32), mat('#34393c', 0.5)));
	lidar.add(mesh(new BoxGeometry(0.012, 0.006, 0.002), ledTeal, { pos: [0, 0, 0.0162], shadow: false }));
	g.add(lidar);

	// standoffs and a half upper deck
	for (const [x, z] of [[-0.055, -0.045], [0.055, -0.045], [-0.055, 0.0], [0.055, 0.0]])
		g.add(mesh(new CylinderGeometry(0.0028, 0.0028, 0.07, 8), M.chrome, { pos: [x, top + 0.035, z] }));
	g.add(mesh(new CylinderGeometry(R - 0.006, R - 0.006, 0.004, 48, 1, false, Math.PI / 2, Math.PI), alu, { pos: [0, top + 0.071, 0] }));

	// rear frame (the skeleton of the shell) with one tray still mounted
	for (const x of [-0.04, 0.04]) g.add(mesh(new BoxGeometry(0.012, 0.3, 0.012), alu, { pos: [x, top + 0.15, -0.07] }));
	g.add(mesh(new BoxGeometry(0.092, 0.012, 0.012), alu, { pos: [0, top + 0.294, -0.07] }));
	const trayShape = new Shape();
	const ca = Math.asin(-0.55);
	trayShape.absarc(0, 0, R, ca, Math.PI - ca, false);
	trayShape.closePath();
	const trayGeo = new ExtrudeGeometry(trayShape, { depth: 0.01, bevelEnabled: true, bevelThickness: 0.002, bevelSize: 0.002, bevelSegments: 2, curveSegments: 40 });
	const insetGeo = new ExtrudeGeometry(trayShape, { depth: 0.002, bevelEnabled: false, curveSegments: 40 });
	const tray = (y) => {
		const t = new Group();
		const base = mesh(trayGeo, silver);
		base.rotation.x = Math.PI / 2;
		t.add(base);
		const inset = mesh(insetGeo, black);
		inset.rotation.x = Math.PI / 2;
		inset.scale.set(0.9, 0.9, 1);
		inset.position.set(0, 0.0025, 0.004);
		t.add(inset);
		t.position.y = y;
		return t;
	};
	const mounted = tray(top + 0.25);
	mounted.add(mesh(new BoxGeometry(0.04, 0.003, 0.003), ledTeal, { pos: [0, -0.006, R + 0.0015], shadow: false }));
	g.add(mounted);

	// cables
	g.add(wire([[-0.02, top + 0.034, -0.03], [-0.03, top + 0.06, 0.0], [-0.045, top + 0.02, 0.03]], '#c0392b'));
	g.add(wire([[-0.01, top + 0.034, -0.03], [-0.022, top + 0.055, 0.004], [-0.038, top + 0.02, 0.028]], '#1c1f22'));
	g.add(wire([[-0.06, top + 0.008, 0.03], [-0.075, top + 0.012, 0.012], [-0.079, 0.045, 0.004]], '#e0a030', 0.0018));
	g.add(wire([[-0.03, top + 0.008, 0.045], [0.03, top + 0.03, 0.06], [0.09, top + 0.01, 0.04], [0.082, 0.045, 0.006]], '#e0a030', 0.0018));
	g.add(wire([[0.03, top + 0.008, 0.045], [0.016, top + 0.02, 0.058], [0.008, top + 0.02, 0.062]], '#3a8fb7', 0.0016));
	g.add(wire([[0.03, top + 0.004, -0.07], [0.034, top + 0.12, -0.064], [0.03, top + 0.22, -0.064], [0.0, top + 0.244, 0.02], [0, top + 0.244, R - 0.004]], PALETTE.teal, 0.0018));
	// a USB cable wandering off the stand across the bench
	g.add(wire([[0.066, top + 0.012, 0.048], [0.11, top + 0.01, 0.07], [0.13, 0.02, 0.1], [0.12, 0.003, 0.16], [0.02, 0.003, 0.2], [-0.1, 0.003, 0.18]], '#e8ebec', 0.0025));

	// removed shell standing beside it, label facing out
	const shell = new Group();
	const profile = [[R, 0], [R, 0.14], [R - 0.004, 0.155], [R - 0.012, 0.165]].map(([x, y]) => new Vector2(x, y));
	shell.add(mesh(new LatheGeometry(profile, 48, -Math.PI * 0.42, Math.PI * 0.84), mat('#dfe2e4', 0.32, 0.35, { side: DoubleSide })));
	const decal = new MeshStandardNodeMaterial({ map: samibotDecal(), transparent: true, roughness: 0.4 });
	shell.add(mesh(new CylinderGeometry(R + 0.0006, R + 0.0006, 0.13, 32, 1, true, -0.8, 1.6), decal, { pos: [0, 0.075, 0], shadow: false }));
	shell.position.set(0.2, 0, 0.0);
	shell.rotation.y = -0.2;
	g.add(shell);

	// second tray lying on the bench, and a screwdriver
	const loose = tray(0.012);
	loose.position.set(0.25, 0.012, 0.17);
	loose.rotation.y = -0.6;
	g.add(loose);
	const driver = new Group();
	driver.add(mesh(new CylinderGeometry(0.009, 0.008, 0.06, 16), M.amber, { rot: [0, 0, Math.PI / 2] }));
	driver.add(mesh(new CylinderGeometry(0.0025, 0.0025, 0.06, 8), M.chrome, { pos: [0.06, 0, 0], rot: [0, 0, Math.PI / 2] }));
	driver.position.set(-0.06, 0.009, 0.16);
	driver.rotation.y = -0.5;
	g.add(driver);

	g.scale.setScalar(1.25);
	return {
		group: place(g, [1.2, 0, 0.24], -0.35),
		view: { pos: [0.92, 0.66, 1.2], look: [1.24, 0.12, 0.24] },
		update(t, dt) {
			for (const w of wheels) w.rotation.x += dt * 5;
			lidar.rotation.y += dt * 9;
			status.visible = Math.floor(t * 2) % 2 === 0;
		},
	};
}

// Nixie clock at the foot of the monitor, like the one under my real screen. Shows the visitor's local time;
// clicking it runs the digit cycle real nixie clocks use against cathode poisoning.
// Nixie cathodes are bent wire, not a typeface. These are traced after the IN-14 style: a tall oval 0,
// a flat-topped 3, an open 4, a 5 with a straight back, 6 and 9 with long curved tails.
// Coordinates are in a 0..1 box (x right, y down).
const NIXIE_GLYPHS = {
	0: (g) => g.ellipse(0.5, 0.5, 0.36, 0.48, 0, 0, Math.PI * 2),
	1: (g) => {
		g.moveTo(0.34, 0.14);
		g.lineTo(0.52, 0.02);
		g.lineTo(0.52, 0.98);
	},
	2: (g) => {
		g.moveTo(0.16, 0.26);
		g.bezierCurveTo(0.16, -0.04, 0.86, -0.04, 0.84, 0.28);
		g.bezierCurveTo(0.82, 0.5, 0.3, 0.72, 0.14, 0.98);
		g.lineTo(0.86, 0.98);
	},
	3: (g) => {
		g.moveTo(0.16, 0.02);
		g.lineTo(0.84, 0.02);
		g.lineTo(0.44, 0.4);
		g.bezierCurveTo(0.98, 0.36, 0.98, 1.02, 0.5, 0.98);
		g.bezierCurveTo(0.3, 0.97, 0.18, 0.9, 0.14, 0.8);
	},
	4: (g) => {
		g.moveTo(0.66, 0.98);
		g.lineTo(0.66, 0.02);
		g.lineTo(0.12, 0.7);
		g.lineTo(0.88, 0.7);
	},
	5: (g) => {
		g.moveTo(0.82, 0.02);
		g.lineTo(0.24, 0.02);
		g.lineTo(0.2, 0.44);
		g.bezierCurveTo(0.5, 0.3, 0.9, 0.42, 0.86, 0.7);
		g.bezierCurveTo(0.82, 1.02, 0.28, 1.04, 0.14, 0.82);
	},
	6: (g) => {
		g.moveTo(0.78, 0.06);
		g.bezierCurveTo(0.42, 0.14, 0.12, 0.44, 0.14, 0.7);
		g.ellipse(0.5, 0.72, 0.36, 0.26, 0, Math.PI, Math.PI * 3);
	},
	7: (g) => {
		g.moveTo(0.14, 0.02);
		g.lineTo(0.86, 0.02);
		g.bezierCurveTo(0.6, 0.3, 0.42, 0.6, 0.38, 0.98);
	},
	8: (g) => {
		g.ellipse(0.5, 0.25, 0.27, 0.23, 0, 0, Math.PI * 2);
		g.moveTo(0.86, 0.72);
		g.ellipse(0.5, 0.72, 0.36, 0.26, 0, 0, Math.PI * 2);
	},
	9: (g) => {
		g.ellipse(0.5, 0.28, 0.36, 0.26, 0, 0, Math.PI * 2);
		g.moveTo(0.86, 0.3);
		g.bezierCurveTo(0.88, 0.56, 0.58, 0.86, 0.22, 0.94);
	},
};

function nixieDigit() {
	const W = 192;
	const H = 320;
	const c = document.createElement('canvas');
	c.width = W;
	c.height = H;
	const g = c.getContext('2d');
	const tex = new CanvasTexture(c);
	tex.colorSpace = SRGBColorSpace;
	// glyph box inside the canvas
	const box = { x: W * 0.2, y: H * 0.12, w: W * 0.6, h: H * 0.76 };
	const trace = (d) => {
		g.save();
		g.translate(box.x, box.y);
		g.scale(box.w, box.h);
		g.beginPath();
		NIXIE_GLYPHS[d](g);
		g.restore();
	};
	let shown = null;
	return {
		tex,
		set(d) {
			if (d === shown) return;
			shown = d;
			g.fillStyle = '#000';
			g.fillRect(0, 0, W, H);
			g.lineCap = g.lineJoin = 'round';
			// the unlit cathodes stacked behind
			g.strokeStyle = 'rgba(255,140,60,.09)';
			g.lineWidth = 3;
			for (let n = 0; n < 10; n++) {
				trace(n);
				g.stroke();
			}
			// the lit one: orange glow around a hot core
			trace(d);
			g.shadowColor = '#ff5a10';
			g.shadowBlur = 22;
			g.strokeStyle = '#ff7a2a';
			g.lineWidth = 9;
			g.stroke();
			g.shadowBlur = 0;
			g.strokeStyle = '#ffd0a0';
			g.lineWidth = 3;
			g.stroke();
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
		// each tube flickers on its own, with the odd dip, like real neon
		const seed = digits.length * 17.3;
		const jitter = hash(floor(time.mul(24.0)).add(seed)).mul(0.14).add(0.86);
		const dip = step(0.992, hash(floor(time.mul(7.0)).add(seed))).mul(0.55);
		const flick = jitter.mul(float(1).sub(dip));
		const face = new MeshStandardNodeMaterial({
			color: '#000',
			transparent: true,
			blending: AdditiveBlending,
			depthWrite: false,
		});
		face.emissiveNode = texture(d.tex, uv()).rgb.mul(4.5).mul(flick);
		// faint orange halo inside the glass, following the same flicker
		const tubeGlass = glass.clone();
		tubeGlass.emissiveNode = color('#ff7a2a').mul(0.05).mul(flick);
		g.add(mesh(new CylinderGeometry(0.0175, 0.0175, 0.006, 24), M.chrome, { pos: [x, 0.031, 0] }));
		// dark anode mesh behind the cathodes, so the orange glow has something to read against
		g.add(mesh(new CylinderGeometry(0.0165, 0.0165, 0.056, 24, 1, true, Math.PI / 2, Math.PI), anode, { pos: [x, 0.064, 0], shadow: false }));
		g.add(mesh(new PlaneGeometry(0.026, 0.044), face, { pos: [x, 0.062, 0.002], shadow: false }));
		g.add(mesh(new CylinderGeometry(0.017, 0.017, 0.07, 24, 1, true), tubeGlass, { pos: [x, 0.069, 0], shadow: false }));
		g.add(mesh(new SphereGeometry(0.017, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2), tubeGlass, { pos: [x, 0.104, 0], shadow: false }));
		g.add(mesh(new SphereGeometry(0.003, 8, 6), glass, { pos: [x, 0.123, 0], shadow: false }));
		digits.push(d);
	}
	const colons = [];
	// a single neon dot between hours, minutes and seconds, down at the digits' baseline
	for (const x of [-0.058, 0.054]) {
		const dot = mesh(new SphereGeometry(0.0033, 12, 8), neon, { pos: [x, 0.043, 0.006], shadow: false });
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

// My skateboard, upside down on the floor under the bench: graphic facing up, wheels in the air.
// Clicking it spins the wheels.
function deckGraphic() {
	const c = document.createElement('canvas');
	c.width = 1024;
	c.height = 256;
	const g = c.getContext('2d');
	g.fillStyle = PALETTE.clay;
	g.fillRect(0, 0, 1024, 256);
	const r = rng(77);
	for (let i = 0; i < 90; i++) {
		const s = 32;
		const x = Math.floor(r() * 32) * s;
		const y = Math.floor(r() * 8) * s;
		const p = r();
		g.fillStyle = p < 0.5 ? PALETTE.peach : p < 0.8 ? PALETTE.tealSoft : PALETTE.teal;
		g.globalAlpha = 0.5 + r() * 0.5;
		g.fillRect(x, y, s, s);
	}
	g.globalAlpha = 1;
	g.fillStyle = PALETTE.teal;
	g.fillRect(0, 118, 1024, 20);
	g.fillStyle = PALETTE.ink;
	g.font = '300 64px Jost, sans-serif';
	g.textAlign = 'center';
	g.fillText('1.048596', 512, 100);
	const t = new CanvasTexture(c);
	t.colorSpace = SRGBColorSpace;
	return t;
}

export function skateboard() {
	const g = new Group();
	const L = 0.8;
	const W = 0.205;
	const T = 0.012;
	const flat = 0.26; // half-length of the flat middle
	const kick = Math.tan(0.3);
	// A segmented box bent into a deck: rounded nose/tail in plan, kicktails bent down (the board is flipped).
	const geo = new BoxGeometry(L, T, W, 80, 1, 12);
	const pos = geo.attributes.position;
	for (let i = 0; i < pos.count; i++) {
		const x = pos.getX(i);
		const ax = Math.abs(x);
		const round = L / 2 - W / 2;
		if (ax > round) {
			const k = (ax - round) / (W / 2);
			pos.setZ(i, pos.getZ(i) * Math.sqrt(Math.max(0, 1 - k * k)) + 0 * k);
		}
		if (ax > flat) pos.setY(i, pos.getY(i) - (ax - flat) * kick);
	}
	geo.computeVertexNormals();
	const wood = mat('#d8b98a', 0.6);
	const deck = mesh(geo, [wood, wood, mat('#fff', 0.5, 0, { map: deckGraphic() }), mat('#18191b', 0.95), wood, wood]);
	g.add(deck);

	const metal = mat('#c3c8cb', 0.25, 0.9);
	const bushing = mat(PALETTE.amber, 0.6);
	const wheelMat = mat('#f1ece2', 0.45);
	const wheels = [];
	for (const x of [-0.2, 0.2]) {
		const truck = new Group();
		truck.position.set(x, T / 2, 0);
		truck.add(mesh(new BoxGeometry(0.06, 0.006, 0.07), metal, { pos: [0, 0.003, 0] }));
		truck.add(mesh(new CylinderGeometry(0.009, 0.009, 0.016, 12), bushing, { pos: [0, 0.014, 0] }));
		truck.add(mesh(rbox(0.03, 0.022, 0.13, 0.008), metal, { pos: [0, 0.03, 0] }));
		truck.add(mesh(new CylinderGeometry(0.0035, 0.0035, 0.21, 10), metal, { pos: [0, 0.036, 0], rot: [Math.PI / 2, 0, 0] }));
		for (const z of [-0.088, 0.088]) {
			const w = new Group();
			w.position.set(0, 0.036, z);
			w.add(mesh(new CylinderGeometry(0.027, 0.027, 0.03, 32), wheelMat, { rot: [Math.PI / 2, 0, 0] }));
			w.add(mesh(new CylinderGeometry(0.012, 0.012, 0.031, 16), metal, { rot: [Math.PI / 2, 0, 0] }));
			truck.add(w);
			wheels.push(w);
		}
		g.add(truck);
	}
	// rest on the tips of the kicktails
	const restY = -0.78 + T / 2 + (L / 2 - flat) * kick;
	g.position.set(0.1, restY, 0.12);
	g.rotation.order = 'YXZ'; // heading, then the flip around the deck's long axis, then the pop
	g.rotation.y = 0.18;
	let spin = 0;
	// Clicking it does a kickflip: pop, one full turn around the long axis, and it lands where it was,
	// still upside down, with a small bounce.
	const FLIP = 0.85;
	const POP = 0.32;
	let flipAge = -1;
	const easeInOut = (x) => (x < 0.5 ? 2 * x * x : 1 - (-2 * x + 2) ** 2 / 2);
	return {
		group: g,
		poke() {
			spin = 30;
			if (flipAge < 0) flipAge = 0;
		},
		update(t, dt) {
			spin *= Math.exp(-dt * 0.6);
			for (const w of wheels) w.rotation.z -= spin * dt;
			if (flipAge < 0) return;
			flipAge += dt;
			const x = Math.min(flipAge / FLIP, 1);
			if (x < 1) {
				g.position.y = restY + 4 * POP * x * (1 - x);
				g.rotation.x = Math.PI * 2 * easeInOut(Math.min(1, x * 1.15));
				g.rotation.z = Math.sin(Math.PI * x) * 0.28 * (1 - x); // nose pops up, levels out
			} else {
				// landing: a couple of little bounces, then settle
				const a = flipAge - FLIP;
				g.position.y = restY + Math.abs(Math.sin(a * 16)) * 0.025 * Math.exp(-a * 7);
				g.rotation.x = 0;
				g.rotation.z = Math.sin(a * 20) * 0.03 * Math.exp(-a * 6);
				if (a > 0.8) {
					g.position.y = restY;
					g.rotation.z = 0;
					flipAge = -1;
				}
			}
		},
	};
}

// Four CDs spread out in the corner of the bench. The covers are small homages drawn in code (no text,
// no real artwork): only someone who knows the albums will recognise them. Clicking spins the loose disc.
function coverCanvas(draw) {
	const c = document.createElement('canvas');
	c.width = c.height = 512;
	const g = c.getContext('2d');
	draw(g, rng(31));
	const t = new CanvasTexture(c);
	t.colorSpace = SRGBColorSpace;
	return t;
}

function glassOnCoaster(g) {
	// round coaster with a square tumbler on it, seen from the front-top
	g.fillStyle = '#d7d4cc';
	g.beginPath();
	g.ellipse(360, 400, 92, 38, 0, 0, Math.PI * 2);
	g.fill();
	g.fillStyle = 'rgba(255,255,255,.35)';
	g.fillRect(300, 250, 120, 150);
	g.fillStyle = 'rgba(120,70,30,.55)';
	g.fillRect(306, 310, 108, 84);
	g.strokeStyle = 'rgba(255,255,255,.8)';
	g.lineWidth = 4;
	g.strokeRect(300, 250, 120, 150);
}

const COVERS = {
	// warm wood, retro diagonal stripes from the top-left, a round coaster, a glass on a coaster
	coaster: (g, r) => {
		g.fillStyle = '#8a5a33';
		g.fillRect(0, 0, 512, 512);
		for (let i = 0; i < 70; i++) {
			g.strokeStyle = `rgba(${60 + r() * 40},${30 + r() * 20},10,${0.15 + r() * 0.2})`;
			g.lineWidth = 1 + r() * 3;
			const y = r() * 700 - 100;
			g.beginPath();
			g.moveTo(0, y);
			g.bezierCurveTo(170, y + 30, 340, y - 30, 512, y + 60);
			g.stroke();
		}
		g.save();
		g.translate(0, 0);
		g.rotate(-Math.PI / 4.2);
		['#efe6cf', '#f2c230', '#ec8a1c', '#c9361e', '#6b3a1c'].forEach((col, k) => {
			g.fillStyle = col;
			g.fillRect(-400, 150 + k * 34, 900, 34);
		});
		g.restore();
		g.fillStyle = '#efe6cf';
		g.beginPath();
		g.arc(110, 410, 70, 0, Math.PI * 2);
		g.fill();
		g.strokeStyle = '#a0522d';
		g.lineWidth = 8;
		g.beginPath();
		g.arc(110, 410, 52, 0, Math.PI * 2);
		g.stroke();
		glassOnCoaster(g);
	},
	// red and black bubbles, dark lenses with red rims, tiny grey figures with raised arms
	twas: (g, r) => {
		g.fillStyle = '#120405';
		g.fillRect(0, 0, 512, 512);
		for (let i = 0; i < 120; i++) {
			const x = r() * 512;
			const y = r() * 512;
			const rad = 4 + r() * 26;
			const grd = g.createRadialGradient(x - rad * 0.3, y - rad * 0.3, 1, x, y, rad);
			grd.addColorStop(0, '#ff5a4a');
			grd.addColorStop(1, '#6d0c0c');
			g.fillStyle = grd;
			g.beginPath();
			g.arc(x, y, rad, 0, Math.PI * 2);
			g.fill();
		}
		for (const [x, y, rx, ry, a] of [[250, 300, 150, 95, -0.2], [420, 420, 110, 80, 0.3], [380, 110, 140, 90, 0.1]]) {
			g.fillStyle = '#0c0203';
			g.strokeStyle = '#d4211b';
			g.lineWidth = 10;
			g.beginPath();
			g.ellipse(x, y, rx, ry, a, 0, Math.PI * 2);
			g.fill();
			g.stroke();
		}
		const figure = (x, y, s) => {
			g.fillStyle = '#b9b6ad';
			g.strokeStyle = '#b9b6ad';
			g.lineWidth = 5 * s;
			g.lineCap = 'round';
			g.beginPath();
			g.arc(x, y - 30 * s, 9 * s, 0, Math.PI * 2);
			g.fill();
			g.beginPath();
			g.moveTo(x, y - 20 * s);
			g.lineTo(x, y + 12 * s);
			g.moveTo(x, y - 12 * s);
			g.lineTo(x - 16 * s, y - 40 * s);
			g.moveTo(x, y - 12 * s);
			g.lineTo(x + 16 * s, y - 40 * s);
			g.moveTo(x, y + 12 * s);
			g.lineTo(x - 10 * s, y + 36 * s);
			g.moveTo(x, y + 12 * s);
			g.lineTo(x + 10 * s, y + 36 * s);
			g.stroke();
		};
		figure(390, 110, 1.2);
		figure(230, 300, 1.0);
		figure(430, 430, 0.8);
		figure(50, 460, 0.8);
	},
	// black field: red heart in a crosshair, yellow bolts in an X, white bombs on the axes, red discs in the corners
	alarmas: (g) => {
		g.fillStyle = '#0b0b0b';
		g.fillRect(0, 0, 512, 512);
		const C = 256;
		for (const [dx, dy] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) {
			g.fillStyle = '#e8312a';
			g.beginPath();
			g.arc(C + dx * 190, C + dy * 190, 54, 0, Math.PI * 2);
			g.fill();
			// zig-zag bolt from the corner to the centre
			g.fillStyle = '#f5b41a';
			g.beginPath();
			const p = (t, o) => [C + dx * (190 - t * 150) + o * dy * 14, C + dy * (190 - t * 150) - o * dx * 14];
			g.moveTo(...p(0, -1));
			g.lineTo(...p(0.45, 0.6));
			g.lineTo(...p(0.5, -0.3));
			g.lineTo(...p(1, 0.2));
			g.lineTo(...p(0.55, -1.1));
			g.lineTo(...p(0.5, 0.1));
			g.lineTo(...p(0, 1));
			g.closePath();
			g.fill();
		}
		for (const a of [0, Math.PI / 2, Math.PI, -Math.PI / 2]) {
			g.save();
			g.translate(C + Math.cos(a) * 185, C + Math.sin(a) * 185);
			g.rotate(a);
			g.fillStyle = '#f2f2f2';
			g.beginPath();
			g.ellipse(0, 0, 40, 16, 0, 0, Math.PI * 2);
			g.fill();
			g.fillRect(28, -12, 16, 24);
			g.restore();
		}
		// heart
		g.fillStyle = '#e8312a';
		g.beginPath();
		g.moveTo(C, C + 52);
		g.bezierCurveTo(C - 70, C + 5, C - 55, C - 55, C, C - 22);
		g.bezierCurveTo(C + 55, C - 55, C + 70, C + 5, C, C + 52);
		g.fill();
		g.strokeStyle = '#ffffff';
		g.lineWidth = 5;
		g.beginPath();
		g.arc(C, C, 22, 0, Math.PI * 2);
		g.moveTo(C - 34, C);
		g.lineTo(C + 34, C);
		g.moveTo(C, C - 34);
		g.lineTo(C, C + 34);
		g.stroke();
		for (const [dx, dy] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) {
			g.beginPath();
			g.moveTo(C + dx * 80, C + dy * 55);
			g.lineTo(C + dx * 80, C + dy * 80);
			g.lineTo(C + dx * 55, C + dy * 80);
			g.stroke();
		}
	},
	// deep blue mist, two icy eyes above, a lone figure holding a candle, white doves below
	word: (g, r) => {
		const bg = g.createRadialGradient(256, 300, 20, 256, 256, 380);
		bg.addColorStop(0, '#5f8fc4');
		bg.addColorStop(0.5, '#23456f');
		bg.addColorStop(1, '#0a1628');
		g.fillStyle = bg;
		g.fillRect(0, 0, 512, 512);
		for (let i = 0; i < 40; i++) {
			g.fillStyle = `rgba(200,225,255,${r() * 0.08})`;
			g.beginPath();
			g.ellipse(r() * 512, 250 + r() * 260, 60 + r() * 120, 20 + r() * 40, 0, 0, Math.PI * 2);
			g.fill();
		}
		for (const x of [120, 392]) {
			g.fillStyle = 'rgba(210,230,255,.55)';
			g.beginPath();
			g.ellipse(x, 170, 70, 26, 0, 0, Math.PI * 2);
			g.fill();
			g.fillStyle = '#4fa3ff';
			g.beginPath();
			g.arc(x, 170, 22, 0, Math.PI * 2);
			g.fill();
			g.fillStyle = '#071322';
			g.beginPath();
			g.arc(x, 170, 9, 0, Math.PI * 2);
			g.fill();
		}
		// figure: long dark coat, pale shirt, candle glow at the chest
		g.fillStyle = '#10151d';
		g.beginPath();
		g.moveTo(256, 190);
		g.lineTo(300, 250);
		g.lineTo(312, 470);
		g.lineTo(200, 470);
		g.lineTo(212, 250);
		g.closePath();
		g.fill();
		g.fillStyle = '#d9c7a4';
		g.fillRect(238, 240, 36, 110);
		g.beginPath();
		g.arc(256, 200, 20, 0, Math.PI * 2);
		g.fill();
		const glow = g.createRadialGradient(262, 300, 2, 262, 300, 70);
		glow.addColorStop(0, 'rgba(255,200,110,.95)');
		glow.addColorStop(1, 'rgba(255,160,60,0)');
		g.fillStyle = glow;
		g.beginPath();
		g.arc(262, 300, 70, 0, Math.PI * 2);
		g.fill();
		const dove = (x, y, s, flip) => {
			g.fillStyle = 'rgba(245,250,255,.9)';
			g.beginPath();
			g.moveTo(x, y);
			g.quadraticCurveTo(x + flip * 40 * s, y - 40 * s, x + flip * 70 * s, y - 10 * s);
			g.quadraticCurveTo(x + flip * 40 * s, y - 5 * s, x + flip * 30 * s, y + 10 * s);
			g.quadraticCurveTo(x + flip * 10 * s, y + 12 * s, x, y);
			g.fill();
		};
		dove(90, 360, 1.1, 1);
		dove(140, 400, 0.8, -1);
		dove(420, 370, 1.1, -1);
		dove(380, 410, 0.8, 1);
	},
};

const CDS = [
	{ cover: 'coaster', spine: ['#8a5a33', '#f2c230', '#c9361e'], pos: [-0.075, 0, -0.06], rot: 0.12, level: 0 },
	{ cover: 'twas', spine: ['#120405', '#d4211b', '#b9b6ad'], pos: [0.075, 0, -0.075], rot: -0.1, level: 0 },
	{ cover: 'word', spine: ['#0a1628', '#4fa3ff', '#d9c7a4'], pos: [0.085, 0, 0.08], rot: 0.18, level: 0 },
	{ cover: 'alarmas', spine: ['#0b0b0b', '#e8312a', '#f5b41a'], pos: [-0.06, 0, 0.075], rot: -0.22, level: 1 },
];

function spineTexture(colors) {
	const c = document.createElement('canvas');
	c.width = 256;
	c.height = 24;
	const g = c.getContext('2d');
	g.fillStyle = colors[0];
	g.fillRect(0, 0, 256, 24);
	g.fillStyle = colors[1];
	g.fillRect(12, 6, 120, 12);
	g.fillStyle = colors[2];
	g.fillRect(200, 6, 30, 12);
	const t = new CanvasTexture(c);
	t.colorSpace = SRGBColorSpace;
	return t;
}

export function cds() {
	const g = new Group();
	const W = 0.125;
	const D = 0.142;
	const H = 0.0104;
	const plastic = new MeshStandardNodeMaterial({ color: '#ffffff', roughness: 0.05, transparent: true, opacity: 0.1, depthWrite: false });
	const tray = mat('#1f2224', 0.5);
	for (const cd of CDS) {
		const c = new Group();
		c.position.set(cd.pos[0], H / 2 + cd.level * H, cd.pos[2]);
		c.rotation.y = cd.rot;
		c.add(mesh(new BoxGeometry(W - 0.004, H - 0.002, D - 0.004), tray, { shadow: false }));
		c.add(mesh(new PlaneGeometry(W - 0.006, H - 0.003), mat('#fff', 0.5, 0, { map: spineTexture(cd.spine) }), { pos: [0, 0, D / 2 - 0.0015], shadow: false }));
		c.add(mesh(new PlaneGeometry(W - 0.01, W - 0.01), mat('#fff', 0.45, 0, { map: coverCanvas(COVERS[cd.cover]) }), { pos: [0.002, H / 2 - 0.0009, 0], rot: [-Math.PI / 2, 0, 0], shadow: false }));
		c.add(mesh(new BoxGeometry(W, H, D), plastic));
		g.add(c);
	}
	// a loose disc, data side up
	const discMat = new MeshPhysicalNodeMaterial({
		color: '#eef1f3',
		metalness: 0.6,
		roughness: 0.22,
		iridescence: 1,
		iridescenceIOR: 1.8,
		iridescenceThicknessRange: [200, 900],
		side: DoubleSide,
	});
	const disc = new Group();
	disc.position.set(0.23, 0.0015, 0.1);
	disc.add(mesh(new RingGeometry(0.0075, 0.06, 96), discMat, { rot: [-Math.PI / 2, 0, 0] }));
	disc.add(mesh(new RingGeometry(0.0075, 0.017, 48), mat('#eef1f2', 0.2, 0, { transparent: true, opacity: 0.6, side: DoubleSide }), { pos: [0, 0.0003, 0], rot: [-Math.PI / 2, 0, 0], shadow: false }));
	g.add(disc);

	let spin = 0;
	return {
		group: place(g, [-1.52, 0, 0.55], 0.12),
		poke() {
			spin = 40;
		},
		update(t, dt) {
			spin *= Math.exp(-dt * 0.5);
			disc.rotation.y += spin * dt;
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
