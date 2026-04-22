"use client";

import { useCallback, useEffect, useRef } from "react";

type Props = {
  className?: string;
  onChange: (pngDataUrl: string | null, isBlank: boolean) => void;
};

const PEN = "#002244";
const STROKE = 2.8;
const MIN_HEIGHT = 220;
const MOBILE_HEIGHT = 260;
const MAX_WIDTH = 860;

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
  const wrapRef = useRef<HTMLDivElement>(null);
  const ref = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const hasStroke = useRef(false);
  const strokeMoved = useRef(false);
  const activePointerId = useRef<number | null>(null);
  const logicalSize = useRef({ width: 720, height: MIN_HEIGHT });

  const paintCanvasBackground = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number) => {
    ctx.fillStyle = "#fafafa";
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = "#cbd5e1";
    ctx.lineWidth = 1;
    ctx.strokeRect(0.5, 0.5, w - 1, h - 1);
    ctx.setLineDash([6, 6]);
    ctx.beginPath();
    ctx.moveTo(16, h - 48);
    ctx.lineTo(w - 16, h - 48);
    ctx.strokeStyle = "#cbd5e1";
    ctx.stroke();
    ctx.setLineDash([]);
  }, []);

  const resetCanvas = useCallback(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const dpr = Math.min(2, typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1);
    const { width: w, height: h } = logicalSize.current;
    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
    canvas.style.width = "100%";
    canvas.style.height = `${h}px`;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(dpr, dpr);
    paintCanvasBackground(ctx, w, h);
    drawing.current = false;
    hasStroke.current = false;
    strokeMoved.current = false;
    activePointerId.current = null;
    onChange(null, true);
  }, [onChange, paintCanvasBackground]);

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    const updateSize = () => {
      const w = Math.max(280, Math.min(MAX_WIDTH, Math.floor(wrap.clientWidth)));
      const h = w < 640 ? MOBILE_HEIGHT : MIN_HEIGHT;
      logicalSize.current = { width: w, height: h };
      resetCanvas();
    };
    updateSize();
    const observer = new ResizeObserver(() => updateSize());
    observer.observe(wrap);
    return () => observer.disconnect();
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

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (activePointerId.current !== null) return;
    activePointerId.current = e.pointerId;
    e.currentTarget.setPointerCapture(e.pointerId);
    e.preventDefault();
    start(e.clientX, e.clientY);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (activePointerId.current !== e.pointerId) return;
    e.preventDefault();
    move(e.clientX, e.clientY);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (activePointerId.current !== e.pointerId) return;
    e.preventDefault();
    e.currentTarget.releasePointerCapture(e.pointerId);
    activePointerId.current = null;
    end();
  };

  return (
    <div ref={wrapRef} className={className}>
      <canvas
        ref={ref}
        className="touch-none select-none rounded-lg border border-slate-200 bg-white"
        style={{ touchAction: "none" }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      />
      <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs text-[#303030]/70">
          Use one finger to sign. The page will not scroll while drawing. / 单指签名，绘制时页面不会滚动。
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
