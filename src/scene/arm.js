import {
	Group,
	Mesh,
	CylinderGeometry,
	SphereGeometry,
	BoxGeometry,
	CapsuleGeometry,
	TorusGeometry,
	PlaneGeometry,
	TubeGeometry,
	CatmullRomCurve3,
	InstancedMesh,
	Object3D,
	CanvasTexture,
	Color,
	MeshStandardNodeMaterial,
	MeshBasicNodeMaterial,
	Vector3,
	MathUtils,
} from 'three/webgpu';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { PALETTE } from './textures.js';

// A small 4-axis desktop arm: base yaw, shoulder, elbow and wrist pitch.
// Every frame it gets a tip target and a mode, solves a 2-link IK in its vertical plane for the wrist,
// and turns the wrist so the tool points at the target.
const L1 = 0.42; // shoulder -> elbow
const L2 = 0.36; // elbow -> wrist
const TIP = 0.17; // wrist -> finger tips
const SHOULDER_H = 0.2;
const TIP_MIN_Y = 0.012; // the bench top is y = 0

// How long it pushes against the bench before the motors give up, and the drama that follows.
const STRAIN_LIMIT = 1.8;
const LIMP_TIME = 3.2;
const SMOKE_TIME = 1.4;
const COOLDOWN = 8;

