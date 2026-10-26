import React from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

// --- Reusable Motion Components ---
// Goal: Subtle, fast, purpose-driven, consistent

const TRANSITION_SPRING = { type: 'spring', stiffness: 400, damping: 30 };
const TRANSITION_SMOOTH = { duration: 0.3, ease: 'easeOut' };

export const FadeUp = ({ children, delay = 0, className = '', style = {}, threshold = 0.1 }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: threshold }}
      transition={{ ...TRANSITION_SMOOTH, delay }}
      className={className}
      style={style}
    >
      {children}
    </motion.div>
  );
};

export const FadeScaleIn = ({ children, delay = 0, className = '', style = {} }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut', delay }}
      className={className}
      style={style}
    >
      {children}
    </motion.div>
  );
};

export const ParallaxHero = ({ children, offset = 50, className = '', style = {} }) => {
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 1000], [0, offset]);

  return (
    <motion.div style={{ y, ...style }} className={className}>
      {children}
    </motion.div>
  );
};

export const FloatMotion = ({ children, className = '', style = {} }) => {
  return (
    <motion.div
      animate={{ y: [0, -6, 0] }}
      transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
      className={className}
      style={style}
    >
      {children}
    </motion.div>
  );
};

export const HoverCard = ({ children, className = '', style = {}, onClick }) => {
  return (
    <motion.div
      whileHover={{ y: -4, boxShadow: '0 12px 24px rgba(0,0,0,0.08)' }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      whileTap={{ scale: 0.98 }}
      className={className}
      style={{ ...style, transition: 'border-color 0.2s', cursor: onClick ? 'pointer' : 'default' }}
      onClick={onClick}
    >
      {children}
    </motion.div>
  );
};

export const ScaleButton = ({ children, className = '', style = {}, onClick, onMouseOver, onMouseOut, disabled = false }) => {
  return (
    <motion.button
      whileHover={!disabled ? { scale: 1.03, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' } : {}}
      whileTap={!disabled ? { scale: 0.97 } : {}}
      transition={TRANSITION_SPRING}
      className={className}
      style={style}
      onClick={onClick}
      onMouseOver={onMouseOver}
      onMouseOut={onMouseOut}
      disabled={disabled}
    >
      {children}
    </motion.button>
  );
};

export const AnimatedUnderlineLink = ({ children, href, style = {}, onMouseOver, onMouseOut, isActive }) => {
  return (
    <motion.a
      href={href}
      style={{
        textDecoration: 'none',
        position: 'relative',
        display: 'inline-block',
        ...style
      }}
      onMouseOver={onMouseOver}
      onMouseOut={onMouseOut}
      initial="initial"
      whileHover="hover"
      animate={isActive ? "hover" : "initial"}
    >
      {children}
      <motion.span
        style={{
          position: 'absolute',
          bottom: -2,
          left: 0,
          height: 2,
          backgroundColor: 'currentColor',
          originX: 0
        }}
        variants={{
          initial: { width: 0 },
          hover: { width: '100%' }
        }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
      />
    </motion.a>
  );
};
