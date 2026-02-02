// Estados de la aplicación
const AppState = {
    LOADING: 'loading',
    WELCOME: 'welcome',
    GALLERY: 'gallery'
};

// Datos de las esculturas
const sculptures = [
    {
        id: 1,
        title: "Guardián del Silencio",
        artist: "Daniel Guido",
        year: "2025",
        material: "Madera de cedro",
        description: "Escultura tallada directamente en madera maciza que revela un búho resguardado en el interior del tronco que le dio origen. Una obra que captura la sabiduría ancestral y la conexión con la naturaleza.",
        image: "https://mapatico.com/gallery/sirena.jpg"
    },
    {
        id: 2,
        title: "Fuerza Ancestral",
        artist: "Daniel Guido",
        year: "2025",
        material: "Madera de guanacaste",
        description: "Tallado expresivo en madera que representa la cabeza de un bovino como símbolo de trabajo, resistencia y vínculo entre el ser humano y la tierra. Las texturas naturales de la madera realzan la fuerza de la pieza.",
        image: "https://mapatico.com/gallery/escultura2.jpg"
    },
    {
        id: 3,
        title: "Raíz de Identidad",
        artist: "Daniel Guido",
        year: "2025",
        material: "Madera de cenízaro",
        description: "Escultura figurativa en madera que retrata un busto femenino cuya cabellera se transforma en una extensión abstracta y texturizada, semejante a raíces. Representa la conexión entre la identidad personal y nuestras raíces culturales.",
        image: "https://mapatico.com/gallery/escultura3.jpg"
    },
    {
        id: 4,
        title: "Vuelo Interior",
        artist: "Daniel Guido",
        year: "2024",
        material: "Madera de ron ron",
        description: "Una interpretación abstracta del movimiento y la libertad. Las formas curvas sugieren alas desplegándose, mientras las vetas de la madera guían al observador en un viaje visual ascendente.",
        image: "https://mapatico.com/gallery/escultura4.jpg"
    },
    {
        id: 5,
        title: "Memoria del Bosque",
        artist: "Daniel Guido",
        year: "2024",
        material: "Madera de laurel",
        description: "Esta pieza surge de un tronco caído naturalmente, preservando las marcas del tiempo y los elementos. El artista trabajó con las imperfecciones para crear una obra que habla de ciclos, memoria y transformación.",
        image: "https://mapatico.com/gallery/escultura5.jpg"
    },
    {
        id: 6,
        title: "Danza de la Tierra",
        artist: "Daniel Guido",
        year: "2024",
        material: "Madera de cocobolo",
        description: "Figura femenina en movimiento que emerge de la madera como si brotara de la tierra misma. Los tonos rojizos del cocobolo aportan calidez y vida a esta celebración del movimiento y la feminidad.",
        image: "https://mapatico.com/gallery/escultura6.jpg"
    },
      {
        id: 7,
        title: "Danza de la Tierra",
        artist: "Daniel Guido",
        year: "2024",
        material: "Madera de cocobolo",
        description: "Figura femenina en movimiento que emerge de la madera como si brotara de la tierra misma. Los tonos rojizos del cocobolo aportan calidez y vida a esta celebración del movimiento y la feminidad.",
        image: "https://mapatico.com/gallery/escultura7.jpg"
    },
     {
        id: 8,
        title: "Danza de la Tierra",
        artist: "Daniel Guido",
        year: "2024",
        material: "Madera de cocobolo",
        description: "Figura femenina en movimiento que emerge de la madera como si brotara de la tierra misma. Los tonos rojizos del cocobolo aportan calidez y vida a esta celebración del movimiento y la feminidad.",
        image: "https://mapatico.com/gallery/escultura8.jpg"
    },
     {
        id: 9,
        title: "Danza de la Tierra",
        artist: "Daniel Guido",
        year: "2024",
        material: "Madera de cocobolo",
        description: "Figura femenina en movimiento que emerge de la madera como si brotara de la tierra misma. Los tonos rojizos del cocobolo aportan calidez y vida a esta celebración del movimiento y la feminidad.",
        image: "https://mapatico.com/gallery/escultura9.jpg"
    },
     {
        id: 10,
        title: "Danza de la Tierra",
        artist: "Daniel Guido",
        year: "2024",
        material: "Madera de cocobolo",
        description: "Figura femenina en movimiento que emerge de la madera como si brotara de la tierra misma. Los tonos rojizos del cocobolo aportan calidez y vida a esta celebración del movimiento y la feminidad.",
        image: "https://mapatico.com/gallery/escultura10.jpg"
    },
     {
        id: 11,
        title: "Danza de la Tierra",
        artist: "Daniel Guido",
        year: "2024",
        material: "Madera de cocobolo",
        description: "Figura femenina en movimiento que emerge de la madera como si brotara de la tierra misma. Los tonos rojizos del cocobolo aportan calidez y vida a esta celebración del movimiento y la feminidad.",
        image: "https://mapatico.com/gallery/escultura11.jpg"
    },
     {
        id: 12,
        title: "Danza de la Tierra",
        artist: "Daniel Guido",
        year: "2024",
        material: "Madera de cocobolo",
        description: "Figura femenina en movimiento que emerge de la madera como si brotara de la tierra misma. Los tonos rojizos del cocobolo aportan calidez y vida a esta celebración del movimiento y la feminidad.",
        image: "https://mapatico.com/gallery/escultura12.jpg"
    },
    
];

