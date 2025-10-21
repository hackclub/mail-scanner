import { useRef } from "react";

export function useErrorSound() {
  const audioContext = useRef<AudioContext | null>(null);
  const buffers = useRef<{
    error: AudioBuffer | null;
    duplicate: AudioBuffer | null;
    success: AudioBuffer | null;
  }>({ error: null, duplicate: null, success: null });
  const initialized = useRef(false);

  const initAudio = async () => {
    if (initialized.current) return;
    
    try {
      audioContext.current = new AudioContext();
      
      const [errorBuffer, duplicateBuffer, successBuffer] = await Promise.all([
        fetch("/error.mp3").then(r => r.arrayBuffer()).then(b => audioContext.current!.decodeAudioData(b)),
        fetch("/duplicate.mp3").then(r => r.arrayBuffer()).then(b => audioContext.current!.decodeAudioData(b)),
        fetch("/success.mp3").then(r => r.arrayBuffer()).then(b => audioContext.current!.decodeAudioData(b)),
      ]);
      
      buffers.current = {
        error: errorBuffer,
        duplicate: duplicateBuffer,
        success: successBuffer,
      };
      
      initialized.current = true;
    } catch (err) {
      console.warn("Failed to initialize audio:", err);
    }
  };

  const playBuffer = async (buffer: AudioBuffer | null) => {
    if (!buffer || !audioContext.current) return;
    
    if (audioContext.current.state === "suspended") {
      await audioContext.current.resume();
    }
    
    const source = audioContext.current.createBufferSource();
    source.buffer = buffer;
    source.connect(audioContext.current.destination);
    source.start(0);
  };

  const playError = async () => {
    await initAudio();
    await playBuffer(buffers.current.error);
  };

  const playDuplicate = async () => {
    await initAudio();
    await playBuffer(buffers.current.duplicate);
  };

  const playSuccess = async () => {
    await initAudio();
    await playBuffer(buffers.current.success);
  };

  return { playError, playDuplicate, playSuccess };
}
