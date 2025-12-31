


// CONFIGURACIÓN Y DATOS DE LA GALERIA

const galleryData = [
    {
        id: 1,
        title: "Formas Orgánicas I",
        artist: "Daniel Guido",
        year: "2023",
        material: "Bronce y mármol",
        description: "Una exploración de las formas naturales y su relación con el espacio tridimensional.",
        
        // ✅ MODELOS OPTIMIZADOS para AR (GLB binario, no GLTF)
        modelSrc: "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/Duck/glTF-Binary/Duck.glb", // ¡GLB no GLTF!
        poster: "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/Duck/Images/duck.png",
        iosSrc: "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/Duck/glTF/Duck.gltf",
        
        audioTranscript: "En esta obra busqué capturar la esencia de las formas naturales...",
        
        // ✅ CONFIGURACIÓN AR COMPLETA
        arModes: "webxr scene-viewer quick-look",
        arScale: "0.5 0.5 0.5",
        arPlacement: "floor",
        arEnvironment: "neutral",
        cameraOrbit: "45deg 55deg 2.5m",
        cameraTarget: "0m 0.3m 0m",
        autoRotate: true,
        autoRotateDelay: 0,
        rotationPerSecond: "30deg",
        interactionPrompt: "none",
        interactionPromptStyle: "basic",
        shadowIntensity: 1,
        exposure: 0.8,
        environmentImage: "neutral",
        skyboxImage: "",
        maxCameraOrbit: "Infinity 90deg auto",
        minCameraOrbit: "-Infinity 10deg auto",
        maxFieldOfView: "45deg",
        minFieldOfView: "10deg"
    },
    {
        id: 2,
        title: "Equilibrio Inestable",
        artist: "Daniel Guido",
        year: "2022",
        material: "Acero corten y vidrio",
        description: "Una reflexión sobre la fragilidad y la permanencia.",
        
        // ✅ GLB binario para AR
        modelSrc: "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/Box/glTF-Binary/Box.glb",
        poster: "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/Box/Images/box.png",
        iosSrc: "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/Box/glTF/Box.gltf",
        
        audioTranscript: "Esta pieza surgió de mi fascinación por los momentos de transición...",
        
        arModes: "webxr scene-viewer quick-look",
        arScale: "0.3 0.3 0.3",
        arPlacement: "wall",
        arEnvironment: "neutral",
        cameraOrbit: "60deg 75deg 2m",
        cameraTarget: "0m 0.2m 0m",
        autoRotate: true,
        rotationPerSecond: "25deg"
    },
    {
        id: 3,
        title: "Memoria del Agua",
        artist: "Daniel Guido",
        year: "2023",
        material: "Resina y pigmentos naturales",
        description: "Inspirada en los movimientos fluidos del agua.",
        
        // ✅ GLB binario para AR
        modelSrc: "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/CesiumMan/glTF-Binary/CesiumMan.glb",
        poster: "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/CesiumMan/Images/CesiumMan.png",
        iosSrc: "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/CesiumMan/glTF/CesiumMan.gltf",
        
        audioTranscript: "El agua tiene memoria, guarda la historia de todo lo que ha tocado...",
        
        arModes: "webxr scene-viewer quick-look",
        arScale: "0.4 0.4 0.4",
        arPlacement: "floor",
        arEnvironment: "neutral",
        cameraOrbit: "30deg 45deg 3m",
        cameraTarget: "0m 0.5m 0m",
        autoRotate: true,
        rotationPerSecond: "20deg"
    }
];
// GESTOR DE CARGA DE MODEL VIEWER

class ModelViewerManager {
    constructor() {
        this.isLoaded = false;
        this.loadAttempts = 0;
        this.maxAttempts = 3;
        this.checkInterval = null;
    }

    async initialize() {
        console.log('🔄 Inicializando Model Viewer Manager...');
        
        // Verificar si ya está cargado
        if (this.checkIfLoaded()) {
            console.log('✅ Model Viewer ya está cargado');
            this.isLoaded = true;
            return true;
        }
        
        // Esperar a que se cargue
        return this.waitForLoad();
    }

