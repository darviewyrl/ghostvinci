import React, { useState, useEffect, useRef } from 'react';
import { HelpCircle } from 'lucide-react';

export default function InfoTooltip({ content }) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);
  const tooltipId = 'card-removal-tooltip';

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
      className="info-tooltip relative inline-flex items-center select-none leading-none"
      onPointerEnter={(e) => {
        if (e.pointerType === 'mouse') setIsOpen(true);
      }}
      onPointerLeave={(e) => {
        if (e.pointerType === 'mouse') setIsOpen(false);
      }}
    >
      <button
        type="button"
        onClick={handleToggle}
        className="info-tooltip__trigger"
        aria-label="ข้อมูลเพิ่มเติม"
        aria-expanded={isOpen}
        aria-describedby={isOpen ? tooltipId : undefined}
      >
        <HelpCircle className="h-4 w-4" strokeWidth={2.2} />
      </button>

      <div
        id={tooltipId}
        role="tooltip"
        aria-hidden={!isOpen}
        className={`info-tooltip__bubble ${isOpen ? 'info-tooltip__bubble--open' : ''}`}
      >
        {content}
        <div className="info-tooltip__arrow" />
      </div>
    </div>
  );
}
