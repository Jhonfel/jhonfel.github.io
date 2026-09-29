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
				<p>ML Engineer at <strong>MercadoLibre</strong>, occasional professor and PhD student at
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
				<p>I teach the Intelligent Systems course at UNAL from time to time. The program, weekly lessons and
				workshops are public at <a href="${LINKS.course}" target="_blank" rel="noopener">introsistemasinteligentes.com</a>.</p>
				<p>Before that I was a teaching assistant for the first programming course.</p>`,
		},
		es: {
			label: 'Docencia',
			title: 'Introducción a los Sistemas Inteligentes',
			body: `
				<p>De vez en cuando dicto el curso de Sistemas Inteligentes en la UNAL. El programa, las clases de cada semana
				y los talleres están en <a href="${LINKS.course}" target="_blank" rel="noopener">introsistemasinteligentes.com</a>.</p>
				<p>Antes fui monitor del primer curso de programación.</p>`,
		},
	},
	{
		id: 'research',
		object: 'books',
		en: {
			label: 'Research',
			title: 'PhD student at UNAL',
			body: `
				<p>I’m doing my PhD at Universidad Nacional de Colombia, after finishing my Master’s in
				Systems and Computing Engineering there.</p>
				<h3>Publications</h3>
				<ul class="projects pubs">
					<li><a href="https://academic.oup.com/ajrccm/article/211/Supplement_1/A3651/8333097" target="_blank" rel="noopener">Comparison of Prediction Equations for Impulse Oscillometry: An AI-based Tool for Assisted Clinical Report</a>
					<span>C. Zhang, <strong>J.F. Delgado Salazar</strong>, L.F. Guantiva Vargas, C.E. Rodriguez-Martinez, S.M. Restrepo Gualteros.
					<em>Am J Respir Crit Care Med</em> 211 (Suppl. 1), A3651. ATS 2025 International Conference, San Francisco.</span>
					<span>A support tool for pediatric pulmonology: it compares 10 prediction equations for impulse oscillometry in children aged 3–18
					and uses an agentic LLM workflow to draft the clinical report, with the recommended equation and diagnostic hypotheses.</span></li>
				</ul>`,
		},
		es: {
			label: 'Investigación',
			title: 'Estudiante de doctorado en la UNAL',
			body: `
				<p>Estoy haciendo el doctorado en la Universidad Nacional de Colombia, después de terminar allí la
				Maestría en Ingeniería de Sistemas y Computación.</p>
				<h3>Publicaciones</h3>
				<ul class="projects pubs">
					<li><a href="https://academic.oup.com/ajrccm/article/211/Supplement_1/A3651/8333097" target="_blank" rel="noopener">Comparison of Prediction Equations for Impulse Oscillometry: An AI-based Tool for Assisted Clinical Report</a>
					<span>C. Zhang, <strong>J.F. Delgado Salazar</strong>, L.F. Guantiva Vargas, C.E. Rodriguez-Martinez, S.M. Restrepo Gualteros.
					<em>Am J Respir Crit Care Med</em> 211 (Suppl. 1), A3651. ATS 2025 International Conference, San Francisco.</span>
					<span>Una herramienta de apoyo para neumología pediátrica: compara 10 ecuaciones de referencia de oscilometría de impulso
					en niños de 3 a 18 años y usa un flujo agéntico con LLMs para redactar el reporte clínico, con la ecuación recomendada
					y las hipótesis diagnósticas.</span></li>
				</ul>`,
		},
	},
	{
		id: 'projects',
		object: 'monitor',
		en: {
			label: 'Projects',
			title: 'Things I’ve built',
			body: `
				<ul class="projects">
					<li><a href="https://github.com/Jhonfel/sunshine-hyprland-virtual-display" target="_blank" rel="noopener">sunshine-hyprland-virtual-display</a>
					<span>Apollo-style virtual display for game streaming on Linux (Hyprland + Sunshine). It matches each client’s
					resolution and refresh rate and does end-to-end HDR10, which needed patches to both Sunshine and Hyprland.</span></li>
					<li><a href="https://github.com/Jhonfel/documentation-rag-poc" target="_blank" rel="noopener">documentation-rag-poc</a>
					<span>Agentic RAG for answering questions over documentation.</span></li>
					<li><a href="https://github.com/Jhonfel/toxic-text-detection" target="_blank" rel="noopener">toxic-text-detection</a>
					<span>NLP classifier for toxic text.</span></li>
					<li><a href="${LINKS.course}" target="_blank" rel="noopener">introsistemasinteligentes.com</a>
					<span>Course site for Intelligent Systems at UNAL.</span></li>
				</ul>`,
		},
		es: {
			label: 'Proyectos',
			title: 'Cosas que he construido',
			body: `
				<ul class="projects">
					<li><a href="https://github.com/Jhonfel/sunshine-hyprland-virtual-display" target="_blank" rel="noopener">sunshine-hyprland-virtual-display</a>
					<span>Pantalla virtual al estilo Apollo para hacer streaming de juegos en Linux (Hyprland + Sunshine). Ajusta la
					resolución y la tasa de refresco a cada cliente y transmite HDR10 de punta a punta, para lo que hubo que parchear Sunshine y Hyprland.</span></li>
					<li><a href="https://github.com/Jhonfel/documentation-rag-poc" target="_blank" rel="noopener">documentation-rag-poc</a>
					<span>RAG agéntico para responder preguntas sobre documentación.</span></li>
					<li><a href="https://github.com/Jhonfel/toxic-text-detection" target="_blank" rel="noopener">toxic-text-detection</a>
					<span>Clasificador de NLP para texto tóxico.</span></li>
					<li><a href="${LINKS.course}" target="_blank" rel="noopener">introsistemasinteligentes.com</a>
					<span>Sitio del curso de Sistemas Inteligentes de la UNAL.</span></li>
				</ul>`,
		},
	},
	{
		id: 'ausculapp',
		object: 'stethoscope',
		en: {
			label: 'AusculApp',
			title: 'AusculApp',
			body: `
				<p>An iOS app for remote auscultation: listening to heart and lung sounds when the doctor isn’t in the room.</p>
				<p><a href="https://github.com/Jhonfel/AusculApp" target="_blank" rel="noopener">github.com/Jhonfel/AusculApp</a></p>`,
		},
		es: {
			label: 'AusculApp',
			title: 'AusculApp',
			body: `
				<p>Una app de iOS para auscultación remota: escuchar el corazón y los pulmones cuando el médico no está en la sala.</p>
				<p><a href="https://github.com/Jhonfel/AusculApp" target="_blank" rel="noopener">github.com/Jhonfel/AusculApp</a></p>`,
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
