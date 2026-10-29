import { useMemo } from "react";

function Star({ style, size = 4, delay = 0 }) {
  return (
    <div
      className="absolute rounded-full bg-primary/60 animate-sparkle"
      style={{
        width: size,
        height: size,
        ...style,
        animationDelay: `${delay}s`,
      }}
    />
  );
}

function Particle({ style, delay = 0 }) {
  return (
    <div
      className="absolute rounded-full bg-secondary/30 blur-sm animate-float"
      style={{
        width: 8,
        height: 8,
        ...style,
        animationDelay: `${delay}s`,
      }}
    />
  );
}

export default function StarBackground({ variant = "full" }) {
  const stars = useMemo(
    () =>
      Array.from({ length: variant === "subtle" ? 12 : 24 }, (_, i) => ({
        id: i,
        top: `${Math.random() * 100}%`,
        left: `${Math.random() * 100}%`,
        size: 2 + Math.random() * 4,
        delay: Math.random() * 3,
      })),
    [variant],
  );

  const particles = useMemo(
    () =>
      Array.from({ length: variant === "subtle" ? 6 : 10 }, (_, i) => ({
        id: i,
        top: `${Math.random() * 100}%`,
        left: `${Math.random() * 100}%`,
        delay: Math.random() * 5,
      })),
    [variant],
  );

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-primary/10 blur-3xl animate-pulse-glow" />
      <div
        className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-accent/10 blur-3xl animate-pulse-glow"
        style={{ animationDelay: "1.5s" }}
      />
      <div
        className="absolute left-1/2 top-1/3 h-64 w-64 -translate-x-1/2 rounded-full bg-secondary/8 blur-3xl animate-pulse-glow"
        style={{ animationDelay: "0.75s" }}
      />

      {stars.map((star) => (
        <Star
          key={star.id}
          size={star.size}
          delay={star.delay}
          style={{ top: star.top, left: star.left }}
        />
      ))}

      {particles.map((particle) => (
        <Particle
          key={particle.id}
          delay={particle.delay}
          style={{ top: particle.top, left: particle.left }}
        />
      ))}

      {variant === "full" && (
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(56,189,248,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(56,189,248,0.5) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
      )}
    </div>
  );
}
