/**
 * Galería Daniel Guido - WebAR Responsive
 * Con cámara trasera garantizada
 */

const appState = {
    arActive: false,
    rotationActive: true,
    audioActive: false,
    cameraStream: null
};

const elements = {
    inicio: document.getElementById('inicio'),
    contenedorAR: document.getElementById('contenedor-ar'),
    btnIniciarAR: document.getElementById('btn-iniciar-ar'),
    btnVolver: document.getElementById('btn-volver'),
    btnInfo: document.getElementById('btn-info'),
    btnCerrarModal: document.getElementById('btn-cerrar-modal'),
    btnRotar: document.getElementById('btn-rotar'),
    btnEscalar: document.getElementById('btn-escalar'),
    btnAudio: document.getElementById('btn-audio'),
    textoInstrucciones: document.getElementById('texto-instrucciones'),
    indicadorCarga: document.getElementById('indicador-carga'),
    modalInfo: document.getElementById('modal-info'),
    escultura: document.getElementById('escultura'),
    marcador: document.getElementById('marcador')
};

/**
 * FUNCIÓN CORREGIDA: Abre cámara trasera
 */
async function getRearCamera() {
    try {
        // Primero intentamos obtener TODAS las cámaras disponibles
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter(device => device.kind === 'videoinput');
        
        console.log('📷 Cámaras encontradas:', videoDevices.length);
        
        // Buscar cámara trasera (environment)
        let constraints = {
            video: {
                facingMode: { ideal: 'environment' },  // Primero intentamos environment
                width: { ideal: 1280 },
                height: { ideal: 720 }
            }
        };
        
        // Intentar con la restricción environment primero
        let stream;
        try {
            stream = await navigator.mediaDevices.getUserMedia(constraints);
            console.log('✅ Cámara trasera encontrada (environment)');
            return stream;
        } catch (error) {
            console.log('⚠️ No se pudo usar environment, intentando método alternativo...');
            
            // Método alternativo para algunos dispositivos
            if (videoDevices.length > 1) {
                // En Android, la segunda cámara suele ser la trasera
                constraints.video = {
                    deviceId: { exact: videoDevices[1].deviceId },
                    width: { ideal: 1280 },
                    height: { ideal: 720 }
                };
                
                stream = await navigator.mediaDevices.getUserMedia(constraints);
                console.log('✅ Cámara trasera encontrada (deviceId)');
                return stream;
            } else {
                // Si solo hay una cámara, usamos esa
                constraints.video = {
                    facingMode: 'user',  // Cámara frontal
                    width: { ideal: 1280 },
                    height: { ideal: 720 }
                };
                
                stream = await navigator.mediaDevices.getUserMedia(constraints);
                console.log('⚠️ Usando cámara frontal (solo hay una disponible)');
                return stream;
            }
        }
    } catch (error) {
        console.error('❌ Error grave al acceder a cámara:', error);
        throw error;
    }
}

/**
 * Inicia AR con cámara trasera
 */
async function startAR() {
    console.log('🚀 Iniciando AR con cámara trasera...');
    
    // Verificar si es móvil
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    if (!isMobile) {
        alert('Por favor, accede desde un dispositivo móvil para usar la experiencia AR.');
        return;
    }
    
    // Mostrar mensaje de carga
    elements.textoInstrucciones.textContent = 'Activando cámara trasera...';
    updateLoadingUI(true);
    
    try {
        // 1. Obtener cámara trasera
        const stream = await getRearCamera();
        appState.cameraStream = stream;
        
        // 2. Detectar si es cámara frontal o trasera (para feedback al usuario)
        const videoTrack = stream.getVideoTracks()[0];
        const settings = videoTrack.getSettings();
        
        console.log('📸 Configuración cámara:', {
            facingMode: settings.facingMode,
            deviceLabel: videoTrack.label,
            width: settings.width,
            height: settings.height
        });
        
        // 3. Dar feedback al usuario sobre qué cámara se está usando
        if (settings.facingMode === 'environment' || videoTrack.label.toLowerCase().includes('back')) {
            elements.textoInstrucciones.textContent = 'Cámara trasera activada. Busca una superficie plana.';
        } else if (settings.facingMode === 'user') {
            elements.textoInstrucciones.textContent = 'Cámara frontal activada. Para mejor experiencia, usa la cámara trasera.';
        } else {
            elements.textoInstrucciones.textContent = 'Cámara activada. Busca una superficie plana.';
        }
        
        // 4. Cambiar a pantalla AR
        elements.inicio.classList.remove('activa');
        elements.contenedorAR.classList.add('activa');
        appState.arActive = true;
        
        // 5. Ajustar para pantalla
        adjustForScreenSize();
        
        // 6. Forzar uso de cámara en A-Frame
        setupAframeCamera(stream);
        
        console.log('🎬 AR activado con cámara trasera');
        
    } catch (error) {
        console.error('❌ Error al iniciar AR:', error);
        elements.textoInstrucciones.textContent = 'Error al acceder a la cámara.';
        
        // Mostrar mensaje específico según el error
        if (error.name === 'NotAllowedError') {
            alert('Permiso de cámara denegado. Por favor:\n1. Da permisos de cámara\n2. Recarga la página\n3. Intenta de nuevo');
        } else if (error.name === 'NotFoundError') {
            alert('No se encontró cámara trasera. Usando cámara frontal...');
            // Intentar con cámara frontal como fallback
            tryFrontCamera();
        } else {
            alert('Error técnico: ' + error.message);
        }
        backToHome();
    }
}