    checkIfLoaded() {
        // Múltiples formas de verificar si Model Viewer está cargado
        const checks = [
            () => 'modelViewer' in window,
            () => window.modelViewer !== undefined,
            () => document.querySelector('model-viewer') !== null,
            () => typeof window.ModelViewerElement !== 'undefined'
        ];
        
        return checks.some(check => {
            try {
                return check();
            } catch (e) {
                return false;
            }
        });
    }

    waitForLoad() {
        return new Promise((resolve) => {
            console.log('⏳ Esperando carga de Model Viewer...');
            
            // Intentar cargar manualmente si no está
            if (!this.checkIfLoaded() && this.loadAttempts < this.maxAttempts) {
                this.loadAttempts++;
                this.tryAlternativeSources();
            }
            
            // Escuchar evento personalizado
            window.addEventListener('model-viewer-loaded', () => {
                console.log('✅ Model Viewer cargado vía evento');
                this.isLoaded = true;
                clearInterval(this.checkInterval);
                resolve(true);
            });
            
            // Verificar periódicamente
            this.checkInterval = setInterval(() => {
                if (this.checkIfLoaded()) {
                    console.log('✅ Model Viewer detectado en verificación periódica');
                    this.isLoaded = true;
                    clearInterval(this.checkInterval);
                    resolve(true);
                }
                
                if (this.loadAttempts >= this.maxAttempts) {
                    console.log('⚠️ Máximos intentos alcanzados, continuando sin Model Viewer');
                    clearInterval(this.checkInterval);
                    resolve(false);
                }
            }, 500);
            
            // Timeout total
            setTimeout(() => {
                if (!this.isLoaded) {
                    console.log('⏰ Timeout de carga de Model Viewer');
                    clearInterval(this.checkInterval);
                    resolve(false);
                }
            }, 10000);
        });
    }

    tryAlternativeSources() {
        console.log(`🔄 Intento ${this.loadAttempts} de cargar Model Viewer...`);
        
        const sources = [
            'https://cdn.jsdelivr.net/npm/@google/model-viewer@2.1.1/dist/model-viewer.min.js',
            'https://unpkg.com/@google/model-viewer@2.1.1/dist/model-viewer.min.js',
            'https://ajax.googleapis.com/ajax/libs/model-viewer/3.0.0/model-viewer.min.js'
        ];
        
        if (this.loadAttempts - 1 < sources.length) {
            const script = document.createElement('script');
            script.type = 'module';
            script.src = sources[this.loadAttempts - 1];
            script.onload = () => {
                console.log(`✅ Model Viewer cargado desde fuente alternativa ${this.loadAttempts}`);
                window.dispatchEvent(new Event('model-viewer-loaded'));
            };
            script.onerror = () => {
                console.warn(`❌ Falló fuente alternativa ${this.loadAttempts}`);
            };
            document.head.appendChild(script);
        }
    }

    isAvailable() {
        return this.isLoaded;
    }
}


