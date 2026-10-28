import { motion, useReducedMotion } from "framer-motion";
import { useState, type ReactNode } from "react";

type HoverAnimationProps = {
  id: string;
  layoutId: string;
  children: ReactNode;
  className?: string;
  backgroundClassName?: string;
};

export function HoverAnimation({
  id,
  layoutId,
  children,
  className = "",
  backgroundClassName = "inset-0",
}: HoverAnimationProps) {
  const reduce = useReducedMotion();
  const [hovered, setHovered] = useState(false);

  if (reduce) {
    return (
      <span className={`relative rounded-lg hover:bg-hover ${className}`}>
        {children}
      </span>
    );
  }

  return (
    <motion.span
      id={id}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      className={`relative ${className}`}
    >
      {hovered ? (
        <motion.span
          layoutId={layoutId}
          className={`absolute -z-10 rounded-lg bg-hover ${backgroundClassName}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
        />
      ) : null}
      {children}
    </motion.span>
  );
}
