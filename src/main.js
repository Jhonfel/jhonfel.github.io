import { SECTIONS, UI } from './content.js';

const $ = (id) => document.getElementById(id);
const num = (i) => `${String(i + 1).padStart(2, '0')}.`;
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const coarse = matchMedia('(pointer: coarse)').matches;

// ---------------------------------------------------------------- language
function initialLang() {
	const q = new URLSearchParams(location.search).get('lang');
	if (q === 'es' || q === 'en') return q;
	try {
		const saved = localStorage.getItem('lang');
		if (saved === 'es' || saved === 'en') return saved;
	} catch {}
	return navigator.language?.toLowerCase().startsWith('es') ? 'es' : 'en';
}

let lang = initialLang();
let current = null;
let world = null;

function render() {
	const ui = UI[lang];
	document.documentElement.lang = lang;
	for (const el of document.querySelectorAll('[data-i18n]')) el.textContent = ui[el.dataset.i18n];
	$('lang').textContent = ui.lang;
	$('lang').setAttribute('aria-label', ui.langLabel);
	$('back').textContent = ui.back;
	$('hint').textContent = coarse ? ui.hintTouch : ui.hint;
	if (world) $('renderer').textContent = ui.renderer[world.backend];

	$('nav').replaceChildren(
		...SECTIONS.map((s, i) => {
			const li = document.createElement('li');
			const b = document.createElement('button');
			b.type = 'button';
			b.dataset.id = s.id;
			b.innerHTML = `<span class="n">${num(i)}</span><span class="l">${s[lang].label}</span>`;
			b.setAttribute('aria-current', String(s.id === current));
			b.addEventListener('click', () => select(s.id === current ? null : s.id));
			li.append(b);
			return li;
		}),
	);
	renderPanel();
}

function renderPanel() {
	const panel = $('panel');
	const i = SECTIONS.findIndex((s) => s.id === current);
	if (i < 0) {
		panel.hidden = true;
		return;
	}
	const s = SECTIONS[i][lang];
	$('panel-num').textContent = num(i);
	$('panel-title').textContent = s.title;
	$('panel-body').innerHTML = s.body;
	panel.hidden = false;
}

function select(id, { push = true, instant = false } = {}) {
	current = id;
	for (const b of $('nav').querySelectorAll('button')) b.setAttribute('aria-current', String(b.dataset.id === id));
	renderPanel();
	document.body.classList.toggle('open', !!id);
	$('hint').style.opacity = id ? 0 : 1;
	if (world) {
		const panel = $('panel');
		const wide = innerWidth > 760;
		const cover = !id ? { x: 0, y: 0 } : wide ? { x: panel.offsetWidth + 20, y: 0 } : { x: 0, y: innerHeight - panel.getBoundingClientRect().top };
		world.focus(id, cover, { instant });
	}
	if (push) history.replaceState(null, '', id ? `#${id}` : location.pathname + location.search);
}

$('lang').addEventListener('click', () => {
	lang = lang === 'en' ? 'es' : 'en';
	try {
		localStorage.setItem('lang', lang);
	} catch {}
	render();
});
$('back').addEventListener('click', () => select(null));
addEventListener('keydown', (e) => {
	if (e.key === 'Escape' && current) select(null);
});

// ---------------------------------------------------------------- hover tag
const tag = $('tag');
let pointer = [0, 0];
addEventListener('pointermove', (e) => {
	pointer = [e.clientX, e.clientY];
	tag.style.left = `${pointer[0]}px`;
	tag.style.top = `${pointer[1]}px`;
});

const PROPS = {
	upa: { en: 'Metal Upa', es: 'Metal Upa' },
	nixie: { en: 'Nixie clock', es: 'Reloj nixie' },
	skate: { en: 'Skateboard', es: 'Skateboard' },
};

function onHover(id) {
	const i = SECTIONS.findIndex((s) => s.id === id);
	for (const b of $('nav').querySelectorAll('button')) b.classList.toggle('hover', b.dataset.id === id);
	document.body.style.cursor = id ? 'pointer' : '';
	if (i >= 0 && id !== current && !coarse) {
		tag.innerHTML = `<b>${num(i)}</b>${SECTIONS[i][lang].label}`;
		tag.hidden = false;
	} else if (PROPS[id] && !coarse) {
		tag.innerHTML = `<b>??.</b>${PROPS[id][lang]}`;
		tag.hidden = false;
	} else tag.hidden = true;
}

// ---------------------------------------------------------------- boot
render();
const fromHash = location.hash.slice(1);
if (SECTIONS.some((s) => s.id === fromHash)) select(fromHash, { push: false });

async function boot() {
	try {
		// Canvas textures use these fonts, so wait for them before drawing.
		await Promise.race([
			Promise.all(['300 40px Jost', '400 40px Jost', '26px "IBM Plex Mono"'].map((f) => document.fonts.load(f))),
			new Promise((r) => setTimeout(r, 2500)),
		]);
		const { createWorld } = await import('./scene/world.js');
		world = await createWorld($('scene'), SECTIONS, { onHover, onSelect: (id) => select(id), reducedMotion });
		$('renderer').hidden = false;
		render();
		if (current) select(current, { push: false, instant: true });
	} catch (err) {
		console.error(err);
		document.body.classList.add('no3d');
		const p = document.createElement('p');
		p.className = 'hint';
		p.style.position = 'static';
		p.style.transform = 'none';
		p.style.padding = '0 20px';
		p.textContent = UI[lang].noGpu;
		$('nav').before(p);
		if (!current) select(SECTIONS[0].id, { push: false });
	} finally {
		$('loader').classList.add('done');
		setTimeout(() => $('loader').remove(), 800);
	}
}
boot();