// DETECCION DE DISPOSITIVO 

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
    }

    async init(modelViewerManager) {
        this.detectDeviceType();
        this.detectOS();
        this.detectBrowser();
        this.deviceInfo.modelViewerSupported = modelViewerManager.isAvailable();
        this.deviceInfo.arSupported = await this.checkARSupport();
        this.updateUI();
        return this.deviceInfo;
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
            const androidVersion = userAgent.match(/Android\s([0-9.]+)/);
            if (androidVersion) {
                this.deviceInfo.arDebugInfo.androidVersion = androidVersion[1];
                this.deviceInfo.arDebugInfo.androidVersionNum = parseFloat(androidVersion[1]);
            }
        } else if (/iphone|ipad|ipod/i.test(userAgent)) {
            os = 'iOS';
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

    async checkARSupport() {
        const debugInfo = [];
        
        // 1. Verificar si es móvil/tablet
        const isMobileDevice = this.deviceInfo.type === 'mobile' || this.deviceInfo.type === 'tablet';
        debugInfo.push(`Dispositivo: ${this.deviceInfo.type} (${isMobileDevice ? 'móvil' : 'no móvil'})`);
        
        if (!isMobileDevice) {
            this.deviceInfo.arDebugInfo.arCheckSteps = debugInfo;
            return false;
        }
        
        // 2. Verificar Model Viewer
        if (!this.deviceInfo.modelViewerSupported) {
            debugInfo.push('Model Viewer no disponible');
            this.deviceInfo.arDebugInfo.arCheckSteps = debugInfo;
            return false;
        }
        debugInfo.push('Model Viewer: OK');
        
        // 3. Verificar Android + Chrome
        if (this.deviceInfo.os === 'Android') {
            const androidVersion = this.deviceInfo.arDebugInfo.androidVersionNum || 0;
            const chromeVersion = this.deviceInfo.arDebugInfo.chromeVersionNum || 0;
            
            debugInfo.push(`Android ${androidVersion}, Chrome ${chromeVersion}`);
            
            if (androidVersion >= 7.0 && chromeVersion >= 81) {
                debugInfo.push('Cumple requisitos mínimos para AR');
                this.deviceInfo.arDebugInfo.arCheckSteps = debugInfo;
                
                // Verificar ARCore via WebXR
                try {
                    if ('xr' in navigator) {
                        const arSupported = await navigator.xr.isSessionSupported('immersive-ar');
                        debugInfo.push(`WebXR AR: ${arSupported ? 'SÍ' : 'NO'}`);
                        this.deviceInfo.arDebugInfo.webXRSupported = arSupported;
                        return arSupported;
                    }
                } catch (e) {
                    debugInfo.push(`WebXR error: ${e.message}`);
                }
                
                // Si WebXR falla, asumir compatible si cumple requisitos
                return true;
            } else {
                debugInfo.push('No cumple requisitos mínimos');
                this.deviceInfo.arDebugInfo.arCheckSteps = debugInfo;
                return false;
            }
        }
        
        // 4. Verificar iOS + Safari
        if (this.deviceInfo.os === 'iOS') {
            const iosVersion = parseFloat(this.deviceInfo.arDebugInfo.iosVersion || 0);
            
            if (iosVersion >= 12.0 && this.deviceInfo.browser === 'Safari') {
                debugInfo.push(`iOS ${iosVersion} + Safari: OK para ARKit`);
                this.deviceInfo.arDebugInfo.arCheckSteps = debugInfo;
                return true;
            }
        }
        
        debugInfo.push('No compatible');
        this.deviceInfo.arDebugInfo.arCheckSteps = debugInfo;
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
                    `Móvil compatible con AR` : 
                    `Móvil - AR no disponible`;
                break;
            case 'tablet':
                deviceIcon = '📱';
                deviceText = this.deviceInfo.arSupported ? 
                    `Tablet compatible con AR` : 
                    `Tablet - AR no disponible`;
                break;
            default:
                deviceIcon = '💻';
                deviceText = 'PC/Laptop - Vista 3D';
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
                        <strong><i class="fas fa-lightbulb"></i> Solución para Xiaomi:</strong>
                        <ul style="margin: 5px 0 0 15px; font-size: 0.9rem;">
                            <li><strong>1.</strong> Abre Google Play Store</li>
                            <li><strong>2.</strong> Busca "Google Play Services for AR" (ARCore)</li>
                            <li><strong>3.</strong> Instálalo o actualízalo</li>
                            <li><strong>4.</strong> Reinicia Chrome y prueba de nuevo</li>
                            <li><strong>5.</strong> Si no funciona, prueba con Firefox para Android</li>
                        </ul>
                        <button id="test-ar-btn" style="margin-top: 10px; background: #8b7355; color: white; border: none; padding: 8px 15px; border-radius: 4px; cursor: pointer; width: 100%;">
                            <i class="fas fa-bolt"></i> Probar compatibilidad AR ahora
                        </button>
                    </div>
                `;
            }
            
            compatibilityDetails.innerHTML = compatibilityHTML;
            
            // Añadir evento al botón de prueba
            const testArBtn = document.getElementById('test-ar-btn');
            if (testArBtn) {
                testArBtn.addEventListener('click', () => {
                    this.runARTest();
                });
            }
        }
        
        window.deviceInfo = this.deviceInfo;
    }

    runARTest() {
        const testUrl = 'https://modelviewer.dev/examples/ar.html';
        const testWindow = window.open(testUrl, '_blank');
        
        if (!testWindow) {
            alert('Por favor, permite ventanas emergentes para probar AR.\n\nO ve manualmente a: https://modelviewer.dev/examples/ar.html');
        }
    }
}

// =============================================
// SISTEMA DE AUDIO
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
        if (this.currentAudio && this.currentAudioId !== sculptureId) {
            this.pauseAudio(this.currentAudioId);
        }
        
        let audio = this.audioElements[sculptureId];
        if (!audio) {
            const sculpture = galleryData.find(s => s.id === sculptureId);
            if (!sculpture) return;
            
            audio = this.createAudioElement(sculptureId, sculpture.audioSrc);
        }
        
        audio.play().then(() => {
            this.currentAudio = audio;
            this.currentAudioId = sculptureId;
            this.isPlaying = true;
            this.updatePlayButton(sculptureId, true);
        }).catch(error => {
            console.error('Error audio:', error);
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
        
        let transcriptEl = document.querySelector(`#transcript-${sculptureId}`);
        
        if (!transcriptEl) {
            const audioControls = document.querySelector(`#audio-controls-${sculptureId}`);
            if (audioControls) {
                transcriptEl = document.createElement('div');
                transcriptEl.id = `transcript-${sculptureId}`;
                transcriptEl.className = 'audio-transcript';
                transcriptEl.textContent = sculpture.audioTranscript;
                audioControls.parentNode.insertBefore(transcriptEl, audioControls.nextSibling);
                
                // Auto-ocultar después de 10 segundos
                setTimeout(() => {
                    transcriptEl.style.display = 'none';
                }, 10000);
            }
        } else {
            transcriptEl.style.display = 'block';
        }
    }
}


