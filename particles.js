// Particle system for additional visual effects
class ParticleSystem {
    constructor() {
        this.particles = [];
        this.sparks = [];
        this.canvas = null;
        this.ctx = null;
        this.animationId = null;
        this.init();
    }

    init() {
        this.createCanvas();
        this.setupParticles();
        this.startAnimation();
    }

    createCanvas() {
        this.canvas = document.createElement('canvas');
        this.canvas.style.position = 'fixed';
        this.canvas.style.top = '0';
        this.canvas.style.left = '0';
        this.canvas.style.width = '100%';
        this.canvas.style.height = '100%';
        this.canvas.style.pointerEvents = 'none';
        this.canvas.style.zIndex = '5';
        
        this.ctx = this.canvas.getContext('2d');
        document.body.appendChild(this.canvas);
        
        this.resize();
        window.addEventListener('resize', () => this.resize());
    }

    setupParticles() {
        // Create floating embers
        for (let i = 0; i < 30; i++) {
            this.particles.push(this.createEmber());
        }
        
        // Create title sparks
        this.createTitleSparks();
    }

    createEmber() {
        return {
            x: Math.random() * window.innerWidth,
            y: window.innerHeight + Math.random() * 100,
            vx: (Math.random() - 0.5) * 2,
            vy: -Math.random() * 3 - 1,
            size: Math.random() * 3 + 1,
            life: Math.random() * 100 + 50,
            maxLife: 150,
            color: `hsl(${Math.random() * 20}, 100%, ${50 + Math.random() * 30}%)`,
            type: 'ember'
        };
    }

    createTitleSparks() {
        const titleElement = document.querySelector('.doom-title');
        if (!titleElement) return;

        const rect = titleElement.getBoundingClientRect();
        
        for (let i = 0; i < 20; i++) {
            this.sparks.push({
                x: rect.left + Math.random() * rect.width,
                y: rect.top + Math.random() * rect.height,
                vx: (Math.random() - 0.5) * 4,
                vy: (Math.random() - 0.5) * 4,
                size: Math.random() * 2 + 0.5,
                life: Math.random() * 60 + 30,
                maxLife: 90,
                color: `hsl(${Math.random() * 20}, 100%, 80%)`,
                type: 'spark',
                delay: Math.random() * 200
            });
        }
    }

    updateParticles() {
        // Update embers
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];
            
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.life--;
            
            // Add slight random movement
            particle.vx += (Math.random() - 0.5) * 0.1;
            particle.vy += (Math.random() - 0.5) * 0.1;
            
            // Gravity and wind effect
            particle.vy -= 0.02;
            particle.vx += Math.sin(Date.now() * 0.001 + particle.x * 0.01) * 0.02;
            
            // Remove dead particles
            if (particle.life <= 0 || particle.y < -50) {
                this.particles.splice(i, 1);
                this.particles.push(this.createEmber());
            }
        }

        // Update sparks
        for (let i = this.sparks.length - 1; i >= 0; i--) {
            const spark = this.sparks[i];
            
            if (spark.delay > 0) {
                spark.delay--;
                continue;
            }
            
            spark.x += spark.vx;
            spark.y += spark.vy;
            spark.life--;
            
            // Fade velocity
            spark.vx *= 0.98;
            spark.vy *= 0.98;
            
            // Remove dead sparks
            if (spark.life <= 0) {
                this.sparks.splice(i, 1);
            }
        }
    }

    drawParticles() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw embers
        this.particles.forEach(particle => {
            const alpha = particle.life / particle.maxLife;
            const size = particle.size * alpha;
            
            this.ctx.save();
            this.ctx.globalAlpha = alpha;
            this.ctx.fillStyle = particle.color;
            this.ctx.shadowBlur = 10;
            this.ctx.shadowColor = particle.color;
            
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, size, 0, Math.PI * 2);
            this.ctx.fill();
            
            this.ctx.restore();
        });

        // Draw sparks
        this.sparks.forEach(spark => {
            if (spark.delay > 0) return;
            
            const alpha = spark.life / spark.maxLife;
            const size = spark.size * alpha;
            
            this.ctx.save();
            this.ctx.globalAlpha = alpha;
            this.ctx.fillStyle = spark.color;
            this.ctx.shadowBlur = 5;
            this.ctx.shadowColor = spark.color;
            
            this.ctx.beginPath();
            this.ctx.arc(spark.x, spark.y, size, 0, Math.PI * 2);
            this.ctx.fill();
            
            this.ctx.restore();
        });
    }

    createExplosion(x, y) {
        // Create explosion effect at given position
        for (let i = 0; i < 15; i++) {
            this.sparks.push({
                x: x,
                y: y,
                vx: (Math.random() - 0.5) * 8,
                vy: (Math.random() - 0.5) * 8,
                size: Math.random() * 3 + 1,
                life: Math.random() * 40 + 20,
                maxLife: 60,
                color: `hsl(${Math.random() * 40}, 100%, 70%)`,
                type: 'explosion',
                delay: 0
            });
        }
    }

    start() {
        this.startAnimation();
    }

    startAnimation() {
        const animate = () => {
            this.updateParticles();
            this.drawParticles();
            this.animationId = requestAnimationFrame(animate);
        };
        animate();
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    destroy() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        if (this.canvas && this.canvas.parentElement) {
            this.canvas.parentElement.removeChild(this.canvas);
        }
    }
}

// Initialize particle system
window.addEventListener('DOMContentLoaded', () => {
    window.particleSystem = new ParticleSystem();
});

// Add mouse interaction
document.addEventListener('mousemove', (event) => {
    if (window.particleSystem && Math.random() < 0.1) {
        window.particleSystem.createExplosion(event.clientX, event.clientY);
    }
});

