import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

const AnimatedBackground = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let particles = [];

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Create animated particles
    class Particle {
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 3 + 1;
        this.speedX = (Math.random() - 0.5) * 0.5;
        this.speedY = (Math.random() - 0.5) * 0.5;
        this.hue = Math.random() * 360;
        this.opacity = Math.random() * 0.5 + 0.2;
      }

      update() {
        this.x += this.speedX;
        this.y += this.speedY;
        this.hue = (this.hue + 0.5) % 360;

        if (this.x < 0 || this.x > canvas.width) this.speedX *= -1;
        if (this.y < 0 || this.y > canvas.height) this.speedY *= -1;
      }

      draw() {
        const isDark = typeof document !== 'undefined' && document.documentElement.classList.contains('dark');
        const gradient = ctx.createRadialGradient(
          this.x,
          this.y,
          0,
          this.x,
          this.y,
          this.size * 20
        );

        const opacity = isDark ? this.opacity * 0.3 : this.opacity * 0.15;
        gradient.addColorStop(0, `hsla(${this.hue}, 70%, 60%, ${opacity})`);
        gradient.addColorStop(0.5, `hsla(${(this.hue + 60) % 360}, 70%, 60%, ${opacity * 0.5})`);
        gradient.addColorStop(1, `hsla(${(this.hue + 120) % 360}, 70%, 60%, 0)`);

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size * 20, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Initialize particles - reduced for better performance
    for (let i = 0; i < 5; i++) {
      particles.push(new Particle());
    }

    const animate = () => {
      ctx.fillStyle = 'rgba(15, 23, 42, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      particles.forEach((particle) => {
        particle.update();
        particle.draw();
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none" style={{ willChange: 'transform' }}>
      <canvas ref={canvasRef} className="absolute inset-0" style={{ willChange: 'transform' }} />
      <div className="absolute inset-0 bg-gradient-to-br from-primary-500/5 via-purple-500/5 to-pink-500/5" />
      <motion.div
        className="absolute inset-0"
        style={{ willChange: 'background' }}
        animate={{
          background: [
            'radial-gradient(circle at 20% 50%, rgba(102, 126, 234, 0.08), transparent 50%)',
            'radial-gradient(circle at 80% 80%, rgba(118, 75, 162, 0.08), transparent 50%)',
            'radial-gradient(circle at 40% 20%, rgba(240, 147, 251, 0.08), transparent 50%)',
            'radial-gradient(circle at 20% 50%, rgba(102, 126, 234, 0.08), transparent 50%)',
          ],
        }}
        transition={{
          duration: 30,
          repeat: Infinity,
          ease: 'linear',
        }}
      />
    </div>
  );
};

export default AnimatedBackground;

