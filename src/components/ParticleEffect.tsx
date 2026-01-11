"use client";

import { useEffect, useState } from "react";

interface Particle {
    id: number;
    x: number;
    y: number;
    size: number;
    speedX: number;
    speedY: number;
    opacity: number;
}

interface ParticleEffectProps {
    type: "stars" | "confetti" | "sparkles";
    count?: number;
}

export default function ParticleEffect({ type, count = 50 }: ParticleEffectProps) {
    const [particles, setParticles] = useState<Particle[]>([]);

    useEffect(() => {
        // Generate particles
        const newParticles: Particle[] = [];
        for (let i = 0; i < count; i++) {
            newParticles.push({
                id: i,
                x: Math.random() * 100,
                y: Math.random() * 100,
                size: Math.random() * (type === "stars" ? 3 : 8) + 1,
                speedX: (Math.random() - 0.5) * (type === "confetti" ? 2 : 0.5),
                speedY: type === "confetti" ? Math.random() * 3 + 1 : Math.random() * 0.5,
                opacity: Math.random() * 0.8 + 0.2,
            });
        }
        setParticles(newParticles);

        if (type === "confetti") {
            // Confetti falls and disappears
            const interval = setInterval(() => {
                setParticles((prev) =>
                    prev.map((p) => ({
                        ...p,
                        y: p.y + p.speedY,
                        x: p.x + p.speedX,
                        opacity: p.opacity - 0.01,
                    })).filter((p) => p.opacity > 0 && p.y < 110)
                );
            }, 50);

            return () => clearInterval(interval);
        }
    }, [type, count]);

    const getParticleColor = (particle: Particle) => {
        if (type === "stars") return "rgba(255, 255, 255, " + particle.opacity + ")";
        if (type === "sparkles") return "rgba(147, 197, 253, " + particle.opacity + ")";
        // Confetti: random colors
        const colors = [
            "rgba(239, 68, 68,",
            "rgba(34, 197, 94,",
            "rgba(59, 130, 246,",
            "rgba(251, 191, 36,",
            "rgba(168, 85, 247,",
        ];
        return colors[particle.id % colors.length] + particle.opacity + ")";
    };

    return (
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
            {particles.map((particle) => (
                <div
                    key={particle.id}
                    className={type === "stars" ? "animate-[twinkle_3s_ease-in-out_infinite]" : ""}
                    style={{
                        position: "absolute",
                        left: `${particle.x}%`,
                        top: `${particle.y}%`,
                        width: `${particle.size}px`,
                        height: `${particle.size}px`,
                        backgroundColor: getParticleColor(particle),
                        borderRadius: type === "stars" ? "50%" : (type === "sparkles" ? "2px" : "4px"),
                        transform: type === "sparkles" ? "rotate(45deg)" : undefined,
                        animationDelay: type === "stars" ? `${Math.random() * 3}s` : undefined,
                    }}
                />
            ))}
        </div>
    );
}
