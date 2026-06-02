 class SoundAmbient {
    constructor() {
        this.audioContext = null;
        this.isPlaying = false;
        this.gainNode = null;
    }

    async init() {
        // Crear contexto de audio (requiere interacción del usuario)
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        
        // Crear sonido generativo (no requiere archivo)
        this.createAmbientDrone();
    }

    createAmbientDrone() {
        // Oscilador para drone ambiental
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(55, this.audioContext.currentTime); // A1
        oscillator.frequency.linearRampToValueAtTime(54.5, this.audioContext.currentTime + 10);
        
        gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.08, this.audioContext.currentTime + 2);
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.start();
        this.gainNode = gainNode;
        this.isPlaying = true;
    }

    fadeOut() {
        if (this.gainNode) {
            this.gainNode.gain.linearRampToValueAtTime(0, this.audioContext.currentTime + 1);
        }
    }

    dispose() {
        if (this.audioContext) {
            this.audioContext.close();
        }
    }
}