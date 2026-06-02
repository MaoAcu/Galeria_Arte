  class CinematicCamera {
    constructor(camera) {
        this.camera = camera;
        this.breath = 0;
    }

    // Respiración suave de la cámara
    applyBreathing() {
        this.breath += 0.0005;
        this.camera.position.y += Math.sin(this.breath) * 0.01;
    }

    // Transición entre esculturas
    transitionTo(targetPosition, duration = 3) {
        const start = this.camera.position.clone();
        const startTime = Date.now();
        
        return new Promise(resolve => {
            const animate = () => {
                const elapsed = (Date.now() - startTime) / 1000;
                const progress = Math.min(elapsed / duration, 1);
                
                // Easing cinematográfico (easeInOutCubic)
                const eased = progress < 0.5
                    ? 4 * progress * progress * progress
                    : 1 - Math.pow(-2 * progress + 2, 3) / 2;
                
                this.camera.position.lerpVectors(start, targetPosition, eased);
                
                if (progress < 1) {
                    requestAnimationFrame(animate);
                } else {
                    resolve();
                }
            };
            animate();
        });
    }
}