import { useEffect, useMemo, useRef, useState } from 'react';
import type { Entry } from '../types';

type WheelCanvasProps = {
  entries: Entry[];
  winningEntryId?: string;
  rotationDeg: number;
  isSpinning: boolean;
  spinDurationMs: number;
  reducedMotion: boolean;
  onSpinTransitionEnd?: () => void;
};

const segmentPalette = [
  '#f6bd60',
  '#f28482',
  '#84a59d',
  '#f5cac3',
  '#90be6d',
  '#577590',
  '#e5989b',
  '#ffd166',
  '#118ab2',
  '#ef476f',
];

function truncateLabel(name: string, maxChars: number): string {
  if (name.length <= maxChars) {
    return name;
  }

  if (maxChars <= 2) {
    return '';
  }

  return `${name.slice(0, Math.max(1, maxChars - 1))}…`;
}

export function WheelCanvas({
  entries,
  winningEntryId,
  rotationDeg,
  isSpinning,
  spinDurationMs,
  reducedMotion,
  onSpinTransitionEnd,
}: WheelCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const [sizePx, setSizePx] = useState(420);

  const winnerIndex = useMemo(() => {
    if (!winningEntryId) {
      return -1;
    }

    return entries.findIndex((entry) => entry.id === winningEntryId);
  }, [entries, winningEntryId]);

  useEffect(() => {
    if (!frameRef.current) {
      return;
    }

    const observer = new ResizeObserver((items) => {
      const nextWidth = items[0]?.contentRect.width ?? 420;
      const bounded = Math.max(280, Math.min(560, Math.floor(nextWidth)));
      setSizePx(bounded);
    });

    observer.observe(frameRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.floor(sizePx * dpr);
    canvas.height = Math.floor(sizePx * dpr);
    canvas.style.width = `${sizePx}px`;
    canvas.style.height = `${sizePx}px`;

    const context = canvas.getContext('2d');
    if (!context) {
      return;
    }

    context.setTransform(dpr, 0, 0, dpr, 0, 0);
    context.clearRect(0, 0, sizePx, sizePx);

    const center = sizePx / 2;
    const radius = sizePx * 0.47;

    context.beginPath();
    context.arc(center, center, radius, 0, Math.PI * 2);
    context.fillStyle = '#fbf7ef';
    context.fill();

    if (entries.length === 0) {
      context.beginPath();
      context.arc(center, center, radius * 0.7, 0, Math.PI * 2);
      context.fillStyle = '#e9d8b4';
      context.fill();

      context.fillStyle = '#3f3a2f';
      context.font = '700 20px ui-rounded, "Avenir Next", "Trebuchet MS", sans-serif';
      context.textAlign = 'center';
      context.textBaseline = 'middle';
      context.fillText('Add entries to start', center, center);
      return;
    }

    const arcSize = (Math.PI * 2) / entries.length;

    entries.forEach((entry, index) => {
      const start = index * arcSize;
      const end = start + arcSize;
      const isWinner = index === winnerIndex;

      context.beginPath();
      context.moveTo(center, center);
      context.arc(center, center, radius, start, end);
      context.closePath();
      context.fillStyle = isWinner ? '#ffe8a3' : segmentPalette[index % segmentPalette.length];
      context.fill();

      context.strokeStyle = '#2b2821';
      context.lineWidth = isWinner ? 3 : 1;
      context.stroke();

      const mid = start + arcSize / 2;
      const arcDegrees = (arcSize * 180) / Math.PI;
      if (arcDegrees < 8) {
        return;
      }

      const textRadius = radius * 0.68;
      const arcLength = textRadius * arcSize;
      const maxChars = Math.floor(arcLength / 10);
      const displayName = truncateLabel(entry.name, maxChars);
      if (!displayName) {
        return;
      }

      context.save();
      context.translate(center, center);
      context.rotate(mid);
      context.textAlign = 'right';
      context.textBaseline = 'middle';
      context.fillStyle = '#1d1a14';
      context.font = '600 15px "Avenir Next", "Segoe UI", sans-serif';
      context.fillText(displayName, textRadius, 0);
      context.restore();
    });

    context.beginPath();
    context.arc(center, center, radius * 0.18, 0, Math.PI * 2);
    context.fillStyle = '#1f1b14';
    context.fill();

    context.beginPath();
    context.arc(center, center, radius * 0.11, 0, Math.PI * 2);
    context.fillStyle = '#ffe7b0';
    context.fill();
  }, [entries, winnerIndex, sizePx]);

  return (
    <div className="wheel-frame" ref={frameRef}>
      <div className="wheel-pointer" aria-hidden="true" />
      <div
        className={`wheel-spin-layer ${!isSpinning && !reducedMotion ? 'wheel-idle' : ''}`}
        style={{
          transform: `rotate(${rotationDeg}deg)`,
          transition: isSpinning
            ? `transform ${spinDurationMs}ms cubic-bezier(0.08, 0.9, 0.14, 1)`
            : 'transform 220ms ease-out',
        }}
        onTransitionEnd={() => {
          if (isSpinning) {
            onSpinTransitionEnd?.();
          }
        }}
      >
        <canvas ref={canvasRef} role="img" aria-label="Wheel with all active entries" />
      </div>
    </div>
  );
}
