import { TourStep } from './steps'

type Props = {
  step: TourStep
  stepIndex: number
  totalSteps: number
  onNext: () => void
}

export default function TourModal({ step, stepIndex, totalSteps, onNext }: Props) {
  return (
    <div
      className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center pb-8 sm:pb-0"
      style={{ background: 'rgba(0,0,0,0.55)' }}
    >
      <div className="bg-white rounded-2xl p-8 w-[320px] shadow-2xl text-center space-y-5 mx-4">
        {/* Step dots */}
        <div className="flex items-center justify-center gap-1.5">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div
              key={i}
              className="rounded-full transition-all"
              style={{
                width: i === stepIndex ? 20 : 6,
                height: 6,
                background: i === stepIndex ? '#10B981' : '#D1FAE5',
              }}
            />
          ))}
        </div>

        <div className="space-y-2">
          <h2 className="text-xl font-bold text-gray-900">{step.title}</h2>
          <p className="text-gray-500 text-sm leading-relaxed">{step.body}</p>
        </div>

        <button
          onClick={onNext}
          className="w-full py-3 rounded-xl font-semibold text-sm text-white transition-opacity hover:opacity-90"
          style={{ background: step.buttonVariant === 'amber' ? '#D97706' : '#10B981' }}
        >
          {step.buttonLabel}
        </button>
      </div>
    </div>
  )
}
