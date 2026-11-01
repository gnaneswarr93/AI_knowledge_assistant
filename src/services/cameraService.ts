let currentStream: MediaStream | null = null;

export const cameraService = {
  isSupported(): boolean {
    if (typeof navigator === 'undefined') return false;
    return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
  },

  async startCamera(videoElement: HTMLVideoElement): Promise<MediaStream> {
    if (!this.isSupported()) {
      throw new Error('Camera capture is not supported in this browser.');
    }

    // Stop any existing stream first
    this.stopCamera();

    try {
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      currentStream = stream;
      videoElement.srcObject = stream;
      await videoElement.play();
      return stream;
    } catch (err: unknown) {
      if (err instanceof DOMException) {
        if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
          throw new Error('Camera access is required to take a photo.');
        } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
          throw new Error('Camera is not available on this device.');
        } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
          throw new Error('Camera is in use by another application.');
        }
      }
      throw new Error('Camera is not available on this device.');
    }
  },

  capturePhoto(videoElement: HTMLVideoElement): string {
    const canvas = document.createElement('canvas');
    const width = videoElement.videoWidth || 640;
    const height = videoElement.videoHeight || 480;

    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Unable to capture camera snapshot.');
    }

    ctx.drawImage(videoElement, 0, 0, width, height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.92);

    // Stop camera after capture as required
    this.stopCamera();

    return dataUrl;
  },

  stopCamera(): void {
    if (currentStream) {
      try {
        currentStream.getTracks().forEach((track) => {
          track.stop();
        });
      } catch {
        // Ignore
      }
      currentStream = null;
    }
  },

  getCurrentStream(): MediaStream | null {
    return currentStream;
  },
};
