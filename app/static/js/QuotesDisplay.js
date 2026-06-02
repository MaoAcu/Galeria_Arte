 class QuotesDisplay {
    constructor() {
        this.quotes = [
            "El arte es la mentira que nos permite comprender la verdad — Picasso",
            "La escultura es el arte de la inteligencia — Picasso",
            "Cada bloque de piedra tiene una estatua dentro — Miguel Ángel",
            "El arte lava del alma el polvo de la vida cotidiana — Picasso",
            "La simplicidad es la máxima sofisticación — Da Vinci",
            "El propósito del arte es lavar el polvo de la vida diaria de nuestras almas",
            "Donde el espíritu no trabaja con la mano, no hay arte — Da Vinci"
        ];
        
        this.currentQuote = null;
        this.container = null;
        this.init();
    }

    init() {
        this.container = document.createElement('div');
        this.container.className = 'immersive-quotes';
        document.body.appendChild(this.container);
        
        this.cycleQuotes();
    }

    async cycleQuotes() {
        while (true) {
            const quote = this.quotes[Math.floor(Math.random() * this.quotes.length)];
            this.showQuote(quote);
            await this.sleep(8000 + Math.random() * 5000);
        }
    }

    showQuote(quote) {
        const quoteElement = document.createElement('p');
        quoteElement.textContent = quote;
        quoteElement.style.opacity = '0';
        quoteElement.style.transform = 'translateY(20px)';
        
        this.container.innerHTML = '';
        this.container.appendChild(quoteElement);
        
        // Animación de entrada
        requestAnimationFrame(() => {
            quoteElement.style.transition = 'all 2s cubic-bezier(0.4, 0, 0.2, 1)';
            quoteElement.style.opacity = '0.7';
            quoteElement.style.transform = 'translateY(0)';
        });
        
        // Fade out después de 6 segundos
        setTimeout(() => {
            quoteElement.style.opacity = '0';
            quoteElement.style.transform = 'translateY(-20px)';
        }, 6000);
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}