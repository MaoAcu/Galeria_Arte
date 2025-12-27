/**
 * Galería Daniel Guido - WebAR Responsive
 * Script optimizado para todos los dispositivos móviles
 */

// Estado global de la aplicación
const EstadoApp = {
    arActivo: false,
    rotacionAutomatica: true,
    audioActivo: false,
    escalaActual: 1,
    esculturaCargada: false,
    isMobile: false,
    orientation: 'portrait'
};

// Elementos DOM
const elementos = {
    // Pantallas
    pantallaInicio: document.getElementById('inicio'),
    contenedorAR: document.getElementById('contenedor-ar'),
    
    // Botones
    btnIniciarAR: document.getElementById('btn-iniciar-ar'),
    btnVolver: document.getElementById('btn-volver'),
    btnInfo: document.getElementById('btn-info'),
    btnCerrarModal: document.getElementById('btn-cerrar-modal'),
    
    // Controles AR
    btnRotar: document.getElementById('btn-rotar'),
    btnEscalar: document.getElementById('btn-escalar'),
    btnAudio: document.getElementById('btn-audio'),
    
    // Textos dinámicos
    tituloObraAR: document.getElementById('titulo-obra-ar'),
    detallesObraAR: document.getElementById('detalles-obra-ar'),
    textoInstrucciones: document.getElementById('texto-instrucciones'),
    indicadorCarga: document.getElementById('indicador-carga'),
    
    // Modal
    modalInfo: document.getElementById('modal-info'),
    
    // Elementos A-Frame
    escultura: document.getElementById('escultura'),
    marcador: document.getElementById('marcador'),
    escenaAR: document.querySelector('a-scene')
};

/**
 * Inicializa la aplicación
 */
function inicializarApp() {
    console.log('🖼️ Galería Daniel Guido - WebAR Responsive');
    
    // Detectar dispositivo y orientación
    detectarDispositivo();
    
    // Configurar listeners
    configurarEventListeners();
    
    // Verificar compatibilidad
    verificarCompatibilidadAR();
    
    // Ajustar para iOS Safari
    ajustarParaSafari();
    
    console.log('✅ Aplicación inicializada para:', 
        EstadoApp.isMobile ? 'Móvil' : 'Desktop', 
        EstadoApp.orientation);
}

/**
 * Detecta tipo de dispositivo y orientación
 */
function detectarDispositivo() {
    // Detectar móvil
    EstadoApp.isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    // Detectar orientación inicial
    EstadoApp.orientation = window.innerWidth > window.innerHeight ? 'landscape' : 'portrait';
    
    // Listener para cambios de orientación
    window.addEventListener('resize', manejarResize);
    window.addEventListener('orientationchange', manejarOrientacionChange);
}

/**
 * Maneja cambios de tamaño
 */
function manejarResize() {
    EstadoApp.orientation = window.innerWidth > window.innerHeight ? 'landscape' : 'portrait';
    
    // Ajustar AR si está activo
    if (EstadoApp.arActivo) {
        ajustarVentanaAR();
    }
}

/**
 * Maneja cambios de orientación
 */
function manejarOrientacionChange() {
    // Pequeño delay para que el navegador actualice dimensiones
    setTimeout(() => {
        EstadoApp.orientation = window.innerWidth > window.innerHeight ? 'landscape' : 'portrait';
        
        if (EstadoApp.arActivo) {
            ajustarVentanaAR();
            mostrarMensajeOrientacion();
        }
    }, 300);
}

/**
 * Ajustes específicos para Safari iOS
 */
function ajustarParaSafari() {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    
    if (isIOS) {
        // Prevenir zoom en inputs
        document.addEventListener('touchstart', (e) => {
            if (e.target.tagName === 'INPUT' || 
                e.target.tagName === 'TEXTAREA' || 
                e.target.tagName === 'BUTTON' ||
                e.target.tagName === 'SELECT') {
                e.preventDefault();
            }
        }, { passive: false });
        
        // Ajustar altura para Safari
        document.documentElement.style.height = '-webkit-fill-available';
        document.body.style.height = '-webkit-fill-available';
    }
}

/**
 * Configura todos los event listeners
 */
function configurarEventListeners() {
    // Navegación principal
    elementos.btnIniciarAR.addEventListener('click', iniciarExperienciaAR);
    elementos.btnVolver.addEventListener('click', volverAlInicio);
    elementos.btnInfo.addEventListener('click', mostrarInformacion);
    elementos.btnCerrarModal.addEventListener('click', cerrarModal);
    
    // Controles AR
    elementos.btnRotar.addEventListener('click', toggleRotacion);
    elementos.btnEscalar.addEventListener('click', resetEscala);
    elementos.btnAudio.addEventListener('click', toggleAudio);
    
    // Cerrar modal haciendo clic fuera
    elementos.modalInfo.addEventListener('click', (e) => {
        if (e.target === elementos.modalInfo) {
            cerrarModal();
        }
    });
    
    // Tecla Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            if (EstadoApp.arActivo) volverAlInicio();
            if (elementos.modalInfo.getAttribute('aria-hidden') === 'false') cerrarModal();
        }
    });
    
    // Modelo 3D
    if (elementos.escultura) {
        elementos.escultura.addEventListener('model-loaded', manejarModeloCargado);
        elementos.escultura.addEventListener('error', manejarErrorModelo);
    }
    
    // Marcador AR
    if (elementos.marcador) {
        elementos.marcador.addEventListener('markerFound', manejarMarcadorEncontrado);
        elementos.marcador.addEventListener('markerLost', manejarMarcadorPerdido);
    }
    
    // Touch events para mejor UX en móvil
    document.addEventListener('touchmove', (e) => {
        if (EstadoApp.arActivo && e.target.tagName === 'BUTTON') {
            e.preventDefault();
        }
    }, { passive: false });
}