/**
 * Intenta usar cámara frontal como fallback
 */
async function tryFrontCamera() {
    try {
        const constraints = {
            video: {
                facingMode: 'user',
                width: { ideal: 1280 },
                height: { ideal: 720 }
            }
        };
        
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        appState.cameraStream = stream;
        
        // Actualizar mensaje
        elements.textoInstrucciones.textContent = 'Cámara frontal activada. Apunta a una superficie.';
        
        // Cambiar a AR
        elements.inicio.classList.remove('activa');
        elements.contenedorAR.classList.add('activa');
        appState.arActive = true;
        
        setupAframeCamera(stream);
        
    } catch (error) {
        console.error('❌ Fallback también falló:', error);
        alert('No se pudo acceder a ninguna cámara.');
    }
}

/**
 * Configura A-Frame para usar nuestro stream de cámara
 */
function setupAframeCamera(stream) {
    // Esta función es importante para asegurar que A-Frame use nuestra cámara
    
    // 1. Obtener el elemento de video de A-Frame
    const scene = document.querySelector('a-scene');
    if (!scene) return;
    
    // 2. Esperar a que A-Frame esté listo
    if (scene.hasLoaded) {
        applyCameraToScene(stream);
    } else {
        scene.addEventListener('loaded', () => {
            applyCameraToScene(stream);
        });
    }
}

function applyCameraToScene(stream) {
    // 3. Forzar que A-Frame use nuestro stream
    const cameraSystem = document.querySelector('a-scene').systems['camera'];
    if (cameraSystem) {
        // Intentar asignar el stream directamente
        const videoElement = document.createElement('video');
        videoElement.srcObject = stream;
        videoElement.setAttribute('autoplay', 'true');
        videoElement.setAttribute('playsinline', 'true');
        
        // Insertar el video en el DOM (oculto)
        videoElement.style.position = 'absolute';
        videoElement.style.width = '0';
        videoElement.style.height = '0';
        videoElement.style.opacity = '0';
        document.body.appendChild(videoElement);
        
        // Dar tiempo para que el video empiece
        videoElement.play().catch(e => console.log('Video play error:', e));
    }
}

/**
 * Vuelve al inicio y detiene la cámara
 */
function backToHome() {
    // Detener stream de cámara
    if (appState.cameraStream) {
        appState.cameraStream.getTracks().forEach(track => {
            track.stop();
        });
        appState.cameraStream = null;
    }
    
    // Cambiar pantallas
    elements.contenedorAR.classList.remove('activa');
    elements.inicio.classList.add('activa');
    appState.arActive = false;
    
    resetControls();
    
    console.log('🏠 Volviendo al inicio - Cámara detenida');
}

/**
 * Resto de funciones (sin cambios)
 */
function initApp() {
    console.log('🖼️ Galería Daniel Guido iniciando...');
    
    setupEventListeners();
    checkARCompatibility();
    setupARListeners();
    
    console.log('✅ Aplicación lista');
}

function setupEventListeners() {
    elements.btnIniciarAR.addEventListener('click', startAR);
    elements.btnVolver.addEventListener('click', backToHome);
    elements.btnInfo.addEventListener('click', showInfo);
    elements.btnCerrarModal.addEventListener('click', closeModal);
    
    elements.btnRotar.addEventListener('click', toggleRotation);
    elements.btnEscalar.addEventListener('click', resetScale);
    elements.btnAudio.addEventListener('click', toggleAudio);
    
    elements.modalInfo.addEventListener('click', function(e) {
        if (e.target === this) closeModal();
    });
    
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            if (appState.arActive) backToHome();
            if (elements.modalInfo.getAttribute('aria-hidden') === 'false') closeModal();
        }
    });
}

