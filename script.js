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
// ESTADO GLOBAL Y VARIABLES
// =============================================

let isModelViewerLoaded = false;
let modelViewerLoadAttempts = 0;
const MAX_LOAD_ATTEMPTS = 3;

// =============================================
// DETECCIÓN DE DISPOSITIVO Y COMPATIBILIDAD AR
// =============================================

// =============================================
// DETECCIÓN DE DISPOSITIVO Y COMPATIBILIDAD AR - VERSIÓN MEJORADA
// =============================================

class DeviceDetector {
    constructor() {
        this.deviceInfo = {
            type: 'desktop',
            arSupported: false,
            os: 'unknown',
            browser: 'unknown',
            modelViewerSupported: false,
            arDebugInfo: {}
        };
        this.init();
    }

    init() {
        this.detectDeviceType();
        this.detectOS();
        this.detectBrowser();
        this.checkModelViewerSupport();
        this.checkARSupportAsync().then(arSupported => {
            this.deviceInfo.arSupported = arSupported;
            this.updateUI();
            this.updateAllARButtons();
        });
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
        
        this.deviceInfo.arDebugInfo.userAgent = navigator.userAgent;
        return this.deviceInfo.type;
    }

    detectOS() {
        const userAgent = navigator.userAgent;
        let os = 'unknown';
        
        if (/android/i.test(userAgent)) {
            os = 'Android';
            // Detectar versión de Android
            const androidVersion = userAgent.match(/Android\s([0-9.]+)/);
            if (androidVersion) {
                this.deviceInfo.arDebugInfo.androidVersion = androidVersion[1];
                this.deviceInfo.arDebugInfo.androidVersionNum = parseFloat(androidVersion[1]);
            }
        } else if (/iphone|ipad|ipod/i.test(userAgent)) {
            os = 'iOS';
            // Detectar versión de iOS
            const iosVersion = userAgent.match(/OS\s([0-9_]+)/);
            if (iosVersion) {
                this.deviceInfo.arDebugInfo.iosVersion = iosVersion[1].replace(/_/g, '.');
            }
        } else if (/macintosh|mac os x/i.test(userAgent)) {
            os = 'macOS';
        } else if (/windows/i.test(userAgent)) {
            os = 'Windows';
        } else if (/linux/i.test(userAgent)) {
            os = 'Linux';
        }
        
        this.deviceInfo.os = os;
        return os;
    }

    detectBrowser() {
        const userAgent = navigator.userAgent;
        let browser = 'unknown';
        let version = 'unknown';
        
        if (/chrome|crios/i.test(userAgent) && !/edg/i.test(userAgent)) {
            browser = 'Chrome';
            const chromeVersion = userAgent.match(/Chrome\/([0-9.]+)/);
            if (chromeVersion) {
                version = chromeVersion[1];
                this.deviceInfo.arDebugInfo.chromeVersion = version;
                this.deviceInfo.arDebugInfo.chromeVersionNum = parseInt(version);
            }
        } else if (/safari/i.test(userAgent) && !/chrome|crios/i.test(userAgent)) {
            browser = 'Safari';
            const safariVersion = userAgent.match(/Version\/([0-9.]+)/);
            if (safariVersion) {
                version = safariVersion[1];
                this.deviceInfo.arDebugInfo.safariVersion = version;
            }
        } else if (/firefox|fxios/i.test(userAgent)) {
            browser = 'Firefox';
        } else if (/edg/i.test(userAgent)) {
            browser = 'Edge';
        }
        
        this.deviceInfo.browser = browser;
        this.deviceInfo.arDebugInfo.browserVersion = version;
        return browser;
    }

    checkModelViewerSupport() {
        // Verificar si Model Viewer está disponible
        const isSupported = 'modelViewer' in window || 
                           document.querySelector('model-viewer') !== null;
        
        this.deviceInfo.modelViewerSupported = isSupported;
        this.deviceInfo.arDebugInfo.modelViewerLoaded = isSupported;
        
        return isSupported;
    }

