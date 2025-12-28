// GALERÍA VIRTUAL AR - JavaScript Principal
// Implementación completa con detección de dispositivo, WebAR y controles de audio

// =============================================
// CONFIGURACIÓN Y DATOS DE LA GALERÍA
// =============================================

const galleryData = [
    {
        id: 1,
        title: "Formas Orgánicas I",
        artist: "Daniel Guido",
        year: "2023",
        material: "Bronce y mármol",
        description: "Una exploración de las formas naturales y su relación con el espacio tridimensional. La pieza representa la intersección entre lo orgánico y lo geométrico.",
        modelSrc: "https://modelviewer.dev/shared-assets/models/Astronaut.glb",
        audioSrc: "https://assets.mixkit.co/music/preview/mixkit-tech-house-vibes-130.mp3",
        audioTranscript: "En esta obra busqué capturar la esencia de las formas que encontramos en la naturaleza, pero reinterpretadas a través de un lenguaje escultórico contemporáneo. El bronce me permite crear superficies fluidas, mientras que el mármol aporta estabilidad y contraste.",
        arScale: "1 1 1",
        cameraOrbit: "45deg 55deg 2.5m",
        cameraTarget: "0m 0.5m 0m"
    },
    {
        id: 2,
        title: "Equilibrio Inestable",
        artist: "Daniel Guido",
        year: "2022",
        material: "Acero corten y vidrio",
        description: "Una reflexión sobre la fragilidad y la permanencia. La composición desafía las leyes de la gravedad mientras mantiene una armonía visual delicada.",
        modelSrc: "https://modelviewer.dev/shared-assets/models/NeilArmstrong.glb",
        audioSrc: "https://assets.mixkit.co/music/preview/mixkit-driving-ambition-32.mp3",
        audioTranscript: "Esta pieza surgió de mi fascinación por los momentos de transición. El acero corten, con su pátina natural, representa lo permanente, mientras que el vidrio simboliza la fragilidad. Juntos crean un diálogo entre resistencia y vulnerabilidad.",
        arScale: "0.8 0.8 0.8",
        cameraOrbit: "60deg 75deg 2m",
        cameraTarget: "0m 0.3m 0m"
    },
    {
        id: 3,
        title: "Memoria del Agua",
        artist: "Daniel Guido",
        year: "2023",
        material: "Resina y pigmentos naturales",
        description: "Inspirada en los movimientos fluidos del agua y su capacidad para moldear la tierra. La escultura captura un instante congelado del flujo continuo.",
        modelSrc: "https://modelviewer.dev/shared-assets/models/RobotExpressive.glb",
        audioSrc: "https://assets.mixkit.co/music/preview/mixkit-deep-urban-623.mp3",
        audioTranscript: "El agua tiene memoria, guarda la historia de todo lo que ha tocado. Con esta obra quise materializar esa idea usando resinas transparentes y pigmentos que recrean las capas sedimentarias. Cada ángulo revela una nueva profundidad.",
        arScale: "1.2 1.2 1.2",
        cameraOrbit: "30deg 45deg 3m",
        cameraTarget: "0m 0.7m 0m"
    }
];

// =============================================
// DETECCIÓN DE DISPOSITIVO Y COMPATIBILIDAD AR
// =============================================

class DeviceDetector {
    constructor() {
        this.deviceInfo = {
            type: 'desktop',
            arSupported: false,
            os: 'unknown',
            browser: 'unknown'
        };
        this.init();
    }

    init() {
        this.detectDeviceType();
        this.detectOS();
        this.detectBrowser();
        this.checkARSupport();
        this.updateUI();
    }

    detectDeviceType() {
        const userAgent = navigator.userAgent.toLowerCase();
        
        if (/mobile|android|iphone|ipad|ipod/.test(userAgent)) {
            this.deviceInfo.type = 'mobile';
        } else if (/tablet|ipad/.test(userAgent)) {
            this.deviceInfo.type = 'tablet';
        } else {
            this.deviceInfo.type = 'desktop';
        }
    }

