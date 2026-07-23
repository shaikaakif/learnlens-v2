"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Camera, FileImage, FileText, X } from "lucide-react";

interface ImageSourceSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectCamera: () => void;
  onSelectFiles: (files: File[]) => void;
}

export function ImageSourceSheet({
  isOpen,
  onClose,
  onSelectCamera,
  onSelectFiles,
}: ImageSourceSheetProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Lock body scroll and listen for Escape key when open
  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !mounted) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onSelectFiles(Array.from(e.target.files));
    }
  };

  const sheetContent = (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 touch-none">
      {/* Dark Blurred Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-md transition-opacity animate-in fade-in duration-300"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sheet Dialog Surface */}
      <div
        className="relative w-full max-w-md bg-card rounded-t-[2.5rem] sm:rounded-3xl shadow-2xl p-6 pt-3 pb-[calc(1.5rem+env(safe-area-inset-bottom))] max-h-[85dvh] flex flex-col space-y-5 animate-spring slide-in-from-bottom-full sm:slide-in-from-bottom-8 sm:zoom-in-95 duration-400 z-10 overflow-hidden"
        role="dialog"
        aria-modal="true"
      >
        {/* Drag Handle Bar */}
        <div className="w-12 h-1.5 bg-muted-foreground/25 rounded-full mx-auto shrink-0 mt-1" />

        {/* Header */}
        <div className="flex justify-between items-center shrink-0 px-1">
          <div>
            <h2 className="text-xl font-serif font-bold text-foreground">Add Answer Sheets</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Select how you want to add documents</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 -mr-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-full transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Options (Scrollable Container) */}
        <div className="flex flex-col gap-3.5 overflow-y-auto pr-1 -mr-1 py-1 flex-1">
          {/* Camera Option */}
          <button
            onClick={onSelectCamera}
            className="flex items-center gap-4 p-4 min-h-[68px] bg-primary/10 hover:bg-primary/15 border border-primary/30 rounded-2xl transition-all text-left group active:scale-[0.98]"
          >
            <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center shrink-0 text-primary shadow-sm border border-primary/20 group-hover:scale-105 transition-transform">
              <Camera className="w-6 h-6" />
            </div>
            <div>
              <p className="font-semibold text-foreground text-base">Camera</p>
              <p className="text-xs text-muted-foreground">Take a clear photo of your answer sheet</p>
            </div>
          </button>

          {/* Photos Gallery Option */}
          <div className="relative">
            <input
              type="file"
              multiple
              accept="image/*"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              onChange={handleFileChange}
              title="Upload from Photos"
            />
            <button className="flex items-center gap-4 p-4 min-h-[68px] bg-muted/40 hover:bg-muted/70 border border-border/70 rounded-2xl transition-all text-left w-full relative z-0 active:scale-[0.98]">
              <div className="w-12 h-12 rounded-2xl bg-background flex items-center justify-center shrink-0 border border-border/60 shadow-sm">
                <FileImage className="w-6 h-6 text-foreground/80" />
              </div>
              <div>
                <p className="font-semibold text-foreground text-base">Photos</p>
                <p className="text-xs text-muted-foreground">Choose existing answer-sheet images</p>
              </div>
            </button>
          </div>

          {/* Document PDF Option */}
          <div className="relative">
            <input
              type="file"
              multiple
              accept="application/pdf"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              onChange={handleFileChange}
              title="Upload PDF Document"
            />
            <button className="flex items-center gap-4 p-4 min-h-[68px] bg-muted/40 hover:bg-muted/70 border border-border/70 rounded-2xl transition-all text-left w-full relative z-0 active:scale-[0.98]">
              <div className="w-12 h-12 rounded-2xl bg-background flex items-center justify-center shrink-0 border border-border/60 shadow-sm">
                <FileText className="w-6 h-6 text-foreground/80" />
              </div>
              <div>
                <p className="font-semibold text-foreground text-base">Document (PDF)</p>
                <p className="text-xs text-muted-foreground">Upload a scanned PDF document</p>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(sheetContent, document.body);
}
