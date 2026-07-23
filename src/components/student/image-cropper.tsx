"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { X, Check, RotateCcw, Crop as CropIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { vibrateLight, vibrateSuccess } from "@/lib/haptics";

interface CropRect {
  x: number; // 0 to 1 percentage
  y: number; // 0 to 1 percentage
  w: number; // 0 to 1 percentage
  h: number; // 0 to 1 percentage
}

interface ImageCropperProps {
  imageUrl: string;
  onConfirm: (file: File) => void;
  onCancel: () => void;
}

export function ImageCropper({ imageUrl, onConfirm, onCancel }: ImageCropperProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  // Normalized crop bounds (default 5% margin)
  const [crop, setCrop] = useState<CropRect>({ x: 0.05, y: 0.05, w: 0.9, h: 0.9 });
  const [isDragging, setIsDragging] = useState(false);
  const [activeHandle, setActiveHandle] = useState<string | null>(null);
  const [dragStart, setDragStart] = useState<{ x: number; y: number; crop: CropRect } | null>(null);
  const [imgBounds, setImgBounds] = useState<{ left: number; top: number; width: number; height: number } | null>(null);

  // Calculate image rendered bounds inside container
  const updateImgBounds = useCallback(() => {
    if (!containerRef.current || !imgRef.current) return;
    const container = containerRef.current.getBoundingClientRect();
    const img = imgRef.current;

    if (!img.naturalWidth || !img.naturalHeight) return;

    const imgAspect = img.naturalWidth / img.naturalHeight;
    const containerAspect = container.width / container.height;

    let renderW: number, renderH: number, renderX: number, renderY: number;

    if (imgAspect > containerAspect) {
      renderW = container.width;
      renderH = container.width / imgAspect;
      renderX = 0;
      renderY = (container.height - renderH) / 2;
    } else {
      renderH = container.height;
      renderW = container.height * imgAspect;
      renderY = 0;
      renderX = (container.width - renderW) / 2;
    }

    setImgBounds({
      left: renderX,
      top: renderY,
      width: renderW,
      height: renderH,
    });
  }, []);

  useEffect(() => {
    window.addEventListener("resize", updateImgBounds);
    return () => window.removeEventListener("resize", updateImgBounds);
  }, [updateImgBounds]);

  const handlePointerDown = (e: React.PointerEvent, handle: string) => {
    e.preventDefault();
    e.stopPropagation();
    vibrateLight();

    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    setIsDragging(true);
    setActiveHandle(handle);
    setDragStart({
      x: e.clientX,
      y: e.clientY,
      crop: { ...crop },
    });
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging || !dragStart || !imgBounds) return;
    e.preventDefault();

    const deltaX = (e.clientX - dragStart.x) / imgBounds.width;
    const deltaY = (e.clientY - dragStart.y) / imgBounds.height;

    const minSize = 0.15; // Minimum 15% crop size

    setCrop(() => {
      let { x, y, w, h } = dragStart.crop;

      if (activeHandle === "move") {
        x = Math.max(0, Math.min(1 - w, dragStart.crop.x + deltaX));
        y = Math.max(0, Math.min(1 - h, dragStart.crop.y + deltaY));
      } else {
        if (activeHandle?.includes("nw")) {
          const newX = Math.max(0, Math.min(dragStart.crop.x + dragStart.crop.w - minSize, dragStart.crop.x + deltaX));
          const newY = Math.max(0, Math.min(dragStart.crop.y + dragStart.crop.h - minSize, dragStart.crop.y + deltaY));
          w = dragStart.crop.w + (dragStart.crop.x - newX);
          h = dragStart.crop.h + (dragStart.crop.y - newY);
          x = newX;
          y = newY;
        } else if (activeHandle?.includes("ne")) {
          const newY = Math.max(0, Math.min(dragStart.crop.y + dragStart.crop.h - minSize, dragStart.crop.y + deltaY));
          w = Math.max(minSize, Math.min(1 - dragStart.crop.x, dragStart.crop.w + deltaX));
          h = dragStart.crop.h + (dragStart.crop.y - newY);
          y = newY;
        } else if (activeHandle?.includes("sw")) {
          const newX = Math.max(0, Math.min(dragStart.crop.x + dragStart.crop.w - minSize, dragStart.crop.x + deltaX));
          w = dragStart.crop.w + (dragStart.crop.x - newX);
          h = Math.max(minSize, Math.min(1 - dragStart.crop.y, dragStart.crop.h + deltaY));
          x = newX;
        } else if (activeHandle?.includes("se")) {
          w = Math.max(minSize, Math.min(1 - dragStart.crop.x, dragStart.crop.w + deltaX));
          h = Math.max(minSize, Math.min(1 - dragStart.crop.y, dragStart.crop.h + deltaY));
        }
      }

      return { x, y, w, h };
    });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (isDragging) {
      setIsDragging(false);
      setActiveHandle(null);
      setDragStart(null);
    }
  };

  const handleReset = () => {
    vibrateLight();
    setCrop({ x: 0.05, y: 0.05, w: 0.9, h: 0.9 });
  };

  const handleConfirm = () => {
    vibrateSuccess();
    const img = imgRef.current;
    if (!img) return;

    const canvas = document.createElement("canvas");
    const naturalWidth = img.naturalWidth;
    const naturalHeight = img.naturalHeight;

    const cropX = crop.x * naturalWidth;
    const cropY = crop.y * naturalHeight;
    const cropW = crop.w * naturalWidth;
    const cropH = crop.h * naturalHeight;

    canvas.width = cropW;
    canvas.height = cropH;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.drawImage(img, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH);

    canvas.toBlob(
      (blob) => {
        if (blob) {
          const croppedFile = new File([blob], `cropped-answer-sheet-${Date.now()}.jpg`, {
            type: "image/jpeg",
            lastModified: Date.now(),
          });
          onConfirm(croppedFile);
        }
      },
      "image/jpeg",
      0.95
    );
  };

  // SVG Overlay calculation
  const cropPx = imgBounds
    ? {
        x: imgBounds.left + crop.x * imgBounds.width,
        y: imgBounds.top + crop.y * imgBounds.height,
        w: crop.w * imgBounds.width,
        h: crop.h * imgBounds.height,
      }
    : null;

  return (
    <div className="fixed inset-0 z-[100] bg-black flex flex-col pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)] select-none">
      {/* Top Header */}
      <div className="flex items-center justify-between p-4 z-20 bg-gradient-to-b from-black/80 to-transparent shrink-0">
        <button
          onClick={onCancel}
          className="w-10 h-10 rounded-full bg-white/10 text-white flex items-center justify-center backdrop-blur-md active:scale-95 transition-transform"
          aria-label="Cancel crop"
        >
          <X className="w-5 h-5" />
        </button>
        <span className="text-white font-medium flex items-center gap-2">
          <CropIcon className="w-4 h-4 text-primary" /> Crop Answer Sheet
        </span>
        <button
          onClick={handleReset}
          className="w-10 h-10 rounded-full bg-white/10 text-white flex items-center justify-center backdrop-blur-md active:scale-95 transition-transform"
          aria-label="Reset crop"
          title="Reset Crop"
        >
          <RotateCcw className="w-5 h-5" />
        </button>
      </div>

      {/* Interactive Crop Workspace */}
      <div
        ref={containerRef}
        className="flex-1 relative overflow-hidden flex items-center justify-center p-4"
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        <img
          ref={imgRef}
          src={imageUrl}
          alt="Target for cropping"
          onLoad={updateImgBounds}
          className="max-w-full max-h-full object-contain pointer-events-none"
        />

        {/* Dimmed Overlay SVG Mask + Handles */}
        {imgBounds && cropPx && (
          <div className="absolute inset-0 pointer-events-none">
            {/* SVG Mask for Dimmed Exterior */}
            <svg className="w-full h-full absolute inset-0 pointer-events-none">
              <defs>
                <mask id="crop-mask">
                  <rect width="100%" height="100%" fill="white" />
                  <rect
                    x={cropPx.x}
                    y={cropPx.y}
                    width={cropPx.w}
                    height={cropPx.h}
                    fill="black"
                    rx="8"
                  />
                </mask>
              </defs>
              <rect
                width="100%"
                height="100%"
                fill="rgba(0,0,0,0.65)"
                mask="url(#crop-mask)"
              />
            </svg>

            {/* Draggable Crop Box Container */}
            <div
              className="absolute border-2 border-white/90 rounded-lg pointer-events-auto cursor-move shadow-2xl"
              style={{
                left: `${cropPx.x}px`,
                top: `${cropPx.y}px`,
                width: `${cropPx.w}px`,
                height: `${cropPx.h}px`,
              }}
              onPointerDown={(e) => handlePointerDown(e, "move")}
            >
              {/* Grid Lines */}
              <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 pointer-events-none opacity-30">
                <div className="border-r border-white/50" />
                <div className="border-r border-white/50" />
                <div />
                <div className="border-t border-white/50 col-span-3" />
                <div className="border-t border-white/50 col-span-3" />
              </div>

              {/* Corner Handles */}
              {/* Top Left Corner Bracket */}
              <div
                className="absolute -top-2.5 -left-2.5 w-7 h-7 border-t-4 border-l-4 border-primary rounded-tl-md cursor-nwse-resize pointer-events-auto touch-none"
                onPointerDown={(e) => handlePointerDown(e, "nw")}
              />
              {/* Top Right Corner Bracket */}
              <div
                className="absolute -top-2.5 -right-2.5 w-7 h-7 border-t-4 border-r-4 border-primary rounded-tr-md cursor-nesw-resize pointer-events-auto touch-none"
                onPointerDown={(e) => handlePointerDown(e, "ne")}
              />
              {/* Bottom Left Corner Bracket */}
              <div
                className="absolute -bottom-2.5 -left-2.5 w-7 h-7 border-b-4 border-l-4 border-primary rounded-bl-md cursor-nesw-resize pointer-events-auto touch-none"
                onPointerDown={(e) => handlePointerDown(e, "sw")}
              />
              {/* Bottom Right Corner Bracket */}
              <div
                className="absolute -bottom-2.5 -right-2.5 w-7 h-7 border-b-4 border-r-4 border-primary rounded-br-md cursor-nwse-resize pointer-events-auto touch-none"
                onPointerDown={(e) => handlePointerDown(e, "se")}
              />
            </div>
          </div>
        )}
      </div>

      {/* Bottom Action Footer */}
      <div className="p-6 bg-gradient-to-t from-black via-black/90 to-transparent flex items-center justify-between gap-4 z-20 shrink-0 pb-[calc(1.5rem+env(safe-area-inset-bottom))]">
        <Button
          onClick={onCancel}
          variant="outline"
          className="rounded-2xl border-white/20 text-white hover:bg-white/10 bg-white/5 h-12 px-6"
        >
          Cancel
        </Button>
        <Button
          onClick={handleConfirm}
          className="rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold h-12 px-8 shadow-lg shadow-primary/30 active:scale-95 transition-all gap-2"
        >
          <Check className="w-5 h-5" strokeWidth={2.5} /> Confirm Crop
        </Button>
      </div>
    </div>
  );
}
