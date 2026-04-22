"use client";

import { useCallback, useLayoutEffect, useRef } from "react";

type Props = {
  className?: string;
  onChange: (pngDataUrl: string | null, isBlank: boolean) => void;
};

const PEN = "#002244";
const STROKE = 2.25;

function toCanvasCoords(canvas: HTMLCanvasElement, clientX: number, clientY: number) {
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;
  return {
    x: (clientX - rect.left) * scaleX,
    y: (clientY - rect.top) * scaleY,
  };
}

export function QuotationSignaturePad({ className, onChange }: Props) {
  const ref = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const hasStroke = useRef(false);
  const strokeMoved = useRef(false);

  const resetCanvas = useCallback(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const dpr = Math.min(2, typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1);
    const w = 720;
    const h = 220;
    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
    canvas.style.width = "100%";
    canvas.style.height = `${h}px`;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(dpr, dpr);
    ctx.fillStyle = "#fafafa";
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = "#cbd5e1";
    ctx.lineWidth = 1;
    ctx.strokeRect(0.5, 0.5, w - 1, h - 1);
    drawing.current = false;
    hasStroke.current = false;
    strokeMoved.current = false;
    onChange(null, true);
  }, [onChange]);

  useLayoutEffect(() => {
    resetCanvas();
  }, [resetCanvas]);

  const emit = useCallback(() => {
    const canvas = ref.current;
    if (!canvas) return;
    if (!hasStroke.current) {
      onChange(null, true);
      return;
    }
    onChange(canvas.toDataURL("image/png"), false);
  }, [onChange]);

  const start = (x: number, y: number) => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const p = toCanvasCoords(canvas, x, y);
    drawing.current = true;
    strokeMoved.current = false;
    ctx.strokeStyle = PEN;
    ctx.lineWidth = STROKE;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.moveTo(p.x, p.y);
  };

  const move = (x: number, y: number) => {
    if (!drawing.current) return;
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const p = toCanvasCoords(canvas, x, y);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
    strokeMoved.current = true;
    hasStroke.current = true;
  };

  const end = () => {
    if (drawing.current && strokeMoved.current) {
      hasStroke.current = true;
    }
    drawing.current = false;
    emit();
  };

  return (
    <div className={className}>
      <canvas
        ref={ref}
        className="touch-none rounded-lg border border-slate-200 bg-white"
        onMouseDown={(e) => start(e.clientX, e.clientY)}
        onMouseMove={(e) => {
          if (drawing.current) move(e.clientX, e.clientY);
        }}
        onMouseUp={end}
        onMouseLeave={end}
        onTouchStart={(e) => {
          e.preventDefault();
          const t = e.touches[0];
          if (t) start(t.clientX, t.clientY);
        }}
        onTouchMove={(e) => {
          e.preventDefault();
          const t = e.touches[0];
          if (t) move(t.clientX, t.clientY);
        }}
        onTouchEnd={(e) => {
          e.preventDefault();
          end();
        }}
      />
      <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs text-[#303030]/70">
          Sign with your finger or mouse. / 用手指或鼠标签名。
        </p>
        <button
          type="button"
          onClick={() => resetCanvas()}
          className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-[#003F73] shadow-sm hover:bg-slate-50"
        >
          Clear / 清空
        </button>
      </div>
    </div>
  );
}
