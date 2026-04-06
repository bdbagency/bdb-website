"use client";

import { useRef } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";

/* ── Animation constants ─────────────────────────────── */
const WORD_SLIDE_DISTANCE_PX = 20;
const WORD_DURATION_S = 0.5;
const DEFAULT_STAGGER_DELAY_S = 0.03;
const VIEWPORT_THRESHOLD = 0.3;
const REDUCED_MOTION_DURATION_S = 0.2;

/* ── Types ───────────────────────────────────────────── */
interface ScrollTextRevealProps {
  text: string;
  className?: string;
  staggerDelay?: number;
  tag?: "p" | "h1" | "h2" | "h3";
}

/* ── Component ───────────────────────────────────────── */
export default function ScrollTextReveal({
  text,
  className = "",
  staggerDelay = DEFAULT_STAGGER_DELAY_S,
  tag: Tag = "p",
}: ScrollTextRevealProps) {
  const ref = useRef<HTMLElement>(null);
  const shouldReduceMotion = useReducedMotion();

  const isInView = useInView(ref as React.RefObject<Element>, {
    once: true,
    amount: VIEWPORT_THRESHOLD,
  });

  const words = text.split(" ");

  return (
    <Tag ref={ref as React.RefObject<any>} className={className}>
      {words.map((word, index) => (
        <motion.span
          key={`${word}-${index}`}
          className="inline-block mr-[0.25em]"
          initial={{
            opacity: 0,
            y: shouldReduceMotion ? 0 : WORD_SLIDE_DISTANCE_PX,
          }}
          animate={
            isInView
              ? { opacity: 1, y: 0 }
              : {
                  opacity: 0,
                  y: shouldReduceMotion ? 0 : WORD_SLIDE_DISTANCE_PX,
                }
          }
          transition={{
            duration: shouldReduceMotion
              ? REDUCED_MOTION_DURATION_S
              : WORD_DURATION_S,
            ease: "easeOut",
            delay: index * staggerDelay,
          }}
        >
          {word}
        </motion.span>
      ))}
    </Tag>
  );
}
