const STEPS = ['Medidas', 'Questionário']

interface Props {
  currentStep: number // 1 or 2
  onSkip: () => void
}

export default function StepProgress({ currentStep, onSkip }: Props) {
  return (
    <div className="flex items-center justify-between mb-8">
      <div className="flex items-center gap-4">
        {STEPS.map((label, i) => {
          const stepNum = i + 1
          const done = stepNum < currentStep
          const active = stepNum === currentStep
          return (
            <div key={label} className="flex items-center gap-2">
              <span className={`w-6 h-6 rounded-full border flex items-center justify-center text-xs transition-colors ${
                done   ? 'bg-gold border-gold text-primary' :
                active ? 'border-gold text-gold' :
                         'border-gold/20 text-offwhite/25'
              }`}>
                {done ? '✓' : stepNum}
              </span>
              <span className={`text-xs tracking-wide hidden sm:block ${active ? 'text-offwhite/70' : done ? 'text-offwhite/40' : 'text-offwhite/20'}`}>
                {label}
              </span>
              {i < STEPS.length - 1 && (
                <span className="text-gold/20 mx-1 hidden sm:block">—</span>
              )}
            </div>
          )
        })}
      </div>
      <button
        onClick={onSkip}
        className="text-offwhite/30 text-xs tracking-widest uppercase hover:text-offwhite transition-colors"
      >
        Pular etapa
      </button>
    </div>
  )
}
