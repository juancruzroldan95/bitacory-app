import { useEffect, useRef } from "react";
import { useResolvedTheme } from "@/hooks/useResolvedTheme";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  baseVx: number;
  baseVy: number;
  size: number;
  alpha: number;
}

export function InteractiveBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const theme = useResolvedTheme();
  const isDark = theme === "dark";

  // Mouse coordinate refs
  const mouseRef = useRef({ x: -1000, y: -1000, active: false });
  // Particles data ref
  const particlesRef = useRef<Particle[]>([]);
  // Animation frame ID ref
  const requestRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Detect prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    let width = 0;
    let height = 0;
    let dpr = 1;

    // Particle settings
    const particleCount = 75;
    const connectionDist = 110;
    const gravityRadius = 240;
    const gravityStrength = 0.18; // Pull force
    const maxSpeed = 1.6;

    const initParticles = () => {
      dpr = window.devicePixelRatio || 1;
      width = window.innerWidth;
      height = window.innerHeight;

      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.scale(dpr, dpr);

      const particles: Particle[] = [];
      for (let i = 0; i < particleCount; i++) {
        // Random slow initial velocity
        const vx = (Math.random() - 0.5) * 0.4;
        const vy = (Math.random() - 0.5) * 0.4;
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx,
          vy,
          baseVx: vx,
          baseVy: vy,
          size: 1 + Math.random() * 2.2,
          alpha: 0.15 + Math.random() * 0.35,
        });
      }

      particlesRef.current = particles;
    };

    initParticles();

    // Event listeners
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.x = e.clientX;
      mouseRef.current.y = e.clientY;
      mouseRef.current.active = true;
    };

    const handleMouseLeave = () => {
      mouseRef.current.active = false;
      mouseRef.current.x = -1000;
      mouseRef.current.y = -1000;
    };

    const handleResize = () => {
      initParticles();
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseleave", handleMouseLeave);
    window.addEventListener("resize", handleResize);

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      const particles = particlesRef.current;
      const mouse = mouseRef.current;

      // Read colors directly from the DOM since Canvas can't resolve CSS var() internally
      const computedStyle = getComputedStyle(document.documentElement);
      const primaryColorStr = computedStyle.getPropertyValue("--primary").trim() || "oklch(0.52 0.105 223.128)";
      const neutralColorStr = computedStyle.getPropertyValue("--chart-2").trim() || "oklch(0.768 0.233 130.85)";

      const getAlphaColor = (baseColor: string, alpha: number) => {
        const cleaned = baseColor.replace("oklch(", "").replace(")", "").trim();
        return `oklch(${cleaned} / ${alpha})`;
      };

      // 1. Update and Draw Particles
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        if (!prefersReducedMotion) {
          // Gravity pull effect
          if (mouse.active) {
            const dx = mouse.x - p.x;
            const dy = mouse.y - p.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < gravityRadius) {
              const force = (gravityRadius - dist) / gravityRadius; // 1 at center, 0 at border
              
              // Pull vector
              const ax = (dx / dist) * force * gravityStrength;
              const ay = (dy / dist) * force * gravityStrength;

              p.vx += ax;
              p.vy += ay;
            } else {
              // Return gently to baseline drift speed
              p.vx += (p.baseVx - p.vx) * 0.03;
              p.vy += (p.baseVy - p.vy) * 0.03;
            }
          } else {
            // Return gently to baseline drift speed
            p.vx += (p.baseVx - p.vx) * 0.03;
            p.vy += (p.baseVy - p.vy) * 0.03;
          }

          // Apply damping/friction
          p.vx *= 0.96;
          p.vy *= 0.96;

          // Cap velocity
          const currentSpeed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
          if (currentSpeed > maxSpeed) {
            p.vx = (p.vx / currentSpeed) * maxSpeed;
            p.vy = (p.vy / currentSpeed) * maxSpeed;
          }

          // Move particle
          p.x += p.vx;
          p.y += p.vy;

          // Boundary bounce
          if (p.x < 0) {
            p.x = 0;
            p.vx *= -1;
            p.baseVx *= -1;
          } else if (p.x > width) {
            p.x = width;
            p.vx *= -1;
            p.baseVx *= -1;
          }

          if (p.y < 0) {
            p.y = 0;
            p.vy *= -1;
            p.baseVy *= -1;
          } else if (p.y > height) {
            p.y = height;
            p.vy *= -1;
            p.baseVy *= -1;
          }
        }

        // Determine particle glow/size shift based on proximity to cursor
        let activeScale = 1;
        let pColor = neutralColorStr;
        let isGlow = false;

        if (mouse.active && !prefersReducedMotion) {
          const dx = mouse.x - p.x;
          const dy = mouse.y - p.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 180) {
            const factor = (180 - dist) / 180;
            activeScale = 1 + factor * 1.5;
            pColor = primaryColorStr; // Glow with brand teal
            isGlow = true;
          }
        }

        // Draw node dot
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * activeScale, 0, Math.PI * 2);
        ctx.fillStyle = getAlphaColor(pColor, isGlow ? 0.7 : p.alpha);
        ctx.fill();
      }

      // 2. Draw Constellation connecting lines
      for (let i = 0; i < particles.length; i++) {
        const p1 = particles[i];
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p2.x - p1.x;
          const dy = p2.y - p1.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < connectionDist) {
            // Draw connection line
            const alpha = (1 - dist / connectionDist) * (isDark ? 0.15 : 0.12);
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = getAlphaColor(neutralColorStr, alpha);
            ctx.lineWidth = 0.7;
            ctx.stroke();
          }
        }

        // Draw line from cursor to particles
        if (mouse.active && !prefersReducedMotion) {
          const dx = mouse.x - p1.x;
          const dy = mouse.y - p1.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 160) {
            const alpha = (1 - dist / 160) * 0.15;
            ctx.beginPath();
            ctx.moveTo(mouse.x, mouse.y);
            ctx.lineTo(p1.x, p1.y);
            ctx.strokeStyle = getAlphaColor(primaryColorStr, alpha);
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }
      }

      if (!prefersReducedMotion) {
        requestRef.current = requestAnimationFrame(render);
      }
    };

    render();

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseleave", handleMouseLeave);
      window.removeEventListener("resize", handleResize);
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [isDark]);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 -z-10 h-full w-full bg-background transition-colors duration-500"
    />
  );
}
