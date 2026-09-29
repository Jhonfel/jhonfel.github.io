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
				<p>I trained as a mechatronics engineer, so I tend to end up somewhere between models, code and hardware.
				This bench is roughly what my desk looks like: a laptop, a board with blinking LEDs, too many books
				and a robot arm that never stays still.</p>`,
		},
		es: {
			label: 'Sobre mí',
			title: 'Hola, soy Jhon Felipe Delgado',
			body: `
				<p>ML Engineer en <strong>MercadoLibre</strong>, profesor ocasional y estudiante de doctorado en la
				<strong>Universidad Nacional de Colombia</strong>.</p>
				<p>Me formé como ingeniero mecatrónico, así que casi siempre termino en algún punto entre modelos, código y hardware.
				Este banco se parece bastante a mi escritorio: un portátil, una placa con LEDs, demasiados libros
				y un brazo robótico que nunca se queda quieto.</p>`,
		},
	},
	{
		id: 'work',
		object: 'laptop',
		en: {
			label: 'Work',
			title: 'ML Engineer at MercadoLibre',
			body: `
				<p>I joined MercadoLibre as a DS Engineer, moved to Data Engineering and now work on machine learning.
				Going through the whole path, from pipelines to models in production, is what I enjoy the most about it.</p>
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
				<p>Entré a MercadoLibre como DS Engineer, pasé a Data Engineering y ahora trabajo en machine learning.
				Recorrer todo el camino, desde los pipelines hasta los modelos en producción, es lo que más disfruto.</p>
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
				<p>Machine learning and NLP are where most of my reading goes, which explains the stack of books.</p>`,
		},
		es: {
			label: 'Investigación',
			title: 'Estudiante de doctorado en la UNAL',
			body: `
				<p>Estoy haciendo el doctorado en la Universidad Nacional de Colombia, después de terminar allí la
				Maestría en Ingeniería de Sistemas y Computación.</p>
				<p>Machine learning y NLP es a donde se va casi toda mi lectura, lo que explica la pila de libros.</p>`,
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
			title: 'Mechatronics & robotics',
			body: `
				<p>Mechatronics engineer by training. Robotics is where I started, and it’s the reason there is
				a soldering iron on this bench; SamiBot, the startup I co-founded, came out of that.</p>
				<p>These days the hardware is mostly my own machine: an Arch + Hyprland setup that I keep patching,
				which is how the HDR streaming project happened.</p>`,
		},
		es: {
			label: 'Hardware',
			title: 'Mecatrónica y robótica',
			body: `
				<p>Soy ingeniero mecatrónico. Empecé por la robótica y por eso hay un cautín en este banco;
				de ahí salió SamiBot, la startup que cofundé.</p>
				<p>Hoy el hardware es sobre todo mi propia máquina: un Arch + Hyprland que no paro de parchear,
				y así nació el proyecto de streaming con HDR.</p>`,
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