    detectOS() {
        const userAgent = navigator.userAgent;
        
        if (/android/i.test(userAgent)) {
            this.deviceInfo.os = 'Android';
        } else if (/iphone|ipad|ipod/i.test(userAgent)) {
            this.deviceInfo.os = 'iOS';
        } else if (/macintosh|mac os x/i.test(userAgent)) {
            this.deviceInfo.os = 'macOS';
        } else if (/windows/i.test(userAgent)) {
            this.deviceInfo.os = 'Windows';
        } else if (/linux/i.test(userAgent)) {
            this.deviceInfo.os = 'Linux';
        }
    }

    detectBrowser() {
        const userAgent = navigator.userAgent;
        
        if (/chrome|crios/i.test(userAgent) && !/edg/i.test(userAgent)) {
            this.deviceInfo.browser = 'Chrome';
        } else if (/safari/i.test(userAgent) && !/chrome|crios/i.test(userAgent)) {
            this.deviceInfo.browser = 'Safari';
        } else if (/firefox|fxios/i.test(userAgent)) {
            this.deviceInfo.browser = 'Firefox';
        } else if (/edg/i.test(userAgent)) {
            this.deviceInfo.browser = 'Edge';
        }
    }

    checkARSupport() {
        // Detección básica de soporte AR
        const isMobile = this.deviceInfo.type === 'mobile' || this.deviceInfo.type === 'tablet';
        const isChrome = this.deviceInfo.browser === 'Chrome';
        const isSafari = this.deviceInfo.browser === 'Safari';
        const isAndroid = this.deviceInfo.os === 'Android';
        const isIOS = this.deviceInfo.os === 'iOS';
        
        // Verificación de soporte para model-viewer AR
        const supportsModelViewer = 'modelViewer' in window;
        
        // Criterios para AR:
        // - Android con Chrome (ARCore)
        // - iOS con Safari (ARKit)
        // - Y soporte para model-viewer
        if (supportsModelViewer) {
            if ((isAndroid && isChrome) || (isIOS && isSafari && parseInt(navigator.userAgent.match(/OS (\d+)_/i)?.[1] || 0) >= 12)) {
                this.deviceInfo.arSupported = true;
            }
        }
        
        // Para desarrollo/testing, permitir AR en desktop
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            this.deviceInfo.arSupported = true;
        }
    }

    updateUI() {
        const deviceInfoElement = document.getElementById('device-info');
        const compatibilityDetails = document.getElementById('compatibility-details');
        
        if (!deviceInfoElement) return;
        
        let deviceIcon, deviceText;
        
        switch(this.deviceInfo.type) {
            case 'mobile':
                deviceIcon = '📱';
                deviceText = this.deviceInfo.arSupported ? 
                    `Móvil compatible con AR (${this.deviceInfo.os})` : 
                    `Móvil - AR no disponible`;
                break;
            case 'tablet':
                deviceIcon = '📱';
                deviceText = this.deviceInfo.arSupported ? 
                    `Tablet compatible con AR (${this.deviceInfo.os})` : 
                    `Tablet - AR no disponible`;
                break;
            default:
                deviceIcon = '💻';
                deviceText = 'PC/Laptop - Usa vista 3D';
        }
        
        deviceInfoElement.innerHTML = `<i class="fas fa-${this.deviceInfo.type === 'desktop' ? 'desktop' : 'mobile-alt'}"></i> <span>${deviceText}</span>`;
        
        if (compatibilityDetails) {
            let compatibilityHTML = `
                <p><strong>Tipo:</strong> ${this.deviceInfo.type === 'mobile' ? 'Teléfono móvil' : this.deviceInfo.type === 'tablet' ? 'Tablet' : 'Computadora'}</p>
                <p><strong>Sistema:</strong> ${this.deviceInfo.os}</p>
                <p><strong>Navegador:</strong> ${this.deviceInfo.browser}</p>
                <p><strong>Realidad Aumentada:</strong> <span style="color: ${this.deviceInfo.arSupported ? '#25D366' : '#FF4757'}">${this.deviceInfo.arSupported ? 'Compatible ✓' : 'No compatible ✗'}</span></p>
            `;
            
            if (!this.deviceInfo.arSupported && (this.deviceInfo.type === 'mobile' || this.deviceInfo.type === 'tablet')) {
                compatibilityHTML += `<p class="compatibility-tip"><small>Consejo: Para usar AR, asegúrate de tener la última versión de ${this.deviceInfo.os === 'iOS' ? 'Safari' : 'Chrome'}</small></p>`;
            }
            
            compatibilityDetails.innerHTML = compatibilityHTML;
        }
        
        // Actualizar estado global para uso en otros módulos
        window.deviceInfo = this.deviceInfo;
    }

    getDeviceInfo() {
        return this.deviceInfo;
    }
}

