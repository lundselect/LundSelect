import { SizeProfile } from './types'
import { supabase } from '@/lib/supabase'

const STORAGE_KEY = 'lund_size_profile'
export const CONSENT_VERSION = '1.0'

// ─── Guest (localStorage) ──────────────────────────────────────────────────

export function getGuestProfile(): SizeProfile | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as SizeProfile) : null
  } catch {
    return null
  }
}

export function saveGuestProfile(profile: SizeProfile): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(profile))
}

export function clearGuestProfile(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(STORAGE_KEY)
}

// ─── Authenticated user (Supabase) ─────────────────────────────────────────

export async function getUserProfile(userId: string): Promise<SizeProfile | null> {
  const { data, error } = await supabase
    .from('size_profiles')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (error || !data) return null

  return {
    userId,
    measurements:        data.measurements      ?? undefined,
    shapeAnswers:        data.shape_answers      ?? undefined,
    fitPreferences:      data.fit_preferences    ?? undefined,
    trueSizeByCategory:  data.true_size_by_category ?? undefined,
    cutSystemFit:        data.cut_system_fit     ?? undefined,
    confidence:          data.confidence         ?? 'low',
    consentVersion:      data.consent_version    ?? CONSENT_VERSION,
    updatedAt:           data.updated_at,
  }
}

export async function saveUserProfile(
  userId: string,
  profile: Omit<SizeProfile, 'userId'>
): Promise<boolean> {
  const { error } = await supabase
    .from('size_profiles')
    .upsert(
      {
        user_id:              userId,
        measurements:         profile.measurements         ?? null,
        shape_answers:        profile.shapeAnswers         ?? null,
        fit_preferences:      profile.fitPreferences       ?? null,
        true_size_by_category: profile.trueSizeByCategory ?? null,
        cut_system_fit:       profile.cutSystemFit         ?? null,
        confidence:           profile.confidence,
        consent_version:      profile.consentVersion,
        updated_at:           new Date().toISOString(),
      },
      { onConflict: 'user_id' }
    )

  return !error
}

export async function deleteUserProfile(userId: string): Promise<boolean> {
  const { error } = await supabase
    .from('size_profiles')
    .delete()
    .eq('user_id', userId)
  return !error
}

// ─── Unified loader (guest or user) ────────────────────────────────────────

export async function loadProfile(userId: string | null): Promise<SizeProfile | null> {
  if (userId) {
    const dbProfile = await getUserProfile(userId)
    if (dbProfile) return dbProfile
  }
  return getGuestProfile()
}