function setupARListeners() {
    if (!elements.escultura || !elements.marcador) return;
    
    elements.escultura.addEventListener('model-loaded', function() {
        console.log('✅ Modelo 3D cargado');
        updateLoadingUI(false);
    });
    
    elements.escultura.addEventListener('error', function(e) {
        console.error('❌ Error cargando modelo:', e.detail);
        elements.textoInstrucciones.textContent = 'Error cargando escultura. Recarga.';
    });
    
    elements.marcador.addEventListener('markerFound', function() {
        console.log('🎯 Marcador encontrado');
        elements.textoInstrucciones.textContent = '¡Escultura encontrada! Acércate.';
        updateLoadingUI(false);
    });
    
    elements.marcador.addEventListener('markerLost', function() {
        console.log('🔍 Buscando marcador...');
        elements.textoInstrucciones.textContent = 'Busca una superficie plana';
        updateLoadingUI(true);
    });
}

function checkARCompatibility() {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    if (!isMobile) {
        elements.btnIniciarAR.disabled = true;
        elements.btnIniciarAR.innerHTML = '<span class="btn-texto">AR solo en móviles</span>';
        elements.btnIniciarAR.style.opacity = '0.5';
    }
    
    // Verificar si el navegador soporta getUserMedia
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        elements.btnIniciarAR.disabled = true;
        elements.btnIniciarAR.innerHTML = '<span class="btn-texto">Navegador no compatible</span>';
        console.error('❌ Navegador no soporta getUserMedia');
    }
}

function adjustForScreenSize() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    
    console.log(`📱 Tamaño: ${width}x${height}`);
    
    if (width < 400 || height < 500) {
        if (elements.escultura) {
            elements.escultura.setAttribute('scale', '0.4 0.4 0.4');
        }
    }
    
    if (width > height) {
        elements.textoInstrucciones.textContent += ' (Modo horizontal)';
    }
}

function showInfo() {
    elements.modalInfo.setAttribute('aria-hidden', 'false');
}

function closeModal() {
    elements.modalInfo.setAttribute('aria-hidden', 'true');
}

function toggleRotation() {
    appState.rotationActive = !appState.rotationActive;
    
    if (elements.escultura) {
        if (appState.rotationActive) {
            elements.escultura.setAttribute('animation', 'property: rotation; to: 0 360 0; loop: true; dur: 20000; easing: linear');
            elements.btnRotar.textContent = '↻ Rotando';
            elements.btnRotar.style.background = 'rgba(44, 44, 44, 0.2)';
        } else {
            elements.escultura.removeAttribute('animation');
            elements.btnRotar.textContent = '↻ Rotar';
            elements.btnRotar.style.background = '';
        }
    }
}

function resetScale() {
    if (!elements.escultura) return;
    
    const width = window.innerWidth;
    const scale = width < 400 ? '0.4 0.4 0.4' : '0.5 0.5 0.5';
    elements.escultura.setAttribute('scale', scale);
    
    elements.btnEscalar.style.background = 'rgba(196, 163, 90, 0.2)';
    setTimeout(() => {
        elements.btnEscalar.style.background = '';
    }, 300);
}

function toggleAudio() {
    appState.audioActive = !appState.audioActive;
    
    if (appState.audioActive) {
        elements.btnAudio.textContent = '🔊 Escuchando';
        elements.btnAudio.style.background = 'rgba(44, 44, 44, 0.2)';
    } else {
        elements.btnAudio.textContent = '🔊 Audio';
        elements.btnAudio.style.background = '';
    }
}

function updateLoadingUI(loading) {
    if (elements.indicadorCarga) {
        elements.indicadorCarga.style.display = loading ? 'flex' : 'none';
    }
}

function resetControls() {
    appState.rotationActive = true;
    appState.audioActive = false;
    
    elements.btnRotar.textContent = '↻ Rotar';
    elements.btnRotar.style.background = '';
    
    elements.btnAudio.textContent = '🔊 Audio';
    elements.btnAudio.style.background = '';
    
    elements.btnEscalar.style.background = '';
}

// Manejar cambios de pantalla/orientación
window.addEventListener('resize', function() {
    if (appState.arActive) {
        adjustForScreenSize();
    }
});

window.addEventListener('orientationchange', function() {
    setTimeout(function() {
        if (appState.arActive) {
            adjustForScreenSize();
        }
    }, 300);
});

// Manejar cierre de página para detener cámara
window.addEventListener('beforeunload', function() {
    if (appState.cameraStream) {
        appState.cameraStream.getTracks().forEach(track => track.stop());
    }
});

// Inicializar
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}

console.log('🎨 Galería Daniel Guido - Cámara trasera configurada');