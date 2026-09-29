import {
	WebGPURenderer,
	RenderPipeline,
	Scene,
	PerspectiveCamera,
	Color,
	Fog,
	Group,
	Mesh,
	PlaneGeometry,
	BoxGeometry,
	InstancedMesh,
	Object3D,
	DirectionalLight,
	HemisphereLight,
	SpotLight,
	PMREMGenerator,
	MeshStandardNodeMaterial,
	MeshBasicNodeMaterial,
	Raycaster,
	Vector2,
	Vector3,
	Plane,
	PCFShadowMap,
	NeutralToneMapping,
	DoubleSide,
	Timer,
} from 'three/webgpu';
import { pass, mrt, output, emissive } from 'three/tsl';
import { bloom } from 'three/addons/tsl/display/BloomNode.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { PALETTE, tileTexture, hudWallTexture, rng } from './textures.js';
import { createArm } from './arm.js';
import { BUILDERS, metalUpa, nixieClock, skateboard } from './objects.js';

const HOME = { pos: new Vector3(-0.2, 1.4, 3.05), look: new Vector3(-0.22, 0.16, -0.2) };
const BENCH = { w: 3.5, d: 1.55, top: 0 };

export async function createWorld(canvas, sections, { onHover, onSelect, reducedMotion }) {
	const renderer = new WebGPURenderer({ canvas, antialias: true, forceWebGL: new URLSearchParams(location.search).has('webgl') });
	await renderer.init();
	renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
	renderer.shadowMap.enabled = true;
	renderer.shadowMap.type = PCFShadowMap;
	renderer.toneMapping = NeutralToneMapping;
	renderer.toneMappingExposure = 0.95;
	const backend = renderer.backend.isWebGPUBackend ? 'webgpu' : 'webgl';

	const scene = new Scene();
	scene.background = new Color(PALETTE.paper);
	scene.fog = new Fog(PALETTE.paper, 5, 13);
	const pmrem = new PMREMGenerator(renderer);
	scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
	scene.environmentIntensity = 0.35;

	const camera = new PerspectiveCamera(38, 1, 0.05, 40);
	scene.userData.camera = camera; // camera-facing particles read it

	// ---------------------------------------------------------------- lights
	// White key light + teal ground bounce: shadows come out teal, like the RE:BOOT opening.
	scene.add(new HemisphereLight('#ffffff', PALETTE.teal, 0.9));
	const sun = new DirectionalLight('#fff6ec', 3.6);
	sun.position.set(-2.2, 4.2, 2.6);
	sun.castShadow = true;
	sun.shadow.mapSize.set(2048, 2048);
	Object.assign(sun.shadow.camera, { left: -2.4, right: 2.4, top: 2, bottom: -2, near: 0.5, far: 12 });
	sun.shadow.bias = -0.0004;
	sun.shadow.normalBias = 0.02;
	sun.shadow.radius = 5;
	scene.add(sun);
	const rim = new SpotLight(PALETTE.peach, 6, 6, 0.6, 0.8);
	rim.position.set(2.2, 2.4, -0.6);
	rim.target.position.set(0, 0, 0);
	scene.add(rim, rim.target);

	// ---------------------------------------------------------------- room
	const room = new Group();
	scene.add(room);
	const floorTex = tileTexture({ cells: 4, repeat: [8, 8] });
		const floor = new Mesh(new PlaneGeometry(40, 40), new MeshStandardNodeMaterial({ color: '#fff', map: floorTex, roughness: 0.55 }));
	floor.rotation.x = -Math.PI / 2;
	floor.position.y = -0.78;
	floor.receiveShadow = true;
	room.add(floor);

	const clay = new MeshStandardNodeMaterial({ color: PALETTE.clay, roughness: 0.4 });
	const clayMatte = new MeshStandardNodeMaterial({ color: '#e6e9ea', roughness: 0.75 });
	const teal = new MeshStandardNodeMaterial({ color: PALETTE.teal, roughness: 0.45 });

	// bench
	const top = new Mesh(new RoundedBoxGeometry(BENCH.w, 0.07, BENCH.d, 4, 0.02), new MeshStandardNodeMaterial({ color: '#fff', map: tileTexture({ cells: 6, dots: true }), roughness: 0.35 }));
	top.position.y = -0.035;
	top.receiveShadow = top.castShadow = true;
	room.add(top);
	const edge = new Mesh(new BoxGeometry(BENCH.w - 0.04, 0.012, 0.012), teal);
	edge.position.set(0, -0.045, BENCH.d / 2 + 0.001);
	room.add(edge);
	for (const x of [-1, 1])
		for (const z of [-1, 1]) {
			const leg = new Mesh(new RoundedBoxGeometry(0.1, 0.72, 0.1, 3, 0.02), clayMatte);
			leg.position.set(x * (BENCH.w / 2 - 0.12), -0.43, z * (BENCH.d / 2 - 0.12));
			leg.castShadow = leg.receiveShadow = true;
			room.add(leg);
		}

	// back wall made of stacked blocks, with HUD fragments printed on it
	const wall = new Mesh(new RoundedBoxGeometry(4.4, 2.6, 0.2, 4, 0.03), new MeshStandardNodeMaterial({ color: '#fff', map: hudWallTexture(), roughness: 0.6 }));
	wall.position.set(0, 0.52, -1.1);
	wall.receiveShadow = true;
	room.add(wall);

	// scattered blocks around the scene, the "city" from the opening
	{
		const r = rng(42);
		const geo = new RoundedBoxGeometry(1, 1, 1, 2, 0.02);
		const count = 90;
		const blocks = new InstancedMesh(geo, clay, count);
		blocks.castShadow = blocks.receiveShadow = true;
		const d = new Object3D();
		let n = 0;
		while (n < count) {
			const x = (r() - 0.5) * 16;
			const z = -1.4 - r() * 8 + (Math.abs(x) > 3 ? 7 : 0);
			if (Math.abs(x) < 2.6 && z > -1.5) continue;
			const w = 0.3 + r() * 1.2;
			const h = 0.2 + r() * r() * 3.2;
			d.position.set(x, -0.78 + h / 2, z);
			d.scale.set(w, h, 0.3 + r() * 1.2);
			d.rotation.y = r() < 0.8 ? 0 : Math.PI / 2;
			d.updateMatrix();
			blocks.setMatrixAt(n++, d.matrix);
		}
		room.add(blocks);
	}

	// ---------------------------------------------------------------- pixels
	// Peach/teal squares that drift and burst around whatever you hover or open.
	const PIX = 260;
	const pixGeo = new PlaneGeometry(1, 1);
	const pixMat = new MeshBasicNodeMaterial({ transparent: true, opacity: 0.85, side: DoubleSide, depthWrite: false, fog: true });
	const pixels = new InstancedMesh(pixGeo, pixMat, PIX);
	pixels.frustumCulled = false;
	const pix = [];
	{
		const r = rng(9);
		const cols = [new Color(PALETTE.peach), new Color(PALETTE.peach), new Color(PALETTE.tealSoft), new Color(PALETTE.teal), new Color('#ffffff')];
		for (let i = 0; i < PIX; i++) {
			const home = new Vector3((r() - 0.5) * 7, -0.2 + r() * 2.6, -1 - r() * 4);
			pix.push({ home, pos: home.clone(), vel: new Vector3(), size: 0.03 + r() * 0.06, phase: r() * 10, burst: 0 });
			pixels.setColorAt(i, cols[Math.floor(r() * cols.length)]);
		}
	}
	scene.add(pixels);
	const dummy = new Object3D();
	function burst(at, amount = 40) {
		const r = Math.random;
		for (let k = 0; k < amount; k++) {
			const p = pix[Math.floor(r() * PIX)];
			p.pos.copy(at).add(new Vector3((r() - 0.5) * 0.3, r() * 0.2, (r() - 0.5) * 0.3));
			p.vel.set((r() - 0.5) * 1.2, 0.4 + r() * 1.2, (r() - 0.5) * 1.2);
			p.burst = 1;
		}
	}

	// ---------------------------------------------------------------- objects
	const arm = createArm();
	arm.object.position.set(0.18, 0, -0.2);
	scene.add(arm.object);

	const items = [];
	for (const s of sections) {
		const item = BUILDERS[s.object]();
		item.id = s.id;
		item.group.traverse((o) => (o.userData.section = s.id));
		item.center = new Vector3();
		scene.add(item.group);
		items.push(item);
	}
	// decorative props: clickable, but they don't open a section
	const props = { upa: metalUpa(), nixie: nixieClock(), skate: skateboard() };
	for (const [id, prop] of Object.entries(props)) {
		prop.group.traverse((o) => (o.userData.section = id));
		scene.add(prop.group);
	}
	scene.updateMatrixWorld(true);
	for (const item of items) item.center.set(...item.view.look);
	const monitorItem = items.find((i) => i.collide);
	// objects on the bench that aren't tied to a section
	for (const name of ['stethoscope']) if (!sections.some((s) => s.object === name)) scene.add(BUILDERS[name]().group);
	const pickables = [...items.map((i) => i.group), ...Object.values(props).map((p) => p.group)];

	// ---------------------------------------------------------------- post
	const pipeline = new RenderPipeline(renderer);
	const scenePass = pass(scene, camera);
	scenePass.setMRT(mrt({ output, emissive }));
	const glow = bloom(scenePass.getTextureNode('emissive'), 0.8, 0.3, 1.05);
	pipeline.outputNode = scenePass.getTextureNode('output').add(glow);

	// ---------------------------------------------------------------- camera rig
	const cam = {
		pos: HOME.pos.clone(),
		look: HOME.look.clone(),
		toPos: HOME.pos.clone(),
		toLook: HOME.look.clone(),
		// view offset (px) so the object isn't hidden behind the panel: side panel on desktop, bottom sheet on phones
		offset: new Vector2(),
		toOffset: new Vector2(),
	};
	let focused = null;
	let size = { w: 1, h: 1 };
	let homeScale = 1;

	// Portrait screens get a higher, more top-down home view so the bench fills the frame.
	// (the desktop home view is shifted left to leave room for the side menu; portrait has no side menu)
	function homeLook(v) {
		v.copy(HOME.look);
		if (camera.aspect < 1) v.x = 0.1;
		return v;
	}
	function homePos(v) {
		v.copy(HOME.pos).sub(HOME.look).multiplyScalar(homeScale).add(HOME.look);
		if (camera.aspect < 1) {
			v.y += 0.5 * (homeScale - 1);
			v.x = 0.1;
		}
		return v;
	}

	function resize() {
		const w = canvas.clientWidth;
		const h = canvas.clientHeight;
		size = { w, h };
		renderer.setSize(w, h, false);
		camera.aspect = w / h;
		// On narrow screens, back the camera up so the whole bench fits.
		camera.fov = camera.aspect < 1 ? 50 : 38;
		homeScale = camera.aspect < 1 ? 0.95 / camera.aspect : Math.max(1, 1.45 / camera.aspect);
		camera.updateProjectionMatrix();
		if (!focused) {
			homePos(cam.toPos);
			homeLook(cam.toLook);
		}
	}
	resize();
	// ?cam=px,py,pz,lx,ly,lz pins the camera (for checking parts of the scene)
	const pin = new URLSearchParams(location.search).get('cam')?.split(',').map(Number);
	if (pin?.length === 6) {
		cam.toPos.set(pin[0], pin[1], pin[2]);
		cam.toLook.set(pin[3], pin[4], pin[5]);
	}
	cam.pos.copy(cam.toPos);
	cam.look.copy(cam.toLook);
	addEventListener('resize', resize);

	function focus(id, panel = { x: 0, y: 0 }, { instant = false } = {}) {
		const item = items.find((i) => i.id === id);
		focused = item ?? null;
		if (item) {
			cam.toPos.set(...item.view.pos);
			cam.toLook.set(...item.view.look);
			// Portrait: pull back so the object still fits the narrower view.
			if (camera.aspect < 1) cam.toPos.sub(cam.toLook).multiplyScalar(1.35).add(cam.toLook);
			cam.toOffset.set(panel.x / 2, panel.y / 2);
			burst(item.center, 22);
		} else {
			homePos(cam.toPos);
			homeLook(cam.toLook);
			cam.toOffset.set(0, 0);
		}
		if (instant) {
			cam.pos.copy(cam.toPos);
			cam.look.copy(cam.toLook);
			cam.offset.copy(cam.toOffset);
		}
	}

	// ---------------------------------------------------------------- input
	const pointer = new Vector2(0, 0);
	let pointerActive = false;
	let lastMove = -10;
	const ray = new Raycaster();
	const aimPlane = new Plane(new Vector3(0, 1, 0), -0.3);
	const benchPlane = new Plane(new Vector3(0, 1, 0), 0);
	// somewhere on the bench top the arm can reach, away from its own base
	const onBench = (p) =>
		Math.abs(p.x) < BENCH.w / 2 - 0.05 && Math.abs(p.z) < BENCH.d / 2 - 0.05 && p.distanceTo(arm.object.position) > 0.3 && p.distanceTo(arm.object.position) < 0.9;
	const planeHit = new Vector3();
	let hovered = null;
	let hoverPoint = new Vector3();

	canvas.addEventListener('pointermove', (e) => {
		const rect = canvas.getBoundingClientRect();
		pointer.set(((e.clientX - rect.left) / rect.width) * 2 - 1, -((e.clientY - rect.top) / rect.height) * 2 + 1);
		pointerActive = true;
		lastMove = timer.getElapsed();
	});
	canvas.addEventListener('pointerleave', () => (pointerActive = false));

	function pick() {
		ray.setFromCamera(pointer, camera);
		const hit = ray.intersectObjects(pickables, true)[0];
		const id = hit?.object.userData.section ?? null;
		if (hit) hoverPoint.copy(hit.point);
		if (id !== hovered) {
			if (id && id !== focused?.id) burst(hit.point, 14);
			hovered = id;
			onHover(id);
		}
		return hit;
	}

	let downAt = null;
	canvas.addEventListener('pointerdown', (e) => {
		downAt = [e.clientX, e.clientY];
		arm.grip(true);
	});
	canvas.addEventListener('pointerup', (e) => {
		arm.grip(false);
		if (!downAt || Math.hypot(e.clientX - downAt[0], e.clientY - downAt[1]) > 6) return;
		downAt = null;
		const rect = canvas.getBoundingClientRect();
		pointer.set(((e.clientX - rect.left) / rect.width) * 2 - 1, -((e.clientY - rect.top) / rect.height) * 2 + 1);
		const hit = pick();
		const id = hit?.object.userData.section;
		if (props[id]) {
			props[id].poke();
			burst(hit.point, 40);
		} else onSelect(id ?? null);
	});

	// ---------------------------------------------------------------- loop
	const timer = new Timer();
	const lookTmp = new Vector3();
	const idleTarget = new Vector3();
	const gesture = new Vector3();

	renderer.setAnimationLoop(() => {
		timer.update();
		const dt = Math.min(timer.getDelta(), 0.05);
		const t = timer.getElapsed();

		const hit = pointerActive ? pick() : null;

		// arm: point at a hovered object; over the bench, reach down and touch it (and strain if you
		// keep it there); elsewhere follow the pointer on a plane above the bench; otherwise idle
		if (hit && hovered) arm.aim(hoverPoint, 'point');
		else if (focused) {
			// gesture towards the open object without reaching into the camera's view
			gesture.copy(focused.center).sub(arm.object.position).setY(0).setLength(0.32).add(arm.object.position).setY(0.42);
			arm.aim(gesture, 'free');
		} else if (pointerActive && t - lastMove < 6 && ray.ray.intersectPlane(benchPlane, planeHit) && onBench(planeHit)) arm.aim(planeHit, 'touch');
		else if (pointerActive && t - lastMove < 4 && ray.ray.intersectPlane(aimPlane, planeHit)) arm.aim(planeHit, 'free');
		else {
			idleTarget.set(0.18 + Math.sin(t * 0.35) * 0.55, 0.28 + Math.sin(t * 0.7) * 0.08, -0.05 + Math.cos(t * 0.35) * 0.4);
			arm.aim(idleTarget, 'free');
		}
		arm.update(dt, t);
		// the monitor is solid: if the arm runs into it, the monitor rocks back and knocks the arm away
		if (monitorItem) {
			const depth = monitorItem.collide(arm.points());
			if (depth > 0 && arm.bump(-1)) burst(arm.points()[4], 12);
		}

		for (const item of items) item.update?.(t, dt);
		for (const prop of Object.values(props)) prop.update(t, dt);

		// pixels
		for (let i = 0; i < PIX; i++) {
			const p = pix[i];
			if (p.burst > 0) {
				p.burst = Math.max(0, p.burst - dt * 0.45);
				p.vel.y -= dt * 0.6;
				p.vel.multiplyScalar(1 - dt * 1.2);
				p.pos.addScaledVector(p.vel, dt);
				if (p.burst === 0) p.pos.copy(p.home);
			} else if (!reducedMotion) {
				p.pos.y = p.home.y + Math.sin(t * 0.4 + p.phase) * 0.05;
			}
			// every so often a pixel "glitches" off for a moment
			const flick = Math.sin(t * 2.3 + p.phase * 7) > 0.97 ? 0 : 1;
			const s = p.size * flick * (p.burst > 0 ? 0.25 + p.burst * 0.2 : 1);
			dummy.position.copy(p.pos);
			dummy.quaternion.copy(camera.quaternion);
			dummy.scale.set(s, s, s);
			dummy.updateMatrix();
			pixels.setMatrixAt(i, dummy.matrix);
		}
		pixels.instanceMatrix.needsUpdate = true;

		// camera: ease towards the target with a little parallax on the home view
		const k = 1 - Math.exp(-(reducedMotion ? 12 : 3.2) * dt);
		cam.pos.lerp(cam.toPos, k);
		cam.look.lerp(cam.toLook, k);
		cam.offset.lerp(cam.toOffset, k);
		const par = focused || reducedMotion ? 0 : 1;
		camera.position.copy(cam.pos).add(lookTmp.set(pointer.x * 0.18 * par, pointer.y * 0.08 * par, 0));
		camera.lookAt(cam.look);
		if (cam.offset.lengthSq() > 0.25) camera.setViewOffset(size.w, size.h, cam.offset.x, cam.offset.y, size.w, size.h);
		else camera.clearViewOffset();

		pipeline.render();
	});

	return {
		backend,
		focus,
		dispose() {
			renderer.setAnimationLoop(null);
			removeEventListener('resize', resize);
		},
	};
}
