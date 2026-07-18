"use client";

import { useEffect, useRef, useState } from "react";
import { X, Check, Camera as CameraIcon, AlertCircle, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { vibrateLight, vibrateSuccess, vibrateError } from "@/lib/haptics";

interface AnswerSheetCameraProps {
  onCapture: (file: File) => void;
  onClose: () => void;
}

export function AnswerSheetCamera({ onCapture, onClose }: AnswerSheetCameraProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  // Initialize Camera
  useEffect(() => {
    let activeStream: MediaStream | null = null;

    async function initCamera() {
      try {
        setIsInitializing(true);
        setError(null);
        const newStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: "environment" } },
          audio: false,
        });
        
        activeStream = newStream;
        setStream(newStream);

        if (videoRef.current) {
          videoRef.current.srcObject = newStream;
        }
      } catch (err: any) {
        console.error("Camera error:", err);
        vibrateError();
        if (err.name === 'NotAllowedError') {
          setError("Camera permission is needed to photograph your answer sheet.");
        } else if (err.name === 'NotFoundError') {
          setError("No camera was found on this device.");
        } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
          setError("Your camera is currently being used by another application.");
        } else {
          setError("Unable to access the camera. Please choose from Photos instead.");
        }
      } finally {
        setIsInitializing(false);
      }
    }

    initCamera();

    // Cleanup tracks strictly on unmount
    return () => {
      if (activeStream) {
        activeStream.getTracks().forEach(track => {
          track.stop();
        });
      }
    };
  }, []);

  const handleCapture = () => {
    if (!videoRef.current || !canvasRef.current) return;
    
    vibrateLight(); // Shutter feel

    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    // Match canvas to actual video dimensions
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const context = canvas.getContext("2d");
    if (context) {
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL("image/jpeg", 0.9);
      setCapturedImage(dataUrl);
    }
  };

  const handleRetake = () => {
    setCapturedImage(null);
  };

  const handleAccept = () => {
    if (!canvasRef.current) return;
    vibrateSuccess(); // Accept feel

    canvasRef.current.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], `answer-sheet-${Date.now()}.jpg`, { type: "image/jpeg" });
        onCapture(file);
        // We stay in the camera component (reset state) to allow rapid multi-page capture if desired,
        // or the parent can close it. Let's let the parent handle the flow, we just fire onCapture and reset.
        setCapturedImage(null);
      }
    }, "image/jpeg", 0.9);
  };

  // Render Error State
  if (error) {
    return (
      <div className="fixed inset-0 z-50 bg-background flex flex-col items-center justify-center p-6 animate-in fade-in zoom-in-95 duration-300 pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]">
        <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mb-6">
          <AlertCircle className="w-8 h-8 text-destructive" />
        </div>
        <h2 className="text-2xl font-serif mb-2">Camera Unavailable</h2>
        <p className="text-muted-foreground text-center mb-8 max-w-sm">{error}</p>
        <div className="flex flex-col gap-3 w-full max-w-xs">
          <Button onClick={onClose} variant="default" className="w-full">Choose from Photos</Button>
          <Button onClick={onClose} variant="ghost" className="w-full">Cancel</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)] animate-in slide-in-from-bottom-full duration-500">
      
      {/* Header bar */}
      <div className="flex items-center justify-between p-4 absolute top-[env(safe-area-inset-top)] left-0 right-0 z-20 bg-gradient-to-b from-black/60 to-transparent">
        <button onClick={onClose} className="w-10 h-10 rounded-full bg-black/40 text-white flex items-center justify-center backdrop-blur-md">
          <X className="w-6 h-6" />
        </button>
        <span className="text-white font-medium tracking-wide drop-shadow-md">
          {capturedImage ? "Review Page" : "Capture Answer Sheet"}
        </span>
        <div className="w-10 h-10" /> {/* Spacer for centering */}
      </div>

      {/* Main View Area */}
      <div className="flex-1 relative flex items-center justify-center overflow-hidden bg-black">
        {isInitializing && !capturedImage && (
          <div className="absolute inset-0 flex items-center justify-center">
            <RefreshCcw className="w-8 h-8 text-white/50 animate-spin" />
          </div>
        )}

        {/* Live Video */}
        <video 
          ref={videoRef}
          autoPlay 
          playsInline 
          muted 
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${capturedImage ? 'opacity-0' : 'opacity-100'}`} 
        />

        {/* Framing Guide (only in live view) */}
        {!capturedImage && !isInitializing && (
          <div className="absolute inset-8 md:inset-16 border-2 border-white/40 rounded-2xl pointer-events-none transition-all duration-300 shadow-[0_0_0_9999px_rgba(0,0,0,0.4)] flex items-center justify-center">
            <span className="text-white/50 font-medium tracking-widest uppercase text-sm">Align page within frame</span>
          </div>
        )}

        {/* Captured Image Preview */}
        {capturedImage && (
          <img 
            src={capturedImage} 
            alt="Captured answer sheet" 
            className="absolute inset-0 w-full h-full object-cover animate-in fade-in zoom-in-95 duration-200"
          />
        )}

        {/* Hidden Canvas for capture processing */}
        <canvas ref={canvasRef} className="hidden" />
      </div>

      {/* Bottom Controls Bar */}
      <div className="bg-black p-8 flex items-center justify-center gap-8 md:gap-16 pb-[calc(2rem+env(safe-area-inset-bottom))] relative z-20">
        
        {!capturedImage ? (
          /* Capture Mode Controls */
          <>
            <div className="w-14 h-14" /> {/* Spacer */}
            <button 
              onClick={handleCapture}
              disabled={isInitializing}
              className="w-20 h-20 rounded-full border-4 border-white/80 p-1 active:scale-95 transition-transform disabled:opacity-50"
              aria-label="Take photo"
            >
              <div className="w-full h-full bg-white rounded-full" />
            </button>
            <div className="w-14 h-14" /> {/* Spacer */}
          </>
        ) : (
          /* Review Mode Controls */
          <div className="flex w-full max-w-sm justify-between items-center px-4 animate-in slide-in-from-bottom-4 duration-300">
            <div className="flex flex-col items-center gap-2">
              <button 
                onClick={handleRetake}
                className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center text-white backdrop-blur-md active:bg-white/20 transition-colors"
                aria-label="Retake"
              >
                <X className="w-6 h-6" />
              </button>
              <span className="text-xs text-white/70 font-medium">Retake</span>
            </div>
            
            <div className="flex flex-col items-center gap-2">
              <button 
                onClick={handleAccept}
                className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-white active:scale-95 shadow-lg shadow-primary/30 transition-all"
                aria-label="Use Photo"
              >
                <Check className="w-8 h-8" strokeWidth={3} />
              </button>
              <span className="text-xs text-white/90 font-bold tracking-wide">Use Photo</span>
            </div>
          </div>
        )}

      </div>
      
    </div>
  );
}