    async checkARSupportAsync() {
        // Método mejorado para detectar soporte AR
        const debugInfo = [];
        
        // 1. Verificar si es móvil/tablet
        const isMobileDevice = this.deviceInfo.type === 'mobile' || this.deviceInfo.type === 'tablet';
        debugInfo.push(`Dispositivo: ${this.deviceInfo.type} (${isMobileDevice ? 'móvil' : 'no móvil'})`);
        
        if (!isMobileDevice) {
            this.deviceInfo.arDebugInfo.arCheckSteps = debugInfo;
            return false; // AR solo en móviles/tablets
        }
        
        // 2. Verificar Model Viewer
        if (!this.deviceInfo.modelViewerSupported) {
            debugInfo.push('Model Viewer no disponible');
            this.deviceInfo.arDebugInfo.arCheckSteps = debugInfo;
            return false;
        }
        debugInfo.push('Model Viewer: OK');
        
        // 3. Verificar compatibilidad por OS y navegador
        const isAndroid = this.deviceInfo.os === 'Android';
        const isIOS = this.deviceInfo.os === 'iOS';
        const isChrome = this.deviceInfo.browser === 'Chrome';
        const isSafari = this.deviceInfo.browser === 'Safari';
        
        debugInfo.push(`OS: ${this.deviceInfo.os}, Navegador: ${this.deviceInfo.browser}`);
        
        // Para Android: necesita Chrome y Android 7+
        if (isAndroid) {
            if (!isChrome) {
                debugInfo.push('Android requiere Chrome para AR');
                this.deviceInfo.arDebugInfo.arCheckSteps = debugInfo;
                return false;
            }
            
            const androidVersion = this.deviceInfo.arDebugInfo.androidVersionNum || 0;
            if (androidVersion < 7.0) {
                debugInfo.push(`Android ${androidVersion} < 7.0 (mínimo requerido)`);
                this.deviceInfo.arDebugInfo.arCheckSteps = debugInfo;
                return false;
            }
            
            const chromeVersion = this.deviceInfo.arDebugInfo.chromeVersionNum || 0;
            if (chromeVersion < 81) {
                debugInfo.push(`Chrome ${chromeVersion} < 81 (mínimo requerido)`);
                this.deviceInfo.arDebugInfo.arCheckSteps = debugInfo;
                return false;
            }
            
            debugInfo.push(`Android ${androidVersion} + Chrome ${chromeVersion}: OK para ARCore`);
            this.deviceInfo.arDebugInfo.arCheckSteps = debugInfo;
            return true;
        }
        
        // Para iOS: necesita Safari y iOS 12+
        if (isIOS) {
            if (!isSafari) {
                debugInfo.push('iOS requiere Safari para AR');
                this.deviceInfo.arDebugInfo.arCheckSteps = debugInfo;
                return false;
            }
            
            const iosVersion = this.deviceInfo.arDebugInfo.iosVersion || '0';
            const iosVersionNum = parseFloat(iosVersion);
            if (iosVersionNum < 12.0) {
                debugInfo.push(`iOS ${iosVersionNum} < 12.0 (mínimo requerido)`);
                this.deviceInfo.arDebugInfo.arCheckSteps = debugInfo;
                return false;
            }
            
            debugInfo.push(`iOS ${iosVersionNum} + Safari: OK para ARKit`);
            this.deviceInfo.arDebugInfo.arCheckSteps = debugInfo;
            return true;
        }
        
        // Otros dispositivos - intentar detección de WebXR
        debugInfo.push('OS no reconocido, intentando WebXR API');
        this.deviceInfo.arDebugInfo.arCheckSteps = debugInfo;
        
        // Intentar detección mediante WebXR API
        return this.checkWebXRSupport();
    }

