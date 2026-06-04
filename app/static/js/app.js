// Configuración de lazy loading con Intersection Observer
const lazyLoadConfig = {
    root: null,
    rootMargin: '100px 0px 100px 0px',
    threshold: 0.01
};

// Estados de la aplicación
const AppState = {
    LOADING: 'loading',
    WELCOME: 'welcome',
    GALLERY: 'gallery',
    IMMERSIVE: 'immersive' 
};

// Datos de las esculturas 
let sculptures = [];
 
async function loadEsculturas() {
    try {
        const response = await fetch('/escultura/GetEsculturas', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
     
        
        sculptures = data.map(item => ({
            id: item.id,
            title: item.title,
            artist: item.artist,
            year: item.year,
            material: item.material,
            description: item.description,
            image: item.image
                ? (item.image.startsWith('http://') || item.image.startsWith('https://')
                    ? item.image
                    : URL_GALLERY + '/' + item.image)
                : URL_GALLERY + '/placeholder.jpg',
            alt: item.alt || item.title,
            width: item.width || 800,
            height: item.height || 600,
            audio: item.audio || null
        }));
        
        return sculptures;
        
    } catch (error) {
        console.error('[ERROR loadEsculturas]:', error);
        return [];
    }
}

 
// SISTEMA DE LAZY LOADING 

class LazyImageLoader {
    constructor() {
        this.observer = null;
        this.loadedImages = new Set();
        this.initObserver();
    }

    initObserver() {
        if ('IntersectionObserver' in window) {
            this.observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        this.loadImage(img);
                        this.observer.unobserve(img);
                    }
                });
            }, lazyLoadConfig);
        } else {
            this.loadAllImagesFallback();
        }
    }

    loadImage(imgElement) {
        if (this.loadedImages.has(imgElement)) return;
        
        const src = imgElement.dataset.src;
        
        if (src) {
            const tempImage = new Image();
            tempImage.onload = () => {
                imgElement.src = src;
                imgElement.classList.add('loaded');
                this.loadedImages.add(imgElement);
            };
            tempImage.onerror = () => {
                imgElement.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"><rect width="400" height="300" fill="%23f0f0f0"/><text x="200" y="150" text-anchor="middle" font-family="Arial" font-size="16" fill="%23999999">Imagen no disponible</text></svg>';
                imgElement.classList.add('loaded');
                this.loadedImages.add(imgElement);
            };
            tempImage.src = src;
        }
    }

    observeImages() {
        setTimeout(() => {
            const images = document.querySelectorAll('img[data-src]');
            images.forEach(img => {
                if (this.observer) {
                    this.observer.observe(img);
                } else {
                    this.loadImage(img);
                }
            });
        }, 100);
    }

    loadAllImagesFallback() {
        const images = document.querySelectorAll('img[data-src]');
        images.forEach(img => this.loadImage(img));
    }
}

 
// SISTEMA DE LIGHTBOX 

class GalleryLightbox {
    constructor(sculpturesArray) {
        this.sculptures = sculpturesArray;
        this.currentIndex = 0;
        this.isOpen = false;
        this.init();
    }

    init() {
        if (!document.getElementById('lightbox')) {
            this.createLightbox();
            this.setupEventListeners();
        }
    }

