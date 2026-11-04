import React, { useRef, useState, useEffect, useCallback } from 'react';
import { RotateCcw, Trash2, Check, PenTool, CheckCircle2, AlertCircle } from 'lucide-react';

interface Point {
  x: number;
  y: number;
}

interface SignaturePadProps {
  savedSignature?: string;
  onSave: (dataUrl: string) => void;
  onRemove: () => void;
  signerName?: string;
}

export const SignaturePad: React.FC<SignaturePadProps> = ({
  savedSignature,
  onSave,
  onRemove,
  signerName,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const strokesRef = useRef<Point[][]>([]);
  const currentStrokeRef = useRef<Point[]>([]);

  const [strokeCount, setStrokeCount] = useState<number>(0);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPadDirty, setIsPadDirty] = useState<boolean>(false);

  // Redraw all strokes onto the canvas
  const redrawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const dpr = Math.max(window.devicePixelRatio || 1, 2);

    // Reset and scale
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.scale(dpr, dpr);

    // Style config
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#0f172a'; // Deep slate / black ink

    for (const stroke of strokesRef.current) {
      if (stroke.length === 0) continue;
      if (stroke.length === 1) {
        ctx.beginPath();
        ctx.arc(stroke[0].x, stroke[0].y, 1.25, 0, Math.PI * 2);
        ctx.fillStyle = '#0f172a';
        ctx.fill();
        continue;
      }
      ctx.beginPath();
      ctx.moveTo(stroke[0].x, stroke[0].y);
      for (let i = 1; i < stroke.length; i++) {
        ctx.lineTo(stroke[i].x, stroke[i].y);
      }
      ctx.stroke();
    }
  }, []);

  // Initialize and resize canvas with High DPI
  const initCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const rect = container.getBoundingClientRect();
    const dpr = Math.max(window.devicePixelRatio || 1, 2);

    const width = rect.width || 420;
    const height = 150;

    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    redrawCanvas();
  }, [redrawCanvas]);

  useEffect(() => {
    initCanvas();
    const handleResize = () => {
      initCanvas();
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [initCanvas]);

  // Pointer event handlers for cross-platform drawing (mouse, trackpad, touchscreen, stylus)
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      canvas.setPointerCapture(e.pointerId);
    } catch {
      // Ignore if pointer capture fails in restricted environments
    }

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    currentStrokeRef.current = [{ x, y }];
    setIsDrawing(true);
    setIsPadDirty(true);
    setErrorMessage(null);

    const ctx = canvas.getContext('2d');
    if (ctx) {
      const dpr = Math.max(window.devicePixelRatio || 1, 2);
      ctx.save();
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
      ctx.beginPath();
      ctx.arc(x, y, 1.25, 0, Math.PI * 2);
      ctx.fillStyle = '#0f172a';
      ctx.fill();
      ctx.restore();
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    e.preventDefault();

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const stroke = currentStrokeRef.current;
    if (stroke.length === 0) return;

    const prevPoint = stroke[stroke.length - 1];
    stroke.push({ x, y });

    const ctx = canvas.getContext('2d');
    if (ctx) {
      const dpr = Math.max(window.devicePixelRatio || 1, 2);
      ctx.save();
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
      ctx.lineWidth = 2.5;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.strokeStyle = '#0f172a';
      ctx.beginPath();
      ctx.moveTo(prevPoint.x, prevPoint.y);
      ctx.lineTo(x, y);
      ctx.stroke();
      ctx.restore();
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    setIsDrawing(false);

    const canvas = canvasRef.current;
    if (canvas) {
      try {
        canvas.releasePointerCapture(e.pointerId);
      } catch {
        // Ignore
      }
    }

    if (currentStrokeRef.current.length > 0) {
      strokesRef.current.push([...currentStrokeRef.current]);
      currentStrokeRef.current = [];
      setStrokeCount(strokesRef.current.length);
    }
  };

  const handlePointerCancel = (e: React.PointerEvent<HTMLCanvasElement>) => {
    handlePointerUp(e);
  };

  // Clear current pad
  const handleClear = () => {
    strokesRef.current = [];
    currentStrokeRef.current = [];
    setStrokeCount(0);
    setIsPadDirty(false);
    setErrorMessage(null);
    redrawCanvas();
  };

  // Undo last stroke
  const handleUndo = () => {
    if (strokesRef.current.length === 0) return;
    strokesRef.current.pop();
    setStrokeCount(strokesRef.current.length);
    if (strokesRef.current.length === 0) {
      setIsPadDirty(false);
    }
    redrawCanvas();
  };

  // Save drawn signature to resume
  const handleSaveSignature = () => {
    if (strokesRef.current.length === 0) {
      setErrorMessage('Please draw your signature on the pad before clicking "Save Signature".');
      return;
    }

    try {
      // Find bounding box with a 12px padding margin
      let minX = Infinity;
      let minY = Infinity;
      let maxX = -Infinity;
      let maxY = -Infinity;

      for (const stroke of strokesRef.current) {
        for (const pt of stroke) {
          if (pt.x < minX) minX = pt.x;
          if (pt.y < minY) minY = pt.y;
          if (pt.x > maxX) maxX = pt.x;
          if (pt.y > maxY) maxY = pt.y;
        }
      }

      const pad = 12;
      const boxWidth = Math.max(30, Math.round(maxX - minX + pad * 2));
      const boxHeight = Math.max(20, Math.round(maxY - minY + pad * 2));

      // Offscreen canvas for a high-res, trimmed transparent PNG
      const trimCanvas = document.createElement('canvas');
      const dpr = 2;
      trimCanvas.width = boxWidth * dpr;
      trimCanvas.height = boxHeight * dpr;
      const tCtx = trimCanvas.getContext('2d');

      if (!tCtx) {
        // Fallback to direct canvas export
        const canvas = canvasRef.current;
        if (!canvas) return;
        const fallbackUrl = canvas.toDataURL('image/png');
        onSave(fallbackUrl);
      } else {
        tCtx.scale(dpr, dpr);
        tCtx.lineWidth = 2.5;
        tCtx.lineCap = 'round';
        tCtx.lineJoin = 'round';
        tCtx.strokeStyle = '#0f172a';

        for (const stroke of strokesRef.current) {
          if (stroke.length === 0) continue;
          if (stroke.length === 1) {
            tCtx.beginPath();
            tCtx.arc(stroke[0].x - minX + pad, stroke[0].y - minY + pad, 1.25, 0, Math.PI * 2);
            tCtx.fillStyle = '#0f172a';
            tCtx.fill();
            continue;
          }
          tCtx.beginPath();
          tCtx.moveTo(stroke[0].x - minX + pad, stroke[0].y - minY + pad);
          for (let i = 1; i < stroke.length; i++) {
            tCtx.lineTo(stroke[i].x - minX + pad, stroke[i].y - minY + pad);
          }
          tCtx.stroke();
        }

        const dataUrl = trimCanvas.toDataURL('image/png');
        onSave(dataUrl);
      }

      setIsPadDirty(false);
      setErrorMessage(null);
      setSaveMessage('Signature successfully saved to resume & preview!');
      setTimeout(() => setSaveMessage(null), 3000);
    } catch (err: any) {
      setErrorMessage('Failed to save signature: ' + (err.message || 'Unknown error'));
    }
  };

  // Remove saved signature completely
  const handleRemove = () => {
    handleClear();
    onRemove();
    setSaveMessage('Saved signature removed. Clean blank signature line restored.');
    setTimeout(() => setSaveMessage(null), 3000);
  };

  return (
    <div className="space-y-3">
      {/* Active Saved Signature Badge */}
      {savedSignature ? (
        <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-md">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-1.5 text-emerald-800 font-semibold text-xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Current Saved Signature Active</span>
            </div>
            <button
              type="button"
              onClick={handleRemove}
              className="text-[11px] font-semibold text-red-600 hover:text-red-700 hover:bg-red-50 border border-red-200 px-2 py-1 rounded inline-flex items-center gap-1 cursor-pointer transition-colors"
            >
              <Trash2 className="w-3 h-3" /> Remove Signature
            </button>
          </div>
          <div className="p-2 bg-white border border-emerald-100 rounded flex items-center justify-center">
            <img
              src={savedSignature}
              alt="Active candidate signature"
              className="h-10 max-w-[200px] object-contain"
            />
          </div>
          <p className="text-[10px] text-slate-500 mt-1.5">
            This signature is saved in your resume and renders in all declaration-capable layouts and Print/PDF. You can draw below to replace it anytime.
          </p>
        </div>
      ) : (
        <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-md text-[11px] text-slate-600 flex items-start gap-2">
          <PenTool className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
          <div>
            <strong>Blank Line Active:</strong> No signature drawn yet. A clean blank signature line (`___________`) is shown above {signerName ? `(${signerName})` : "the candidate's name"} in the resume preview so it can be signed by hand after printing. Draw below to add your personalized e-signature.
          </div>
        </div>
      )}

      {/* Notifications */}
      {saveMessage && (
        <div className="p-2 bg-emerald-100/80 border border-emerald-300 text-emerald-900 rounded text-xs flex items-center gap-1.5 animate-fadeIn">
          <Check className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
          <span>{saveMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-2 bg-red-50 border border-red-200 text-red-700 rounded text-xs flex items-center gap-1.5">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Canvas Drawing Area */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs text-slate-600">
          <span className="font-medium flex items-center gap-1">
            <PenTool className="w-3.5 h-3.5 text-indigo-600" />
            Drawing Pad (Mouse, Trackpad, Finger or Stylus)
          </span>
          {isPadDirty && (
            <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
              Unsaved drawing
            </span>
          )}
        </div>

        <div
          ref={containerRef}
          className="relative w-full h-[150px] bg-white rounded-md border-2 border-slate-300 hover:border-indigo-400 focus-within:border-indigo-500 shadow-inner overflow-hidden select-none transition-colors"
        >
          {/* Faint Guide Line */}
          <div className="absolute bottom-6 left-6 right-6 border-b border-dashed border-slate-300 pointer-events-none flex justify-between items-end pb-0.5">
            <span className="text-[10px] text-slate-300 font-sans tracking-wide">
              Sign above this line
            </span>
            <span className="text-[11px] text-slate-300 font-mono">✕</span>
          </div>

          {/* Interactive HTML5 Canvas */}
          <canvas
            ref={canvasRef}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerCancel}
            className="w-full h-full block cursor-crosshair touch-none bg-transparent"
            style={{ touchAction: 'none' }}
          />

          {/* Empty Prompt Overlay if nothing is drawn */}
          {strokeCount === 0 && !isDrawing && (
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center text-slate-400 text-xs font-normal">
              Draw your signature here with mouse or touch
            </div>
          )}
        </div>
      </div>

      {/* Control Buttons Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleUndo}
            disabled={strokeCount === 0}
            className="px-2.5 py-1.5 rounded-md text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer inline-flex items-center gap-1 transition-colors"
            title="Undo last stroke"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Undo
          </button>
          <button
            type="button"
            onClick={handleClear}
            disabled={strokeCount === 0}
            className="px-2.5 py-1.5 rounded-md text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer inline-flex items-center gap-1 transition-colors"
            title="Clear the drawing pad"
          >
            Clear Pad
          </button>
        </div>

        <div className="flex items-center gap-2">
          {savedSignature && (
            <button
              type="button"
              onClick={handleRemove}
              className="px-2.5 py-1.5 rounded-md text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 cursor-pointer inline-flex items-center gap-1 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" /> Remove
            </button>
          )}

          <button
            type="button"
            onClick={handleSaveSignature}
            disabled={strokeCount === 0}
            className="px-3.5 py-1.5 rounded-md text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-xs disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer inline-flex items-center gap-1.5 transition-colors"
          >
            <Check className="w-3.5 h-3.5" /> Save Signature
          </button>
        </div>
      </div>
    </div>
  );
};
