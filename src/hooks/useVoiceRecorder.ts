import { useEffect, useRef, useState } from "react";

type VoiceRecorderState = "idle" | "recording" | "recorded";

export function useVoiceRecorder() {
  const [state, setState] = useState<VoiceRecorderState>("idle");
  const [durationMs, setDurationMs] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const blobRef = useRef<Blob | null>(null);
  const startedAtRef = useRef<number | null>(null);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        window.clearInterval(timerRef.current);
      }
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  function resetRecording() {
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    mediaRecorderRef.current = null;
    chunksRef.current = [];
    blobRef.current = null;
    startedAtRef.current = null;
    setDurationMs(0);
    setPreviewUrl(null);
    setState("idle");
    setError(null);
  }

  async function startRecording() {
    setError(null);

    if (!navigator.mediaDevices?.getUserMedia) {
      setError("Voice recording is not supported in this browser.");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : MediaRecorder.isTypeSupported("audio/webm")
          ? "audio/webm"
          : "";

      const recorder = mimeType
        ? new MediaRecorder(stream, { mimeType })
        : new MediaRecorder(stream);

      chunksRef.current = [];
      blobRef.current = null;
      startedAtRef.current = Date.now();
      setDurationMs(0);

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        stream.getTracks().forEach((track) => track.stop());
        if (timerRef.current) {
          window.clearInterval(timerRef.current);
          timerRef.current = null;
        }

        const blob = new Blob(chunksRef.current, {
          type: recorder.mimeType || "audio/webm",
        });
        blobRef.current = blob;
        const nextDuration = startedAtRef.current
          ? Date.now() - startedAtRef.current
          : durationMs;
        setDurationMs(nextDuration);
        setPreviewUrl(URL.createObjectURL(blob));
        setState("recorded");
      };

      recorder.onerror = () => {
        stream.getTracks().forEach((track) => track.stop());
        setError("Recording failed. Please try again.");
        resetRecording();
      };

      mediaRecorderRef.current = recorder;
      recorder.start();
      setState("recording");

      timerRef.current = window.setInterval(() => {
        if (startedAtRef.current) {
          setDurationMs(Date.now() - startedAtRef.current);
        }
      }, 200);
    } catch {
      setError("Microphone permission is required to record a voice comment.");
      resetRecording();
    }
  }

  function stopRecording() {
    const recorder = mediaRecorderRef.current;
    if (!recorder || recorder.state === "inactive") {
      return;
    }
    recorder.stop();
  }

  function getRecordedBlob() {
    return blobRef.current;
  }

  return {
    state,
    durationMs,
    error,
    previewUrl,
    startRecording,
    stopRecording,
    resetRecording,
    getRecordedBlob,
  };
}

export function formatDuration(ms: number) {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}
