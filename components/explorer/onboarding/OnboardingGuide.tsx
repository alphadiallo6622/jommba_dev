'use client'

import { useState, useEffect } from 'react'
import { TOUR_STEPS, TOUR_STORAGE_KEY } from './steps'
import TourModal from './TourModal'
import { useExplorerStore } from '@/store/explorer.store'

export default function OnboardingGuide() {
  const [tourDone, setTourDone] = useState(true) // true by default to avoid SSR flash
  const [stepIndex, setStepIndex] = useState(0)
  const setTourHighlight = useExplorerStore(s => s.setTourHighlight)

  useEffect(() => {
    const done = localStorage.getItem(TOUR_STORAGE_KEY) === 'true'
    setTourDone(done)
    if (!done) {
      setTourHighlight(TOUR_STEPS[0].highlight)
    }
  }, [setTourHighlight])

  const handleNext = () => {
    const nextIndex = stepIndex + 1
    if (nextIndex >= TOUR_STEPS.length) {
      localStorage.setItem(TOUR_STORAGE_KEY, 'true')
      setTourHighlight('none')
      setTourDone(true)
    } else {
      setStepIndex(nextIndex)
      setTourHighlight(TOUR_STEPS[nextIndex].highlight)
    }
  }

  if (tourDone) return null

  return (
    <TourModal
      step={TOUR_STEPS[stepIndex]}
      stepIndex={stepIndex}
      totalSteps={TOUR_STEPS.length}
      onNext={handleNext}
    />
  )
}
