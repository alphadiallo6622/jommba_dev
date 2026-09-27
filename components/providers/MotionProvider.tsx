'use client'

import { MotionConfig } from 'framer-motion'

// Respecte prefers-reduced-motion pour toutes les animations Framer Motion
// (modales, drawers, accordéons…) : transforms coupés, fondus conservés.
export default function MotionProvider({ children }: { children: React.ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>
}