// RENDERIZA LA GALERIA

class GalleryRenderer {
    constructor() {
        this.audioManager = new AudioManager();
        this.modelViewerManager = new ModelViewerManager();
        this.deviceDetector = new DeviceDetector();
        this.initialized = false;
    }

    async init() {
        if (this.initialized) return;
        
        console.log('🚀 Inicializando Galería Virtual AR...');
        
        try {
            // 1. Inicializar Model Viewer primero
            const modelViewerLoaded = await this.modelViewerManager.initialize();
            console.log(`Model Viewer: ${modelViewerLoaded ? 'CARGADO' : 'NO DISPONIBLE'}`);
            
            // 2. Detectar dispositivo
            const deviceInfo = await this.deviceDetector.init(this.modelViewerManager);
            
            // 3. Renderizar galería
            this.renderGallery(deviceInfo);
            
            // 4. Configurar eventos
            this.initModal();
            this.setupEventListeners();
            
            // 5. Verificación final
            this.runFinalChecks();
            
            this.initialized = true;
            console.log('✅ Galería inicializada correctamente');
            
        } catch (error) {
            console.error('❌ Error inicializando galería:', error);
            this.showErrorFallback();
        }
    }

    renderGallery(deviceInfo) {
        const container = document.getElementById('sculptures-container');
        if (!container) return;
        
        container.innerHTML = '';
        
        galleryData.forEach(sculpture => {
            const sculptureCard = this.createSculptureCard(sculpture, deviceInfo);
            container.appendChild(sculptureCard);
        });
    }

createSculptureCard(sculpture, deviceInfo) {
  const card = document.createElement("article")
  card.className = "sculpture-card"
  card.dataset.id = sculpture.id

  const modelViewerAvailable = deviceInfo.modelViewerSupported
  const arSupported = deviceInfo.arSupported && modelViewerAvailable

  let modelViewerHTML = ""

  if (modelViewerAvailable) {
    modelViewerHTML = `
            <model-viewer 
                id="model-${sculpture.id}"
                src="${sculpture.modelSrc}"
                ${sculpture.poster ? `poster="${sculpture.poster}"` : ""}
                alt="${sculpture.title}"
                camera-controls
                auto-rotate
                ${arSupported ? 'ar ar-modes="webxr scene-viewer quick-look" ar-scale="auto" ar-placement="floor"' : ""}
                style="width: 100%; height: 100%;"
                loading="eager"
                reveal="auto"
                interaction-prompt="none">
                
                ${
                  sculpture.poster
                    ? `
                <div slot="poster" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: #f8f8f8; display: flex; align-items: center; justify-content: center;">
                    <img src="${sculpture.poster}" alt="Vista previa" style="max-width: 80%; max-height: 80%; opacity: 0.6;">
                </div>
                `
                    : ""
                }
                
                <!-- Botón AR dentro del model-viewer (manejado automáticamente) -->
                ${
                  arSupported
                    ? `
                <button slot="ar-button" 
                        id="ar-slot-btn-${sculpture.id}"
                        class="model-ar-button"
                        style="background: linear-gradient(135deg, #8b7355 0%, #6b5a45 100%); 
                               color: white; 
                               border: none; 
                               padding: 14px 28px; 
                               border-radius: 30px; 
                               font-weight: 600; 
                               font-size: 1rem; 
                               cursor: pointer; 
                               position: absolute; 
                               bottom: 25px; 
                               left: 50%; 
                               transform: translateX(-50%);
                               z-index: 1000; 
                               box-shadow: 0 4px 15px rgba(139, 115, 85, 0.3); 
                               transition: all 0.3s ease; 
                               display: flex; 
                               align-items: center; 
                               justify-content: center; 
                               gap: 8px; 
                               min-width: 220px;">
                    <i class="fas fa-cube"></i> Ver en tu espacio
                </button>
                `
                    : ""
                }
            </model-viewer>
        `
  } else {
    modelViewerHTML = `
            <div class="model-viewer-fallback">
                ${
                  sculpture.poster
                    ? `
                    <img src="${sculpture.poster}" alt="${sculpture.title}" 
                         style="max-width: 90%; max-height: 90%; object-fit: contain;">
                `
                    : `
                    <div style="text-align: center; padding: 20px;">
                        <i class="fas fa-cube" style="font-size: 3rem; color: #8b7355; margin-bottom: 1rem;"></i>
                        <h4>${sculpture.title}</h4>
                        <p>Vista 3D no disponible</p>
                    </div>
                `
                }
            </div>
        `
  }

  card.innerHTML = `
        <div class="sculpture-media">
            <div class="model-viewer-container" id="container-${sculpture.id}">
                ${modelViewerHTML}
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
            
            <div class="audio-transcript" id="transcript-${sculpture.id}" style="display: none;">
                <h4><i class="fas fa-comment"></i> Explicación del artista:</h4>
                <p>"${sculpture.audioTranscript}"</p>
            </div>
            
            <div class="action-buttons">
                <!-- Botón externo que activa el AR programáticamente -->
                <button class="btn ${arSupported ? "btn-ar" : "btn-disabled"}" 
                        id="ar-btn-${sculpture.id}"
                        ${!arSupported ? "disabled" : ""}>
                    <i class="fas fa-cube"></i> ${arSupported ? "Activar Realidad Aumentada" : "AR no disponible"}
                </button>
                
                <a class="btn btn-whatsapp" 
                   href="https://wa.me/50687922758?text=Hola%20Daniel,%20estoy%20interesado%20en%20la%20obra%20${encodeURIComponent(sculpture.title)}%20de%20tu%20galería%20virtual.%20¿Podrías%20darme%20más%20información?"
                   target="_blank">
                    <i class="fab fa-whatsapp"></i> Consultar para compra
                </a>
            </div>
        </div>
    `

  setTimeout(() => {
    setupARButton(sculpture.id, arSupported)
    setupAudioControls(sculpture)
  }, 100)

  return card
}

