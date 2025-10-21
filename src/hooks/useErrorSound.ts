export function useErrorSound() {
  const playError = () => {
    const audio = new Audio("/error.mp3");
    audio.play().catch((err) => {
      console.warn("Failed to play error sound:", err);
    });
  };

  const playDuplicate = () => {
    const audio = new Audio("/duplicate.mp3");
    audio.play().catch((err) => {
      console.warn("Failed to play duplicate sound:", err);
    });
  };

  const playSuccess = () => {
    const audio = new Audio("/success.mp3");
    audio.play().catch((err) => {
      console.warn("Failed to play success sound:", err);
    });
  };

  return { playError, playDuplicate, playSuccess };
}
