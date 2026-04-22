"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import SignatureCanvas from "react-signature-canvas";

type Props = {
  className?: string;
  onChange: (pngDataUrl: string | null, isBlank: boolean) => void;
};

const MIN_HEIGHT = 220;
const MOBILE_HEIGHT = 260;
const MAX_WIDTH = 860;

export function QuotationSignaturePad({ className, onChange }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const padRef = useRef<SignatureCanvas | null>(null);
  const [padSize, setPadSize] = useState({ width: 720, height: MIN_HEIGHT });

  const resetCanvas = useCallback(() => {
    const pad = padRef.current;
    if (!pad) return;
    pad.clear();
    onChange(null, true);
  }, [onChange]);

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    const updateSize = () => {
      const w = Math.max(280, Math.min(MAX_WIDTH, Math.floor(wrap.clientWidth)));
      const h = w < 640 ? MOBILE_HEIGHT : MIN_HEIGHT;
      setPadSize((prev) => {
        if (prev.width === w && prev.height === h) return prev;
        return { width: w, height: h };
      });
    };
    updateSize();
    const observer = new ResizeObserver(() => updateSize());
    observer.observe(wrap);
    return () => observer.disconnect();
  }, []);

  const emit = useCallback(() => {
    const pad = padRef.current;
    if (!pad || pad.isEmpty()) {
      onChange(null, true);
      return;
    }
    onChange(pad.toDataURL("image/png"), false);
  }, [onChange]);

  useEffect(() => {
    // Keep exported signature state consistent when canvas is resized.
    resetCanvas();
  }, [padSize.width, padSize.height, resetCanvas]);

  return (
    <div ref={wrapRef} className={className}>
      <div className="overflow-hidden rounded-lg border border-slate-200 bg-[#fafafa]">
        <SignatureCanvas
          ref={(instance) => {
            padRef.current = instance;
          }}
          canvasProps={{
            className: "block touch-none select-none bg-[#fafafa]",
            width: padSize.width,
            height: padSize.height,
            style: { width: "100%", height: `${padSize.height}px`, touchAction: "none" },
          }}
          minWidth={1.5}
          maxWidth={3.2}
          penColor="#002244"
          onEnd={emit}
          throttle={12}
          velocityFilterWeight={0.55}
        />
      </div>
      <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs text-[#303030]/70">
          One finger to sign. Pinch/scroll outside the box if needed. / 单指签名，缩放或滚动请在框外操作。
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
