"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { RefreshCcw } from 'lucide-react';

interface PullToRefreshProps {
  onRefresh: () => Promise<void>;
  children: React.ReactNode;
}

export function PullToRefresh({ onRefresh, children }: PullToRefreshProps) {
  const [startY, setStartY] = useState(0);
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const controls = useAnimation();

  const handleTouchStart = (e: React.TouchEvent) => {
    if (window.scrollY === 0) {
      setStartY(e.touches[0].pageY);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (startY === 0 || isRefreshing) return;

    const currentY = e.touches[0].pageY;
    const distance = currentY - startY;

    if (distance > 0 && window.scrollY === 0) {
      // Apply resistance
      const pull = Math.min(distance * 0.4, 80);
      setPullDistance(pull);
    }
  };

  const handleTouchEnd = useCallback(async () => {
    if (pullDistance > 60 && !isRefreshing) {
      setIsRefreshing(true);
      setPullDistance(60);
      
      try {
        await onRefresh();
      } finally {
        setIsRefreshing(false);
        setPullDistance(0);
      }
    } else {
      setPullDistance(0);
    }
    setStartY(0);
  }, [pullDistance, isRefreshing, onRefresh]);

  return (
    <div 
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className="relative w-full h-full overflow-x-hidden"
    >
      <motion.div 
        animate={{ y: pullDistance }}
        transition={isRefreshing ? { duration: 0.2 } : { type: 'spring', damping: 20 }}
        className="w-full h-full"
      >
        <div 
          className="absolute left-0 right-0 flex justify-center items-center overflow-hidden"
          style={{ height: pullDistance, top: -pullDistance }}
        >
          <motion.div
            animate={{ rotate: isRefreshing ? 360 : pullDistance * 3 }}
            transition={isRefreshing ? { repeat: Infinity, duration: 1, ease: 'linear' } : {}}
            className="p-2 bg-white rounded-full shadow-lg border border-slate-100"
          >
            <RefreshCcw className="w-4 h-4 text-blue-600" />
          </motion.div>
        </div>
        {children}
      </motion.div>
    </div>
  );
}