// =============================================
// SISTEMA DE AUDIO PARA LAS ESCULTURAS
// =============================================

class AudioManager {
    constructor() {
        this.currentAudio = null;
        this.currentAudioId = null;
        this.audioElements = {};
        this.isPlaying = false;
    }

    createAudioElement(sculptureId, audioSrc) {
        const audio = new Audio(audioSrc);
        audio.preload = 'metadata';
        
        // Configurar eventos
        audio.addEventListener('loadedmetadata', () => {
            this.updateAudioDisplay(sculptureId, 0, audio.duration);
        });
        
        audio.addEventListener('timeupdate', () => {
            this.updateAudioDisplay(sculptureId, audio.currentTime, audio.duration);
        });
        
        audio.addEventListener('ended', () => {
            this.resetAudioControls(sculptureId);
        });
        
        this.audioElements[sculptureId] = audio;
        return audio;
    }

    playAudio(sculptureId) {
        // Si hay un audio reproduciéndose, detenerlo
        if (this.currentAudio && this.currentAudioId !== sculptureId) {
            this.pauseAudio(this.currentAudioId);
        }
        
        // Obtener o crear el elemento de audio
        let audio = this.audioElements[sculptureId];
        if (!audio) {
            const sculpture = galleryData.find(s => s.id === sculptureId);
            if (!sculpture) return;
            
            audio = this.createAudioElement(sculptureId, sculpture.audioSrc);
        }
        
        // Reproducir audio
        audio.play().then(() => {
            this.currentAudio = audio;
            this.currentAudioId = sculptureId;
            this.isPlaying = true;
            this.updatePlayButton(sculptureId, true);
        }).catch(error => {
            console.error('Error al reproducir audio:', error);
            // Fallback: mostrar transcripción si el audio falla
            this.showTranscript(sculptureId);
        });
    }

    pauseAudio(sculptureId) {
        const audio = this.audioElements[sculptureId];
        if (audio) {
            audio.pause();
            this.updatePlayButton(sculptureId, false);
            
            if (this.currentAudioId === sculptureId) {
                this.isPlaying = false;
            }
        }
    }

    toggleAudio(sculptureId) {
        if (this.currentAudioId === sculptureId && this.isPlaying) {
            this.pauseAudio(sculptureId);
        } else {
            this.playAudio(sculptureId);
        }
    }

    updatePlayButton(sculptureId, isPlaying) {
        const playBtn = document.querySelector(`#play-btn-${sculptureId}`);
        if (playBtn) {
            const icon = playBtn.querySelector('i');
            if (icon) {
                icon.className = isPlaying ? 'fas fa-pause' : 'fas fa-play';
            }
            playBtn.classList.toggle('playing', isPlaying);
        }
    }

