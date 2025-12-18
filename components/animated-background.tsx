"use client";

import React, { useEffect, useRef } from "react";

interface ParticleType {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  color: string;
  alpha: number;
  waveOffset: number;
  waveSpeed: number;
  isEnergyParticle: boolean;
  orbitRadius: number;
  orbitAngle: number;
  orbitSpeed: number;
  pulse: number;
  pulseSpeed: number;
}

const AnimatedBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const particlesRef = useRef<ParticleType[]>([]);
  const mouseRef = useRef<{
    x: number | null;
    y: number | null;
    radius: number;
  }>({
    x: null,
    y: null,
    radius: 150,
  });
  const centerRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Оптимизированная инициализация частиц
  const initParticles = (canvas: HTMLCanvasElement) => {
    const particles: ParticleType[] = [];
    const particleCount = 100; // Значительно уменьшено количество частиц

    for (let i = 0; i < particleCount; i++) {
      const isEnergyParticle = i < 20; // Только 20% частиц энергетические

      if (isEnergyParticle) {
        // Энергетические частицы вращаются по орбите
        particles.push({
          x: centerRef.current.x,
          y: centerRef.current.y,
          size: Math.random() * 3 + 1.5,
          speedX: 0,
          speedY: 0,
          color: "#ffffff",
          alpha: Math.random() * 0.4 + 0.3,
          waveOffset: Math.random() * Math.PI * 2,
          waveSpeed: Math.random() * 0.01 + 0.005,
          isEnergyParticle: true,
          orbitRadius: 80 + Math.random() * 200,
          orbitAngle: Math.random() * Math.PI * 2,
          orbitSpeed: (Math.random() - 0.5) * 0.0015,
          pulse: Math.random() * Math.PI * 2,
          pulseSpeed: Math.random() * 0.02 + 0.01,
        });
      } else {
        // Обычные частицы
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: Math.random() * 2 + 0.5,
          speedX: (Math.random() - 0.5) * 0.3,
          speedY: (Math.random() - 0.5) * 0.3,
          color: Math.random() > 0.5 ? "#000000" : "#111111",
          alpha: Math.random() * 0.5 + 0.2,
          waveOffset: Math.random() * Math.PI * 2,
          waveSpeed: Math.random() * 0.01 + 0.005,
          isEnergyParticle: false,
          orbitRadius: 0,
          orbitAngle: 0,
          orbitSpeed: 0,
          pulse: Math.random() * Math.PI * 2,
          pulseSpeed: Math.random() * 0.01 + 0.005,
        });
      }
    }

    particlesRef.current = particles;
  };

  // Оптимизированное обновление частиц
  const updateParticles = (canvas: HTMLCanvasElement, time: number) => {
    const centerX = centerRef.current.x;
    const centerY = centerRef.current.y;
    const mouse = mouseRef.current;

    for (let i = 0; i < particlesRef.current.length; i++) {
      const p = particlesRef.current[i];

      if (p.isEnergyParticle) {
        // Орбитальное движение с пульсацией
        p.orbitAngle += p.orbitSpeed;
        p.pulse += p.pulseSpeed;

        const pulseEffect = Math.sin(p.pulse) * 0.2 + 1;

        p.x =
          centerX +
          Math.cos(p.orbitAngle + time * 0.0005) * p.orbitRadius * pulseEffect;
        p.y =
          centerY +
          Math.sin(p.orbitAngle + time * 0.0005) * p.orbitRadius * pulseEffect;
        p.alpha = 0.3 + Math.sin(p.pulse * 2) * 0.2;
      } else {
        // Простое движение с границами
        p.x += p.speedX;
        p.y += p.speedY;

        // Отскок от границ
        if (p.x > canvas.width || p.x < 0) p.speedX = -p.speedX * 0.95;
        if (p.y > canvas.height || p.y < 0) p.speedY = -p.speedY * 0.95;

        // Легкое притяжение к центру
        const dx = centerX - p.x;
        const dy = centerY - p.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 400 && distance > 30) {
          p.speedX += dx * 0.0001;
          p.speedY += dy * 0.0001;
        }

        // Взаимодействие с мышью
        if (mouse.x !== null && mouse.y !== null) {
          const mx = mouse.x - p.x;
          const my = mouse.y - p.y;
          const mouseDistance = Math.sqrt(mx * mx + my * my);

          if (mouseDistance < mouse.radius) {
            const force =
              ((mouse.radius - mouseDistance) / mouse.radius) * 0.05;
            p.x -= mx * force;
            p.y -= my * force;
          }
        }

        // Пульсация альфы
        p.pulse += p.pulseSpeed;
        p.alpha = 0.2 + Math.sin(p.pulse) * 0.15;
      }
    }
  };

  // Оптимизированная отрисовка
  const drawParticles = (ctx: CanvasRenderingContext2D) => {
    for (let i = 0; i < particlesRef.current.length; i++) {
      const p = particlesRef.current[i];

      ctx.globalAlpha = p.alpha;

      if (p.isEnergyParticle) {
        // Энергетические частицы
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // Обычные частицы
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.globalAlpha = 1;
  };

  // Центральный вращающийся узел
  const drawNexus = (ctx: CanvasRenderingContext2D, time: number) => {
    const centerX = centerRef.current.x;
    const centerY = centerRef.current.y;
    const pulse = Math.sin(time * 0.001) * 0.15 + 0.85;
    const rotation = time * 0.0003;

    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(rotation);

    // Внутреннее ядро
    const coreGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, 60 * pulse);
    coreGradient.addColorStop(0, "rgba(255, 255, 255, 0.15)");
    coreGradient.addColorStop(1, "rgba(255, 255, 255, 0)");

    ctx.beginPath();
    ctx.arc(0, 0, 60 * pulse, 0, Math.PI * 2);
    ctx.fillStyle = coreGradient;
    ctx.fill();

    // Внешнее кольцо
    ctx.beginPath();
    ctx.arc(0, 0, 100, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(255, 255, 255, ${
      0.1 + Math.sin(time * 0.002) * 0.05
    })`;
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // 4 луча
    for (let i = 0; i < 4; i++) {
      const angle = (i / 4) * Math.PI * 2 + rotation * 1.5;
      const length = 80 + Math.sin(time * 0.002 + i) * 20;

      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(Math.cos(angle) * length, Math.sin(angle) * length);
      ctx.strokeStyle = `rgba(255, 255, 255, ${
        0.08 + Math.sin(time * 0.003 + i) * 0.04
      })`;
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    ctx.restore();
  };

  // Оптимизированный анимационный цикл
  const animate = (time: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Эффект шлейфа с минимальной прозрачностью
    ctx.fillStyle = "rgba(8, 8, 8, 0.08)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Темный градиентный фон
    const gradient = ctx.createRadialGradient(
      centerRef.current.x,
      centerRef.current.y,
      0,
      centerRef.current.x,
      centerRef.current.y,
      Math.max(canvas.width, canvas.height) * 0.6
    );
    gradient.addColorStop(0, "rgba(0, 0, 0, 0.9)");
    gradient.addColorStop(1, "rgba(20, 20, 20, 0.7)");

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Обновление и отрисовка
    updateParticles(canvas, time);
    drawNexus(ctx, time);
    drawParticles(ctx);

    animationRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Установка размера
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      centerRef.current = {
        x: canvas.width / 2,
        y: canvas.height / 2,
      };
      initParticles(canvas);
    };

    resizeCanvas();

    // Обработчики событий
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.x = e.clientX;
      mouseRef.current.y = e.clientY;
    };

    const handleMouseLeave = () => {
      mouseRef.current.x = null;
      mouseRef.current.y = null;
    };

    // Запуск анимации
    animationRef.current = requestAnimationFrame(animate);

    window.addEventListener("resize", resizeCanvas);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      cancelAnimationFrame(animationRef.current);
      window.removeEventListener("resize", resizeCanvas);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        zIndex: -10,
        pointerEvents: "none",
        opacity: 1,
      }}
    />
  );
};

export default AnimatedBackground;
