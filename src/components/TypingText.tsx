"use client";
import { useEffect, useState } from "react";

type TypingTextProps = {
  text: string;
  speed?: number;
  className?: string;
  onComplete?: () => void;
};

export function TypingText({ text, speed = 100, className, onComplete }: TypingTextProps) {
  const [displayed, setDisplayed] = useState("");

  useEffect(() => {
    let idx = 0;
    const timer = setInterval(() => {
      idx++;
      setDisplayed(text.slice(0, idx));
      if (idx === text.length) {
        clearInterval(timer);
        onComplete?.();
      }
    }, speed);
    return () => clearInterval(timer);
  }, [text, speed, onComplete]);

  return <p className={className}>{displayed}</p>;
}