    updateAudioDisplay(sculptureId, currentTime, duration) {
        const progressBar = document.querySelector(`#progress-bar-${sculptureId}`);
        const timeDisplay = document.querySelector(`#time-display-${sculptureId}`);
        
        if (progressBar) {
            const percentage = duration > 0 ? (currentTime / duration) * 100 : 0;
            progressBar.style.width = `${percentage}%`;
        }
        
        if (timeDisplay) {
            const formatTime = (seconds) => {
                const mins = Math.floor(seconds / 60);
                const secs = Math.floor(seconds % 60);
                return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
            };
            
            timeDisplay.textContent = `${formatTime(currentTime)} / ${formatTime(duration)}`;
        }
    }

    resetAudioControls(sculptureId) {
        const audio = this.audioElements[sculptureId];
        if (audio) {
            audio.currentTime = 0;
            this.updateAudioDisplay(sculptureId, 0, audio.duration);
            this.updatePlayButton(sculptureId, false);
            
            if (this.currentAudioId === sculptureId) {
                this.currentAudio = null;
                this.currentAudioId = null;
                this.isPlaying = false;
            }
        }
    }

    showTranscript(sculptureId) {
        const sculpture = galleryData.find(s => s.id === sculptureId);
        if (!sculpture) return;
        
        // Crear o mostrar elemento de transcripción
        let transcriptEl = document.querySelector(`#transcript-${sculptureId}`);
        
        if (!transcriptEl) {
            const audioControls = document.querySelector(`#audio-controls-${sculptureId}`);
            if (audioControls) {
                transcriptEl = document.createElement('div');
                transcriptEl.id = `transcript-${sculptureId}`;
                transcriptEl.className = 'audio-transcript';
                transcriptEl.textContent = sculpture.audioTranscript;
                audioControls.parentNode.insertBefore(transcriptEl, audioControls.nextSibling);
            }
        } else {
            transcriptEl.style.display = 'block';
        }
    }
}

// =============================================
// RENDERIZADO DE LA GALERÍA
// =============================================

class GalleryRenderer {
    constructor() {
        this.audioManager = new AudioManager();
        this.deviceDetector = null;
    }

    init() {
        this.deviceDetector = new DeviceDetector();
        this.renderGallery();
        this.initModal();
        this.setupEventListeners();
    }

    renderGallery() {
        const container = document.getElementById('sculptures-container');
        if (!container) return;
        
        container.innerHTML = '';
        
        galleryData.forEach(sculpture => {
            const sculptureCard = this.createSculptureCard(sculpture);
            container.appendChild(sculptureCard);
        });
    }