/**
 * Verifica compatibilidad con WebAR
 */
function verificarCompatibilidadAR() {
    if (!EstadoApp.isMobile) {
        elementos.btnIniciarAR.disabled = true;
        elementos.btnIniciarAR.innerHTML = '<span class="btn-texto">AR solo disponible en móviles</span>';
        elementos.btnIniciarAR.classList.add('cargando');
        elementos.btnIniciarAR.style.opacity = '0.7';
        console.warn('⚠️ WebAR solo disponible en dispositivos móviles');
    }
    
    // Verificar si es iOS y mostrar advertencia sobre Safari
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    if (isIOS) {
        const isSafari = /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent);
        if (!isSafari) {
            mostrarAdvertenciaNavegador('Para mejor experiencia en iOS, usa Safari');
        }
    }
}

/**
 * Maneja carga del modelo 3D
 */
function manejarModeloCargado() {
    console.log('✅ Modelo 3D cargado');
    EstadoApp.esculturaCargada = true;
    actualizarInterfazCarga(false);
    
    // Ajustar escala según dispositivo
    if (EstadoApp.isMobile && EstadoApp.orientation === 'portrait') {
        elementos.escultura.setAttribute('scale', '0.4 0.4 0.4');
    }
}

/**
 * Maneja error del modelo 3D
 */
function manejarErrorModelo(e) {
    console.error('❌ Error cargando modelo 3D:', e.detail);
    mostrarErrorModelo();
}

/**
 * Maneja marcador encontrado
 */
function manejarMarcadorEncontrado() {
    console.log('🎯 Marcador detectado');
    actualizarInstrucciones('¡Escultura encontrada! Puedes acercarte y observarla.');
    actualizarInterfazCarga(false);
}

/**
 * Maneja marcador perdido
 */
function manejarMarcadorPerdido() {
    console.log('🔍 Buscando escultura...');
    actualizarInstrucciones('Mueve el dispositivo para encontrar una superficie plana');
    actualizarInterfazCarga(true);
}

/**
 * Inicia la experiencia AR
 */
async function iniciarExperienciaAR() {
    console.log('🚀 Iniciando AR...');
    
    if (!EstadoApp.isMobile) {
        alert('La experiencia AR está optimizada para dispositivos móviles. Por favor, accede desde tu teléfono.');
        return;
    }
    
    try {
        // Solicitar permisos de cámara
        const stream = await navigator.mediaDevices.getUserMedia({ 
            video: { 
                facingMode: 'environment',
                width: { ideal: 1280 },
                height: { ideal: 720 }
            } 
        });
        
        // Detener stream previo si existe
        stream.getTracks().forEach(track => track.stop());
        
        // Transición a AR
        transicionAAR();
        
    } catch (error) {
        console.error('❌ Error cámara:', error);
        manejarErrorCamara(error);
    }
}

/**
 * Transición a AR
 */
function transicionAAR() {
    EstadoApp.arActivo = true;
    
    // Cambiar pantallas
    elementos.pantallaInicio.classList.remove('activa');
    elementos.contenedorAR.classList.add('activa');
    
    // Ajustar ventana AR
    ajustarVentanaAR();
    
    // Actualizar interfaz
    actualizarInstrucciones('Mueve el dispositivo para encontrar una superficie plana');
    actualizarInterfazCarga(true);
    
    // Forzar redimensionamiento para Safari
    setTimeout(() => {
        window.dispatchEvent(new Event('resize'));
    }, 100);
    
    console.log('🔄 AR activado');
}

/**
 * Ajusta ventana AR según dispositivo
 */
function ajustarVentanaAR() {
    if (!elementos.escenaAR) return;
    
    const escena = elementos.escenaAR;
    
    // Ajustar para orientación
    if (EstadoApp.orientation === 'landscape') {
        // En horizontal, ajustar escala
        if (elementos.escultura) {
            elementos.escultura.setAttribute('scale', '0.3 0.3 0.3');
        }
        actualizarInstrucciones('Encuentra una superficie plana para ver la escultura');
    } else {
        // En vertical, escala normal
        if (elementos.escultura) {
            elementos.escultura.setAttribute('scale', '0.5 0.5 0.5');
        }
    }
    
    console.log('🔄 Ventana AR ajustada para:', EstadoApp.orientation);
}