// Sistema de Lightbox Moderno
class GalleryLightbox {
    constructor(sculpturesArray) {
        this.sculptures = sculpturesArray;
        this.currentIndex = 0;
        this.init();
    }

    init() {
        // Crear el lightbox en el DOM una sola vez
        if (!document.getElementById('lightbox')) {
            this.createLightbox();
            this.setupEventListeners();
        }
    }

    createLightbox() {
        const lightboxHTML = `
            <div class="lightbox-overlay" id="lightbox">
                <div class="lightbox-content">
                    <button class="lightbox-close" id="lightbox-close" aria-label="Cerrar vista ampliada">
                        <i class="fas fa-times"></i>
                        <span class="sr-only">Cerrar</span>
                    </button>
                    
                    <div class="lightbox-image-container" id="lightbox-image-container">
                        <div class="lightbox-loading" id="lightbox-loading"></div>
                        <img id="lightbox-image" src="" alt="" loading="lazy">
                        
                        <div class="lightbox-controls">
                            <button class="lightbox-prev" id="lightbox-prev" aria-label="Imagen anterior">
                                <i class="fas fa-chevron-left"></i>
                                <span class="sr-only">Anterior</span>
                            </button>
                            
                            <button class="lightbox-next" id="lightbox-next" aria-label="Siguiente imagen">
                                <i class="fas fa-chevron-right"></i>
                                <span class="sr-only">Siguiente</span>
                            </button>
                        </div>
                    </div>
                    
                    <div class="lightbox-details">
                        <p class="lightbox-artist" id="lightbox-artist"></p>
                        <h2 class="lightbox-title" id="lightbox-title"></h2>
                        
                        <div class="lightbox-tags" id="lightbox-tags"></div>
                        
                        <p class="lightbox-description" id="lightbox-description"></p>
                        
                        <a href="#" class="lightbox-whatsapp" id="lightbox-whatsapp" target="_blank" rel="noopener">
                            <i class="fab fa-whatsapp"></i> Consultar por esta obra
                        </a>
                        
                        <div class="lightbox-counter" id="lightbox-counter">
                            1 / ${this.sculptures.length}
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', lightboxHTML);
    }

    setupEventListeners() {
        // Delegación de eventos para las tarjetas
        document.addEventListener('click', (e) => {
            const card = e.target.closest('.sculpture-card');
            if (card) {
                const id = parseInt(card.dataset.sculptureId);
                if (!isNaN(id)) {
                    const index = this.sculptures.findIndex(s => s.id === id);
                    if (index !== -1) {
                        this.open(index);
                    }
                }
            }
            
            // Cerrar lightbox
            const lightboxClose = document.getElementById('lightbox-close');
            const lightbox = document.getElementById('lightbox');
            
            if (e.target === lightboxClose || (e.target === lightbox && lightbox.classList.contains('active'))) {
                this.close();
            }
            
            // Navegación
            const prevBtn = document.getElementById('lightbox-prev');
            const nextBtn = document.getElementById('lightbox-next');
            
            if (e.target.closest('#lightbox-prev') || e.target === prevBtn) {
                this.prev();
            }
            
            if (e.target.closest('#lightbox-next') || e.target === nextBtn) {
                this.next();
            }
        });
        
        // Navegación por teclado
        document.addEventListener('keydown', (e) => {
            const lightbox = document.getElementById('lightbox');
            if (!lightbox || !lightbox.classList.contains('active')) return;
            
            if (e.key === 'Escape') {
                this.close();
            } else if (e.key === 'ArrowLeft') {
                this.prev();
            } else if (e.key === 'ArrowRight') {
                this.next();
            }
        });
        
        // Gestos táctiles
        const lightboxContainer = document.getElementById('lightbox-image-container');
        if (lightboxContainer) {
            let touchStartX = 0;
            let touchEndX = 0;
            
            lightboxContainer.addEventListener('touchstart', (e) => {
                touchStartX = e.changedTouches[0].clientX;
            }, { passive: true });
            
            lightboxContainer.addEventListener('touchend', (e) => {
                touchEndX = e.changedTouches[0].clientX;
                this.handleSwipe(touchStartX, touchEndX);
            }, { passive: true });
        }
    }

    open(index) {
        this.currentIndex = index;
        this.update();
        document.getElementById('lightbox').classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    close() {
        document.getElementById('lightbox').classList.remove('active');
        document.body.style.overflow = 'auto';
    }

    prev() {
        this.currentIndex = (this.currentIndex - 1 + this.sculptures.length) % this.sculptures.length;
        this.update();
    }

    next() {
        this.currentIndex = (this.currentIndex + 1) % this.sculptures.length;
        this.update();
    }

    handleSwipe(startX, endX) {
        const threshold = 50;
        const diff = startX - endX;
        
        if (Math.abs(diff) > threshold) {
            if (diff > 0) {
                this.next(); // Swipe izquierda = siguiente
            } else {
                this.prev(); // Swipe derecha = anterior
            }
        }
    }

    update() {
        const sculpture = this.sculptures[this.currentIndex];
        if (!sculpture) return;
        
        // Mostrar loading
        const loading = document.getElementById('lightbox-loading');
        const img = document.getElementById('lightbox-image');
        const container = document.getElementById('lightbox-image-container');
        
        if (loading) loading.style.display = 'block';
        if (container) container.classList.add('loading');
        
        // Precargar imagen
        const image = new Image();
        image.src = sculpture.image;
        image.alt = sculpture.title;
        
        image.onload = () => {
            if (img) {
                img.src = sculpture.image;
                img.alt = sculpture.title;
                this.updateDetails(sculpture);
                
                if (loading) loading.style.display = 'none';
                if (container) container.classList.remove('loading');
            }
        };
        
        image.onerror = () => {
            if (img) {
                img.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"><rect width="400" height="300" fill="%23f0f0f0"/><text x="200" y="150" text-anchor="middle" font-family="Arial" font-size="16" fill="%23999999">Imagen no disponible</text></svg>';
                img.alt = 'Imagen no disponible';
                this.updateDetails(sculpture);
                
                if (loading) loading.style.display = 'none';
                if (container) container.classList.remove('loading');
            }
        };
    }

    updateDetails(sculpture) {
        const artist = document.getElementById('lightbox-artist');
        const title = document.getElementById('lightbox-title');
        const tags = document.getElementById('lightbox-tags');
        const description = document.getElementById('lightbox-description');
        const whatsapp = document.getElementById('lightbox-whatsapp');
        const counter = document.getElementById('lightbox-counter');
        
        if (artist) artist.textContent = sculpture.artist;
        if (title) title.textContent = sculpture.title;
        
        if (tags) {
            tags.innerHTML = `
                <span class="lightbox-tag">${sculpture.year}</span>
                <span class="lightbox-tag">${sculpture.material}</span>
            `;
        }
        
        if (description) description.textContent = sculpture.description;
        
        if (whatsapp) {
            whatsapp.href = `https://wa.me/50687922758?text=Hola%20Daniel,%20estoy%20interesado%20en%20la%20obra%20%22${encodeURIComponent(sculpture.title)}%22`;
        }
        
