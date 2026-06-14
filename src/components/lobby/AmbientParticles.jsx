const EMBERS = Array.from({ length: 7 }, (_, index) => ({
  id: index,
  left: `${10 + index * 12}%`,
  top: `${8 + (index % 4) * 18}%`,
  size: 56 + (index % 3) * 26,
  delay: `${index * 0.5}s`,
  duration: `${6 + (index % 3)}s`,
}));

export default function AmbientParticles() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {EMBERS.map((ember) => (
        <div
          key={ember.id}
          className="absolute rounded-full bg-[rgba(140,20,20,0.08)] animate-ghost-bob"
          style={{
            width: `${ember.size}px`,
            height: `${ember.size}px`,
            left: ember.left,
            top: ember.top,
            filter: 'blur(40px)',
            animationDelay: ember.delay,
            animationDuration: ember.duration,
          }}
        />
      ))}
    </div>
  );
}
