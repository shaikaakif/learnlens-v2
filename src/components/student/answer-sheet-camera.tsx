"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { X, Check, Camera as CameraIcon, AlertCircle, RefreshCcw, Flashlight, Crop as CropIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { vibrateLight, vibrateSuccess, vibrateError } from "@/lib/haptics";
import { ImageCropper } from "@/components/student/image-cropper";

interface AnswerSheetCameraProps {
  onCapture: (file: File) => void;
  onClose: () => void;
}

type CameraStage = "camera" | "review" | "crop";

export function AnswerSheetCamera({ onCapture, onClose }: AnswerSheetCameraProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [stage, setStage] = useState<CameraStage>("camera");
  const [capturedDataUrl, setCapturedDataUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [hasTorch, setHasTorch] = useState(false);
  const [torchOn, setTorchOn] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Stop all camera hardware tracks cleanly
  const stopStream = (mediaStream: MediaStream | null) => {
    if (mediaStream) {
      mediaStream.getTracks().forEach((track) => {
        track.stop();
      });
    }
  };

  // Initialize Camera Stream
  useEffect(() => {
    let activeStream: MediaStream | null = null;

    async function initCamera() {
      try {
        setIsInitializing(true);
        setError(null);

        const constraints: MediaStreamConstraints = {
          video: {
            facingMode: { ideal: "environment" },
            width: { ideal: 1920 },
            height: { ideal: 1080 },
          },
          audio: false,
        };

        const newStream = await navigator.mediaDevices.getUserMedia(constraints);
        activeStream = newStream;
        setStream(newStream);

        if (videoRef.current) {
          videoRef.current.srcObject = newStream;
        }

        // Check if torch/flash is supported by video track
        const videoTrack = newStream.getVideoTracks()[0];
        if (videoTrack && typeof videoTrack.getCapabilities === "function") {
          const capabilities = videoTrack.getCapabilities() as any;
          if (capabilities && capabilities.torch) {
            setHasTorch(true);
          }
        }
      } catch (err: any) {
        console.error("Camera error:", err);
        vibrateError();
        if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
          setError("Camera permission is needed to photograph your answer sheet.");
        } else if (err.name === "NotFoundError" || err.name === "DevicesNotFoundError") {
          setError("No camera was found on this device.");
        } else if (err.name === "NotReadableError" || err.name === "TrackStartError") {
          setError("Your camera is currently being used by another application.");
        } else {
          setError("Unable to access the camera. Please choose from Photos instead.");
        }
      } finally {
        setIsInitializing(false);
      }
    }

    initCamera();

    return () => {
      stopStream(activeStream);
    };
  }, []);

  // Lock body scroll while camera flow is active
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  // Toggle Flash/Torch
  const toggleTorch = async () => {
    if (!stream) return;
    const videoTrack = stream.getVideoTracks()[0];
    if (!videoTrack) return;

    try {
      const nextState = !torchOn;
      await (videoTrack as any).applyConstraints({
        advanced: [{ torch: nextState }],
      });
      setTorchOn(nextState);
      vibrateLight();
    } catch (err) {
      console.warn("Torch failed to toggle", err);
    }
  };

  // Capture Photo Frame
  const handleCapture = () => {
    if (!videoRef.current || !canvasRef.current) return;
    vibrateLight();

    const video = videoRef.current;
    const canvas = canvasRef.current;

    canvas.width = video.videoWidth || 1920;
    canvas.height = video.videoHeight || 1080;

    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL("image/jpeg", 0.95);
      setCapturedDataUrl(dataUrl);
      setStage("review");
    }
  };

  const handleRetake = () => {
    vibrateLight();
    setCapturedDataUrl(null);
    setStage("camera");
  };

  const handleClose = () => {
    stopStream(stream);
    onClose();
  };

  // Accept Photo without crop
  const handleAcceptUncropped = () => {
    if (!canvasRef.current) return;
    vibrateSuccess();

    canvasRef.current.toBlob(
      (blob) => {
        if (blob) {
          const file = new File([blob], `answer-sheet-${Date.now()}.jpg`, {
            type: "image/jpeg",
            lastModified: Date.now(),
          });
          stopStream(stream);
          onCapture(file);
        }
      },
      "image/jpeg",
      0.95
    );
  };

  // Confirm Cropped Photo
  const handleConfirmCrop = (croppedFile: File) => {
    vibrateSuccess();
    stopStream(stream);
    onCapture(croppedFile);
  };

  if (!mounted) return null;

  // Render Error Overlay State
  if (error) {
    const errorContent = (
      <div className="fixed inset-0 z-[100] bg-background flex flex-col items-center justify-center p-6 animate-in fade-in zoom-in-95 duration-300 pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]">
        <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mb-6">
          <AlertCircle className="w-8 h-8 text-destructive" />
        </div>
        <h2 className="text-2xl font-serif mb-2 font-bold text-foreground">Camera Unavailable</h2>
        <p className="text-muted-foreground text-center mb-8 max-w-sm">{error}</p>
        <div className="flex flex-col gap-3 w-full max-w-xs">
          <Button onClick={handleClose} variant="default" className="w-full h-12 rounded-xl">
            Choose from Photos
          </Button>
          <Button onClick={handleClose} variant="ghost" className="w-full h-12 rounded-xl">
            Cancel
          </Button>
        </div>
      </div>
    );
    return createPortal(errorContent, document.body);
  }

  // Render Crop Stage
  if (stage === "crop" && capturedDataUrl) {
    const cropContent = (
      <ImageCropper
        imageUrl={capturedDataUrl}
        onConfirm={handleConfirmCrop}
        onCancel={() => setStage("review")}
      />
    );
    return createPortal(cropContent, document.body);
  }

  // Main Camera & Review Render
  const portalContent = (
    <div className="fixed inset-0 z-[100] bg-black flex flex-col pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)] animate-in slide-in-from-bottom-full duration-400 select-none">
      
      {/* Native Camera Header Bar */}
      <div className="flex items-center justify-between p-4 absolute top-[env(safe-area-inset-top)] left-0 right-0 z-30 bg-gradient-to-b from-black/70 to-transparent">
        <button
          onClick={handleClose}
          className="w-10 h-10 rounded-full bg-black/40 text-white flex items-center justify-center backdrop-blur-md active:scale-95 transition-transform"
          aria-label="Close Camera"
        >
          <X className="w-6 h-6" />
        </button>

        <span className="text-white font-medium text-sm tracking-wide drop-shadow-md">
          {stage === "review" ? "Review Answer Sheet" : "Capture Answer Sheet"}
        </span>

        {/* Torch Button or Crop Tool Button */}
        {stage === "camera" ? (
          hasTorch ? (
            <button
              onClick={toggleTorch}
              className={`w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-md active:scale-95 transition-all ${
                torchOn ? "bg-amber-400 text-black shadow-lg shadow-amber-400/50" : "bg-black/40 text-white"
              }`}
              aria-label="Toggle Flash"
            >
              <Flashlight className="w-5 h-5" />
            </button>
          ) : (
            <div className="w-10 h-10" />
          )
        ) : (
          <button
            onClick={() => setStage("crop")}
            className="w-10 h-10 rounded-full bg-black/40 text-white flex items-center justify-center backdrop-blur-md active:scale-95 transition-all hover:bg-white/20"
            aria-label="Crop Photo"
            title="Crop Image"
          >
            <CropIcon className="w-5 h-5 text-primary" />
          </button>
        )}
      </div>

      {/* Camera Preview Area */}
      <div className="flex-1 relative flex items-center justify-center overflow-hidden bg-black">
        {isInitializing && stage === "camera" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
            <RefreshCcw className="w-8 h-8 text-primary animate-spin" />
            <span className="text-xs text-white/70 font-medium">Opening Camera...</span>
          </div>
        )}

        {/* Live Video Feed */}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${
            stage === "review" ? "opacity-0" : "opacity-100"
          }`}
        />

        {/* Framing Corner Brackets (Only in camera mode) */}
        {stage === "camera" && !isInitializing && (
          <div className="absolute inset-6 sm:inset-12 pointer-events-none transition-all duration-300 flex items-center justify-center">
            {/* Top Left Bracket */}
            <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-white/80 rounded-tl-xl" />
            {/* Top Right Bracket */}
            <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-white/80 rounded-tr-xl" />
            {/* Bottom Left Bracket */}
            <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-white/80 rounded-bl-xl" />
            {/* Bottom Right Bracket */}
            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-white/80 rounded-br-xl" />
            
            <span className="text-white/60 font-medium tracking-widest uppercase text-xs px-3 py-1.5 rounded-full bg-black/30 backdrop-blur-sm border border-white/10">
              Align Page Within Frame
            </span>
          </div>
        )}

        {/* Captured Photo Preview (Review Stage) */}
        {stage === "review" && capturedDataUrl && (
          <img
            src={capturedDataUrl}
            alt="Captured answer sheet preview"
            className="absolute inset-0 w-full h-full object-contain bg-black animate-in fade-in zoom-in-95 duration-200"
          />
        )}

        {/* Hidden Canvas for capture processing */}
        <canvas ref={canvasRef} className="hidden" />
      </div>

      {/* Bottom Camera Controls Bar */}
      <div className="bg-black/95 p-6 flex items-center justify-center pb-[calc(1.5rem+env(safe-area-inset-bottom))] relative z-30 shrink-0 border-t border-white/10">
        {stage === "camera" ? (
          /* Live Shutter Mode */
          <div className="flex items-center justify-center w-full max-w-xs">
            <button
              onClick={handleCapture}
              disabled={isInitializing}
              className="w-20 h-20 rounded-full border-4 border-white/90 p-1 active:scale-90 transition-transform disabled:opacity-50 shadow-2xl"
              aria-label="Take Photo"
            >
              <div className="w-full h-full bg-white rounded-full active:bg-white/80 transition-colors" />
            </button>
          </div>
        ) : (
          /* Review Mode Controls */
          <div className="flex w-full max-w-md justify-between items-center px-4 animate-in slide-in-from-bottom-4 duration-300">
            {/* Retake Button */}
            <button
              onClick={handleRetake}
              className="flex flex-col items-center gap-1.5 text-white/80 hover:text-white active:scale-95 transition-all"
            >
              <div className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center border border-white/20 backdrop-blur-md">
                <X className="w-6 h-6" />
              </div>
              <span className="text-xs font-medium">Retake</span>
            </button>

            {/* Crop Button */}
            <button
              onClick={() => setStage("crop")}
              className="flex flex-col items-center gap-1.5 text-white/80 hover:text-white active:scale-95 transition-all"
            >
              <div className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center border border-white/20 backdrop-blur-md">
                <CropIcon className="w-6 h-6 text-primary" />
              </div>
              <span className="text-xs font-medium">Crop</span>
            </button>

            {/* Accept / Attach Photo Button */}
            <button
              onClick={handleAcceptUncropped}
              className="flex flex-col items-center gap-1.5 text-white active:scale-95 transition-all"
            >
              <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center text-primary-foreground shadow-lg shadow-primary/40">
                <Check className="w-7 h-7" strokeWidth={3} />
              </div>
              <span className="text-xs font-bold tracking-wide text-primary">Use Photo</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );

  return createPortal(portalContent, document.body);
}