        if (counter) {
            counter.textContent = `${this.currentIndex + 1} / ${this.sculptures.length}`;
        }
    }
}

// Aplicación principal
class App {
    constructor() {
        this.currentState = AppState.LOADING;
        this.appElement = document.getElementById('app');
        this.lightbox = null;
        this.init();
    }

    init() {
        this.setupGlobalLoader();
        this.render();
        
        // Inicializar iconos
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }

    setupGlobalLoader() {
        const loader = document.getElementById('global-loader');
        const progressBar = document.getElementById('loader-progress-bar');
        const statusText = document.getElementById('loader-status');
        
        const steps = [
            { progress: 25, status: "Cargando estructura de la galería..." },
            { progress: 50, status: "Preparando visualización 3D..." },
            { progress: 75, status: "Configurando experiencia inmersiva..." },
            { progress: 100, status: "¡Galería lista!" }
        ];
        
        let currentStep = 0;
        
        const interval = setInterval(() => {
            if (currentStep < steps.length) {
                progressBar.style.width = `${steps[currentStep].progress}%`;
                statusText.textContent = steps[currentStep].status;
                currentStep++;
            } else {
                clearInterval(interval);
                setTimeout(() => {
                    loader.classList.add('hidden');
                    setTimeout(() => {
                        this.currentState = AppState.WELCOME;
                        this.render();
                    }, 300);
                }, 500);
            }
        }, 600);
    }

