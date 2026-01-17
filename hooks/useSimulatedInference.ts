import { useState, useEffect } from "react";

export function useSimulatedInference(data: any, isCached: boolean) {
  const [revealedData, setRevealedData] = useState<any>(null);
  const [isRevealing, setIsRevealing] = useState(false);

  useEffect(() => {
    if (data) {
      // Regardless of whether it's cached or fresh, we start the reveal process
      setIsRevealing(true);
      setRevealedData(data);
    }
  }, [data, isCached]);

  return {
    revealedData,
    isRevealing,
    onComplete: () => setIsRevealing(false)
  };
}
