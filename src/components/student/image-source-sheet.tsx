"use client";

import { useEffect } from "react";
import { Camera, FileImage, X } from "lucide-react";

interface ImageSourceSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectCamera: () => void;
  onSelectFiles: (files: File[]) => void;
}

export function ImageSourceSheet({ isOpen, onClose, onSelectCamera, onSelectFiles }: ImageSourceSheetProps) {
  
  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onSelectFiles(Array.from(e.target.files));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity animate-in fade-in duration-300"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sheet Content */}
      <div 
        className="relative w-full max-w-sm bg-card rounded-t-3xl sm:rounded-3xl shadow-2xl p-6 pt-4 space-y-6 animate-spring slide-in-from-bottom-full sm:slide-in-from-bottom-8 sm:zoom-in-95 duration-500"
        role="dialog"
        aria-modal="true"
      >
        {/* Drag Indicator */}
        <div className="w-12 h-1.5 bg-muted-foreground/20 rounded-full mx-auto sm:hidden" />

        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Add Answer Sheets</h2>
          <button 
            onClick={onClose}
            className="p-2 -mr-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-full transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex flex-col gap-3">
          <button
            onClick={onSelectCamera}
            className="flex items-center gap-4 p-4 min-h-[64px] bg-primary/5 hover:bg-primary/10 border border-primary/20 rounded-2xl transition-colors text-left"
          >
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <Camera className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="font-semibold text-foreground">Camera</p>
              <p className="text-sm text-muted-foreground">Take a photo of your answer sheet</p>
            </div>
          </button>

          <div className="relative">
            <input 
              type="file" 
              multiple 
              accept="image/*" 
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              onChange={handleFileChange}
              title="Upload from Photos"
            />
            <button
              className="flex items-center gap-4 p-4 min-h-[64px] bg-muted/50 hover:bg-muted border border-border rounded-2xl transition-colors text-left w-full relative z-0"
            >
              <div className="w-12 h-12 rounded-full bg-background flex items-center justify-center shrink-0 border border-border/50">
                <FileImage className="w-6 h-6 text-muted-foreground" />
              </div>
              <div>
                <p className="font-semibold text-foreground">Photos</p>
                <p className="text-sm text-muted-foreground">Choose existing answer-sheet photos</p>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
