import React, { useState, useEffect, useRef } from 'react';
import { HelpCircle } from 'lucide-react';

export default function InfoTooltip({ content }) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  // Close tooltip when clicking outside the container
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isOpen]);

  const handleToggle = (e) => {
    e.stopPropagation();
    setIsOpen((prev) => !prev);
  };

  return (
    <div
      ref={containerRef}
      className="relative inline-flex items-center select-none leading-none"
    >
      <button
        type="button"
        onClick={handleToggle}
        onPointerEnter={(e) => {
          if (e.pointerType === 'mouse') setIsOpen(true);
        }}
        onPointerLeave={(e) => {
          if (e.pointerType === 'mouse') setIsOpen(false);
        }}
        className="flex items-center justify-center p-0.5 rounded-full text-[rgba(230,80,80,0.6)] hover:text-[#ff6c6c] transition-colors focus:outline-none cursor-pointer"
        aria-label="ข้อมูลเพิ่มเติม"
      >
        <HelpCircle className="h-4 w-4" strokeWidth={2.2} />
      </button>

      {isOpen && (
        <div
          className="absolute z-50 bottom-full left-0 mb-2.5 w-64 p-3 rounded-md border border-[rgba(151,35,35,0.72)] bg-[rgba(12,6,8,0.96)] text-[0.78rem] font-medium leading-relaxed text-[#f5f2e9] shadow-[0_8px_32px_rgba(0,0,0,0.95),inset_0_0_12px_rgba(239,68,68,0.06)] backdrop-blur-md pointer-events-none sm:pointer-events-auto"
          style={{ transform: 'translate3d(0, 0, 0)' }}
        >
          {content}
          <div className="absolute top-full left-3.5 border-8 border-transparent border-t-[rgba(12,6,8,0.96)] filter drop-shadow-[0_2px_0_rgba(151,35,35,0.5)]" />
        </div>
      )}
    </div>
  );
}
