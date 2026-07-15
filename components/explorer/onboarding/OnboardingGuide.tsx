'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { TOUR_STEPS, TOUR_STORAGE_KEY, type TourStep } from './steps'
import TourModal from './TourModal'
import { useExplorerStore } from '@/store/explorer.store'

export default function OnboardingGuide() {
  const t = useTranslations('dashboard.explorer.tour')
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

  const meta = TOUR_STEPS[stepIndex]
  const resolvedStep: TourStep = {
    ...meta,
    title:       t(`step${meta.id}Title`),
    body:        t(`step${meta.id}Body`),
    buttonLabel: t(`step${meta.id}Button`),
  }

  return (
    <TourModal
      step={resolvedStep}
      stepIndex={stepIndex}
      totalSteps={TOUR_STEPS.length}
      onNext={handleNext}
    />
  )
}
