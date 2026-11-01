import React, { useState, useEffect, useLayoutEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

export type PopoverPlacement = 'top' | 'bottom';
export type PopoverAlign = 'start' | 'end' | 'center';

interface FloatingPopoverProps {
  isOpen: boolean;
  onClose: () => void;
  anchorRef: React.RefObject<HTMLElement | null>;
  preferredPlacement?: PopoverPlacement;
  align?: PopoverAlign;
  offset?: number;
  className?: string;
  showArrow?: boolean;
  children: React.ReactNode;
}

export const FloatingPopover: React.FC<FloatingPopoverProps> = ({
  isOpen,
  onClose,
  anchorRef,
  preferredPlacement = 'top',
  align = 'start',
  offset = 8,
  className = '',
  showArrow = true,
  children,
}) => {
  const popoverRef = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState<{
    top: number;
    left: number;
    placement: PopoverPlacement;
    arrowLeft?: number;
  } | null>(null);

  const updatePosition = () => {
    if (!isOpen || !anchorRef.current || !popoverRef.current) return;

    const anchorRect = anchorRef.current.getBoundingClientRect();
    const popoverRect = popoverRef.current.getBoundingClientRect();

    const popoverWidth = popoverRect.width || 200;
    const popoverHeight = popoverRect.height || 140;

    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const margin = 12; // Min distance from viewport edge

    // Determine placement (top vs bottom) based on available space
    let finalPlacement: PopoverPlacement = preferredPlacement;
    const spaceAbove = anchorRect.top;
    const spaceBelow = viewportHeight - anchorRect.bottom;

    if (preferredPlacement === 'top') {
      if (spaceAbove < popoverHeight + offset + margin && spaceBelow > spaceAbove) {
        finalPlacement = 'bottom';
      }
    } else {
      if (spaceBelow < popoverHeight + offset + margin && spaceAbove > spaceBelow) {
        finalPlacement = 'top';
      }
    }

    // Calculate Y coordinate
    let top = 0;
    if (finalPlacement === 'top') {
      top = anchorRect.top - popoverHeight - offset;
    } else {
      top = anchorRect.bottom + offset;
    }

    // Clamp Y to viewport
    top = Math.max(margin, Math.min(top, viewportHeight - popoverHeight - margin));

    // Calculate X coordinate based on alignment
    let left = 0;
    if (align === 'start') {
      left = anchorRect.left;
    } else if (align === 'end') {
      left = anchorRect.right - popoverWidth;
    } else {
      left = anchorRect.left + (anchorRect.width - popoverWidth) / 2;
    }

    // Clamp X to viewport
    const maxLeft = Math.max(margin, viewportWidth - popoverWidth - margin);
    const clampedLeft = Math.max(margin, Math.min(left, maxLeft));

    // Calculate arrow position relative to popover left
    const anchorCenter = anchorRect.left + anchorRect.width / 2;
    const arrowLeft = Math.max(16, Math.min(popoverWidth - 16, anchorCenter - clampedLeft));

    setCoords({
      top,
      left: clampedLeft,
      placement: finalPlacement,
      arrowLeft,
    });
  };

  // Measure and position before paint
  useLayoutEffect(() => {
    if (isOpen) {
      updatePosition();
    } else {
      setCoords(null);
    }
  }, [isOpen, preferredPlacement, align, offset]);

  // Listen to window events (scroll, resize, click outside, escape)
  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (e: MouseEvent | TouchEvent) => {
      const target = e.target as Node;
      if (
        popoverRef.current &&
        !popoverRef.current.contains(target) &&
        anchorRef.current &&
        !anchorRef.current.contains(target)
      ) {
        onClose();
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    const handleScrollOrResize = () => {
      updatePosition();
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('touchstart', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    window.addEventListener('resize', handleScrollOrResize);
    window.addEventListener('scroll', handleScrollOrResize, true);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('touchstart', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('resize', handleScrollOrResize);
      window.removeEventListener('scroll', handleScrollOrResize, true);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <div
      ref={popoverRef}
      style={{
        position: 'fixed',
        top: coords ? `${coords.top}px` : '-9999px',
        left: coords ? `${coords.left}px` : '-9999px',
        zIndex: 9999,
        visibility: coords ? 'visible' : 'hidden',
      }}
      className={`bg-white dark:bg-[#1D2129] border border-slate-200 dark:border-[#2A2F38] rounded-xl shadow-2xl transition-opacity animate-in fade-in zoom-in-95 duration-150 ${className}`}
    >
      {/* Visual Directional Indicator / Arrow */}
      {showArrow && coords && (
        <div
          style={{ left: `${coords.arrowLeft}px` }}
          className={`absolute -translate-x-1/2 w-3 h-3 rotate-45 bg-white dark:bg-[#1D2129] border-slate-200 dark:border-[#2A2F38] pointer-events-none ${
            coords.placement === 'top'
              ? 'bottom-[-6px] border-b border-r'
              : 'top-[-6px] border-t border-l'
          }`}
        />
      )}

      {/* Popover Content */}
      <div className="relative z-10">{children}</div>
    </div>,
    document.body
  );
};
