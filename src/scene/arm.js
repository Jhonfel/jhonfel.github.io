import {
	Group,
	Mesh,
	CylinderGeometry,
	SphereGeometry,
	BoxGeometry,
	CapsuleGeometry,
	TorusGeometry,
	MeshStandardNodeMaterial,
	MeshBasicNodeMaterial,
	Vector3,
	MathUtils,
} from 'three/webgpu';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { PALETTE } from './textures.js';

// A small 4-axis desktop arm: base yaw, shoulder, elbow and wrist pitch.
// It solves a 2-link IK in its vertical plane so the tool always points at the target.
const L1 = 0.42; // shoulder -> elbow
const L2 = 0.36; // elbow -> wrist
const TOOL = 0.16; // wrist -> tip
const SHOULDER_H = 0.2;

export function createArm() {
	const shell = new MeshStandardNodeMaterial({ color: PALETTE.clay, roughness: 0.28, metalness: 0 });
	const joint = new MeshStandardNodeMaterial({ color: PALETTE.teal, roughness: 0.35, metalness: 0.1 });
	const chrome = new MeshStandardNodeMaterial({ color: '#dfe5e7', roughness: 0.12, metalness: 1 });
	const accent = new MeshStandardNodeMaterial({ color: PALETTE.peach, roughness: 0.4 });
	const laserMat = new MeshBasicNodeMaterial({ color: '#ff7a3c', transparent: true, opacity: 0.9, depthWrite: false });
	// emissive drives the bloom pass (see world.js), so the tip LED glows.
	const ledMat = new MeshStandardNodeMaterial({ color: '#ffffff', emissive: '#ff8a4c', emissiveIntensity: 4 });

	const root = new Group();
	const shadow = (m) => ((m.castShadow = m.receiveShadow = true), m);

	// base plate
	const plate = shadow(new Mesh(new CylinderGeometry(0.2, 0.23, 0.05, 48), shell));
	plate.position.y = 0.025;
	root.add(plate);
	const ring = new Mesh(new TorusGeometry(0.205, 0.008, 12, 64), joint);
	ring.rotation.x = Math.PI / 2;
	ring.position.y = 0.052;
	root.add(ring);

	const yaw = new Group();
	yaw.position.y = 0.05;
	root.add(yaw);
	const turret = shadow(new Mesh(new CylinderGeometry(0.13, 0.15, 0.12, 40), shell));
	turret.position.y = 0.06;
	yaw.add(turret);

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

	const elbow = new Group();
	elbow.position.y = L1;
	shoulder.add(elbow);
	const elbowHub = shadow(new Mesh(new CylinderGeometry(0.065, 0.065, 0.16, 36), joint));
	elbowHub.rotation.z = Math.PI / 2;
	elbow.add(elbowHub);
	const fore = shadow(new Mesh(new CapsuleGeometry(0.045, L2 - 0.09, 8, 24), shell));
	fore.position.y = L2 / 2;
	elbow.add(fore);

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
	led.position.y = TOOL - 0.01;
	wrist.add(led);

	// Laser from the tip to whatever is hovered. Unit-length cylinder scaled every frame.
	const laser = new Mesh(new CylinderGeometry(0.0025, 0.0025, 1, 8, 1, true), laserMat);
	laser.visible = false;
	root.add(laser);
	const dot = new Mesh(new SphereGeometry(0.012, 16, 8), ledMat);
	dot.visible = false;
	root.add(dot);

	// state
	const angles = { yaw: 0, a1: 0.5, a2: 1.2, a3: 1.2 };
	const target = { yaw: 0, a1: 0.5, a2: 1.2, a3: 1.2 };
	let grip = 0;
	let gripTarget = 0;
	const local = new Vector3();
	const tipWorld = new Vector3();
	const tmp = new Vector3();
	let pointAt = null;

	function solve(worldPoint, pointing) {
		root.worldToLocal(local.copy(worldPoint));
		const yawAngle = Math.atan2(local.x, local.z);
		const horiz = Math.hypot(local.x, local.z);
		// Keep the tool slightly back and above the point, aiming down at it.
		const back = pointing ? 0.14 : 0;
		const up = pointing ? 0.2 : 0;
		let r = Math.max(0.12, horiz - back);
		let y = local.y + up - SHOULDER_H;
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
		const a1 = Math.PI / 2 - t1; // tilt from vertical
		const a2 = t2;
		// wrist position in the arm plane
		const wr = L1 * Math.cos(t1) + L2 * Math.cos(t1 - t2);
		const wy = L1 * Math.sin(t1) + L2 * Math.sin(t1 - t2);
		const dirAngle = Math.atan2(horiz - wr, local.y - SHOULDER_H - wy); // from +Y
		target.yaw = yawAngle;
		target.a1 = a1;
		target.a2 = a2;
		target.a3 = MathUtils.clamp(dirAngle - a1 - a2, -1.8, 1.8);
	}

	function damp(cur, to, k, dt) {
		return cur + (to - cur) * (1 - Math.exp(-k * dt));
	}

	return {
		object: root,
		reach: L1 + L2,
		/** point: world Vector3; pointing: true when aiming at a hovered object */
		aim(point, pointing = false) {
			solve(point, pointing);
			pointAt = pointing ? point.clone() : null;
		},
		grip(closed) {
			gripTarget = closed ? 1 : 0;
		},
		update(dt, t) {
			let dy = target.yaw - angles.yaw;
			dy = Math.atan2(Math.sin(dy), Math.cos(dy));
			angles.yaw += dy * (1 - Math.exp(-6 * dt));
			angles.a1 = damp(angles.a1, target.a1, 5, dt);
			angles.a2 = damp(angles.a2, target.a2, 5.5, dt);
			angles.a3 = damp(angles.a3, target.a3, 7, dt);
			grip = damp(grip, gripTarget, 14, dt);

			yaw.rotation.y = angles.yaw;
			shoulder.rotation.x = angles.a1 + Math.sin(t * 1.3) * 0.006;
			elbow.rotation.x = angles.a2;
			wrist.rotation.x = angles.a3;
			fingers[0].position.x = -0.022 + grip * 0.012;
			fingers[1].position.x = 0.022 - grip * 0.012;

			ledMat.emissiveIntensity = pointAt ? 6 : 2.5 + Math.sin(t * 3) * 1.5;

			if (pointAt) {
				led.getWorldPosition(tipWorld);
				root.worldToLocal(tipWorld);
				root.worldToLocal(tmp.copy(pointAt));
				const len = tipWorld.distanceTo(tmp);
				laser.visible = dot.visible = len > 0.03;
				laser.position.copy(tipWorld).add(tmp).multiplyScalar(0.5);
				laser.scale.set(1, len, 1);
				laser.quaternion.setFromUnitVectors(new Vector3(0, 1, 0), tmp.clone().sub(tipWorld).normalize());
				dot.position.copy(tmp);
			} else {
				laser.visible = dot.visible = false;
			}
		},
	};
}
