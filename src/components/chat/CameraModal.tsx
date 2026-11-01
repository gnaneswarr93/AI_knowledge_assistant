import React, { useRef, useState, useEffect, useCallback } from 'react';
import { cameraService } from '../../services/cameraService';
import { useToast } from '../../context/ToastContext';
import { Camera, X, RefreshCw, AlertCircle, Check } from 'lucide-react';

interface CameraModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPhotoCaptured: (imageDataUrl: string, filename: string) => void;
}

export const CameraModal: React.FC<CameraModalProps> = ({
  isOpen,
  onClose,
  onPhotoCaptured,
}) => {
  const { showToast } = useToast();
  const videoRef = useRef<HTMLVideoElement>(null);
  const mobileInputRef = useRef<HTMLInputElement>(null);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [capturedPreview, setCapturedPreview] = useState<string | null>(null);

  // Stop camera tracks helper
  const handleStopStream = useCallback(() => {
    cameraService.stopCamera();
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  const startStream = useCallback(async () => {
    setIsLoading(true);
    setErrorMsg(null);
    setCapturedPreview(null);

    if (!cameraService.isSupported()) {
      setErrorMsg('Camera capture is not supported in this browser.');
      setIsLoading(false);
      return;
    }

    try {
      if (videoRef.current) {
        await cameraService.startCamera(videoRef.current);
      }
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : 'Camera is not available on this device.';
      setErrorMsg(msg);
      showToast(msg, 'error');
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    if (isOpen) {
      // Delay slightly for modal DOM attachment
      const timer = setTimeout(() => {
        startStream();
      }, 100);
      return () => clearTimeout(timer);
    } else {
      handleStopStream();
    }
  }, [isOpen, startStream, handleStopStream]);

  // Ensure camera stops if unmounted
  useEffect(() => {
    return () => {
      cameraService.stopCamera();
    };
  }, []);

  if (!isOpen) return null;

  const handleCapture = () => {
    if (!videoRef.current) return;
    try {
      const dataUrl = cameraService.capturePhoto(videoRef.current);
      setCapturedPreview(dataUrl);
    } catch {
      showToast('Unable to capture camera snapshot.', 'error');
    }
  };

  const handleConfirmPhoto = () => {
    if (!capturedPreview) return;
    const filename = `camera-doc-${Date.now().toString().slice(-5)}.jpg`;
    onPhotoCaptured(capturedPreview, filename);
    handleStopStream();
    onClose();
  };

  const handleRetake = () => {
    setCapturedPreview(null);
    startStream();
  };

  const handleClose = () => {
    handleStopStream();
    onClose();
  };

  const handleMobileFileFallback = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        onPhotoCaptured(reader.result, file.name);
        handleClose();
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#1D2129] border border-slate-200 dark:border-[#2A2F38] text-slate-900 dark:text-slate-100 rounded-2xl max-w-lg w-full p-5 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100 dark:border-[#2A2F38]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold tracking-tight">Take Photo</h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Capture enterprise document or badge
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            aria-label="Close camera"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Video / Captured Viewport */}
        <div className="relative rounded-xl overflow-hidden bg-slate-950 aspect-4/3 flex items-center justify-center border border-slate-800">
          {errorMsg ? (
            <div className="p-6 text-center text-rose-400 space-y-3">
              <AlertCircle className="w-8 h-8 mx-auto text-rose-400" />
              <p className="text-xs font-medium">{errorMsg}</p>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => mobileInputRef.current?.click()}
                  className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs cursor-pointer"
                >
                  Use Device Camera File Picker
                </button>
              </div>
            </div>
          ) : capturedPreview ? (
            <div className="relative w-full h-full flex items-center justify-center">
              <img
                src={capturedPreview}
                alt="Captured snapshot"
                className="w-full h-full object-contain"
              />
              <div className="absolute top-2 right-2 px-2 py-0.5 rounded bg-black/60 text-[10px] text-white font-mono">
                Preview Snapshot
              </div>
            </div>
          ) : (
            <>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={`w-full h-full object-cover ${isLoading ? 'opacity-0' : 'opacity-100'}`}
              />
              {isLoading && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-slate-400 text-xs">
                  <RefreshCw className="w-6 h-6 animate-spin text-blue-500" />
                  <span>Connecting to camera...</span>
                </div>
              )}
              {/* Live Indicator overlay */}
              {!isLoading && (
                <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-slate-900/80 backdrop-blur-xs text-[10px] text-emerald-400 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  Live Camera
                </div>
              )}
            </>
          )}

          {/* Hidden mobile camera fallback input */}
          <input
            ref={mobileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={handleMobileFileFallback}
          />
        </div>

        {/* Modal Controls */}
        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-[#2A2F38] flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={handleClose}
            className="px-3.5 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition cursor-pointer"
          >
            Cancel
          </button>

          <div className="flex items-center gap-2">
            {capturedPreview ? (
              <>
                <button
                  type="button"
                  onClick={handleRetake}
                  className="px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition cursor-pointer flex items-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Retake</span>
                </button>
                <button
                  type="button"
                  onClick={handleConfirmPhoto}
                  className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition cursor-pointer flex items-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Use Photo</span>
                </button>
              </>
            ) : (
              !errorMsg && (
                <button
                  type="button"
                  disabled={isLoading}
                  onClick={handleCapture}
                  className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-lg shadow-xs transition disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>Capture</span>
                </button>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