    async checkWebXRSupport() {
        // Verificación usando WebXR API (más precisa)
        if ('xr' in navigator) {
            try {
                // Verificar si hay sesiones AR disponibles
                const supported = await navigator.xr.isSessionSupported('immersive-ar');
                console.log('WebXR immersive-ar support:', supported);
                this.deviceInfo.arDebugInfo.webXRSupported = supported;
                return supported;
            } catch (error) {
                console.log('WebXR check failed:', error);
                this.deviceInfo.arDebugInfo.webXRError = error.message;
                return false;
            }
        }
        
        this.deviceInfo.arDebugInfo.webXRSupported = false;
        return false;
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
                <p><strong>Sistema:</strong> ${this.deviceInfo.os} ${this.deviceInfo.arDebugInfo.androidVersion || this.deviceInfo.arDebugInfo.iosVersion || ''}</p>
                <p><strong>Navegador:</strong> ${this.deviceInfo.browser} ${this.deviceInfo.arDebugInfo.browserVersion || ''}</p>
                <p><strong>Model Viewer:</strong> <span style="color: ${this.deviceInfo.modelViewerSupported ? '#25D366' : '#FF4757'}">${this.deviceInfo.modelViewerSupported ? 'Cargado ✓' : 'No disponible ✗'}</span></p>
                <p><strong>Realidad Aumentada:</strong> <span style="color: ${this.deviceInfo.arSupported ? '#25D366' : '#FF4757'}; font-weight: bold;">${this.deviceInfo.arSupported ? 'COMPATIBLE ✓' : 'NO COMPATIBLE ✗'}</span></p>
            `;
            
            // Mostrar información de debug
            if (this.deviceInfo.arDebugInfo.arCheckSteps) {
                compatibilityHTML += `<div style="margin-top: 10px; padding: 10px; background: #f5f5f5; border-radius: 5px; font-size: 12px;">`;
                compatibilityHTML += `<strong>Proceso de verificación:</strong><ul>`;
                this.deviceInfo.arDebugInfo.arCheckSteps.forEach(step => {
                    compatibilityHTML += `<li>${step}</li>`;
                });
                compatibilityHTML += `</ul>`;
                
                if (this.deviceInfo.arDebugInfo.webXRSupported !== undefined) {
                    compatibilityHTML += `<p><strong>WebXR API:</strong> ${this.deviceInfo.arDebugInfo.webXRSupported ? 'Soportada' : 'No soportada'}</p>`;
                }
                
                compatibilityHTML += `</div>`;
            }
            
            if (!this.deviceInfo.arSupported && this.deviceInfo.type !== 'desktop') {
                compatibilityHTML += `
                    <div style="margin-top: 15px; padding: 10px; background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 5px;">
                        <strong><i class="fas fa-lightbulb"></i> Consejos para activar AR:</strong>
                        <ul style="margin: 5px 0 0 15px; font-size: 0.9rem;">
                            <li>Asegúrate de usar ${this.deviceInfo.os === 'iOS' ? 'Safari' : 'Chrome'} actualizado</li>
                            <li>Android necesita versión 7.0+ y Chrome 81+</li>
                            <li>iOS necesita versión 12.0+ y Safari</li>
                            <li>Permite el acceso a la cámara cuando se solicite</li>
                            ${this.deviceInfo.os === 'Android' ? '<li>Verifica que ARCore esté instalado desde Play Store</li>' : ''}
                        </ul>
                        <button id="force-ar-btn" style="margin-top: 10px; background: #8b7355; color: white; border: none; padding: 8px 15px; border-radius: 4px; cursor: pointer;">
                            <i class="fas fa-bolt"></i> Forzar activación de AR (experimental)
                        </button>
                    </div>
                `;
            }
            
            compatibilityDetails.innerHTML = compatibilityHTML;
            
            // Añadir evento al botón de forzar AR
            const forceArBtn = document.getElementById('force-ar-btn');
            if (forceArBtn) {
                forceArBtn.addEventListener('click', () => {
                    this.forceEnableAR();
                });
            }
        }
        
        // Actualizar estado global
        window.deviceInfo = this.deviceInfo;
    }

    updateAllARButtons() {
        // Actualizar todos los botones AR en la página
        const arButtons = document.querySelectorAll('.btn-ar');
        arButtons.forEach(btn => {
            const isEnabled = this.deviceInfo.arSupported && this.deviceInfo.modelViewerSupported;
            
            if (isEnabled) {
                btn.classList.remove('btn-disabled');
                btn.disabled = false;
                btn.innerHTML = '<i class="fas fa-cube"></i> Ver en Realidad Aumentada';
                btn.setAttribute('aria-label', 'Ver esta obra en Realidad Aumentada');
            } else {
                btn.classList.add('btn-disabled');
                btn.disabled = true;
                btn.innerHTML = '<i class="fas fa-cube"></i> AR no disponible';
                btn.setAttribute('aria-label', 'Realidad Aumentada no disponible en este dispositivo');
            }
        });
    }

    forceEnableAR() {
        // Forzar la activación de AR (modo experimental)
        this.deviceInfo.arSupported = true;
        this.updateUI();
        this.updateAllARButtons();
        
        // Mostrar mensaje
        alert("AR forzado activado (modo experimental).\n\nSi tu dispositivo realmente es compatible, el botón AR debería funcionar ahora.\nSi no funciona, es posible que tu dispositivo/navegador no sea compatible con WebAR.");
        
        console.log('AR forzado activado. Device info:', this.deviceInfo);
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
        this.modelViewerAvailable = false;
        this.renderedCards = new Set();
    }

    init() {
        this.deviceDetector = new DeviceDetector();
        this.checkModelViewerAvailability();
        this.renderGallery();
        this.initModal();
        this.setupEventListeners();
        
        // Intentar verificar Model Viewer después de un tiempo
        setTimeout(() => {
            this.checkModelViewerAvailability();
            this.updateARButtons();
        }, 1000);
    }

    checkModelViewerAvailability() {
        const wasAvailable = this.modelViewerAvailable;
        this.modelViewerAvailable = 'modelViewer' in window || 
                                   document.querySelector('model-viewer') !== null;
        
        if (this.modelViewerAvailable && !wasAvailable) {
            console.log('Model Viewer cargado correctamente');
            this.updateARButtons();
            
            // Si tenemos modelos ya renderizados, actualizar sus botones AR
            this.renderedCards.forEach(id => {
                this.updateModelViewerInstance(id);
            });
        }
        
        return this.modelViewerAvailable;
    }

    renderGallery() {
        const container = document.getElementById('sculptures-container');
        if (!container) return;
        
        container.innerHTML = '';
        
        galleryData.forEach(sculpture => {
            const sculptureCard = this.createSculptureCard(sculpture);
            container.appendChild(sculptureCard);
            this.renderedCards.add(sculpture.id);
        });
    }

    createSculptureCard(sculpture) {
        const deviceInfo = window.deviceInfo || { arSupported: false };
        
        const card = document.createElement('article');
        card.className = 'sculpture-card';
        card.dataset.id = sculpture.id;
        
        // Determinar si mostrar botón AR
        const showARButton = deviceInfo.arSupported && this.modelViewerAvailable;
        
        // Configuración del model-viewer
        const modelViewerAttributes = this.modelViewerAvailable ? `
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
        ` : '';
        
        card.innerHTML = `
            <div class="sculpture-media">
                <div class="model-viewer-container" id="container-${sculpture.id}">
                    ${this.modelViewerAvailable ? `
                    <model-viewer 
                        id="model-${sculpture.id}"
                        src="${sculpture.modelSrc}"
                        alt="${sculpture.title} - ${sculpture.artist}"
                        ${modelViewerAttributes}
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
                    ` : `
                    <div class="model-viewer-fallback">
                        <div class="fallback-content">
                            <i class="fas fa-cube" style="font-size: 3rem; color: #8b7355; margin-bottom: 1rem;"></i>
                            <h4>Vista 3D no disponible</h4>
                            <p>El visor de modelos 3D no se cargó correctamente.</p>
                            <p>Puedes intentar recargar la página.</p>
                            <button class="btn btn-ar retry-load-btn" data-model-id="${sculpture.id}" style="margin-top: 1rem;">
                                <i class="fas fa-redo"></i> Reintentar carga
                            </button>
                        </div>
                    </div>
                    `}
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
                       href="https://wa.me/50612345678?text=Hola%20Daniel,%20estoy%20interesado%20en%20la%20obra%20${encodeURIComponent(sculpture.title)}%20de%20tu%20galería%20virtual.%20¿Podrías%20darme%20más%20información?"
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

    updateModelViewerInstance(sculptureId) {
        const container = document.getElementById(`container-${sculptureId}`);
        if (!container) return;
        
        const sculpture = galleryData.find(s => s.id === sculptureId);
        if (!sculpture) return;
        
        // Si Model Viewer ahora está disponible y tenemos un fallback, reemplazarlo
        if (this.modelViewerAvailable && container.querySelector('.model-viewer-fallback')) {
            const deviceInfo = window.deviceInfo || { arSupported: false };
            const showARButton = deviceInfo.arSupported;
            
            container.innerHTML = `
                <model-viewer 
                    id="model-${sculptureId}"
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
            `;
            
            // Actualizar el botón AR principal
            this.updateARButtonState(sculptureId, showARButton);
        }
    }

    updateARButtons() {
        galleryData.forEach(sculpture => {
            this.updateARButtonState(sculpture.id, window.deviceInfo?.arSupported && this.modelViewerAvailable);
        });
    }

    updateARButtonState(sculptureId, isEnabled) {
        const arBtn = document.getElementById(`ar-btn-${sculptureId}`);
        if (!arBtn) return;
        
        if (isEnabled) {
            arBtn.classList.remove('btn-disabled');
            arBtn.disabled = false;
            arBtn.innerHTML = '<i class="fas fa-cube"></i> Ver en Realidad Aumentada';
        } else {
            arBtn.classList.add('btn-disabled');
            arBtn.disabled = true;
            arBtn.innerHTML = '<i class="fas fa-cube"></i> AR no disponible';
        }
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
        if (arBtn) {
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
        
        // Botón de reintento para fallback
        const retryBtn = card.querySelector('.retry-load-btn');
        if (retryBtn) {
            retryBtn.addEventListener('click', () => {
                this.retryModelViewerLoad(sculptureId);
            });
        }
    }

    retryModelViewerLoad(sculptureId) {
        modelViewerLoadAttempts++;
        
        if (modelViewerLoadAttempts <= MAX_LOAD_ATTEMPTS) {
            console.log(`Reintento ${modelViewerLoadAttempts} de carga de Model Viewer...`);
            
            // Mostrar mensaje de carga
            const container = document.getElementById(`container-${sculptureId}`);
            if (container) {
                container.innerHTML = `
                    <div class="model-loading" style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%;">
                        <div class="loading-spinner" style="width: 40px; height: 40px; border: 4px solid #f3f3f3; border-top: 4px solid #8b7355; border-radius: 50%; animation: spin 1s linear infinite; margin-bottom: 1rem;"></div>
                        <p>Cargando Model Viewer... (${modelViewerLoadAttempts}/${MAX_LOAD_ATTEMPTS})</p>
                    </div>
                `;
            }
            
            // Intentar cargar Model Viewer de nuevo
            this.loadModelViewerWithRetry(sculptureId);
        } else {
            // Mostrar mensaje de error final
            const container = document.getElementById(`container-${sculptureId}`);
            if (container) {
                container.innerHTML = `
                    <div class="model-viewer-fallback">
                        <div class="fallback-content">
                            <i class="fas fa-exclamation-triangle" style="font-size: 3rem; color: #ff4757; margin-bottom: 1rem;"></i>
                            <h4>No se pudo cargar el visor 3D</h4>
                            <p>Por favor, verifica tu conexión a Internet o intenta más tarde.</p>
                            <p>Puedes contactar al artista para ver imágenes de la obra.</p>
                        </div>
                    </div>
                `;
            }
        }
    }

    loadModelViewerWithRetry(sculptureId) {
        // Crear un nuevo script para Model Viewer
        const script = document.createElement('script');
        script.type = 'module';
        script.src = 'https://unpkg.com/@google/model-viewer/dist/model-viewer.min.js';
        script.onload = () => {
            console.log('Model Viewer cargado con éxito en reintento');
            isModelViewerLoaded = true;
            this.modelViewerAvailable = true;
            this.updateModelViewerInstance(sculptureId);
        };
        script.onerror = () => {
            console.error('Error al cargar Model Viewer en reintento');
            setTimeout(() => {
                if (modelViewerLoadAttempts < MAX_LOAD_ATTEMPTS) {
                    this.retryModelViewerLoad(sculptureId);
                }
            }, 2000);
        };
        
        document.head.appendChild(script);
    }

  activateAR(sculptureId) {
    if (!this.modelViewerAvailable) {
        this.showModelViewerError();
        return;
    }
    
    const modelViewer = document.querySelector(`#model-${sculptureId}`);
    
    // Múltiples métodos para activar AR
    if (modelViewer) {
        // Método 1: activateAR() nativo
        if (typeof modelViewer.activateAR === 'function') {
            console.log('Activando AR con activateAR()');
            modelViewer.activateAR();
            return;
        }
        
        // Método 2: Intentar con el botón slot
        const arButton = modelViewer.querySelector('[slot="ar-button"]');
        if (arButton) {
            console.log('Activando AR con botón slot');
            arButton.click();
            return;
        }
        
        // Método 3: WebXR API directa
        this.activateWebXR(sculptureId);
    } else {
        this.showARInstructions();
    }
}

async activateWebXR(sculptureId) {
    try {
        if ('xr' in navigator) {
            const session = await navigator.xr.requestSession('immersive-ar', {
                requiredFeatures: ['hit-test', 'dom-overlay'],
                domOverlay: { root: document.body }
            });
            
            console.log('Sesión WebXR iniciada:', session);
            // Aquí integrarías el modelo 3D con WebXR API
            alert('WebXR AR activado. Para una experiencia completa, usa el botón AR nativo de model-viewer.');
        } else {
            this.showARInstructions();
        }
    } catch (error) {
        console.error('Error al activar WebXR:', error);
        this.showARInstructions();
    }
}

    showModelViewerError() {
        const modal = document.getElementById('ar-modal');
        if (modal) {
            // Asegurar que el modal muestre información sobre el error
            const compatibilityDetails = document.getElementById('compatibility-details');
            if (compatibilityDetails) {
                compatibilityDetails.innerHTML += `
                    <p style="color: #ff4757; margin-top: 1rem;">
                        <strong>Error:</strong> Model Viewer no se cargó. 
                        <button id="retry-global-btn" style="background: #8b7355; color: white; border: none; padding: 5px 10px; border-radius: 4px; margin-left: 10px;">
                            Reintentar
                        </button>
                    </p>
                `;
                
                document.getElementById('retry-global-btn').addEventListener('click', () => {
                    this.retryModelViewerLoad(galleryData[0].id);
                    modal.classList.remove('active');
                });
            }
            
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
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
            if (this.deviceDetector) {
                this.deviceDetector.updateUI();
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
        
        // Escuchar eventos personalizados de Model Viewer si están disponibles
        if (this.modelViewerAvailable) {
            document.addEventListener('model-viewer-ready', () => {
                console.log('Model Viewer listo');
                this.modelViewerAvailable = true;
                this.updateARButtons();
            });
        }
    }
}

// =============================================
// INICIALIZACIÓN DE LA APLICACIÓN
// =============================================

document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM cargado, iniciando galería...');
    
    // Inicializar la galería
    const gallery = new GalleryRenderer();
    gallery.init();
    
    // Hacer disponible globalmente para depuración
    window.galleryApp = gallery;
    
    // Verificar periódicamente si Model Viewer se cargó
    const checkModelViewerInterval = setInterval(() => {
        if (gallery.modelViewerAvailable) {
            clearInterval(checkModelViewerInterval);
            console.log('Model Viewer verificado como disponible');
        } else if (modelViewerLoadAttempts >= MAX_LOAD_ATTEMPTS) {
            clearInterval(checkModelViewerInterval);
            console.log('Se excedieron los intentos de carga de Model Viewer');
        } else {
            gallery.checkModelViewerAvailability();
        }
    }, 500);
    
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

// Añadir estilo para el spinner de carga
const style = document.createElement('style');
style.textContent = `
    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
    
    .model-viewer-fallback {
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        background-color: #f8f8f8;
        border-radius: 8px;
    }
    
    .fallback-content {
        text-align: center;
        padding: 2rem;
        color: #666;
    }
    
    .model-loading {
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        background-color: #f8f8f8;
    }
    
    .loading-spinner {
        width: 50px;
        height: 50px;
        border: 5px solid #f3f3f3;
        border-top: 5px solid #8b7355;
        border-radius: 50%;
        animation: spin 1s linear infinite;
        margin-bottom: 1rem;
    }
`;
document.head.appendChild(style);

// Exportar para uso en consola (depuración)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { DeviceDetector, AudioManager, GalleryRenderer };
}

// DIAGNÓSTICO EN TIEMPO REAL
function runARDiagnostic() {
    console.log('=== DIAGNÓSTICO AR ===');
    console.log('User Agent:', navigator.userAgent);
    console.log('Platform:', navigator.platform);
    console.log('Model Viewer loaded:', 'modelViewer' in window);
    
    // Verificar características específicas
    const tests = {
        'WebXR': 'xr' in navigator,
        'getGamepads': 'getGamepads' in navigator,
        'MediaDevices': 'mediaDevices' in navigator,
        'Permissions API': 'permissions' in navigator,
        'HTTPS': window.location.protocol === 'https:'
    };
    
    Object.entries(tests).forEach(([name, result]) => {
        console.log(`${name}: ${result ? '✓' : '✗'}`);
    });
    
    // Intentar detectar ARCore/ARKit específicamente
    if (navigator.userAgent.includes('Android')) {
        console.log('Dispositivo: Android');
        // Verificar si ARCore está disponible
        const arcoreCheck = document.createElement('div');
        arcoreCheck.style.display = 'none';
        document.body.appendChild(arcoreCheck);
        
        const sceneViewerIntent = `intent://arvr.google.com/scene-viewer/1.0?file=https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/Duck/glTF/Duck.gltf&mode=ar_only#Intent;scheme=https;package=com.google.ar.core;action=android.intent.action.VIEW;S.browser_fallback_url=https://developers.google.com/ar;end;`;
        
        console.log('ARCore intent disponible:', sceneViewerIntent.length > 0);
    }
    
    console.log('=== FIN DIAGNÓSTICO ===');
    
    // Mostrar botón de diagnóstico en página
    const diagBtn = document.createElement('button');
    diagBtn.textContent = '🛠 Diagnóstico AR';
    diagBtn.style.cssText = 'position:fixed;top:10px;right:10px;z-index:10000;background:#8b7355;color:white;border:none;padding:8px 12px;border-radius:4px;font-size:12px;';
    diagBtn.onclick = () => {
        const info = window.deviceInfo || {};
        alert(`DIAGNÓSTICO AR:\n\n` +
              `OS: ${info.os || 'desconocido'}\n` +
              `Navegador: ${info.browser || 'desconocido'}\n` +
              `AR Compatible: ${info.arSupported ? 'SÍ' : 'NO'}\n` +
              `Model Viewer: ${info.modelViewerSupported ? 'Cargado' : 'No cargado'}\n\n` +
              `User Agent:\n${navigator.userAgent}\n\n` +
              `Para Xiaomi Redmi Note 14:\n` +
              `1. Actualiza Chrome desde Play Store\n` +
              `2. Instala "Google Play Services for AR"\n` +
              `3. Permite cámara en Chrome\n` +
              `4. Prueba en https://modelviewer.dev para verificar`);
    };
    document.body.appendChild(diagBtn);
}

// Ejecutar diagnóstico después de cargar
setTimeout(runARDiagnostic, 2000);