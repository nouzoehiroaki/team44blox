"use client";
import { useEffect, useState } from "react";

type TypingTextProps = {
  text: string;
  speed?: number; // 1文字あたりの表示速度（ms）
  className?: string;
};

export function TypingText({ text, speed = 100, className }: TypingTextProps) {
  const [displayed, setDisplayed] = useState("");

  useEffect(() => {
    let idx = 0;
    const timer = setInterval(() => {
      setDisplayed(text.slice(0, ++idx));
      if (idx === text.length) clearInterval(timer);
    }, speed);
    return () => clearInterval(timer);
  }, [text, speed]);

  return <p className={className}>{displayed}</p>;
}
