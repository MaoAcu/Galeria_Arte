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
    GALLERY: 'gallery'
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
            image: item.image.startsWith('http') ? item.image : `/static/images/esculturas/${item.image}`,
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
            this.attachEventListeners();
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
    }

    render() {
        if (!this.appElement) return;
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
                                    <i data-lucide="image"></i>
                                </div>
                                <h3 class="mode-card-title font-heading text-2xl font-medium">Galería Normal</h3>
                                <p class="mode-card-description">
                                    Explora todas las esculturas en formato de galería tradicional con
                                    imágenes de alta calidad y descripciones detalladas.
                                </p>
                                <a href="#" class="mode-card-link" data-action="go-to-gallery">
                                    Explorar galería
                                    <i data-lucide="arrow-right" aria-hidden="true"></i>
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
                                <h3 class="mode-card-title font-heading text-2xl font-medium">Realidad Aumentada</h3>
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
                    </div>
                </div>
            </footer>
        `;
    }
}
 
// INICIALIZACIÓN 

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.app = new App();
    });
} else {
    window.app = new App();
}