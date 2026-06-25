import React, { useEffect, useState } from 'react';

export default function AnimatedCounter({ value, duration = 800 }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const target = parseFloat(value);
    if (isNaN(target)) {
      setCount(value);
      return;
    }

    let start = 0;
    const end = target;
    if (start === end) return;

    const totalSteps = 40;
    const stepTime = duration / totalSteps;
    let currentStep = 0;

    const timer = setInterval(() => {
      currentStep++;
      const progress = currentStep / totalSteps;
      // Ease out quad formula
      const easeVal = progress * (2 - progress);
      const nextVal = Math.round(easeVal * end);
      
      if (currentStep >= totalSteps) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(nextVal);
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [value, duration]);

  return <span>{count}</span>;
}
