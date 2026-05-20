'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { FitPreferences, Measurements, ShapeAnswers, SizeProfile } from '@/lib/size-guide/types'
import { computeTrueSize } from '@/lib/size-guide/trueSize'
import { saveGuestProfile, saveUserProfile, CONSENT_VERSION } from '@/lib/size-guide/storage'
import StepProgress from './StepProgress'
import Step1Measurements from './Step1Measurements'
import Step2BodyScan from './Step2BodyScan'
import Step3Questionnaire from './Step3Questionnaire'
import FlowCompletion from './FlowCompletion'

type Step = 'measurements' | 'scan' | 'questionnaire' | 'done'

interface FlowState {
  measurements?: Partial<Measurements>
  shapeAnswers?: Partial<ShapeAnswers>
  fitPreferences?: Partial<FitPreferences>
  scanSizeHint?: string
}

function computeConfidence(state: FlowState) {
  const hasMeasurements = !!(
    state.measurements?.bust_cm ||
    state.measurements?.hip_cm
  )
  const hasQuestionnaire = !!(
    state.shapeAnswers && Object.values(state.shapeAnswers).some(Boolean)
  )
  const hasPrefs = !!(
    state.fitPreferences && Object.values(state.fitPreferences).some(Boolean)
  )

  if (hasMeasurements && (hasQuestionnaire || hasPrefs)) return 'high' as const
  if (hasMeasurements) return 'medium' as const
  if (hasQuestionnaire || hasPrefs) return 'low' as const
  return 'low' as const
}

export default function SizeGuideFlow() {
  const { user } = useAuth()
  const [step, setStep] = useState<Step>('measurements')
  const [state, setState] = useState<FlowState>({})
  const [savedProfile, setSavedProfile] = useState<SizeProfile | null>(null)
  const [saving, setSaving] = useState(false)

  const handleMeasurementsDone = (measurements: Partial<Measurements>) => {
    setState(s => ({ ...s, measurements }))
    setStep('scan')
  }

  const handleScanDone = (
    shapeAnswers: Partial<ShapeAnswers>,
    fitPreferences: Partial<FitPreferences>,
    sizeHint?: string
  ) => {
    setState(s => ({ ...s, shapeAnswers, fitPreferences, scanSizeHint: sizeHint }))
    setStep('questionnaire')
  }

  const handleQuestionnaireDone = async (
    shapeAnswers: Partial<ShapeAnswers>,
    fitPreferences: Partial<FitPreferences>
  ) => {
    const finalState = { ...state, shapeAnswers, fitPreferences }
    setState(finalState)
    await save(finalState)
  }

  const save = async (finalState: FlowState) => {
    setSaving(true)

    const fullMeasurements: Measurements | undefined = finalState.measurements?.bust_cm ||
      finalState.measurements?.hip_cm
      ? {
          ...(finalState.measurements as Partial<Measurements>),
          sources: ['manual'],
          lastUpdated: new Date().toISOString(),
        } as Measurements
      : undefined

    const trueSize = fullMeasurements
      ? computeTrueSize(fullMeasurements, finalState.shapeAnswers as ShapeAnswers)
      : undefined

    const confidence = computeConfidence(finalState)

    const profile: SizeProfile = {
      userId: user?.id ?? null,
      measurements: fullMeasurements,
      shapeAnswers: (finalState.shapeAnswers && Object.values(finalState.shapeAnswers).some(Boolean))
        ? finalState.shapeAnswers as ShapeAnswers
        : undefined,
      fitPreferences: (finalState.fitPreferences && Object.values(finalState.fitPreferences).some(Boolean))
        ? finalState.fitPreferences as FitPreferences
        : undefined,
      trueSizeByCategory: trueSize,
      confidence,
      consentVersion: CONSENT_VERSION,
      updatedAt: new Date().toISOString(),
    }

    if (user?.id) {
      await saveUserProfile(user.id, profile)
    } else {
      saveGuestProfile(profile)
    }

    setSaving(false)
    setSavedProfile(profile)
    setStep('done')
  }

  const currentStepNum = step === 'measurements' ? 1 : step === 'scan' ? 2 : 3

  if (step === 'done' && savedProfile) {
    return (
      <div className="max-w-lg mx-auto px-4 py-12">
        <FlowCompletion profile={savedProfile} />
      </div>
    )
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-12">
      <div className="mb-8">
        <p className="text-gold/60 text-xs tracking-[0.3em] uppercase mb-2">Meu perfil de tamanhos</p>
        <h1 className="text-offwhite text-2xl font-light">Criar perfil</h1>
      </div>

      <StepProgress
        currentStep={currentStepNum}
        onSkip={() => {
          if (step === 'measurements') setStep('scan')
          else if (step === 'scan') setStep('questionnaire')
          else save(state)
        }}
      />

      {saving && (
        <div className="flex items-center justify-center py-12">
          <div className="w-5 h-5 border border-gold border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {!saving && step === 'measurements' && (
        <Step1Measurements
          initial={state.measurements}
          onComplete={handleMeasurementsDone}
          onSkip={() => setStep('scan')}
        />
      )}

      {!saving && step === 'scan' && (
        <Step2BodyScan
          onComplete={handleScanDone}
          onSkip={() => setStep('questionnaire')}
        />
      )}

      {!saving && step === 'questionnaire' && (
        <Step3Questionnaire
          initialAnswers={state.shapeAnswers}
          initialPrefs={state.fitPreferences}
          onComplete={handleQuestionnaireDone}
          onSkip={() => save(state)}
        />
      )}
    </div>
  )
}