    createLightbox() {
        const lightboxHTML = `
            <div class="lightbox-overlay" id="lightbox" role="dialog" aria-modal="true" aria-label="Visor de esculturas">
                <div class="lightbox-content">
                    <button class="lightbox-close" id="lightbox-close" aria-label="Cerrar vista ampliada">
                        <i class="fas fa-times" aria-hidden="true"></i>
                        <span class="sr-only">Cerrar</span>
                    </button>
                    
                    <div class="lightbox-image-container" id="lightbox-image-container">
                        <div class="lightbox-loading" id="lightbox-loading" role="status" aria-label="Cargando imagen"></div>
                        <img id="lightbox-image" src="" alt="" loading="lazy">
                        
                        <div class="lightbox-controls">
                            <button class="lightbox-prev" id="lightbox-prev" aria-label="Imagen anterior">
                                <i class="fas fa-chevron-left" aria-hidden="true"></i>
                                <span class="sr-only">Anterior</span>
                            </button>
                            
                            <button class="lightbox-next" id="lightbox-next" aria-label="Siguiente imagen">
                                <i class="fas fa-chevron-right" aria-hidden="true"></i>
                                <span class="sr-only">Siguiente</span>
                            </button>
                        </div>
                    </div>
                    
                    <div class="lightbox-details">
                        <p class="lightbox-artist" id="lightbox-artist"></p>
                        <h2 class="lightbox-title" id="lightbox-title"></h2>
                        
                        <div class="lightbox-tags" id="lightbox-tags"></div>
                        
                        <p class="lightbox-description" id="lightbox-description"></p>
                        
                        <a href="#" class="lightbox-whatsapp" id="lightbox-whatsapp" target="_blank" rel="noopener noreferrer">
                            <i class="fab fa-whatsapp" aria-hidden="true"></i> Consultar por esta obra
                        </a>
                        
                        <div class="lightbox-counter" id="lightbox-counter" aria-live="polite">
                            1 / ${this.sculptures.length}
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', lightboxHTML);
    }

    setupEventListeners() {
        document.addEventListener('click', (e) => {
            const card = e.target.closest('.sculpture-card');
            if (card) {
                const id = parseInt(card.dataset.sculptureId);
                if (!isNaN(id)) {
                    const index = this.sculptures.findIndex(s => s.id === id);
                    if (index !== -1) this.open(index);
                }
            }
            
            const lightboxClose = document.getElementById('lightbox-close');
            const lightbox = document.getElementById('lightbox');
            
            if (e.target === lightboxClose || (e.target === lightbox && lightbox.classList.contains('active'))) {
                this.close();
            }
        });
        
        document.addEventListener('click', (e) => {
            if (e.target.closest('#lightbox-prev')) {
                this.prev();
            }
            if (e.target.closest('#lightbox-next')) {
                this.next();
            }
        });
        
        document.addEventListener('keydown', (e) => {
            if (!this.isOpen) return;
            
            switch(e.key) {
                case 'Escape': this.close(); break;
                case 'ArrowLeft': this.prev(); break;
                case 'ArrowRight': this.next(); break;
                default: return;
            }
            e.preventDefault();
        });
        
        const lightboxContainer = document.getElementById('lightbox-image-container');
        if (lightboxContainer) {
            let touchStartX = 0;
            
            lightboxContainer.addEventListener('touchstart', (e) => {
                touchStartX = e.changedTouches[0].clientX;
            }, { passive: true });
            
            lightboxContainer.addEventListener('touchend', (e) => {
                const touchEndX = e.changedTouches[0].clientX;
                const diff = touchStartX - touchEndX;
                if (Math.abs(diff) > 50) {
                    if (diff > 0) this.next();
                    else this.prev();
                }
            }, { passive: true });
        }
    }

    open(index) {
        this.currentIndex = index;
        this.update();
        const lightbox = document.getElementById('lightbox');
        lightbox.classList.add('active');
        this.isOpen = true;
        document.body.style.overflow = 'hidden';
    }

    close() {
        const lightbox = document.getElementById('lightbox');
        lightbox.classList.remove('active');
        this.isOpen = false;
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

    update() {
        const sculpture = this.sculptures[this.currentIndex];
        if (!sculpture) return;
        
        const loading = document.getElementById('lightbox-loading');
        const img = document.getElementById('lightbox-image');
        const container = document.getElementById('lightbox-image-container');
        
        if (loading) loading.style.display = 'block';
        if (container) container.classList.add('loading');
        
        const image = new Image();
        image.src = sculpture.image;
        image.alt = sculpture.alt || sculpture.title;
        
        image.onload = () => {
            if (img) {
                img.src = sculpture.image;
                img.alt = sculpture.alt || sculpture.title;
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
        const elements = {
            artist: document.getElementById('lightbox-artist'),
            title: document.getElementById('lightbox-title'),
            tags: document.getElementById('lightbox-tags'),
            description: document.getElementById('lightbox-description'),
            whatsapp: document.getElementById('lightbox-whatsapp'),
            counter: document.getElementById('lightbox-counter')
        };
        
        if (elements.artist) elements.artist.textContent = sculpture.artist;
        if (elements.title) elements.title.textContent = sculpture.title;
        
        if (elements.tags) {
            elements.tags.innerHTML = `
                <span class="lightbox-tag">${sculpture.year}</span>
                <span class="lightbox-tag">${sculpture.material}</span>
            `;
        }
        
        if (elements.description) elements.description.textContent = sculpture.description;
        
        if (elements.whatsapp) {
            elements.whatsapp.href = `https://wa.me/50660204266?text=Hola%20Daniel,%20estoy%20interesado%20en%20la%20obra%20%22${encodeURIComponent(sculpture.title)}%22`;
        }
        
        if (elements.counter) {
            elements.counter.textContent = `${this.currentIndex + 1} / ${this.sculptures.length}`;
        }
    }
}

 
// APLICACIÓN PRINCIPAL  

class App {
    constructor() {
        this.currentState = AppState.LOADING;
        this.appElement = document.getElementById('app');
        this.lightbox = null;
        this.lazyLoader = null;
        this.immersiveScene = null;
        this.quotesDisplay = null;
        this.cinematicCamera = null;
        this.soundAmbient = null;
        this._immersiveLoadId = 0;

        this.init();
    }

    async init() {
        // Cargar esculturas primero
        await loadEsculturas();
        
        // Mostrar loader y luego la welcome screen
        this.setupGlobalLoader();
    }

    setupGlobalLoader() {
        const loader = document.getElementById('global-loader');
        const progressBar = document.getElementById('loader-progress-bar');
        const statusText = document.getElementById('loader-status');
        
        const steps = [
            { progress: 25, status: "Cargando estructura de la galería..." },
            { progress: 50, status: "Preparando visualización..." },
            { progress: 75, status: "Cargando obras de arte..." },
            { progress: 100, status: "¡Galería lista!" }
        ];
        
        let currentStep = 0;
        
        const interval = setInterval(() => {
            if (currentStep < steps.length) {
                if (progressBar) progressBar.style.width = `${steps[currentStep].progress}%`;
                if (statusText) statusText.textContent = steps[currentStep].status;
                currentStep++;
            } else {
                clearInterval(interval);
                setTimeout(() => {
                    if (loader) {
                        loader.classList.add('hidden');
                        setTimeout(() => {
                            this.currentState = AppState.WELCOME;
                            this.render();
                        }, 300);
                    }
                }, 500);
            }
        }, 600);
    }

