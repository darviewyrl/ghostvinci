import React, { useMemo } from 'react';

export default function AmbientParticles() {
  // 7 large background misty glows (preserved)
  const glowBlobs = useMemo(() => {
    return Array.from({ length: 7 }, (_, index) => ({
      id: `glow-${index}`,
      left: `${10 + index * 12}%`,
      top: `${8 + (index % 4) * 18}%`,
      size: 56 + (index % 3) * 26,
      delay: `${index * 0.5}s`,
      duration: `${6 + (index % 3)}s`,
    }));
  }, []);

  // Dense ember field with varied shapes so the fire reads as ash/embers, not dots.
  const fireEmbers = useMemo(() => {
    const colors = [
      [239, 68, 68],   // red
      [249, 115, 22],  // orange
      [245, 158, 11],  // amber
      [220, 38, 38],   // dark red
      [251, 146, 60],  // light orange
    ];
    return Array.from({ length: 88 }, (_, index) => {
      const [red, green, blue] = colors[index % colors.length];
      const width = 2 + Math.random() * 4.8;
      const height = width * (0.55 + Math.random() * 1.35);
      const left = Math.random() * 100;
      const opacity = 0.24 + Math.random() * 0.56;
      const blur = 0.4 + Math.random() * 1.8;
      const driftX = `${(Math.random() * 120 - 60).toFixed(2)}px`;
      const driftXMid = `${(Math.random() * 90 - 45).toFixed(2)}px`;
      const rotateStart = `${(Math.random() * 90 - 45).toFixed(2)}deg`;
      const rotateEnd = `${(Math.random() * 220 - 110).toFixed(2)}deg`;
      const radiusA = `${35 + Math.random() * 40}%`;
      const radiusB = `${50 + Math.random() * 35}%`;
      const radiusC = `${28 + Math.random() * 45}%`;
      const radiusD = `${42 + Math.random() * 40}%`;
      const delay = Math.random() * 16;
      const duration = 10 + Math.random() * 12;
      const glowSize = Math.max(width, height) * (1.6 + Math.random() * 1.5);
      const glowAlpha = Math.min(0.92, opacity + 0.22);
      const color = `rgba(${red}, ${green}, ${blue}, ${opacity})`;
      const glow = `0 0 ${glowSize.toFixed(2)}px rgba(${red}, ${green}, ${blue}, ${glowAlpha.toFixed(2)})`;
      const animType = (index % 4) + 1;

      return {
        id: `ember-${index}`,
        style: {
          left: `${left}%`,
          width: `${width.toFixed(2)}px`,
          height: `${height.toFixed(2)}px`,
          background: color,
          animationDelay: `${delay}s`,
          animationDuration: `${duration}s`,
          boxShadow: glow,
          borderRadius: `${radiusA} ${radiusB} ${radiusC} ${radiusD}`,
          filter: `blur(${blur.toFixed(2)}px)`,
          '--ember-opacity': opacity.toFixed(2),
          '--ember-drift-x': driftX,
          '--ember-drift-x-mid': driftXMid,
          '--ember-rotate-start': rotateStart,
          '--ember-rotate-end': rotateEnd,
        },
        className: `ember-particle absolute bottom-[-12%] animate-ember-${animType}`,
      };
    });
  }, []);

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden z-0">
      {/* Misty background glows */}
      {glowBlobs.map((blob) => (
        <div
          key={blob.id}
          className="absolute rounded-full bg-[rgba(140,20,20,0.08)] animate-ghost-bob"
          style={{
            width: `${blob.size}px`,
            height: `${blob.size}px`,
            left: blob.left,
            top: blob.top,
            filter: 'blur(40px)',
            animationDelay: blob.delay,
            animationDuration: blob.duration,
          }}
        />
      ))}

      {/* Floating fire embers */}
      {fireEmbers.map((ember) => (
        <div
          key={ember.id}
          className={ember.className}
          style={ember.style}
        />
      ))}
    </div>
  );
}
