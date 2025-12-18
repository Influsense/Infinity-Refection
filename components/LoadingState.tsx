
import React, { useState, useEffect } from 'react';

const messages = [
  "Polishing the chrome sphere...",
  "Aligning the infinite columns...",
  "Capturing the recursive reflection...",
  "Rendering reality within reality...",
  "Finalizing the Droste effect...",
  "Engraving details on the hands..."
];

export const LoadingState: React.FC = () => {
  const [msgIndex, setMsgIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMsgIndex((prev) => (prev + 1) % messages.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center space-y-8 p-12">
      <div className="relative w-24 h-24">
        <div className="absolute inset-0 border-4 border-zinc-800 rounded-full"></div>
        <div className="absolute inset-0 border-4 border-t-zinc-200 rounded-full animate-spin"></div>
        <div className="absolute inset-4 bg-zinc-400/20 rounded-full blur-sm animate-pulse"></div>
      </div>
      <div className="text-center">
        <p className="text-zinc-400 font-medium animate-pulse text-lg">
          {messages[msgIndex]}
        </p>
        <p className="text-zinc-600 text-sm mt-2">
          This may take up to 20 seconds
        </p>
      </div>
    </div>
  );
};