    setState(newState) {
        this.currentState = newState;
        this.render();
        
        setTimeout(() => {
            if (this.lazyLoader && this.currentState === AppState.GALLERY) {
                this.lazyLoader.observeImages();
            }
        }, 100);
    }

    attachEventListeners() {
        const galleryBtn = document.querySelector('[data-action="go-to-gallery"]');
        if (galleryBtn) {
            galleryBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.setState(AppState.GALLERY);
            });
        }
        
        const backBtn = document.querySelector('[data-action="go-back"]');
        if (backBtn) {
            backBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.setState(AppState.WELCOME);
            });
        }
        
        if (this.currentState === AppState.GALLERY && !this.lightbox) {
            this.lightbox = new GalleryLightbox(sculptures);
        }
        
        const arBtn = document.querySelector('[data-action="open-ar"]');
        if (arBtn) {
            arBtn.addEventListener('click', (e) => {
                e.preventDefault();
                const arModal = document.getElementById('ar-modal');
                if (arModal) arModal.classList.add('active');
            });
        }
        
        const closeButtons = document.querySelectorAll('[data-action="close-modal"]');
        closeButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.ar-modal, .lightbox-overlay').forEach(modal => {
                    modal.classList.remove('active');
                });
            });
        });
        const immersiveBtn = document.querySelector('[data-action="go-to-immersive"]');
    if (immersiveBtn) {
        immersiveBtn.addEventListener('click', (e) => {
            e.preventDefault();
            // Activar el modo inmersivo
            this.setState(AppState.IMMERSIVE);
        });
    }
    
    const exitImmersiveBtn = document.querySelector('[data-action="exit-immersive"]');
    if (exitImmersiveBtn) {
        exitImmersiveBtn.addEventListener('click', () => {
            if (this._igCleanup) {
                this._igCleanup();
                this._igCleanup = null;
            }
            if (this.immersiveScene) {
                this.immersiveScene.dispose();
                this.immersiveScene = null;
            }
            if (document.pointerLockElement) {
                document.exitPointerLock();
            }
            this.setState(AppState.WELCOME);
        });
    }
}

    render() {
        if (!this.appElement) return;

        if (this._igCleanup) {
            this._igCleanup();
            this._igCleanup = null;
        }
        if (this.immersiveScene) {
            this.immersiveScene.dispose();
            this.immersiveScene = null;
        }
        if (document.pointerLockElement) {
            document.exitPointerLock();
        }

        this.appElement.innerHTML = '';
        
        switch (this.currentState) {
            case AppState.WELCOME:
                this.renderWelcomeScreen();
                break;
            case AppState.GALLERY:
                this.renderGallery();
                break;
            case AppState.IMMERSIVE:
                this.renderImmersiveExperience();
                break;
        }
        
        this.attachEventListeners();
        
        if (this.currentState === AppState.GALLERY && !this.lazyLoader) {
            this.lazyLoader = new LazyImageLoader();
            this.lazyLoader.observeImages();
        }
        
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }

    renderWelcomeScreen() {
        this.appElement.innerHTML = `
            <main>
                <section class="hero-section">
                    <div class="container">
                        <div class="hero-content">
                            <p class="hero-subtitle">ESCULTOR COSTARRICENSE</p>
                            <h1 class="hero-title">Daniel Guido</h1>
                            <p class="hero-description">
                                Explora una colección única de esculturas talladas en madera.
                                Una fusión entre tradición artesanal y tecnología de vanguardia.
                            </p>
                            <div class="hero-features">
                                <div class="feature-item">
                                    <span class="feature-icon" aria-hidden="true">
                                        <i data-lucide="image"></i>
                                    </span>
                                    <span>Galería digital</span>
                                </div>
                                <div class="feature-item">
                                    <span class="feature-icon" aria-hidden="true">
                                        <i data-lucide="smartphone"></i>
                                    </span>
                                    <span>Realidad Aumentada</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section class="about-section">
                    <div class="container">
                        <div class="about-content">
                            <div class="about-image">
                                <img src="https://mapatico.com/gallery/soyDaniel.jpg" 
                                     alt="Daniel Guido, escultor costarricense trabajando en una escultura de madera"
                                     width="600"
                                     height="400"
                                     loading="eager">
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
             
                <section class="mode-section">
                    <div class="container">
                        <div class="mode-header">
                            <h2 class="font-heading text-3xl font-medium mb-4">Elige tu experiencia</h2>
                            <p class="mode-subtitle">
                                Selecciona cómo deseas explorar la colección de esculturas
                            </p>
                        </div>
                        
                        <div class="mode-cards">
                            <div class="mode-card">
                                <div class="mode-icon" aria-hidden="true">
                                    <i data-lucide="layout-grid"></i>
                                </div>
                                <h3 class="mode-card-title">Galería Clásica</h3>
                                <p class="mode-card-description">
                                    Explora todas las esculturas en formato de galería tradicional con
                                    imágenes de alta calidad y descripciones detalladas.
                                </p>
                                <a href="#" class="mode-card-link" data-action="go-to-gallery">
                                    Explorar galería
                                    <i data-lucide="arrow-right" aria-hidden="true"></i>
                                </a>
                            </div>
                            <div class="mode-card" style="border-color: rgba(201,169,110,0.3); background: linear-gradient(145deg, #fdfaf5 0%, #faf6ef 100%);">
                                <div class="mode-icon" style="background: linear-gradient(135deg, #c9a96e, #8b6914); color: #fff;">
                                    <i data-lucide="eye"></i>
                                </div>
                                <h3 class="mode-card-title">Experiencia Inmersiva</h3>
                                <p class="mode-card-description">
                                    Sumérgete en una galería virtual 3D donde recorres un pasillo 
                                    contemplativo. Contempla cada obra con iluminación ambiental.
                                </p>
                                <a href="#" class="mode-card-link" data-action="go-to-immersive" style="background: linear-gradient(125deg, #c9a96e, #a67c3d); color: #fff; border-color: transparent; box-shadow: 0 4px 16px rgba(201,169,110,0.25);">
                                    Comenzar experiencia
                                    <i data-lucide="sparkles" aria-hidden="true"></i>
                                </a>
                            </div>
                            <div class="mode-card coming-soon">
                                <div class="badge">
                                    <i data-lucide="construction" aria-hidden="true"></i>
                                    <span>En desarrollo</span>
                                </div>
                                <div class="mode-icon" aria-hidden="true">
                                    <i data-lucide="smartphone"></i>
                                </div>
                                <h3 class="mode-card-title">Realidad Aumentada</h3>
                                <p class="mode-card-description">
                                    Visualiza las esculturas en tu espacio físico utilizando la cámara
                                    de tu dispositivo móvil con tecnología WebAR.
                                </p>
                                <a href="#" class="mode-card-link coming-soon" data-action="open-ar">
                                    Próximamente
                                    <i data-lucide="smartphone" aria-hidden="true"></i>
                                </a>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

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
                            <a href="https://wa.me/50660204266" 
                               target="_blank" 
                               rel="noopener noreferrer"
                               class="text-primary hover:underline block mt-2">
                                WhatsApp: +506 6020 4266
                            </a>
                        </div>
                    </div>
                    
                    <div class="footer-bottom">
                        <p>
                            © 2026 Galería Virtual. Todos los derechos reservados. 
                            <span class="made-with-love">
                                Hecho con el ❤️ por <a href="https://logiclookcr.com" target="_blank" rel="noopener noreferrer">Logic Look</a>
                            </span>
                        </p>
                        <p style="font-size:0.7rem;margin-top:4px;color:rgba(255,255,255,0.35)">
                            Música de fondo: Gymnopedie No. 1 por Kevin MacLeod (Licencia CC BY 4.0)
                        </p>
                    </div>
                </div>
            </footer>

            <div id="ar-modal" class="ar-modal" role="dialog" aria-modal="true" aria-label="Realidad Aumentada">
                <div class="ar-modal-content">
                    <div class="ar-modal-icon" aria-hidden="true">
                        <i data-lucide="construction"></i>
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
        if (sculptures.length === 0) {
            this.appElement.innerHTML = `
                <div class="container text-center py-20">
                    <h2>No hay esculturas disponibles</h2>
                    <button class="btn-outline" data-action="go-back">Volver</button>
                </div>
            `;
            return;
        }
        
        this.appElement.innerHTML = `
            <header class="gallery-header">
                <div class="container">
                    <div class="gallery-header-content">
                        <button class="btn-outline" data-action="go-back" aria-label="Volver a página principal">
                            <i data-lucide="arrow-left" aria-hidden="true"></i>
                            <span class="hidden sm:inline">Volver</span>
                        </button>
                        
                        <h1 class="font-heading">Colección de Esculturas</h1>
                        
                        <a href="https://wa.me/50660204266?text=Hola%20Daniel,%20estoy%20interesado%20en%20una%20obra%20de%20tu%20galería%20virtual"
                           target="_blank"
                           rel="noopener noreferrer"
                           class="btn-primary">
                            <i data-lucide="external-link" aria-hidden="true"></i>
                            <span class="hidden sm:inline">Contactar</span>
                        </a>
                    </div>
                </div>
            </header>

            <section class="gallery-title-section">
                <div class="container">
                    <h2 class="font-heading text-3xl font-medium text-center mb-4">Esculturas en Madera</h2>
                    <p class="gallery-intro text-center">
                        Cada pieza es única, tallada a mano por mi persona utilizando técnicas
                        tradicionales de talla directa. Haz clic en cualquier escultura para ver
                        los detalles.
                    </p>
                </div>
            </section>

            <main>
                <div class="container">
                    <div class="gallery-grid">
                        ${sculptures.map(sculpture => `
                            <div class="sculpture-card" data-sculpture-id="${sculpture.id}" role="article">
                                <div class="sculpture-image">
                                    <img data-src="${sculpture.image}" 
                                         alt="${sculpture.alt || sculpture.title}"
                                         class="lazy-image"
                                         width="${sculpture.width || 400}"
                                         height="${sculpture.height || 300}">
                                    <noscript>
                                        <img src="${sculpture.image}" alt="${sculpture.title}">
                                    </noscript>
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
                            <a href="https://wa.me/50660204266" 
                               target="_blank" 
                               rel="noopener noreferrer"
                               class="text-primary hover:underline block mt-2">
                                WhatsApp: +506 6020 4266
                            </a>
                        </div>
                    </div>
                    
                    <div class="footer-bottom">
                        <p>
                            © 2026 Galería Virtual. Todos los derechos reservados. 
                            <span class="made-with-love">
                                Hecho con el ❤️ por <a href="https://logiclookcr.com" target="_blank" rel="noopener noreferrer">Logic Look</a>
                            </span>
                        </p>
                        <p style="font-size:0.7rem;margin-top:4px;color:rgba(255,255,255,0.35)">
                            Música de fondo: Gymnopedie No. 1 por Kevin MacLeod (Licencia CC BY 4.0)
                        </p>
                    </div>
                </div>
            </footer>
        `;
    }
    


async renderImmersiveExperience() {
    var loadId = ++this._immersiveLoadId;
    var data, invitadosData;
    try {
        var resp = await fetch('/escultura/GetEsculturas', { method: 'GET', headers: { 'Accept': 'application/json' } });
        data = await resp.json();
    } catch(e) {
        data = sculptures;
    }
    if (this._immersiveLoadId !== loadId) return;

    try {
        var respInv = await fetch('/escultura/GetInvitados', { method: 'GET', headers: { 'Accept': 'application/json' } });
        invitadosData = await respInv.json();
    } catch(e) {
        invitadosData = [];
    }
    if (this._immersiveLoadId !== loadId) return;
    if (!data || data.length === 0) {
        this.appElement.innerHTML = '<div style="color:#c9a96e;text-align:center;padding:4rem;">No hay esculturas disponibles. <button class="immersive-exit" data-action="exit-immersive" style="position:static;margin-top:1rem;border:1px solid #c9a96e;background:transparent;color:#c9a96e;padding:10px 20px;border-radius:8px;cursor:pointer;">Volver</button></div>';
        this.attachEventListeners();
        return;
    }
    var arts = data.map(function(item) {
        var url = item.image
            ? (item.image.startsWith('http://') || item.image.startsWith('https://') ? item.image : URL_GALLERY + '/' + item.image)
            : URL_GALLERY + '/placeholder.jpg';
        var audioUrl = item.audio
            ? (item.audio.startsWith('http://') || item.audio.startsWith('https://') ? item.audio : URL_AUDIO + '/' + item.audio)
            : null;
        return {
            id: item.id,
            title: item.title,
            artist: item.artist,
            year: item.year,
            material: item.material,
            description: item.description,
            image: url,
            audio: audioUrl,
            width: item.width || 800,
            height: item.height || 600,
            imgEl: null
        };
    });

    this.appElement.innerHTML =
    '<style id="immersive-inline-styles">' +
        '.imm-scene-wrap{position:fixed;top:0;left:0;width:100%;height:100%;z-index:2;background:#0a0a0a}' +
        '.imm-scene-wrap canvas{display:block;width:100%;height:100%}' +
        '.imm-hud{position:fixed;bottom:30px;left:50%;transform:translateX(-50%);z-index:10;background:rgba(0,0,0,0.7);backdrop-filter:blur(8px);padding:10px 20px;border-radius:20px;border:1px solid rgba(255,255,255,0.08);color:rgba(255,255,255,0.6);font-size:0.75rem;letter-spacing:1px;text-align:center;pointer-events:none;font-family:sans-serif}' +
        '.imm-hud kbd{display:inline-block;background:rgba(255,255,255,0.1);padding:1px 6px;border-radius:3px;margin:0 2px;font-size:0.7rem;color:#c9a96e}' +
        '.imm-ex{position:fixed;top:1.5rem;right:1.5rem;z-index:200;pointer-events:all;background:rgba(255,255,255,0.08);backdrop-filter:blur(10px);border:1px solid rgba(255,255,255,0.15);color:rgba(255,255,255,0.8);width:42px;height:42px;border-radius:50%;display:flex;align-items:center;justify-content:center;cursor:pointer;transition:all 0.4s;font-size:1.1rem;font-family:sans-serif}' +
        '.imm-ex:hover{background:rgba(255,255,255,0.15);color:#fff;transform:scale(1.08)}' +
        '@media(max-width:768px){.imm-hud{font-size:0.6rem;padding:6px 12px;bottom:15px}.imm-ex{top:0.8rem;right:0.8rem;width:36px;height:36px;font-size:0.9rem}}' +
        '.rg-over{position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.92);backdrop-filter:blur(12px);z-index:50;display:flex;align-items:center;justify-content:center;opacity:0;pointer-events:none;transition:opacity 0.6s ease}' +
        '.rg-over.activo{opacity:1;pointer-events:auto}' +
        '.rg-card{background:rgba(18,24,36,0.9);backdrop-filter:blur(18px);border:1px solid rgba(71,85,105,0.3);border-radius:2rem;padding:1.8rem 1.6rem;width:100%;max-width:380px;display:flex;flex-direction:column;align-items:center;box-shadow:0 30px 50px rgba(0,0,0,0.6);text-align:center}' +
        '.rg-card h2{font-size:1.5rem;color:#c9a96e;font-family:"Playfair Display",serif;margin-bottom:0.2rem}' +
        '.rg-card .rg-sub{color:#8b949e;font-size:0.82rem;margin-bottom:1rem}' +
        '.rg-img{width:100%;margin-bottom:1rem;border-radius:14px;overflow:hidden;border:2px solid rgba(201,169,110,0.3)}' +
        '.rg-img img{width:100%;display:block;max-height:200px;object-fit:cover}' +
        '.rg-btns{display:flex;gap:10px;width:100%}' +
        '.rg-dl{flex:1;background:linear-gradient(125deg,#c9a96e,#a67c3d);border:none;color:#0a0a0a;font-weight:600;font-size:1rem;padding:0.8rem 1.2rem;border-radius:3rem;cursor:pointer;box-shadow:0 8px 20px rgba(201,169,110,0.3);transition:transform 0.2s,box-shadow 0.25s;display:flex;align-items:center;justify-content:center;gap:0.3rem}' +
        '.rg-dl:hover{transform:translateY(-3px);box-shadow:0 14px 26px rgba(201,169,110,0.4)}' +
        '.rg-cl{min-width:90px;background:transparent;border:1px solid rgba(139,148,158,0.3);color:#8b949e;font-size:0.85rem;padding:0.8rem 1rem;border-radius:3rem;cursor:pointer;transition:all 0.3s}' +
        '.rg-cl:hover{color:#c9a96e;border-color:#c9a96e}' +
        '.pr-stage{position:relative;width:100%;margin-top:0.2rem;display:none}' +
        '.pr-stage.show{display:flex;flex-direction:column;align-items:center}' +
        '.pr-sky{position:relative;width:100%;height:160px;display:flex;justify-content:center;align-items:flex-end}' +
        '.pr-w{position:absolute;bottom:50px;left:50%;transform:translateX(-50%);width:60px;height:60px;filter:drop-shadow(0 6px 10px rgba(0,0,0,0.5));z-index:10}' +
        '.pr-w svg{width:100%;height:100%;display:block}' +
        '.pr-l{stroke:#c9a96e;stroke-width:1.8;stroke-dasharray:4 3;opacity:0;transition:opacity 0.25s}' +
        '.pr-c{fill:#c9a96e;stroke:#dccaa0;stroke-width:1.7;opacity:0;transition:opacity 0.2s}' +
        '.pr-a{fill:#e2e8f0;stroke:#c9a96e;stroke-width:2.2;stroke-linejoin:round;stroke-linecap:round}' +
        '.pr-ck{opacity:0;fill:none;stroke:#00e676;stroke-width:5.5;stroke-linecap:round;stroke-linejoin:round;transition:opacity 0.2s}' +
        '.pr-w.rising{animation:rgShootUp 0.7s cubic-bezier(0.33,1,0.68,1) forwards}' +
        '.pr-w.falling{animation:rgFloatDown 3.6s linear forwards,rgSway 1.3s ease-in-out infinite alternate}' +
        '.pr-w.falling .pr-l,.pr-w.falling .pr-c{opacity:1}' +
        '.pr-w.success .pr-a,.pr-w.success .pr-l,.pr-w.success .pr-c{opacity:0}' +
        '.pr-w.success .pr-ck{opacity:1;animation:rgPop 0.4s cubic-bezier(0.34,1.56,0.64,1) forwards}' +
        '@keyframes rgShootUp{0%{bottom:50px;transform:translateX(-50%) scale(1);opacity:1}85%{opacity:0.9}100%{bottom:145px;transform:translateX(-50%) scale(0.8);opacity:0}}' +
        '@keyframes rgFloatDown{0%{bottom:145px}100%{bottom:50px}}' +
        '@keyframes rgSway{0%{transform:translateX(-50%) rotate(-12deg)}100%{transform:translateX(-50%) rotate(12deg)}}' +
        '@keyframes rgPop{0%{transform:scale(0.6)}100%{transform:scale(1.15)}}' +
        '.pr-pc{width:100%;margin-top:0.4rem;display:none}' +
        '.pr-pc.show{display:block}' +
        '.pr-pt{background:#1e293b;height:5px;border-radius:20px;overflow:hidden}' +
        '.pr-pf{width:0%;height:100%;background:linear-gradient(90deg,#c9a96e,#e0c88e);border-radius:20px;transition:width 0.05s linear}' +
        '.pr-pm{display:flex;justify-content:space-between;align-items:center;margin-top:0.4rem;font-size:0.75rem}' +
        '.pr-pm span:first-child{color:#8191aa;text-transform:uppercase;letter-spacing:0.8px;font-weight:600}' +
        '.pr-pm span:last-child{color:#b9c7dd;font-weight:600}' +
        '@media(max-width:768px){.rg-card{padding:1.2rem 1rem;max-width:300px}.rg-card h2{font-size:1.2rem}.rg-img img{max-height:150px}}' +
        '@media(orientation:landscape) and (max-height:500px){.rg-card{max-height:95vh;overflow-y:auto;padding:0.8rem 1rem;max-width:280px}.rg-card h2{font-size:1rem;margin-bottom:0.1rem}.rg-sub{font-size:0.7rem;margin-bottom:0.5rem}.rg-img img{max-height:80px}.rg-btns{gap:6px}.rg-dl,.rg-cl{font-size:0.8rem;padding:0.55rem 0.8rem}.pr-sky{height:70px}.pr-w{width:30px;height:30px;bottom:20px}.pr-w.rising{animation-name:rgShootUpSm}.pr-w.falling{animation-name:rgFloatDownSm,rgSwaySm}@keyframes rgShootUpSm{0%{bottom:20px;transform:translateX(-50%) scale(1);opacity:1}85%{opacity:0.9}100%{bottom:58px;transform:translateX(-50%) scale(0.7);opacity:0}}@keyframes rgFloatDownSm{0%{bottom:58px}100%{bottom:20px}}@keyframes rgSwaySm{0%{transform:translateX(-50%) rotate(-10deg)}100%{transform:translateX(-50%) rotate(10deg)}}@keyframes rgPopSm{0%{transform:scale(0.5)}100%{transform:scale(1.05)}}.pr-w.success .pr-ck{animation-name:rgPopSm}.pr-pm{font-size:0.6rem;margin-top:0.15rem}.pr-pc{margin-top:0.15rem}.pr-pt{height:3px}}' +
        '#rotarMsgWrap{position:fixed;top:0;left:0;width:100%;height:100%;z-index:300;background:rgba(0,0,0,0.88);display:none;align-items:center;justify-content:center;flex-direction:column;font-family:sans-serif;pointer-events:all}' +
        '#rotarMsgWrap.show{display:flex}' +
        '#rotarMsgIcon{font-size:3rem;margin-bottom:1rem}' +
        '#rotarMsgTitle{color:#c9a96e;font-size:1.3rem;font-weight:600;margin-bottom:0.4rem}' +
        '#rotarMsgSub{color:rgba(255,255,255,0.5);font-size:0.85rem;margin-bottom:1.2rem}' +
        '#rotarMsgBtn{background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.15);color:rgba(255,255,255,0.7);padding:10px 24px;border-radius:2rem;font-size:0.85rem;cursor:pointer;transition:all 0.3s}' +
        '#rotarMsgBtn:hover{background:rgba(255,255,255,0.15);color:#fff}' +
    '</style>' +
    '<div id="rotarMsgWrap"><div id="rotarMsgIcon">📱</div><div id="rotarMsgTitle">Gira tu teléfono</div><div id="rotarMsgSub">La experiencia inmersiva se disfruta mejor en horizontal</div><button id="rotarMsgBtn">Entendido</button></div>' +
    '<div class="imm-scene-wrap" id="immersiveSceneContainer"></div>' +
    '<div class="imm-hud" id="immHudDesktop">Haz clic para mirar &nbsp;|&nbsp; <kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd> o flechas para caminar &nbsp;|&nbsp; Busca el regalo al final</div>' +
    '<div class="imm-hud" id="immHudMobile" style="display:none">Arrastra el joystick para caminar &nbsp;|&nbsp; Toca fuera para mirar &nbsp;|&nbsp; Busca el regalo al final</div>' +
    '<div class="rg-over" id="regaloOverlay">' +
        '<div class="rg-card">' +
            '<h2>Un regalo de agradecimiento</h2>' +
            '<p class="rg-sub">Gracias por visitar mi exposici\u00f3n. Recibe este obsequio con gratitud.</p>' +
            '<div class="rg-img"><img src="/static/images/regalo.jpeg" alt="Regalo de agradecimiento"></div>' +
            '<div class="rg-btns" id="regaloBtns">' +
                '<button class="rg-dl" id="regaloBtnDownload">Descargar Regalo</button>' +
                '<button class="rg-cl" id="regaloBtnClose">Cerrar</button>' +
            '</div>' +
            '<div class="pr-stage" id="parachuteStage">' +
                '<div class="pr-sky">' +
                    '<div class="pr-w" id="parachuteWidget">' +
                        '<svg viewBox="0 0 100 100"><g class="pr-l"><line x1="50" y1="54" x2="18" y2="36"/><line x1="50" y1="54" x2="35" y2="28"/><line x1="50" y1="54" x2="65" y2="28"/><line x1="50" y1="54" x2="82" y2="36"/></g><path class="pr-c" d="M18,36 C18,8 82,8 82,36 C70,30 60,36 50,30 C40,36 30,30 18,36 Z"/><g class="pr-a"><line x1="50" y1="46" x2="50" y2="74" stroke-width="7" stroke-linecap="round"/><polygon points="50,85 35,65 65,65"/></g><path class="pr-ck" d="M28,52 L44,68 L74,36"/></svg>' +
                    '</div>' +
                '</div>' +
                '<div class="pr-pc" id="regaloProgressContainer">' +
                    '<div class="pr-pt"><div class="pr-pf" id="regaloProgressFill"></div></div>' +
                    '<div class="pr-pm"><span id="regaloStatusLabel">Preparando...</span><span id="regaloPercentText">0%</span></div>' +
                '</div>' +
            '</div>' +
        '</div>' +
    '</div>' +
    '<button class="imm-ex" data-action="exit-immersive" aria-label="Salir">✕</button>';

    if (this._immersiveLoadId !== loadId) return;

    var self = this;
    var container = document.getElementById('immersiveSceneContainer');
    this._immersiveArts = arts;

    var loaded = 0;
    var total = arts.length;
    if (total === 0) {
        self._startImmersive(container, arts, invitadosData, loadId);
    } else {
        arts.forEach(function(a) {
            var i = new Image();
            i.onload = function() { loaded++; if (loaded === total) { self._startImmersive(container, arts, invitadosData, loadId); } };
            i.onerror = function() { loaded++; if (loaded === total) { self._startImmersive(container, arts, invitadosData, loadId); } };
            i.src = a.image;
        });
    }

    var isMobile = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    var hudDesktop = document.getElementById('immHudDesktop');
    var hudMobile = document.getElementById('immHudMobile');
    if (isMobile) {
        if (hudDesktop) hudDesktop.style.display = 'none';

        var hudTimer = null;
        function showHud() {
            if (!hudMobile) return;
            hudMobile.style.display = 'block';
            hudMobile.style.transition = 'none';
            hudMobile.style.opacity = '1';
            if (hudTimer) clearTimeout(hudTimer);
            hudTimer = setTimeout(function() {
                if (hudMobile) { hudMobile.style.transition = 'opacity 1.2s ease'; hudMobile.style.opacity = '0'; }
            }, 5000);
        }

        if (document.documentElement.requestFullscreen && !document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(function() {});
        }

        function checkOrientation() {
            var rw = document.getElementById('rotarMsgWrap');
            if (!rw) return;
            var ro = document.getElementById('regaloOverlay');
            if (ro && ro.classList.contains('activo')) return;
            if (window.innerHeight > window.innerWidth) {
                rw.classList.add('show');
            } else {
                rw.classList.remove('show');
                showHud();
            }
        }
        checkOrientation();
        window.addEventListener('resize', checkOrientation);
        window.addEventListener('orientationchange', function() { setTimeout(checkOrientation, 200); });

        var rotarBtn = document.getElementById('rotarMsgBtn');
        if (rotarBtn) {
            rotarBtn.addEventListener('click', function() {
                document.getElementById('rotarMsgWrap').classList.remove('show');
                showHud();
            });
        }
    }

    this._igCleanup = function() {
        if (self.immersiveScene) {
            self.immersiveScene.dispose();
            self.immersiveScene = null;
        }
        var rw = document.getElementById('rotarMsgWrap');
        if (rw && rw.parentNode) rw.parentNode.removeChild(rw);
        var hd = document.getElementById('immHudDesktop');
        if (hd && hd.parentNode) hd.parentNode.removeChild(hd);
        var hm = document.getElementById('immHudMobile');
        if (hm && hm.parentNode) hm.parentNode.removeChild(hm);
    };

    this.attachEventListeners();

    if (document.getElementById('regaloBtnClose')) {
        document.getElementById('regaloBtnClose').addEventListener('click', function() {
            document.getElementById('regaloOverlay').classList.remove('activo');
        });
    }

    if (document.getElementById('regaloBtnDownload')) {
        document.getElementById('regaloBtnDownload').addEventListener('click', function() {
            var parachuteStage = document.getElementById('parachuteStage');
            var parachuteWidget = document.getElementById('parachuteWidget');
            var progressFill = document.getElementById('regaloProgressFill');
            var percentText = document.getElementById('regaloPercentText');
            var statusLabel = document.getElementById('regaloStatusLabel');
            var progressContainer = document.getElementById('regaloProgressContainer');
            var regaloBtns = document.getElementById('regaloBtns');

            regaloBtns.style.display = 'none';
            parachuteStage.classList.add('show');
            progressContainer.classList.add('show');
            parachuteWidget.classList.remove('rising', 'falling', 'success');
            progressFill.style.width = '0%'; percentText.textContent = '0%';
            statusLabel.textContent = 'Preparando...'; statusLabel.style.color = '#8191aa';
            void parachuteWidget.offsetWidth;

            parachuteWidget.classList.add('rising');

            setTimeout(function() {
                parachuteWidget.classList.remove('rising');
                parachuteWidget.classList.add('falling');
                statusLabel.textContent = 'Descargando...';
                var progress = 0;
                var animDuration = 3800, intervalStep = 45;
                var increment = 100 / (animDuration / intervalStep);
                var progressInterval = setInterval(function() {
                    progress += increment;
                    if (progress >= 100) {
                        progress = 100; clearInterval(progressInterval);
                        progressFill.style.width = '100%'; percentText.textContent = '100%';
                        setTimeout(function() {
                            parachuteWidget.classList.remove('falling');
                            parachuteWidget.classList.add('success');
                            statusLabel.textContent = 'Completado'; statusLabel.style.color = '#00e676';
                            window._galeriaRegaloEntregado = true;
                            if (self.immersiveScene && self.immersiveScene.hideGiftPanel) {
                                self.immersiveScene.hideGiftPanel();
                            }
                            var a = document.createElement('a');
                            a.href = '/static/images/regalo.jpeg';
                            a.download = 'regalo-daniel-guido.jpeg';
                            document.body.appendChild(a);
                            a.click();
                            document.body.removeChild(a);
                            setTimeout(function() {
                                parachuteWidget.classList.remove('success');
                                document.getElementById('regaloOverlay').classList.remove('activo');
                                regaloBtns.style.display = 'flex';
                                parachuteStage.classList.remove('show');
                                progressContainer.classList.remove('show');
                                progressFill.style.width = '0%';
                                percentText.textContent = '0%';
                            }, 2000);
                        }, 80);
                    } else {
                        progressFill.style.width = progress + '%';
                        percentText.textContent = Math.floor(progress) + '%';
                    }
                }, intervalStep);
            }, 700);
        });
    }
}

_startImmersive(container, arts, invitadosData, loadId) {
    if (this._immersiveLoadId !== loadId) return;
    var app = this;
    this.immersiveScene = new ImmersiveScene(container, arts, invitadosData);
    this._igCleanup = function() {
        if (app.immersiveScene) {
            app.immersiveScene.dispose();
            app.immersiveScene = null;
        }
        var rw = document.getElementById('rotarMsgWrap');
        if (rw && rw.parentNode) rw.parentNode.removeChild(rw);
        var hd = document.getElementById('immHudDesktop');
        if (hd && hd.parentNode) hd.parentNode.removeChild(hd);
        var hm = document.getElementById('immHudMobile');
        if (hm && hm.parentNode) hm.parentNode.removeChild(hm);
    };
}

_initCanvasImmersiveGallery() {}
}
 
// INICIALIZACIÓN 

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.app = new App();
    });
} else {
    window.app = new App();
}