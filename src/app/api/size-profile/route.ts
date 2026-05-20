import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { SizeProfile } from '@/lib/size-guide/types'
import { CONSENT_VERSION } from '@/lib/size-guide/storage'

function createClient() {
  const cookieStore = cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (toSet) => toSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options)),
      },
    }
  )
}

export async function GET() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data, error } = await supabase
    .from('size_profiles')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (error || !data) return NextResponse.json(null)

  const profile: SizeProfile = {
    userId:              user.id,
    measurements:        data.measurements         ?? undefined,
    shapeAnswers:        data.shape_answers         ?? undefined,
    fitPreferences:      data.fit_preferences       ?? undefined,
    trueSizeByCategory:  data.true_size_by_category ?? undefined,
    cutSystemFit:        data.cut_system_fit        ?? undefined,
    confidence:          data.confidence            ?? 'low',
    consentVersion:      data.consent_version       ?? CONSENT_VERSION,
    updatedAt:           data.updated_at,
  }

  return NextResponse.json(profile)
}

export async function PUT(request: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()

  // Reject any payload that contains image/binary fields
  const forbidden = ['photo', 'image', 'imageData', 'base64', 'frameData', 'video', 'blob']
  for (const key of forbidden) {
    if (key in body) {
      return NextResponse.json({ error: 'Payload contains forbidden field: ' + key }, { status: 400 })
    }
  }

  const { error } = await supabase
    .from('size_profiles')
    .upsert(
      {
        user_id:               user.id,
        measurements:          body.measurements         ?? null,
        shape_answers:         body.shapeAnswers         ?? null,
        fit_preferences:       body.fitPreferences       ?? null,
        true_size_by_category: body.trueSizeByCategory   ?? null,
        cut_system_fit:        body.cutSystemFit         ?? null,
        confidence:            body.confidence           ?? 'low',
        consent_version:       body.consentVersion       ?? CONSENT_VERSION,
        updated_at:            new Date().toISOString(),
      },
      { onConflict: 'user_id' }
    )

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}

export async function DELETE() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { error } = await supabase
    .from('size_profiles')
    .delete()
    .eq('user_id', user.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
