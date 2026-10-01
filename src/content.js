// Every section is tied to one object on the workbench (see scene/objects.js).
// The HTML nav and the panels are built from this file, so the site stays readable without 3D.

export const LINKS = {
	github: 'https://github.com/Jhonfel',
	linkedin: 'https://www.linkedin.com/in/jhon-felipe-delgado-salazar-732427161',
	course: 'https://introsistemasinteligentes.com',
};

export const UI = {
	en: {
		role: 'ML Engineer · Mechatronics · PhD student',
		hint: 'Move the mouse, the arm follows you. Click anything on the bench.',
		hintTouch: 'Tap anything on the bench.',
		back: 'Back to the bench',
		loading: 'Warming up the workshop',
		sections: 'Sections',
		renderer: { webgpu: 'WebGPU', webgl: 'WebGL 2 fallback' },
		noGpu: 'Your browser can’t run the 3D workshop, so here is the plain version.',
		lang: 'ES',
		langLabel: 'Ver en español',
	},
	es: {
		role: 'ML Engineer · Mecatrónica · Estudiante de doctorado',
		hint: 'Mueve el mouse, el brazo te sigue. Haz clic en cualquier cosa del banco.',
		hintTouch: 'Toca cualquier cosa del banco.',
		back: 'Volver al banco',
		loading: 'Encendiendo el taller',
		sections: 'Secciones',
		renderer: { webgpu: 'WebGPU', webgl: 'WebGL 2 (respaldo)' },
		noGpu: 'Tu navegador no puede mostrar el taller 3D, así que aquí va la versión simple.',
		lang: 'EN',
		langLabel: 'View in English',
	},
};

