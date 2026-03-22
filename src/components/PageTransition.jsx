import { motion } from 'framer-motion'

// Glitch variant — defines the animation states
const glitchVariants = {
  initial: {
    opacity: 0,
    clipPath: 'inset(50% 0% 50% 0%)',  // collapsed to a horizontal slice
    filter: 'hue-rotate(90deg) brightness(2)',
    x: 8,
  },
  animate: {
    opacity: 1,
    clipPath: 'inset(0% 0% 0% 0%)',    // expand to full page
    filter: 'hue-rotate(0deg) brightness(1)',
    x: 0,
    transition: {
      duration: 0.45,
      ease: [0.16, 1, 0.3, 1],
    },
  },
  exit: {
    opacity: 0,
    clipPath: 'inset(50% 0% 50% 0%)',  // collapse back to slice
    filter: 'hue-rotate(-90deg) brightness(2)',
    x: -8,
    transition: {
      duration: 0.3,
      ease: 'easeIn',
    },
  },
}

export default function PageTransition({ children }) {
  return (
    <motion.div
      className="page-transition"
      variants={glitchVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      {/* RGB split layers — pure CSS glitch on top of the real content */}
      <div className="glitch-layer glitch-r" aria-hidden="true" />
      <div className="glitch-layer glitch-b" aria-hidden="true" />

      {children}
    </motion.div>
  )
}