    createSculptureCard(sculpture) {
        const deviceInfo = window.deviceInfo || { arSupported: false };
        
        const card = document.createElement('article');
        card.className = 'sculpture-card';
        card.dataset.id = sculpture.id;
        
        // Determinar si mostrar botón AR
        const showARButton = deviceInfo.arSupported;
        
        card.innerHTML = `
            <div class="sculpture-media">
                <div class="model-viewer-container">
                    <model-viewer 
                        id="model-${sculpture.id}"
                        src="${sculpture.modelSrc}"
                        alt="${sculpture.title} - ${sculpture.artist}"
                        ar 
                        ar-modes="webxr scene-viewer quick-look"
                        camera-controls 
                        touch-action="pan-y"
                        camera-orbit="${sculpture.cameraOrbit}"
                        camera-target="${sculpture.cameraTarget}"
                        auto-rotate 
                        rotation-per-second="30deg"
                        shadow-intensity="1"
                        exposure="1"
                        environment-image="neutral"
                        style="width: 100%; height: 100%;">
                        
                        <div class="model-loading" slot="progress-bar">
                            <div class="loading-spinner"></div>
                            <p>Cargando modelo 3D...</p>
                        </div>
                        
                        <button slot="ar-button" class="model-ar-button" ${!showARButton ? 'style="display: none;"' : ''}>
                            Ver en Realidad Aumentada
                        </button>
                        
                        <div slot="ar-failure" style="text-align: center; padding: 10px;">
                            <p>AR no disponible en este dispositivo</p>
                        </div>
                    </model-viewer>
                </div>
            </div>
            
            <div class="sculpture-info">
                <h3 class="sculpture-title">${sculpture.title}</h3>
                <p class="sculpture-artist">${sculpture.artist}</p>
                <div class="sculpture-details">
                    <span>${sculpture.year}</span>
                    <span>${sculpture.material}</span>
                </div>
                <p class="sculpture-description">${sculpture.description}</p>
                
                <div class="audio-controls" id="audio-controls-${sculpture.id}">
                    <button class="audio-btn" id="play-btn-${sculpture.id}">
                        <i class="fas fa-play"></i>
                    </button>
                    <div class="audio-progress">
                        <div class="audio-progress-bar" id="progress-bar-${sculpture.id}"></div>
                    </div>
                    <div class="audio-time" id="time-display-${sculpture.id}">0:00 / 0:00</div>
                </div>
                
                <div class="action-buttons">
                    <button class="btn btn-ar ${showARButton ? '' : 'btn-disabled'}" 
                            id="ar-btn-${sculpture.id}"
                            ${!showARButton ? 'disabled' : ''}>
                        <i class="fas fa-cube"></i> ${showARButton ? 'Ver en Realidad Aumentada' : 'AR no disponible'}
                    </button>
                    
                    <a class="btn btn-whatsapp" 
                       href="https://wa.me/50612345678?text=Hola%20Daniel,%20estoy%20interesado%20en%20la%20obra%20"${encodeURIComponent(sculpture.title)}"%20de%20tu%20galería%20virtual.%20¿Podrías%20darme%20más%20información?"
                       target="_blank">
                        <i class="fab fa-whatsapp"></i> Consultar para compra
                    </a>
                </div>
            </div>
        `;
        
        // Configurar eventos después de crear el elemento
        setTimeout(() => {
            this.setupCardEvents(card, sculpture.id);
        }, 0);
        
        return card;
    }

    setupCardEvents(card, sculptureId) {
        // Botón de audio
        const playBtn = card.querySelector(`#play-btn-${sculptureId}`);
        if (playBtn) {
            playBtn.addEventListener('click', () => {
                this.audioManager.toggleAudio(sculptureId);
            });
        }
        
        // Botón AR personalizado
        const arBtn = card.querySelector(`#ar-btn-${sculptureId}`);
        if (arBtn && !arBtn.disabled) {
            arBtn.addEventListener('click', () => {
                this.activateAR(sculptureId);
            });
        }
        
        // Control de progreso de audio
        const progressBar = card.querySelector(`.audio-progress`);
        if (progressBar) {
            progressBar.addEventListener('click', (e) => {
                const audio = this.audioManager.audioElements[sculptureId];
                if (!audio) return;
                
                const rect = progressBar.getBoundingClientRect();
                const clickX = e.clientX - rect.left;
                const percentage = clickX / rect.width;
                audio.currentTime = percentage * audio.duration;
            });
        }
    }

    activateAR(sculptureId) {
        const modelViewer = document.querySelector(`#model-${sculptureId}`);
        if (modelViewer && modelViewer.activateAR) {
            modelViewer.activateAR();
        } else {
            // Fallback: mostrar instrucciones
            this.showARInstructions();
        }
    }

