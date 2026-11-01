// Type declarations for browser SpeechRecognition
interface SpeechRecognitionEventLike extends Event {
  results: {
    length: number;
    item(index: number): {
      length: number;
      item(index: number): {
        transcript: string;
        confidence: number;
      };
      [index: number]: {
        transcript: string;
        confidence: number;
      };
      isFinal?: boolean;
    };
    [index: number]: {
      length: number;
      [index: number]: {
        transcript: string;
        confidence: number;
      };
      isFinal?: boolean;
    };
  };
  resultIndex: number;
}

interface SpeechRecognitionErrorEventLike extends Event {
  error: string;
  message?: string;
}

interface SpeechRecognitionLike extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEventLike) => void) | null;
  onend: (() => void) | null;
  onstart: (() => void) | null;
}

interface SpeechRecognitionConstructor {
  new (): SpeechRecognitionLike;
}

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  }
}

let activeRecognition: SpeechRecognitionLike | null = null;
let isCurrentlyListening = false;

export interface SpeechListenOptions {
  onStart?: () => void;
  onResult: (transcript: string, isFinal: boolean) => void;
  onError: (friendlyErrorMessage: string) => void;
  onEnd: () => void;
}

export const speechService = {
  isSupported(): boolean {
    if (typeof window === 'undefined') return false;
    return !!(window.SpeechRecognition || window.webkitSpeechRecognition);
  },

  isListening(): boolean {
    return isCurrentlyListening;
  },

  startListening(options: SpeechListenOptions): void {
    if (!this.isSupported()) {
      options.onError('Voice input is not supported in this browser.');
      return;
    }

    // Stop existing instance if running
    if (activeRecognition) {
      try {
        activeRecognition.abort();
      } catch {
        // Ignore
      }
      activeRecognition = null;
      isCurrentlyListening = false;
    }

    try {
      const SpeechRecognitionClass =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SpeechRecognitionClass) {
        options.onError('Voice input is not supported in this browser.');
        return;
      }

      const recognition = new SpeechRecognitionClass();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        isCurrentlyListening = true;
        options.onStart?.();
      };

      recognition.onresult = (event: SpeechRecognitionEventLike) => {
        let finalTranscript = '';
        let interimTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const res = event.results[i];
          const transcriptChunk = res[0]?.transcript || '';
          if (res.isFinal) {
            finalTranscript += transcriptChunk;
          } else {
            interimTranscript += transcriptChunk;
          }
        }

        const combined = (finalTranscript || interimTranscript).trim();
        if (combined) {
          options.onResult(combined, !!finalTranscript);
        }
      };

      recognition.onerror = (event: SpeechRecognitionErrorEventLike) => {
        isCurrentlyListening = false;
        const errType = event.error;

        if (errType === 'not-allowed' || errType === 'service-not-allowed') {
          options.onError('Microphone permission is required.');
        } else if (errType === 'no-speech') {
          options.onError('No speech detected. Please try again.');
        } else if (errType === 'network') {
          options.onError('Network connection error during voice recognition.');
        } else if (errType === 'audio-capture') {
          options.onError('No microphone detected on your device.');
        } else if (errType === 'aborted') {
          // Explicitly stopped by user, no error toast needed
        } else {
          options.onError('Recognition stopped. Please try again.');
        }
      };

      recognition.onend = () => {
        isCurrentlyListening = false;
        activeRecognition = null;
        options.onEnd();
      };

      activeRecognition = recognition;
      recognition.start();
    } catch {
      isCurrentlyListening = false;
      activeRecognition = null;
      options.onError('Unable to start voice input. Please check microphone access.');
      options.onEnd();
    }
  },

  stopListening(): void {
    if (activeRecognition) {
      try {
        activeRecognition.stop();
      } catch {
        try {
          activeRecognition.abort();
        } catch {
          // Ignore
        }
      }
      activeRecognition = null;
    }
    isCurrentlyListening = false;
  },
};