    setState(newState) {
        this.currentState = newState;
        this.render();
        
        // Re-inicializar iconos
        setTimeout(() => {
            if (typeof lucide !== 'undefined') {
                lucide.createIcons();
            }
            this.attachEventListeners();
        }, 10);
    }

    attachEventListeners() {
        // Botón para ir a la galería
        const galleryBtn = document.querySelector('[data-action="go-to-gallery"]');
        if (galleryBtn) {
            galleryBtn.addEventListener('click', () => this.setState(AppState.GALLERY));
        }
        
        // Botón para volver
        const backBtn = document.querySelector('[data-action="go-back"]');
        if (backBtn) {
            backBtn.addEventListener('click', () => this.setState(AppState.WELCOME));
        }
        
        // Inicializar lightbox si estamos en galería
        if (this.currentState === AppState.GALLERY && !this.lightbox) {
            this.lightbox = new GalleryLightbox(sculptures);
        }
        
        // Modal AR
        const arBtn = document.querySelector('[data-action="open-ar"]');
        if (arBtn) {
            arBtn.addEventListener('click', () => {
                document.getElementById('ar-modal').classList.add('active');
            });
        }
        
        // Cerrar modales
        const closeButtons = document.querySelectorAll('[data-action="close-modal"]');
        closeButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.ar-modal, .lightbox-overlay').forEach(modal => {
                    modal.classList.remove('active');
                });
            });
        });
    }

    render() {
        this.appElement.innerHTML = '';
        
        switch (this.currentState) {
            case AppState.WELCOME:
                this.renderWelcomeScreen();
                break;
            case AppState.GALLERY:
                this.renderGallery();
                break;
        }
        
        this.attachEventListeners();
    }

    renderWelcomeScreen() {
        this.appElement.innerHTML = `
            <!-- HERO SECTION -->
            <section class="hero-section">
                <div class="container">
                    <div class="hero-content">
                        <p class="hero-subtitle">ESCULTOR COSTARRICENSE</p>
                        <h1 class="hero-title">Daniel Guido</h1>
                        <p class="hero-description">
                            Explora una colección única de esculturas contemporáneas talladas en madera.
                            Una fusión entre tradición artesanal y tecnología de vanguardia.
                        </p>
                        <div class="hero-features">
                            <div class="feature-item">
                                <span class="feature-icon">
                                    <i data-lucide="image"></i>
                                </span>
                                <span>Galería digital</span>
                            </div>
                            <div class="feature-item">
                                <span class="feature-icon">
                                    <i data-lucide="smartphone"></i>
                                </span>
                                <span>Realidad Aumentada</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <!-- ABOUT SECTION -->
            <section class="about-section">
                <div class="container">
                    <div class="about-content">
                        <div class="about-image">
                            <img src="https://mapatico.com/gallery/soyDaniel.jpg" 
                                 alt="Escultura en madera">
                        </div>
                        <div class="about-text">
                            <p class="about-subtitle">SOBRE EL ARTISTA</p>
                            <h2 class="font-heading text-3xl font-medium mb-6">Arte que cobra vida</h2>
                            <div class="about-description">
                                <p class="mb-4">
                                    Daniel Guido es un escultor costarricense especializado en la talla directa
                                    de madera, una técnica ancestral que transforma troncos en obras de arte
                                    que capturan la esencia de la naturaleza.
                                </p>
                                <p class="mb-4">
                                    Sus esculturas exploran temas de identidad, conexión con la tierra y la
                                    fuerza de las formas orgánicas. Cada pieza es única, tallada a mano
                                    respetando las vetas naturales de la madera.
                                </p>
                                <p>
                                    Esta galería virtual te permite explorar su obra de dos formas:
                                    navegando la colección en formato tradicional o experimentándola
                                    en tu propio espacio mediante Realidad Aumentada.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <!-- MODE SELECTION SECTION -->
            <section class="mode-section">
                <div class="container">
                    <div class="mode-header">
                        <h2 class="font-heading text-3xl font-medium mb-4">Elige tu experiencia</h2>
                        <p class="mode-subtitle">
                            Selecciona cómo deseas explorar la colección de esculturas
                        </p>
                    </div>
                    
                    <div class="mode-cards">
                        <!-- Galería Normal -->
                        <div class="mode-card">
                            <div class="mode-icon">
                                <i data-lucide="image"></i>
                            </div>
                            <h3 class="mode-card-title font-heading text-2xl font-medium">Galería Normal</h3>
                            <p class="mode-card-description">
                                Explora todas las esculturas en formato de galería tradicional con
                                imágenes de alta calidad y descripciones detalladas.
                            </p>
                            <a href="#" class="mode-card-link" data-action="go-to-gallery">
                                Explorar galería
                                <i data-lucide="arrow-right" class="w-4 h-4"></i>
                            </a>
                        </div>
                        
                        <!-- Realidad Aumentada -->
                        <div class="mode-card coming-soon">
                            <div class="badge">
                                <i data-lucide="construction" class="w-3 h-3"></i>
                                <span>En desarrollo</span>
                            </div>
                            <div class="mode-icon">
                                <i data-lucide="smartphone"></i>
                            </div>
                            <h3 class="mode-card-title font-heading text-2xl font-medium">Realidad Aumentada</h3>
                            <p class="mode-card-description">
                                Visualiza las esculturas en tu espacio físico utilizando la cámara
                                de tu dispositivo móvil con tecnología WebAR.
                            </p>
                            <a href="#" class="mode-card-link coming-soon" data-action="open-ar">
                                Próximamente
                                <i data-lucide="smartphone" class="w-4 h-4"></i>
                            </a>
                        </div>
                    </div>
                </div>
            </section>

            <!-- FOOTER -->
            <footer class="main-footer">
                <div class="container">
                    <div class="footer-content">
                        <div class="footer-section">
                            <h3 class="font-heading text-xl font-medium">Galería Virtual</h3>
                            <p>
                                Una experiencia innovadora que fusiona arte tradicional con tecnología
                                de vanguardia.
                            </p>
                        </div>
                        
                        <div class="footer-section">
                            <h3 class="font-heading text-xl font-medium">Contacto</h3>
                            <p>Daniel Guido</p>
                            <p>Escultor costarricense</p>
                            <a href="https://wa.me/50687922758" 
                               target="_blank" 
                               rel="noopener noreferrer"
                               class="text-primary hover:underline block mt-2">
                                WhatsApp: +506 8792 2758
                            </a>
                        </div>
                        
                    </div>
                    
                    <div class="footer-bottom">
                        <p>© 2026 Galería Virtual. Todos los derechos reservados.</p>
                    </div>
                </div>
            </footer>

            <!-- MODAL AR -->
            <div id="ar-modal" class="ar-modal">
                <div class="ar-modal-content">
                    <div class="ar-modal-icon">
                        <i data-lucide="construction" class="w-10 h-10"></i>
                    </div>
                    <h3 class="font-heading text-2xl font-medium mb-4">Estamos trabajando en esto</h3>
                    <p class="text-gray-dark mb-6">
                        La experiencia de Realidad Aumentada está en desarrollo. Estamos perfeccionando
                        los modelos 3D de las esculturas para brindarte la mejor experiencia posible.
                    </p>
                    <p class="text-sm text-gray mb-8">
                        Estamos en retoques finales.
                        ¡Pronto podrás ver las esculturas en tu espacio!
                    </p>
                    <button class="btn btn-primary w-full" data-action="close-modal">
                        Entendido
                    </button>
                </div>
            </div>
        `;
    }

    renderGallery() {
        this.appElement.innerHTML = `
            <!-- HEADER -->
            <header class="gallery-header">
    <div class="container">
        <div class="gallery-header-content">
            <button class="btn-outline" data-action="go-back">
                <i data-lucide="arrow-left"></i>
                <span class="hidden sm:inline">Volver</span>
            </button>
            
            <h1 class="font-heading">
                Colección de Esculturas
            </h1>
            
            <a href="https://wa.me/50687922758?text=Hola%20Daniel,%20estoy%20interesado%20en%20una%20obra%20de%20tu%20galería%20virtual"
               target="_blank"
               rel="noopener noreferrer"
               class="btn-primary">
                <i data-lucide="external-link"></i>
                <span class="hidden sm:inline">Contactar</span>
            </a>
        </div>
    </div>
</header>

            <!-- INTRO SECTION -->
            <section class="gallery-title-section">
                <div class="container">
                    <h2 class="font-heading text-3xl font-medium text-center mb-4">Esculturas en Madera</h2>
                    <p class="gallery-intro text-center">
                        Cada pieza es única, tallada a mano por Daniel utilizando técnicas
                        tradicionales de talla directa. Haz clic en cualquier escultura para ver
                        los detalles.
                    </p>
                </div>
            </section>

            <!-- GALLERY GRID -->
            <main>
                <div class="container">
                    <div class="gallery-grid">
                        ${sculptures.map(sculpture => `
                            <div class="sculpture-card cursor-pointer" data-sculpture-id="${sculpture.id}">
                                <div class="sculpture-image">
                                    <img src="${sculpture.image}" 
                                         alt="${sculpture.title}"
                                         loading="lazy">
                                </div>
                                <div class="sculpture-info">
                                    <h3 class="sculpture-name">${sculpture.title}</h3>
                                    <p class="sculpture-artist">${sculpture.artist}</p>
                                    <div class="sculpture-meta">
                                        <span class="meta-tag">${sculpture.year}</span>
                                        <span class="meta-tag">${sculpture.material}</span>
                                    </div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </main>

            <!-- FOOTER -->
            <footer class="main-footer">
                <div class="container">
                    <div class="footer-content">
                        <div class="footer-section">
                            <h3 class="font-heading text-xl font-medium">Galería Virtual</h3>
                            <p>
                                Una experiencia innovadora que fusiona arte tradicional con tecnología
                                de vanguardia.
                            </p>
                        </div>
                        
                        <div class="footer-section">
                            <h3 class="font-heading text-xl font-medium">Contacto</h3>
                            <p>Daniel Guido</p>
                            <p>Escultor costarricense</p>
                            <a href="https://wa.me/50687922758" 
                               target="_blank" 
                               rel="noopener noreferrer"
                               class="text-primary hover:underline block mt-2">
                                WhatsApp: +506 8792 2758
                            </a>
                        </div>
                        
                        <div class="footer-section">
                            <h3 class="font-heading text-xl font-medium">Tecnologías</h3>
                            <div class="tech-tags">
                                <span class="tech-tag">Next.js</span>
                                <span class="tech-tag">React</span>
                                <span class="tech-tag">WebAR</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="footer-bottom">
                        <p>© 2025 Galería Virtual. Todos los derechos reservados.</p>
                    </div>
                </div>
            </footer>
        `;
    }
}

// Inicializar la aplicación
document.addEventListener('DOMContentLoaded', () => {
    window.app = new App();
});

 


// Agregar estilos al DOM
const styleSheet = document.createElement("style");
document.head.appendChild(styleSheet);