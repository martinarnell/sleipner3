'use client';

import { motion } from 'framer-motion';
import React from 'react';

interface AnimateOnScrollProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}

export const AnimateOnScroll = ({ children, className, delay = 0 }: AnimateOnScrollProps) => {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.5, delay }}
    >
      {children}
    </motion.div>
  );
}; 