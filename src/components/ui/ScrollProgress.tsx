// components/ui/ScrollProgress.tsx
import React, { useState, useEffect } from 'react';
import { motion, useScroll, useSpring } from 'motion/react';

const ScrollProgress = () => {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  return (
    <motion.div
      className="fixed top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-pink-500 via-rose-500 to-pink-500 z-[9999] origin-left"
      style={{ scaleX }}
    />
  );
};

export default ScrollProgress;