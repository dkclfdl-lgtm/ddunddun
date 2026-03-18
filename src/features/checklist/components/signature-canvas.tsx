'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import { Eraser } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SignatureCanvasProps {
  onSignatureChange: (dataUrl: string | null) => void;
  height?: number;
}

export function SignatureCanvas({
  onSignatureChange,
  height = 200,
}: SignatureCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);
  const [canvasWidth, setCanvasWidth] = useState(500);

  // Measure container width and listen for resize
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const updateWidth = () => {
      const w = container.clientWidth;
      if (w > 0) setCanvasWidth(w);
    };

    updateWidth();

    const observer = new ResizeObserver(() => {
      updateWidth();
    });
    observer.observe(container);

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set up canvas for high DPI
    const dpr = window.devicePixelRatio || 1;
    canvas.width = canvasWidth * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    // Style
    ctx.strokeStyle = '#1a1a1a';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  }, [canvasWidth, height]);

  const getPos = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      if (!canvas) return { x: 0, y: 0 };
      const rect = canvas.getBoundingClientRect();

      if ('touches' in e) {
        const touch = e.touches[0];
        return {
          x: touch.clientX - rect.left,
          y: touch.clientY - rect.top,
        };
      }
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    },
    [],
  );

  const startDrawing = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
      e.preventDefault();
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (!ctx) return;

      const pos = getPos(e);
      ctx.beginPath();
      ctx.moveTo(pos.x, pos.y);
      setIsDrawing(true);
    },
    [getPos],
  );

  const draw = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
      e.preventDefault();
      if (!isDrawing) return;
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (!ctx) return;

      const pos = getPos(e);
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
    },
    [isDrawing, getPos],
  );

  const stopDrawing = useCallback(() => {
    if (!isDrawing) return;
    setIsDrawing(false);
    setHasSignature(true);

    const canvas = canvasRef.current;
    if (canvas) {
      onSignatureChange(canvas.toDataURL('image/png'));
    }
  }, [isDrawing, onSignatureChange]);

  const clearCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx || !canvas) return;

    const dpr = window.devicePixelRatio || 1;
    ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr);
    setHasSignature(false);
    onSignatureChange(null);
  }, [onSignatureChange]);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-foreground">서명</p>
        <Button
          variant="ghost"
          size="sm"
          onClick={clearCanvas}
          disabled={!hasSignature}
          className="text-xs"
        >
          <Eraser size={14} className="mr-1" />
          지우기
        </Button>
      </div>
      <div
        ref={containerRef}
        className="w-full rounded-xl border-2 border-dashed border-muted-foreground/30 bg-white overflow-hidden"
      >
        <canvas
          ref={canvasRef}
          style={{ width: '100%', height, touchAction: 'none' }}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          className="cursor-crosshair"
        />
      </div>
      {!hasSignature && (
        <p className="text-xs text-muted-foreground text-center">
          위 영역에 서명해 주세요
        </p>
      )}
    </div>
  );
}
