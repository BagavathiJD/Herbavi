type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  rot: number;
  vr: number;
  shape: 'rect' | 'circle';
  life: number;
};

const COLORS = ['#355E3B', '#C8A24A', '#6B4E31', '#10B981', '#F59E0B', '#EF4444', '#FFFFFF'];

function createParticles(originX: number, originY: number, count: number): Particle[] {
  return Array.from({ length: count }, () => ({
    x: originX + (Math.random() - 0.5) * 40,
    y: originY + (Math.random() - 0.5) * 20,
    vx: (Math.random() - 0.5) * 16,
    vy: Math.random() * -16 - 4,
    size: Math.random() * 9 + 4,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    rot: Math.random() * 360,
    vr: (Math.random() - 0.5) * 14,
    shape: Math.random() > 0.45 ? 'rect' : 'circle',
    life: 1,
  }));
}

export function fireConfettiBurst(durationMs = 3200): void {
  if (typeof window === 'undefined') return;

  const canvas = document.createElement('canvas');
  canvas.className = 'herbavi-confetti-canvas';
  canvas.style.position = 'fixed';
  canvas.style.inset = '0';
  canvas.style.width = '100%';
  canvas.style.height = '100%';
  canvas.style.pointerEvents = 'none';
  canvas.style.zIndex = '9999';
  document.body.appendChild(canvas);

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    canvas.remove();
    return;
  }

  const resize = () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  };
  resize();
  window.addEventListener('resize', resize);

  const width = window.innerWidth;
  const height = window.innerHeight;
  const particles: Particle[] = [
    ...createParticles(width * 0.5, height * 0.38, 90),
    ...createParticles(width * 0.18, height * 0.42, 45),
    ...createParticles(width * 0.82, height * 0.42, 45),
  ];

  const start = performance.now();

  const draw = (now: number) => {
    const elapsed = now - start;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    particles.forEach((particle) => {
      particle.x += particle.vx;
      particle.y += particle.vy;
      particle.vy += 0.32;
      particle.vx *= 0.99;
      particle.rot += particle.vr;
      particle.life = Math.max(0, 1 - elapsed / durationMs);

      ctx.save();
      ctx.globalAlpha = particle.life;
      ctx.translate(particle.x, particle.y);
      ctx.rotate((particle.rot * Math.PI) / 180);
      ctx.fillStyle = particle.color;

      if (particle.shape === 'rect') {
        ctx.fillRect(-particle.size / 2, -particle.size / 4, particle.size, particle.size / 2);
      } else {
        ctx.beginPath();
        ctx.arc(0, 0, particle.size / 2, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    });

    if (elapsed < durationMs) {
      requestAnimationFrame(draw);
    } else {
      window.removeEventListener('resize', resize);
      canvas.remove();
    }
  };

  requestAnimationFrame(draw);
}