 setupARButton(sculptureId, arSupported) {
  if (!arSupported) return

  const externalBtn = document.getElementById(`ar-btn-${sculptureId}`)
  const modelViewer = document.getElementById(`model-${sculptureId}`)

  if (externalBtn && modelViewer) {
    externalBtn.addEventListener("click", () => {
      console.log("[v0] Activando AR para modelo:", sculptureId)

      // Activar AR del model-viewer programáticamente
      if (modelViewer.canActivateAR) {
        modelViewer.activateAR()
      } else {
        console.error("[v0] AR no disponible en este modelo")
        alert("AR no disponible. Asegúrate de estar en un dispositivo compatible.")
      }
    })

    // Debug: verificar capacidades AR
    modelViewer.addEventListener("load", () => {
      console.log("[v0] Model-viewer cargado. AR disponible:", modelViewer.canActivateAR)
    })
  }
}

 setupAudioControls(sculpture) {
  const playBtn = document.getElementById(`play-btn-${sculpture.id}`)
  if (playBtn) {
    playBtn.addEventListener("click", () => {
      console.log("[v0] Reproducir audio para:", sculpture.title)
      // Implementar lógica de audio aquí
    })
  }
}
   setupCardEvents(card, sculptureId, arSupported) {
        // Audio
        const playBtn = card.querySelector(`#play-btn-${sculptureId}`);
        if (playBtn) {
            playBtn.addEventListener('click', () => {
                this.audioManager.toggleAudio(sculptureId);
            });
        }
        
        // AR
        const arBtn = card.querySelector(`#ar-btn-${sculptureId}`);
        if (arBtn && arSupported) {
            arBtn.addEventListener('click', () => {
                this.activateAR(sculptureId);
            });
        }
        
        // Progress bar
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
        
        // Botón de reintento
        const retryBtn = card.querySelector('.retry-load-btn');
        if (retryBtn) {
            retryBtn.addEventListener('click', () => {
                location.reload();
            });
        }
    }