/**
 * Vuelve al inicio
 */
function volverAlInicio() {
    EstadoApp.arActivo = false;
    
    elementos.contenedorAR.classList.remove('activa');
    elementos.pantallaInicio.classList.add('activa');
    
    resetControlesAR();
    
    console.log('🏠 Regreso al inicio');
}

/**
 * Muestra información
 */
function mostrarInformacion() {
    elementos.modalInfo.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    
    // Scroll al top del modal
    elementos.modalInfo.scrollTop = 0;
}

/**
 * Cierra modal
 */
function cerrarModal() {
    elementos.modalInfo.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = 'auto';
}

/**
 * Control de rotación
 */
function toggleRotacion() {
    EstadoApp.rotacionAutomatica = !EstadoApp.rotacionAutomatica;
    
    if (elementos.escultura) {
        if (EstadoApp.rotacionAutomatica) {
            elementos.escultura.setAttribute('animation', 'property: rotation; to: 0 360 0; loop: true; dur: 20000; easing: linear');
            elementos.btnRotar.classList.add('activo');
        } else {
            elementos.escultura.removeAttribute('animation');
            elementos.btnRotar.classList.remove('activo');
        }
    }
}

/**
 * Reinicia escala
 */
function resetEscala() {
    if (!elementos.escultura) return;
    
    const escala = EstadoApp.orientation === 'landscape' ? '0.3 0.3 0.3' : '0.5 0.5 0.5';
    elementos.escultura.setAttribute('scale', escala);
    
    // Feedback táctil
    elementos.btnEscalar.classList.add('activo');
    setTimeout(() => elementos.btnEscalar.classList.remove('activo'), 300);
}

/**
 * Control de audio
 */
function toggleAudio() {
    EstadoApp.audioActivo = !EstadoApp.audioActivo;
    
    if (EstadoApp.audioActivo) {
        elementos.btnAudio.classList.add('activo');
    } else {
        elementos.btnAudio.classList.remove('activo');
    }
}

/**
 * Actualiza instrucciones
 */
function actualizarInstrucciones(texto) {
    if (elementos.textoInstrucciones) {
        elementos.textoInstrucciones.textContent = texto;
    }
}

/**
 * Actualiza interfaz de carga
 */
function actualizarInterfazCarga(cargando) {
    if (elementos.indicadorCarga) {
        elementos.indicadorCarga.style.display = cargando ? 'flex' : 'none';
    }
    
    if (cargando) {
        elementos.textoInstrucciones?.classList.add('cargando');
    } else {
        elementos.textoInstrucciones?.classList.remove('cargando');
    }
}

/**
 * Resetea controles AR
 */
function resetControlesAR() {
    EstadoApp.rotacionAutomatica = true;
    EstadoApp.audioActivo = false;
    
    elementos.btnRotar.classList.remove('activo');
    elementos.btnAudio.classList.remove('activo');
    elementos.btnEscalar.classList.remove('activo');
}

/**
 * Maneja error de cámara
 */
function manejarErrorCamara(error) {
    let mensaje = 'No se pudo acceder a la cámara. ';
    
    switch(error.name) {
        case 'NotAllowedError':
            mensaje += 'Por favor, permite el acceso a la cámara en la configuración de tu navegador.';
            break;
        case 'NotFoundError':
            mensaje += 'No se encontró una cámara en tu dispositivo.';
            break;
        case 'NotSupportedError':
            mensaje += 'Tu navegador no soporta acceso a la cámara.';
            break;
        default:
            mensaje += 'Por favor, verifica los permisos de cámara y recarga la página.';
    }
    
    alert(mensaje);
}

/**
 * Maneja error de modelo
 */
function mostrarErrorModelo() {
    actualizarInstrucciones('Error cargando la escultura. Verifica tu conexión.');
    
    // Fallback visual
    if (elementos.escultura) {
        elementos.escultura.setAttribute('geometry', 'primitive: box; width: 0.5; height: 0.5; depth: 0.5');
        elementos.escultura.setAttribute('material', 'color: #C4A35A');
    }
}

/**
 * Muestra mensaje de orientación
 */
function mostrarMensajeOrientacion() {
    if (EstadoApp.orientation === 'landscape') {
        actualizarInstrucciones('Modo horizontal activado. Encuentra una superficie plana.');
    }
}

/**
 * Muestra advertencia de navegador
 */
function mostrarAdvertenciaNavegador(mensaje) {
    console.warn('⚠️ ' + mensaje);
}

// Inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inicializarApp);
} else {
    inicializarApp();
}

// Exportar para debugging
if (window) {
    window.GaleriaDanielGuido = {
        EstadoApp,
        elementos,
        funciones: {
            iniciarExperienciaAR,
            volverAlInicio,
            toggleRotacion,
            resetEscala,
            toggleAudio
        }
    };
}

console.log('🎨 Galería Daniel Guido - WebAR Responsive cargado');