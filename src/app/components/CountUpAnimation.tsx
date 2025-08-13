"use client";

import { useEffect, useState } from "react";

interface CountUpAnimationProps {
  end: number;
  duration?: number;
  className?: string;
  formatNumber?: boolean;
}

export default function CountUpAnimation({
  end,
  duration = 1000,
  className = "",
  formatNumber = false,
}: CountUpAnimationProps) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (end === 0) {
      setCount(0);
      return;
    }

    let startTime: number;
    let animationId: number;

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;

      const progress = Math.min((currentTime - startTime) / duration, 1);

      // easeOutCubic 이징 함수 적용
      const easedProgress = 1 - Math.pow(1 - progress, 3);

      setCount(Math.floor(easedProgress * end));

      if (progress < 1) {
        animationId = requestAnimationFrame(animate);
      } else {
        setCount(end);
      }
    };

    animationId = requestAnimationFrame(animate);

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [end, duration]);

  const displayValue = formatNumber ? count.toLocaleString() : count;

  return <span className={className}>{displayValue}</span>;
}