   async activateAR(sculptureId) {
    console.log(`📱 ACTIVANDO AR para escultura ${sculptureId} en producción`);
    
    const modelViewer = document.querySelector(`#model-${sculptureId}`);
    if (!modelViewer) {
        console.error('❌ Model Viewer no encontrado');
        this.showARError('No se encontró el modelo 3D');
        return;
    }
    
    // Verificar HTTPS
    if (window.location.protocol !== 'https:') {
        this.showARError('AR requiere HTTPS. Estás en: ' + window.location.protocol);
        return;
    }
    
    // Mostrar indicador de carga
    this.showARLoading('Preparando Realidad Aumentada...');
    
    try {
        // PRIMERO: Verificar permisos de cámara
        const hasCameraAccess = await this.requestCameraPermission();
        
        if (!hasCameraAccess) {
            this.showARError('Se requiere permiso de cámara para AR. Por favor, permite el acceso a la cámara en la configuración de tu navegador.');
            return;
        }
        
        // SEGUNDO: Verificar compatibilidad AR
        const isARSupported = await this.checkARSpecificSupport();
        
        if (!isARSupported) {
            this.showARInstructions();
            return;
        }
        
        // TERCERO: Activar AR con método específico por dispositivo
        await this.activateARByDevice(modelViewer, sculptureId);
        
    } catch (error) {
        console.error('💥 Error en AR:', error);
        this.handleARError(error);
    } finally {
        this.hideARLoading();
    }
}
setupModelViewerEvents(sculptureId) {
    try {
        console.log(`🔄 Configurando eventos AR para modelo ${sculptureId}`);
        
        const modelViewer = document.querySelector(`#model-${sculptureId}`);
        if (!modelViewer) return;
        
        // Esperar a que model-viewer esté completamente inicializado
        setTimeout(() => {
            // Configurar el botón AR personalizado
            const arButton = modelViewer.querySelector('[slot="ar-button"]');
            if (arButton) {
                // Añadir funcionalidad extra al botón
                arButton.addEventListener('click', async (e) => {
                    e.stopPropagation(); // Evitar múltiples clics
                    
                    console.log(`🎯 Botón AR presionado para modelo ${sculptureId}`);
                    
                    // Verificar permisos de cámara primero
                    const hasPermission = await this.checkCameraPermission();
                    
                    if (!hasPermission) {
                        this.showCameraPermissionModal(sculptureId);
                        return;
                    }
                    
                    // Activar AR
                    try {
                        if (typeof modelViewer.activateAR === 'function') {
                            await modelViewer.activateAR();
                            console.log('✅ AR activado correctamente');
                        } else {
                            console.warn('activateAR() no disponible');
                            // El botón slot ya debería funcionar por sí solo
                        }
                    } catch (error) {
                        console.error('Error activando AR:', error);
                        this.showARErrorModal(sculptureId, error);
                    }
                });
            }
            
            // También configurar el botón AR principal de la card
            const mainArButton = document.getElementById(`ar-btn-${sculptureId}`);
            if (mainArButton && !mainArButton.disabled) {
                mainArButton.addEventListener('click', async () => {
                    await this.activateARWithPermission(sculptureId);
                });
            }
            
        }, 500); // Dar tiempo a que model-viewer se inicialice
        
    } catch (error) {
        console.error(`Error configurando eventos AR para ${sculptureId}:`, error);
    }
}
async requestCameraAndActivateAR(sculptureId) {
    try {
        // Solicitar permiso explícito
        const stream = await navigator.mediaDevices.getUserMedia({ 
            video: { 
                facingMode: { ideal: 'environment' },
                width: { ideal: 1920 },
                height: { ideal: 1080 }
            }
        });
        
        // Detener stream (ya tenemos permiso)
        stream.getTracks().forEach(track => track.stop());
        
        // Ocultar modal
        this.hidePermissionModal();
        
        // Activar AR
        setTimeout(() => {
            this.activateARWithPermission(sculptureId);
        }, 300);
        
    } catch (error) {
        console.error('Error obteniendo permiso de cámara:', error);
        alert('No se pudo acceder a la cámara. Por favor, verifica los permisos en la configuración de tu navegador.');
    }
}
async checkARSpecificSupport() {
    // Detección específica para AR
    const userAgent = navigator.userAgent.toLowerCase();
    const isAndroid = /android/.test(userAgent);
    const isIOS = /iphone|ipad|ipod/.test(userAgent);
    
    if (isAndroid) {
        // Verificar ARCore para Android
        return await this.checkARCoreSupport();
    } else if (isIOS) {
        // Verificar ARKit para iOS
        return await this.checkARKitSupport();
    }
    
    return false;
}

async checkARCoreSupport() {
    // Para Android: Scene Viewer es la forma más confiable
    try {
        // Verificar si Scene Viewer está disponible
        const sceneViewerIntent = 'intent://arvr.google.com/scene-viewer/1.0';
        return true; // Asumir compatible si es Android moderno
    } catch (error) {
        return false;
    }
}

async activateARByDevice(modelViewer, sculptureId) {
    const userAgent = navigator.userAgent.toLowerCase();
    const isIOS = /iphone|ipad|ipod/.test(userAgent);
    
    if (isIOS) {
        // Para iOS: Usar Quick Look
        await this.activateQuickLook(modelViewer, sculptureId);
    } else {
        // Para Android/otros: Usar WebXR o Scene Viewer
        await this.activateWebXR(modelViewer, sculptureId);
    }
}

async activateQuickLook(modelViewer, sculptureId) {
    // iOS Quick Look (muy confiable)
    const sculpture = galleryData.find(s => s.id === sculptureId);
    if (!sculpture || !sculpture.iosSrc) {
        throw new Error('No hay modelo para iOS');
    }
    
    console.log('🍎 Activando Quick Look para iOS');
    
    // Crear enlace Quick Look
    const quickLookLink = document.createElement('a');
    quickLookLink.href = sculpture.iosSrc;
    quickLookLink.setAttribute('rel', 'ar');
    quickLookLink.innerHTML = `
        <img src="${sculpture.poster}" width="200" height="200" alt="${sculpture.title}">
    `;
    
    // Disparar click (iOS detectará el atributo 'rel="ar"')
    quickLookLink.click();
}

async activateWebXR(modelViewer, sculptureId) {
    console.log('🤖 Activando WebXR para Android/Desktop');
    
    if (typeof modelViewer.activateAR === 'function') {
        try {
            await modelViewer.activateAR();
            console.log('✅ AR activado con activateAR()');
            return;
        } catch (error) {
            console.warn('activateAR() falló:', error);
        }
    }
    
    // Fallback: Botón slot
    const arButton = modelViewer.querySelector('[slot="ar-button"]');
    if (arButton) {
        console.log('🖱️ Usando botón AR slot');
        arButton.click();
        return;
    }
    
    // Último recurso: WebXR manual
    if ('xr' in navigator) {
        try {
            const session = await navigator.xr.requestSession('immersive-ar');
            console.log('WebXR session iniciada:', session);
            // Aquí integrarías el modelo con Three.js
        } catch (error) {
            throw new Error('WebXR no disponible: ' + error.message);
        }
    }
    
    throw new Error('No se pudo activar AR');
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
        
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.classList.remove('active');
                    document.body.style.overflow = 'auto';
                }
            });
        }
        
        const privacyLink = document.getElementById('privacy-link');
        if (privacyLink) {
            privacyLink.addEventListener('click', (e) => {
                e.preventDefault();
                alert("Esta galería virtual no recopila datos personales. Los modelos 3D se cargan desde servidores de Google. Para usar AR necesitarás permitir acceso a la cámara, pero no se almacenan imágenes.");
            });
        }
    }

    setupEventListeners() {
        window.addEventListener('resize', () => {
            // Re-check device orientation if needed
        });
        
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

    runFinalChecks() {
        console.log('🔍 Ejecutando verificaciones finales...');
        
        // Verificar WebGL (necesario para 3D)
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        const hasWebGL = !!gl;
        
        console.log(`WebGL: ${hasWebGL ? 'DISPONIBLE' : 'NO DISPONIBLE'}`);
        
        if (!hasWebGL) {
            this.showWebGLError();
        }
        
        // Verificar si estamos en HTTPS (necesario para cámara)
        const isHTTPS = window.location.protocol === 'https:';
        console.log(`HTTPS: ${isHTTPS ? 'SÍ' : 'NO'}`);
        
        if (!isHTTPS && window.deviceInfo?.arSupported) {
            console.warn('AR puede no funcionar sin HTTPS');
        }
    }

    showWebGLError() {
        const cards = document.querySelectorAll('.sculpture-card');
        cards.forEach(card => {
            const fallback = card.querySelector('.model-viewer-fallback');
            if (fallback) {
                const content = fallback.querySelector('.fallback-content');
                if (content) {
                    content.innerHTML = `
                        <i class="fas fa-exclamation-triangle" style="font-size: 3rem; color: #ff4757; margin-bottom: 1rem;"></i>
                        <h4>WebGL no disponible</h4>
                        <p>Tu navegador no soporta gráficos 3D necesarios para esta galería.</p>
                        <p>Por favor:</p>
                        <ul style="text-align: left; margin: 10px 0; font-size: 0.9rem;">
                            <li>Actualiza Chrome/Firefox/Safari</li>
                            <li>Habilita WebGL en configuraciones</li>
                            <li>Prueba con otro navegador</li>
                        </ul>
                    `;
                }
            }
        });
    }

    showErrorFallback() {
        const container = document.getElementById('sculptures-container');
        if (!container) return;
        
        container.innerHTML = `
            <div style="text-align: center; padding: 40px 20px; grid-column: 1 / -1;">
                <i class="fas fa-exclamation-circle" style="font-size: 4rem; color: #8b7355; margin-bottom: 20px;"></i>
                <h2>Error al cargar la galería</h2>
                <p>No se pudo inicializar la galería virtual. Esto puede deberse a:</p>
                <ul style="text-align: left; max-width: 500px; margin: 20px auto; padding-left: 20px;">
                    <li>Problemas de conexión a Internet</li>
                    <li>Bloqueo de scripts por el navegador</li>
                    <li>Falta de soporte para tecnologías necesarias</li>
                </ul>
                <button onclick="location.reload()" 
                        style="background: #8b7355; color: white; border: none; padding: 12px 30px; border-radius: 5px; font-size: 1rem; cursor: pointer; margin-top: 20px;">
                    <i class="fas fa-redo"></i> Reintentar
                </button>
                <p style="margin-top: 30px; font-size: 0.9rem; color: #666;">
                    Si el problema persiste, contacta al soporte técnico.
                </p>
            </div>
        `;
    }

    showARInstructions() {
        const modal = document.getElementById('ar-modal');
        if (modal) {
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    }
}

// =============================================
// INICIALIZACIÓN PRINCIPAL
// =============================================

// Esperar a que todo esté listo
window.addEventListener('DOMContentLoaded', async () => {
    console.log('🌐 DOM listo, iniciando aplicación...');
    
    // Pequeña espera para asegurar carga de recursos
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Inicializar la galería
    const gallery = new GalleryRenderer();
    
    try {
        await gallery.init();
        console.log('🎉 Aplicación inicializada con éxito');
    } catch (error) {
        console.error('💥 Error crítico:', error);
        
        // Mostrar error al usuario
        const container = document.getElementById('sculptures-container');
        if (container) {
            container.innerHTML = `
                <div style="text-align: center; padding: 50px 20px;">
                    <h3 style="color: #ff4757;">Error de inicialización</h3>
                    <p>Por favor, recarga la página o intenta más tarde.</p>
                    <button onclick="location.reload()" style="margin-top: 20px; padding: 10px 20px;">
                        Recargar página
                    </button>
                </div>
            `;
        }
    }
});