    showARInstructions() {
        const modal = document.getElementById('ar-modal');
        if (modal) {
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    }

    initModal() {
        const modal = document.getElementById('ar-modal');
        const closeBtn = document.getElementById('modal-close');
        const helpBtn = document.getElementById('ar-help-btn');
        
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                modal.classList.remove('active');
                document.body.style.overflow = 'auto';
            });
        }
        
        if (helpBtn) {
            helpBtn.addEventListener('click', () => {
                modal.classList.add('active');
                document.body.style.overflow = 'hidden';
            });
        }
        
        // Cerrar modal al hacer clic fuera
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.classList.remove('active');
                    document.body.style.overflow = 'auto';
                }
            });
        }
        
        // Enlace de privacidad
        const privacyLink = document.getElementById('privacy-link');
        if (privacyLink) {
            privacyLink.addEventListener('click', (e) => {
                e.preventDefault();
                alert("Política de privacidad: Esta galería no recopila datos personales. Los modelos 3D se cargan desde servidores externos. La funcionalidad AR requiere acceso a la cámara, pero no se almacenan imágenes ni videos.");
            });
        }
    }

    setupEventListeners() {
        // Detectar cambios en la orientación/ventana
        window.addEventListener('resize', () => {
            // Actualizar detección de dispositivo si es necesario
            if (window.deviceDetector) {
                window.deviceDetector.updateUI();
            }
        });
        
        // Mejorar manejo de teclado para accesibilidad
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                const modal = document.getElementById('ar-modal');
                if (modal && modal.classList.contains('active')) {
                    modal.classList.remove('active');
                    document.body.style.overflow = 'auto';
                }
            }
        });
    }
}

// =============================================
// INICIALIZACIÓN DE LA APLICACIÓN
// =============================================

document.addEventListener('DOMContentLoaded', () => {
    // Inicializar la galería
    const gallery = new GalleryRenderer();
    gallery.init();
    
    // Hacer disponible globalmente para depuración
    window.galleryApp = gallery;
    
    // Cargar Model Viewer si no está cargado
    if (typeof modelViewer === 'undefined') {
        console.warn('Model Viewer no se cargó correctamente. Verifica la conexión a Internet.');
        
        // Fallback: mostrar mensaje amigable
        const modelViewerContainers = document.querySelectorAll('.model-viewer-container');
        modelViewerContainers.forEach(container => {
            const fallbackMsg = document.createElement('div');
            fallbackMsg.style.padding = '20px';
            fallbackMsg.style.textAlign = 'center';
            fallbackMsg.style.backgroundColor = '#f8f8f8';
            fallbackMsg.innerHTML = `
                <h4>Vista 3D no disponible</h4>
                <p>El visor de modelos 3D no pudo cargarse. Por favor, verifica tu conexión a Internet.</p>
                <p>Puedes usar la función de Realidad Aumentada si tu dispositivo es compatible.</p>
            `;
            container.appendChild(fallbackMsg);
        });
    }
    
    // Inicializar tooltips para accesibilidad
    initAccessibilityFeatures();
});

// =============================================
// FUNCIONES AUXILIARES
// =============================================

function initAccessibilityFeatures() {
    // Añadir labels a los botones que no los tengan
    const audioButtons = document.querySelectorAll('.audio-btn');
    audioButtons.forEach(btn => {
        if (!btn.getAttribute('aria-label')) {
            btn.setAttribute('aria-label', 'Reproducir explicación de la obra');
        }
    });
    
    const arButtons = document.querySelectorAll('.btn-ar:not(.btn-disabled)');
    arButtons.forEach(btn => {
        if (!btn.getAttribute('aria-label')) {
            btn.setAttribute('aria-label', 'Ver esta obra en Realidad Aumentada');
        }
    });
    
    // Mejorar navegación por teclado
    document.addEventListener('keyup', (e) => {
        if (e.key === 'Tab') {
            // Asegurar que los elementos enfocados sean visibles
            const focused = document.activeElement;
            if (focused && focused.scrollIntoViewIfNeeded) {
                focused.scrollIntoViewIfNeeded({ behavior: 'smooth', block: 'nearest' });
            }
        }
    });
}

// Función para verificar la compatibilidad con Web Speech API (opcional)
function checkSpeechSupport() {
    if ('speechSynthesis' in window) {
        console.log('Web Speech API está soportada');
        return true;
    } else {
        console.log('Web Speech API no está soportada en este navegador');
        return false;
    }
}

// Exportar para uso en consola (depuración)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { DeviceDetector, AudioManager, GalleryRenderer };
}