export const SECTIONS = [
	{
		id: 'about',
		object: 'photo',
		en: {
			label: 'About me',
			title: 'Hi, I’m Jhon Felipe Delgado',
			body: `
				<p>ML Engineer at <strong>MercadoLibre</strong>, adjunct professor and PhD student at
				<strong>Universidad Nacional de Colombia</strong>.</p>
				<p>Mechatronics engineer from Universidad Nacional de Colombia.</p>`,
		},
		es: {
			label: 'Sobre mí',
			title: 'Hola, soy Jhon Felipe Delgado',
			body: `
				<p>ML Engineer en <strong>MercadoLibre</strong>, profesor ocasional y estudiante de doctorado en la
				<strong>Universidad Nacional de Colombia</strong>.</p>
				<p>Ingeniero mecatrónico de la Universidad Nacional de Colombia.</p>`,
		},
	},
	{
		id: 'work',
		object: 'laptop',
		en: {
			label: 'Work',
			title: 'ML Engineer at MercadoLibre',
			body: `
				<ul>
					<li><strong>ML Engineer</strong> on the Research &amp; Acceleration team (current).</li>
					<li><strong>Data Engineer</strong> on the cloud cost forecasting team, to go deeper on the technical path.</li>
					<li><strong>DS Engineer</strong> on the OneClick team, where I started.</li>
				</ul>
				<h3>Before</h3>
				<ul>
					<li><strong>Senior NLP Engineer at Millenium BPO</strong>: chatbots and voicebots running in production.</li>
					<li><strong>Co-founder of SamiBot</strong>, a robotics startup.</li>
				</ul>`,
		},
		es: {
			label: 'Trabajo',
			title: 'ML Engineer en MercadoLibre',
			body: `
				<ul>
					<li><strong>ML Engineer</strong> en el equipo de Research &amp; Acceleration (actual).</li>
					<li><strong>Data Engineer</strong> en el equipo de forecast de costos de cloud, para profundizar en el camino técnico.</li>
					<li><strong>DS Engineer</strong> en el equipo de OneClick, donde empecé.</li>
				</ul>
				<h3>Antes</h3>
				<ul>
					<li><strong>Senior NLP Engineer en Millenium BPO</strong>: chatbots y voicebots en producción.</li>
					<li><strong>Cofundador de SamiBot</strong>, una startup de robótica.</li>
				</ul>`,
		},
	},
	{
		id: 'teaching',
		object: 'board',
		en: {
			label: 'Teaching',
			title: 'Introducción a los Sistemas Inteligentes',
			body: `
				<p>I’m an adjunct professor (<em>profesor ocasional</em>) at UNAL, where I teach the Intelligent Systems course. The program, weekly lessons and
				workshops are public at <a href="${LINKS.course}" target="_blank" rel="noopener">introsistemasinteligentes.com</a>.</p>
				<p>Before that, during my Master’s, I taught the introductory programming course as a graduate instructor (<em>profesor asistente</em>).</p>`,
		},
		es: {
			label: 'Docencia',
			title: 'Introducción a los Sistemas Inteligentes',
			body: `
				<p>Soy profesor ocasional en la UNAL, donde dicto el curso de Sistemas Inteligentes. El programa, las clases de cada semana
				y los talleres están en <a href="${LINKS.course}" target="_blank" rel="noopener">introsistemasinteligentes.com</a>.</p>
				<p>Antes, durante la maestría, fui profesor asistente: dictaba el primer curso de programación.</p>`,
		},
	},
	{
		id: 'research',
		object: 'books',
		en: {
			label: 'Research',
			title: 'Research and publications',
			body: `
				<p>PhD student at Universidad Nacional de Colombia, after finishing my Master’s in Systems and Computing
				Engineering there.</p>
				<h3>Publications</h3>
				<ul class="projects pubs">
					<li><a href="https://academic.oup.com/ajrccm/article/211/Supplement_1/A3651/8333097" target="_blank" rel="noopener">Comparison of Prediction Equations for Impulse Oscillometry: An AI-based Tool for Assisted Clinical Report</a>
					<span>C. Zhang, <strong>J.F. Delgado Salazar</strong>, L.F. Guantiva Vargas, C.E. Rodriguez-Martinez, S.M. Restrepo Gualteros.
					<em>Am J Respir Crit Care Med</em> 211 (Suppl. 1), A3651. Conference abstract, ATS 2025 International Conference, San Francisco.</span>
					<span>A support tool for pediatric pulmonology. It compares 10 published prediction equations for impulse oscillometry
					in children aged 3–18; a k-nearest-neighbours recommender trained on 1,000 synthetic data points suggests an equation,
					an agentic workflow built with LangChain (few-shot) drafts the clinical report, and an evaluation step corrects errors
					iteratively. The output is a PDF report with the recommended equation, a parametric analysis and diagnostic hypotheses.</span></li>
				</ul>`,
		},
		es: {
			label: 'Investigación',
			title: 'Investigación y publicaciones',
			body: `
				<p>Estudiante de doctorado en la Universidad Nacional de Colombia, después de terminar allí la Maestría en
				Ingeniería de Sistemas y Computación.</p>
				<h3>Publicaciones</h3>
				<ul class="projects pubs">
					<li><a href="https://academic.oup.com/ajrccm/article/211/Supplement_1/A3651/8333097" target="_blank" rel="noopener">Comparison of Prediction Equations for Impulse Oscillometry: An AI-based Tool for Assisted Clinical Report</a>
					<span>C. Zhang, <strong>J.F. Delgado Salazar</strong>, L.F. Guantiva Vargas, C.E. Rodriguez-Martinez, S.M. Restrepo Gualteros.
					<em>Am J Respir Crit Care Med</em> 211 (Suppl. 1), A3651. Resumen de congreso, ATS 2025 International Conference, San Francisco.</span>
					<span>Una herramienta de apoyo para neumología pediátrica. Compara 10 ecuaciones de predicción publicadas para
					oscilometría de impulso en niños de 3 a 18 años; un recomendador de k vecinos más cercanos, entrenado con 1.000 datos
					sintéticos, sugiere una ecuación; un flujo agéntico construido con LangChain (few-shot) redacta el reporte clínico, y un
					paso de evaluación corrige errores de forma iterativa. El resultado es un reporte en PDF con la ecuación recomendada,
					el análisis paramétrico y las hipótesis diagnósticas.</span></li>
				</ul>`,
		},
	},
	{
		id: 'pulmonology',
		object: 'stethoscope',
		en: {
			label: 'Pediatric pulmonology',
			title: 'Pediatric pulmonology',
			body: `
				<p>Awards at the Congreso Colombiano de Neumología Pediátrica (Colombian Congress of Pediatric Pulmonology):</p>
				<ul class="projects">
					<li><strong>2026 · Best poster</strong>
					<span>Normal acid–base values in children living at high altitude, and a visual application for their interpretation.</span></li>
					<li><strong>2024 · Second place</strong>
					<span>Prediction equations for impulse oscillometry.</span></li>
				</ul>
				<p>The oscillometry work was also presented at the ATS 2025 International Conference:
				<a href="https://academic.oup.com/ajrccm/article/211/Supplement_1/A3651/8333097" target="_blank" rel="noopener">abstract in AJRCCM</a>.</p>`,
		},
		es: {
			label: 'Neumología pediátrica',
			title: 'Neumología pediátrica',
			body: `
				<p>Premios en el Congreso Colombiano de Neumología Pediátrica:</p>
				<ul class="projects">
					<li><strong>2026 · Mejor póster</strong>
					<span>Valores normales de estado ácido-base en niños residentes a gran altura y aplicación visual para su interpretación.</span></li>
					<li><strong>2024 · Segundo lugar</strong>
					<span>Ecuaciones de predicción para oscilometría de impulso.</span></li>
				</ul>
				<p>El trabajo de oscilometría también se presentó en el congreso internacional de la ATS 2025:
				<a href="https://academic.oup.com/ajrccm/article/211/Supplement_1/A3651/8333097" target="_blank" rel="noopener">abstract en AJRCCM</a>.</p>`,
		},
	},
	{
		id: 'projects',
		object: 'monitor',
		en: {
			label: 'Projects',
			title: 'Projects and contributions',
			body: `
				<ul class="projects">
					<li><a href="https://github.com/Jhonfel/documentation-rag-poc" target="_blank" rel="noopener">documentation-rag-poc</a>
					<span>Agentic RAG for answering questions over documentation.</span></li>
					<li><a href="https://github.com/Jhonfel/toxic-text-detection" target="_blank" rel="noopener">toxic-text-detection</a>
					<span>NLP classifier for toxic text.</span></li>
					<li><a href="${LINKS.course}" target="_blank" rel="noopener">introsistemasinteligentes.com</a>
					<span>Course site for Intelligent Systems at UNAL.</span></li>
				</ul>
				<h3>Open-source contributions</h3>
				<ul class="projects">
					<li><a href="https://github.com/jhonsnake/sunshine-hyprland-virtual-display/pull/4" target="_blank" rel="noopener">sunshine-hyprland-virtual-display · PR #4</a>
					<span>Contribution to <a href="https://github.com/jhonsnake/sunshine-hyprland-virtual-display" target="_blank" rel="noopener">jhonsnake/sunshine-hyprland-virtual-display</a>, an
					Apollo-style virtual display for game streaming on Linux (Hyprland + Sunshine): per-client resolution and refresh-rate
					matching, and end-to-end HDR10 streaming, including a Hyprland screencopy patch. The Sunshine side relies on
					<a href="https://github.com/LizardByte/Sunshine/pull/5615" target="_blank" rel="noopener">LizardByte/Sunshine#5615</a>.</span></li>
				</ul>`,
		},
		es: {
			label: 'Proyectos',
			title: 'Proyectos y contribuciones',
			body: `
				<ul class="projects">
					<li><a href="https://github.com/Jhonfel/documentation-rag-poc" target="_blank" rel="noopener">documentation-rag-poc</a>
					<span>RAG agéntico para responder preguntas sobre documentación.</span></li>
					<li><a href="https://github.com/Jhonfel/toxic-text-detection" target="_blank" rel="noopener">toxic-text-detection</a>
					<span>Clasificador de NLP para texto tóxico.</span></li>
					<li><a href="${LINKS.course}" target="_blank" rel="noopener">introsistemasinteligentes.com</a>
					<span>Sitio del curso de Sistemas Inteligentes de la UNAL.</span></li>
				</ul>
				<h3>Contribuciones open source</h3>
				<ul class="projects">
					<li><a href="https://github.com/jhonsnake/sunshine-hyprland-virtual-display/pull/4" target="_blank" rel="noopener">sunshine-hyprland-virtual-display · PR #4</a>
					<span>Contribución a <a href="https://github.com/jhonsnake/sunshine-hyprland-virtual-display" target="_blank" rel="noopener">jhonsnake/sunshine-hyprland-virtual-display</a>, una
					pantalla virtual al estilo Apollo para hacer streaming de juegos en Linux (Hyprland + Sunshine): ajuste de resolución y
					tasa de refresco a cada cliente, y transmisión HDR10 de punta a punta, incluido un parche de screencopy para Hyprland.
					La parte de Sunshine usa <a href="https://github.com/LizardByte/Sunshine/pull/5615" target="_blank" rel="noopener">LizardByte/Sunshine#5615</a>.</span></li>
				</ul>`,
		},
	},
	{
		id: 'hardware',
		object: 'pcb',
		en: {
			label: 'Hardware',
			title: 'Mechatronics',
			body: `
				<ul>
					<li>Mechatronics engineer, Universidad Nacional de Colombia.</li>
					<li>President of RAS – CEIMTUN at Universidad Nacional de Colombia (2018).</li>
					<li>Co-founder of SamiBot, a startup that built waiter robots.</li>
				</ul>`,
		},
		es: {
			label: 'Hardware',
			title: 'Mecatrónica',
			body: `
				<ul>
					<li>Ingeniero mecatrónico, Universidad Nacional de Colombia.</li>
					<li>Presidente de RAS – CEIMTUN en la Universidad Nacional de Colombia (2018).</li>
					<li>Cofundador de SamiBot, una startup que hacía robots meseros.</li>
				</ul>`,
		},
	},
	{
		id: 'samibot',
		object: 'samibot',
		en: {
			label: 'SamiBot',
			title: 'SamiBot',
			body: `
				<p>I co-founded SamiBot, a robotics startup that built waiter robots: three trays, a screen on top,
				and it drives the dishes from the kitchen to the table on its own.</p>
				<p>The one on the bench is opened up for repairs: chassis on a stand, battery, lidar and cables out.
				This is how it looked closed, delivering a burger:</p>
				<video src="${import.meta.env.BASE_URL}video/samibot.mp4" poster="${import.meta.env.BASE_URL}video/samibot.jpg"
					autoplay muted loop playsinline preload="none" aria-label="SamiBot delivering a plate"></video>`,
		},
		es: {
			label: 'SamiBot',
			title: 'SamiBot',
			body: `
				<p>Cofundé SamiBot, una startup de robótica que hacía robots meseros: tres bandejas, una pantalla arriba,
				y lleva solo los platos de la cocina a la mesa.</p>
				<p>El del banco está desarmado para reparación: el chasis en un soporte, la batería, el lidar y los cables afuera.
				Así se veía armado, entregando una hamburguesa:</p>
				<video src="${import.meta.env.BASE_URL}video/samibot.mp4" poster="${import.meta.env.BASE_URL}video/samibot.jpg"
					autoplay muted loop playsinline preload="none" aria-label="SamiBot entregando un plato"></video>`,
		},
	},
	{
		id: 'contact',
		object: 'phone',
		en: {
			label: 'Contact',
			title: 'Let’s talk',
			body: `
				<p>Happy to talk about ML, teaching, robotics or Linux setups.</p>
				<ul class="contact">
					<li><a href="${LINKS.linkedin}" target="_blank" rel="noopener">LinkedIn</a></li>
					<li><a href="${LINKS.github}" target="_blank" rel="noopener">GitHub</a></li>
				</ul>`,
		},
		es: {
			label: 'Contacto',
			title: 'Hablemos',
			body: `
				<p>Con gusto hablo de ML, docencia, robótica o configuraciones de Linux.</p>
				<ul class="contact">
					<li><a href="${LINKS.linkedin}" target="_blank" rel="noopener">LinkedIn</a></li>
					<li><a href="${LINKS.github}" target="_blank" rel="noopener">GitHub</a></li>
				</ul>`,
		},
	},
];