export function createArm() {
	const shell = new MeshStandardNodeMaterial({ color: PALETTE.clay, roughness: 0.28, metalness: 0 });
	const joint = new MeshStandardNodeMaterial({ color: PALETTE.teal, roughness: 0.35, metalness: 0.1 });
	const chrome = new MeshStandardNodeMaterial({ color: '#dfe5e7', roughness: 0.12, metalness: 1 });
	const accent = new MeshStandardNodeMaterial({ color: PALETTE.peach, roughness: 0.4 });
	const cableBlack = new MeshStandardNodeMaterial({ color: '#232628', roughness: 0.55 });
	const cableTeal = new MeshStandardNodeMaterial({ color: PALETTE.tealDeep, roughness: 0.5 });
	const cablePeach = new MeshStandardNodeMaterial({ color: PALETTE.amber, roughness: 0.5 });
	const laserMat = new MeshBasicNodeMaterial({ color: '#ff7a3c', transparent: true, opacity: 0.9, depthWrite: false });
	// emissive drives the bloom pass (see world.js), so the tip LED glows.
	const ledMat = new MeshStandardNodeMaterial({ color: '#ffffff', emissive: '#ff8a4c', emissiveIntensity: 4 });

	const root = new Group();
	const shadow = (m) => ((m.castShadow = m.receiveShadow = true), m);
	const cable = (pts, material, r = 0.006) =>
		shadow(new Mesh(new TubeGeometry(new CatmullRomCurve3(pts.map((p) => new Vector3(...p))), 48, r, 8), material));
	const clip = (parent, pos) => {
		const c = shadow(new Mesh(new BoxGeometry(0.03, 0.012, 0.03), cableBlack));
		c.position.set(...pos);
		parent.add(c);
	};

	// base plate
	const plate = shadow(new Mesh(new CylinderGeometry(0.2, 0.23, 0.05, 48), shell));
	plate.position.y = 0.025;
	root.add(plate);
	const ring = new Mesh(new TorusGeometry(0.205, 0.008, 12, 64), joint);
	ring.rotation.x = Math.PI / 2;
	ring.position.y = 0.052;
	root.add(ring);
	// power cable leaving the back of the base and running off across the bench
	root.add(cable([[0, 0.03, -0.2], [0.02, 0.012, -0.3], [-0.06, 0.006, -0.42], [-0.02, 0.006, -0.6], [0.1, 0.006, -0.75]], cableBlack, 0.008));

	const yaw = new Group();
	yaw.position.y = 0.05;
	root.add(yaw);
	const turret = shadow(new Mesh(new CylinderGeometry(0.13, 0.15, 0.12, 40), shell));
	turret.position.y = 0.06;
	yaw.add(turret);
	// service loop from the turret up to the shoulder
	yaw.add(cable([[0.0, 0.1, -0.12], [0.05, 0.2, -0.2], [0.12, 0.2, -0.1], [0.12, 0.15, -0.02]], cableBlack));
	yaw.add(cable([[0.02, 0.1, -0.12], [0.08, 0.22, -0.19], [0.13, 0.19, -0.08], [0.125, 0.155, 0.0]], cableTeal, 0.0045));

	const shoulder = new Group();
	shoulder.position.y = SHOULDER_H - 0.05;
	yaw.add(shoulder);
	const shoulderHub = shadow(new Mesh(new CylinderGeometry(0.085, 0.085, 0.2, 40), joint));
	shoulderHub.rotation.z = Math.PI / 2;
	shoulder.add(shoulderHub);

	const upper = shadow(new Mesh(new RoundedBoxGeometry(0.1, L1, 0.12, 4, 0.04), shell));
	upper.position.y = L1 / 2;
	shoulder.add(upper);
	const stripe = new Mesh(new BoxGeometry(0.102, L1 * 0.5, 0.02), accent);
	stripe.position.set(0, L1 / 2, 0.055);
	shoulder.add(stripe);
	// harness along the side of the upper arm, with a slack loop over the elbow
	shoulder.add(cable([[0.11, 0.0, -0.02], [0.075, 0.1, -0.05], [0.07, 0.25, -0.05], [0.075, L1 - 0.03, -0.05], [0.08, L1 + 0.05, -0.1], [0.08, L1 + 0.08, -0.02], [0.07, L1 + 0.03, 0.02]], cableBlack));
	shoulder.add(cable([[0.115, 0.0, 0.0], [0.08, 0.1, -0.035], [0.078, 0.25, -0.035], [0.08, L1 - 0.03, -0.035], [0.09, L1 + 0.04, -0.085], [0.088, L1 + 0.07, -0.01], [0.075, L1 + 0.025, 0.025]], cablePeach, 0.004));
	clip(shoulder, [0.065, 0.13, -0.045]);
	clip(shoulder, [0.065, 0.3, -0.045]);

	const elbow = new Group();
	elbow.position.y = L1;
	shoulder.add(elbow);
	const elbowHub = shadow(new Mesh(new CylinderGeometry(0.065, 0.065, 0.16, 36), joint));
	elbowHub.rotation.z = Math.PI / 2;
	elbow.add(elbowHub);
	const fore = shadow(new Mesh(new CapsuleGeometry(0.045, L2 - 0.09, 8, 24), shell));
	fore.position.y = L2 / 2;
	elbow.add(fore);
	// forearm harness, spiral-wrapped once, into the wrist
	elbow.add(cable([[0.07, 0.03, 0.02], [0.055, 0.1, -0.03], [0.0, 0.18, -0.06], [-0.055, 0.26, -0.03], [-0.05, L2 - 0.04, 0.02], [-0.02, L2 + 0.02, 0.05]], cableBlack, 0.005));
	elbow.add(cable([[0.075, 0.025, 0.025], [0.06, 0.12, 0.03], [0.055, 0.25, 0.03], [0.045, L2 - 0.03, 0.035], [0.02, L2 + 0.015, 0.05]], cableTeal, 0.0035));
	clip(elbow, [0.0, 0.18, -0.05]);

	const wrist = new Group();
	wrist.position.y = L2;
	elbow.add(wrist);
	const wristHub = shadow(new Mesh(new SphereGeometry(0.05, 32, 16), joint));
	wrist.add(wristHub);
	const head = shadow(new Mesh(new CylinderGeometry(0.035, 0.045, 0.08, 24), chrome));
	head.position.y = 0.06;
	wrist.add(head);

	const fingers = [];
	for (const side of [-1, 1]) {
		const f = shadow(new Mesh(new BoxGeometry(0.014, 0.075, 0.03), chrome));
		f.position.set(side * 0.022, 0.13, 0);
		wrist.add(f);
		fingers.push(f);
	}
	const led = new Mesh(new SphereGeometry(0.011, 16, 8), ledMat);
	led.position.y = 0.15;
	wrist.add(led);
	const tipMarker = new Object3D();
	tipMarker.position.y = TIP;
	wrist.add(tipMarker);

	// Laser from the tip to whatever is hovered. Unit-length cylinder scaled every frame.
	const laser = new Mesh(new CylinderGeometry(0.0025, 0.0025, 1, 8, 1, true), laserMat);
	laser.visible = false;
	root.add(laser);
	const dot = new Mesh(new SphereGeometry(0.012, 16, 8), ledMat);
	dot.visible = false;
	root.add(dot);

	// ---------------------------------------------------------------- smoke
	const smokeTex = (() => {
		const c = document.createElement('canvas');
		c.width = c.height = 64;
		const g = c.getContext('2d');
		const grd = g.createRadialGradient(32, 32, 0, 32, 32, 32);
		grd.addColorStop(0, 'rgba(255,255,255,1)');
		grd.addColorStop(0.5, 'rgba(255,255,255,.5)');
		grd.addColorStop(1, 'rgba(255,255,255,0)');
		g.fillStyle = grd;
		g.fillRect(0, 0, 64, 64);
		return new CanvasTexture(c);
	})();
	const PUFFS = 48;
	const smoke = new InstancedMesh(
		new PlaneGeometry(1, 1),
		new MeshBasicNodeMaterial({ map: smokeTex, transparent: true, depthWrite: false, opacity: 0.85 }),
		PUFFS,
	);
	smoke.frustumCulled = false;
	root.add(smoke);
	const puffs = Array.from({ length: PUFFS }, () => ({ life: 0, pos: new Vector3(), vel: new Vector3() }));
	const dark = new Color('#55595c');
	const light = new Color(PALETTE.paper);
	const puffColor = new Color();
	const dummy = new Object3D();
	let nextPuff = 0;
	function emitPuff(from) {
		const p = puffs[nextPuff++ % PUFFS];
		root.worldToLocal(p.pos.copy(from));
		p.pos.x += (Math.random() - 0.5) * 0.05;
		p.pos.z += (Math.random() - 0.5) * 0.05;
		p.vel.set((Math.random() - 0.5) * 0.05, 0.12 + Math.random() * 0.1, (Math.random() - 0.5) * 0.05);
		p.life = 1;
	}

	// ---------------------------------------------------------------- state
	const angles = { yaw: 0, a1: 0.5, a2: 1.2, a3: 1.2 };
	const target = { yaw: 0, a1: 0.5, a2: 1.2, a3: 1.2 };
	let grip = 0;
	let gripTarget = 0;
	let mode = 'free';
	let pointAt = null;
	let pressing = false;
	let strain = 0; // seconds spent pushing against the bench
	let limp = 0; // seconds left slumped after giving up
	let smoking = 0;
	let cooldown = 0;
	let bumpAge = 10; // seconds since it last bounced off the monitor
	let bumpSide = 1;
	const local = new Vector3();
	const tmp = new Vector3();
	const tipWorld = new Vector3();
	const up = new Vector3(0, 1, 0);

	// Tool directions in the arm's vertical plane, measured from straight up.
	const TOOL_ANGLE = { point: 2.45, touch: 2.75, free: 2.25 };

	function solve(worldPoint, m) {
		root.worldToLocal(local.copy(worldPoint));
		const yawAngle = Math.atan2(local.x, local.z);
		const horiz = Math.hypot(local.x, local.z);
		let py = local.y;
		pressing = false;
		if (m === 'touch') {
			// it wants to push 3 cm into the bench; the bench says no
			py = Math.max(TIP_MIN_Y, py - 0.03);
			pressing = true;
		}
		py = Math.max(py, TIP_MIN_Y);
		const phi = TOOL_ANGLE[m];
		const gap = m === 'point' ? 0.1 : 0;
		// desired wrist: back off from the tip along the tool direction
		let r = horiz - Math.sin(phi) * (TIP + gap);
		let y = py - Math.cos(phi) * (TIP + gap) - SHOULDER_H;
		r = Math.max(0.1, r);
		let d = Math.hypot(r, y);
		const maxReach = L1 + L2 - 0.02;
		if (d > maxReach) {
			r *= maxReach / d;
			y *= maxReach / d;
			d = maxReach;
		}
		const c2 = MathUtils.clamp((d * d - L1 * L1 - L2 * L2) / (2 * L1 * L2), -1, 1);
		const t2 = Math.acos(c2);
		const t1 = Math.atan2(y, r) + Math.atan2(L2 * Math.sin(t2), L1 + L2 * Math.cos(t2));
		const a1 = Math.PI / 2 - t1;
		const a2 = t2;
		// aim the tool from where the wrist actually ended up (differs when out of reach)
		const wr = L1 * Math.cos(t1) + L2 * Math.cos(t1 - t2);
		const wy = SHOULDER_H + L1 * Math.sin(t1) + L2 * Math.sin(t1 - t2);
		let dir = Math.atan2(horiz - wr, py - wy);
		// never let the tip end up under the bench
		const tipY = wy + Math.cos(dir) * TIP;
		if (tipY < TIP_MIN_Y) dir = Math.acos(MathUtils.clamp((TIP_MIN_Y - wy) / TIP, -1, 1)) * Math.sign(dir || 1);
		target.yaw = yawAngle;
		target.a1 = a1;
		target.a2 = a2;
		target.a3 = MathUtils.clamp(dir - a1 - a2, -2, 2);
	}

	function damp(cur, to, k, dt) {
		return cur + (to - cur) * (1 - Math.exp(-k * dt));
	}

	// planar forward kinematics: tip height for the current angles
	function tipHeight() {
		const s1 = angles.a1;
		const s2 = s1 + angles.a2;
		const s3 = s2 + angles.a3;
		return SHOULDER_H + L1 * Math.cos(s1) + L2 * Math.cos(s2) + TIP * Math.cos(s3);
	}

	const samples = [new Vector3(), new Vector3(), new Vector3(), new Vector3(), new Vector3()];
	const sampleSrc = [
		[elbow, 0.5],
		[elbow, 0.8],
		[wrist, 0],
		[wrist, 0.09],
		[wrist, TIP],
	];

	return {
		object: root,
		reach: L1 + L2 + TIP,
		get busy() {
			return limp > 0;
		},
		/** point: world Vector3. mode: 'point' (aim at a hovered thing), 'touch' (press the bench), 'free' (follow) */
		aim(point, m = 'free') {
			mode = m;
			if (limp > 0) return;
			solve(point, m);
			pointAt = m === 'point' ? point.clone() : null;
		},
		grip(closed) {
			gripTarget = closed ? 1 : 0;
		},
		/** called when a part of the arm hits something: side = which way to recoil */
		bump(side = 1) {
			if (bumpAge < 0.7 || limp > 0) return false;
			bumpAge = 0;
			bumpSide = side;
			return true;
		},
		/** world-space points along the forearm and tool, for collision checks */
		points() {
			return sampleSrc.map(([obj, yOff], i) => obj.localToWorld(samples[i].set(0, yOff * (obj === elbow ? L2 : 1), 0)));
		},
		update(dt, t) {
			cooldown = Math.max(0, cooldown - dt);
			bumpAge += dt;

			// pushing the bench: strain builds up while the tip is on the surface
			const onBench = pressing && mode === 'touch' && tipHeight() < 0.05 && limp <= 0;
			strain = onBench && cooldown <= 0 ? strain + dt : Math.max(0, strain - dt * 2);
			if (strain > STRAIN_LIMIT) {
				strain = 0;
				limp = LIMP_TIME;
				smoking = SMOKE_TIME;
				cooldown = COOLDOWN;
				pointAt = null;
			}
			if (limp > 0) {
				limp -= dt;
				// slumped, head hanging
				target.a1 = 0.72;
				target.a2 = 1.85;
				target.a3 = 0.95;
			}

			// bounced off something: the recoil throws the arm back and wobbles out
			let recoil = 0;
			if (bumpAge < 1.6) recoil = Math.exp(-3 * bumpAge) * Math.cos(9 * bumpAge);

			const k = limp > 0 ? 2 : 5;
			let dy = target.yaw + recoil * 0.25 * bumpSide - angles.yaw;
			dy = Math.atan2(Math.sin(dy), Math.cos(dy));
			angles.yaw += dy * (1 - Math.exp(-6 * dt));
			angles.a1 = damp(angles.a1, target.a1 - recoil * 0.55, k, dt);
			angles.a2 = damp(angles.a2, target.a2 - recoil * 0.35, k + 0.5, dt);
			angles.a3 = damp(angles.a3, target.a3, k + 2, dt);
			grip = damp(grip, gripTarget, 14, dt);

			// motors shaking under load
			const shake = strain > 0.5 ? ((strain - 0.5) / (STRAIN_LIMIT - 0.5)) * 0.035 : 0;
			const jitter = (f) => Math.sin(t * f) * Math.sin(t * f * 1.7) * shake;

			yaw.rotation.y = angles.yaw + jitter(53);
			shoulder.rotation.x = angles.a1 + Math.sin(t * 1.3) * 0.006 + jitter(61);
			elbow.rotation.x = angles.a2 + jitter(71);
			wrist.rotation.x = angles.a3;
			fingers[0].position.x = -0.022 + grip * 0.012;
			fingers[1].position.x = 0.022 - grip * 0.012;

			if (limp > 0) ledMat.emissiveIntensity = Math.floor(t * 3) % 2 ? 0.2 : 1.5;
			else if (shake > 0) ledMat.emissiveIntensity = 4 + Math.sin(t * 40) * 3;
			else ledMat.emissiveIntensity = pointAt ? 6 : 2.5 + Math.sin(t * 3) * 1.5;

			// smoke out of the shoulder and elbow motors
			if (smoking > 0) {
				smoking -= dt;
				if (Math.random() < dt * 30) emitPuff(shoulderHub.getWorldPosition(tmp));
				if (Math.random() < dt * 22) emitPuff(elbowHub.getWorldPosition(tmp));
			}
			const camQ = root.parent?.userData.camera?.quaternion;
			for (let i = 0; i < PUFFS; i++) {
				const p = puffs[i];
				if (p.life > 0) {
					p.life = Math.max(0, p.life - dt * 0.45);
					p.pos.addScaledVector(p.vel, dt);
					p.vel.y += dt * 0.03;
				}
				const s = p.life > 0 ? 0.05 + (1 - p.life) * 0.22 : 0;
				dummy.position.copy(p.pos);
				if (camQ) dummy.quaternion.copy(camQ);
				dummy.scale.set(s, s, s);
				dummy.updateMatrix();
				smoke.setMatrixAt(i, dummy.matrix);
				smoke.setColorAt(i, puffColor.copy(dark).lerp(light, 1 - p.life));
			}
			smoke.instanceMatrix.needsUpdate = true;
			if (smoke.instanceColor) smoke.instanceColor.needsUpdate = true;

			if (pointAt && limp <= 0) {
				led.getWorldPosition(tipWorld);
				root.worldToLocal(tipWorld);
				root.worldToLocal(tmp.copy(pointAt));
				const len = tipWorld.distanceTo(tmp);
				laser.visible = dot.visible = len > 0.03;
				laser.position.copy(tipWorld).add(tmp).multiplyScalar(0.5);
				laser.scale.set(1, len, 1);
				laser.quaternion.setFromUnitVectors(up, tmp.clone().sub(tipWorld).normalize());
				dot.position.copy(tmp);
			} else {
				laser.visible = dot.visible = false;
			}
		},
	};
}
