"use client";

import { useEffect, useRef } from "react";

export function AnimatedBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();

  useEffect(() => {
    if (typeof window === "undefined") return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    const colors = {
      background: "#000000",
      darkest: "#0a0a0a",
      dark: "#1a1a1a",
      medium: "#2a2a2a",
      light: "#3a3a3a",
      lighter: "#4a4a4a",
      lightest: "#5a5a5a",
      white: "#ffffff",
      offWhite: "#f0f0f0",
      gray: "#888888",
      accentLight: "#e0e0e0",
      accentWhite: "#ffffff",
    };

    class Particle {
      x: number;
      y: number;
      size: number;
      speedX: number;
      speedY: number;
      opacity: number;
      color: string;
      pulseSpeed: number;
      waveOffset: number;
      originalSize: number;

      constructor(canvasWidth: number, canvasHeight: number) {
        this.x = Math.random() * canvasWidth;
        this.y = Math.random() * canvasHeight;
        this.originalSize = Math.random() * 1.5 + 0.5;
        this.size = this.originalSize;
        this.speedX = Math.random() * 0.6 - 0.3;
        this.speedY = Math.random() * 0.6 - 0.3;
        this.opacity = Math.random() * 0.6 + 0.1;
        const rand = Math.random();
        this.color =
          rand > 0.8
            ? colors.accentWhite
            : rand > 0.6
            ? colors.offWhite
            : rand > 0.4
            ? colors.lightest
            : rand > 0.2
            ? colors.lighter
            : colors.gray;
        this.pulseSpeed = Math.random() * 0.03 + 0.01;
        this.waveOffset = Math.random() * Math.PI * 2;
      }

      update(canvasWidth: number, canvasHeight: number) {
        this.waveOffset += 0.04;
        this.x += this.speedX + Math.sin(this.waveOffset * 1.5) * 0.3;
        this.y += this.speedY + Math.cos(this.waveOffset) * 0.3;
        this.size =
          this.originalSize + Math.sin(Date.now() * this.pulseSpeed) * 0.5;

        if (this.x > canvasWidth + 20) this.x = -20;
        if (this.x < -20) this.x = canvasWidth + 20;
        if (this.y > canvasHeight + 20) this.y = -20;
        if (this.y < -20) this.y = canvasHeight + 20;
      }

      draw(ctx: CanvasRenderingContext2D) {
        const glowSize = this.size * 4;
        const glowGradient = ctx.createRadialGradient(
          this.x,
          this.y,
          0,
          this.x,
          this.y,
          glowSize
        );

        if (this.color === colors.accentWhite) {
          glowGradient.addColorStop(0, "rgba(255, 255, 255, 0.8)");
          glowGradient.addColorStop(0.3, "rgba(255, 255, 255, 0.2)");
        } else {
          glowGradient.addColorStop(
            0,
            `${this.color}${Math.floor(this.opacity * 255)
              .toString(16)
              .padStart(2, "0")}`
          );
          glowGradient.addColorStop(
            0.5,
            `${this.color}${Math.floor(this.opacity * 128)
              .toString(16)
              .padStart(2, "0")}`
          );
        }
        glowGradient.addColorStop(1, "transparent");

        ctx.fillStyle = glowGradient;
        ctx.beginPath();
        ctx.arc(this.x, this.y, glowSize, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = this.color;
        ctx.globalAlpha = this.opacity;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();

        const innerGlowSize = this.size * 0.8;
        const innerGradient = ctx.createRadialGradient(
          this.x,
          this.y,
          0,
          this.x,
          this.y,
          innerGlowSize
        );
        innerGradient.addColorStop(0, "rgba(255, 255, 255, 0.9)");
        innerGradient.addColorStop(1, "transparent");

        ctx.fillStyle = innerGradient;
        ctx.beginPath();
        ctx.arc(this.x, this.y, innerGlowSize, 0, Math.PI * 2);
        ctx.fill();

        ctx.globalAlpha = 1;
      }
    }

    const particles: Particle[] = [];
    const particleCount = 70;
    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle(canvas.width, canvas.height));
    }

    let time = 0;
    let wavePhase1 = 0;
    let wavePhase2 = 0;

    const createWaveGrid = () => {
      const gridSize = 60;
      const waveAmplitude = 15;

      ctx.strokeStyle = `rgba(255, 255, 255, 0.03)`;
      ctx.lineWidth = 0.3;

      for (let x = 0; x <= canvas.width; x += gridSize) {
        for (let y = 0; y <= canvas.height; y += gridSize) {
          if (x < canvas.width) {
            ctx.beginPath();
            ctx.moveTo(
              x + Math.sin(y * 0.01 + time * 2 + wavePhase1) * waveAmplitude,
              y
            );
            ctx.lineTo(
              x +
                gridSize +
                Math.sin((y + gridSize) * 0.01 + time * 2 + wavePhase1) *
                  waveAmplitude,
              y + gridSize
            );
            ctx.stroke();
          }

          if (y < canvas.height) {
            ctx.beginPath();
            ctx.moveTo(
              x,
              y + Math.cos(x * 0.01 + time * 1.5 + wavePhase2) * waveAmplitude
            );
            ctx.lineTo(
              x + gridSize,
              y +
                gridSize +
                Math.cos((x + gridSize) * 0.01 + time * 1.5 + wavePhase2) *
                  waveAmplitude
            );
            ctx.stroke();
          }
        }
      }
    };

    const animate = () => {
      ctx.fillStyle = "rgba(0, 0, 0, 0.08)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      time += 0.01;
      wavePhase1 += 0.005;
      wavePhase2 += 0.003;

      const bgGradient1 = ctx.createRadialGradient(
        canvas.width * 0.5,
        canvas.height * 0.5,
        0,
        canvas.width * 0.5,
        canvas.height * 0.5,
        Math.max(canvas.width, canvas.height) * 0.8
      );

      bgGradient1.addColorStop(
        0,
        `rgba(40, 40, 40, ${0.05 + Math.sin(time) * 0.02})`
      );
      bgGradient1.addColorStop(
        0.5,
        `rgba(20, 20, 20, ${0.03 + Math.cos(time * 1.3) * 0.01})`
      );
      bgGradient1.addColorStop(1, `rgba(0, 0, 0, ${0.01})`);

      ctx.fillStyle = bgGradient1;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      createWaveGrid();

      ctx.lineWidth = 0.5;
      for (let i = 0; i < 3; i++) {
        const amplitude = 30 + i * 15;
        const frequency = 0.005 + i * 0.002;
        const speed = 0.5 + i * 0.2;

        ctx.beginPath();
        ctx.strokeStyle = `rgba(255, 255, 255, ${0.02 - i * 0.005})`;

        for (let x = 0; x < canvas.width; x += 2) {
          const y =
            canvas.height * (0.3 + i * 0.2) +
            Math.sin(x * frequency + time * speed + (i * Math.PI) / 2) *
              amplitude;

          if (x === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        ctx.stroke();
      }

      particles.forEach((particle) => {
        particle.update(canvas.width, canvas.height);
        particle.draw(ctx);
      });

      ctx.lineWidth = 0.3;
      particles.forEach((particleA, indexA) => {
        particles.slice(indexA + 1).forEach((particleB) => {
          const dx = particleA.x - particleB.x;
          const dy = particleA.y - particleB.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 120) {
            const opacity =
              0.2 *
              (1 - distance / 120) *
              Math.min(particleA.opacity, particleB.opacity) *
              (0.7 + Math.sin(time * 2) * 0.3);

            const lineGradient = ctx.createLinearGradient(
              particleA.x,
              particleA.y,
              particleB.x,
              particleB.y
            );

            lineGradient.addColorStop(0, `rgba(255, 255, 255, ${opacity})`);
            lineGradient.addColorStop(
              0.5,
              `rgba(200, 200, 200, ${opacity * 0.7})`
            );
            lineGradient.addColorStop(
              1,
              `rgba(150, 150, 150, ${opacity * 0.4})`
            );

            ctx.strokeStyle = lineGradient;
            ctx.beginPath();
            ctx.moveTo(particleA.x, particleA.y);

            const controlX =
              (particleA.x + particleB.x) / 2 +
              Math.sin(time * 3 + distance * 0.01) * 20;
            const controlY =
              (particleA.y + particleB.y) / 2 +
              Math.cos(time * 2 + distance * 0.01) * 20;
            ctx.quadraticCurveTo(controlX, controlY, particleB.x, particleB.y);
            ctx.stroke();
          }
        });
      });

      const scanLineHeight = 1;
      const scanPosition = (Date.now() * 0.1) % (canvas.height + 100);
      const scanGradient = ctx.createLinearGradient(
        0,
        0,
        0,
        scanLineHeight * 2
      );
      scanGradient.addColorStop(0, "rgba(255, 255, 255, 0)");
      scanGradient.addColorStop(0.3, "rgba(255, 255, 255, 0.3)");
      scanGradient.addColorStop(0.7, "rgba(255, 255, 255, 0.3)");
      scanGradient.addColorStop(1, "rgba(255, 255, 255, 0)");

      ctx.fillStyle = scanGradient;
      ctx.fillRect(
        0,
        scanPosition - scanLineHeight,
        canvas.width,
        scanLineHeight * 2
      );

      const pulseSize = 50 + Math.sin(time * 2) * 20;
      const cornerCircles = [
        { x: 0, y: 0 },
        { x: canvas.width, y: 0 },
        { x: 0, y: canvas.height },
        { x: canvas.width, y: canvas.height },
      ];

      cornerCircles.forEach((corner, i) => {
        const pulseOpacity = 0.03 + Math.sin(time * 3 + i) * 0.02;
        const pulseGradient = ctx.createRadialGradient(
          corner.x,
          corner.y,
          0,
          corner.x,
          corner.y,
          pulseSize
        );
        pulseGradient.addColorStop(0, `rgba(255, 255, 255, ${pulseOpacity})`);
        pulseGradient.addColorStop(1, "transparent");

        ctx.fillStyle = pulseGradient;
        ctx.beginPath();
        ctx.arc(corner.x, corner.y, pulseSize, 0, Math.PI * 2);
        ctx.fill();
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <>
      <canvas
        ref={canvasRef}
        className="fixed top-0 left-0 w-full h-full -z-10"
        style={{
          background:
            "linear-gradient(135deg, #000000 0%, #0a0a0a 50%, #000000 100%)",
        }}
      />
      <div
        className="fixed top-0 left-0 w-full h-full -z-10 pointer-events-none"
        style={{
          background: `
            radial-gradient(ellipse at 10% 20%, rgba(255, 255, 255, 0.02) 0%, transparent 50%),
            radial-gradient(ellipse at 90% 80%, rgba(255, 255, 255, 0.015) 0%, transparent 50%),
            radial-gradient(ellipse at 50% 50%, rgba(255, 255, 255, 0.01) 0%, transparent 60%)
          `,
          backdropFilter: "blur(60px) contrast(120%)",
          mixBlendMode: "overlay",
        }}
      />
      <div
        className="fixed top-0 left-0 w-full h-full -z-10 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 30%, rgba(0, 0, 0, 0.9) 70%)",
        }}
      />
    </>
  );
}
