'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { SizeProfile } from '@/lib/size-guide/types'
import { getUserProfile, deleteUserProfile } from '@/lib/size-guide/storage'
import ConfidenceBadge from '@/components/size-guide/ConfidenceBadge'

function ProfileSection({ profile, onDelete }: { profile: SizeProfile; onDelete: () => void }) {
  const [confirmDelete, setConfirmDelete] = useState(false)
  const ts = profile.trueSizeByCategory
  const m = profile.measurements
  const updatedAt = profile.updatedAt
    ? new Date(profile.updatedAt).toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })
    : null

  return (
    <div className="space-y-6">
      {/* Confidence */}
      <div className="flex items-center justify-between">
        <ConfidenceBadge confidence={profile.confidence} />
        {updatedAt && (
          <p className="text-offwhite/25 text-xs">Atualizado em {updatedAt}</p>
        )}
      </div>

      {/* True sizes */}
      {ts && Object.values(ts).some(Boolean) && (
        <div className="border border-gold/10 p-5 space-y-3">
          <p className="text-offwhite/40 text-xs tracking-widest uppercase mb-2">Seus tamanhos base</p>
          {ts.tops && (
            <div className="flex justify-between text-sm border-b border-gold/5 pb-2">
              <span className="text-offwhite/50">Blusas e tops</span>
              <span className="text-gold tracking-widest font-light">{ts.tops}</span>
            </div>
          )}
          {ts.bottoms && (
            <div className="flex justify-between text-sm border-b border-gold/5 pb-2">
              <span className="text-offwhite/50">Calças e shorts</span>
              <span className="text-gold tracking-widest font-light">{ts.bottoms}</span>
            </div>
          )}
          {ts.dresses && (
            <div className="flex justify-between text-sm border-b border-gold/5 pb-2">
              <span className="text-offwhite/50">Vestidos</span>
              <span className="text-gold tracking-widest font-light">{ts.dresses}</span>
            </div>
          )}
          {ts.outerwear && (
            <div className="flex justify-between text-sm">
              <span className="text-offwhite/50">Casacos e jaquetas</span>
              <span className="text-gold tracking-widest font-light">{ts.outerwear}</span>
            </div>
          )}
        </div>
      )}

      {/* Measurements */}
      {m && (
        <div className="border border-gold/10 p-5 space-y-3">
          <p className="text-offwhite/40 text-xs tracking-widest uppercase mb-2">Medidas salvas</p>
          {m.bust_cm    && <div className="flex justify-between text-sm"><span className="text-offwhite/50">Busto</span>  <span className="text-offwhite/70">{m.bust_cm} cm</span></div>}
          {m.waist_cm   && <div className="flex justify-between text-sm"><span className="text-offwhite/50">Cintura</span><span className="text-offwhite/70">{m.waist_cm} cm</span></div>}
          {m.hip_cm     && <div className="flex justify-between text-sm"><span className="text-offwhite/50">Quadril</span><span className="text-offwhite/70">{m.hip_cm} cm</span></div>}
          {m.height_cm  && <div className="flex justify-between text-sm"><span className="text-offwhite/50">Altura</span> <span className="text-offwhite/70">{m.height_cm} cm</span></div>}
          {m.inseam_cm  && <div className="flex justify-between text-sm"><span className="text-offwhite/50">Entrepernas</span><span className="text-offwhite/70">{m.inseam_cm} cm</span></div>}
        </div>
      )}

      {/* Fit preferences */}
      {profile.fitPreferences && Object.values(profile.fitPreferences).some(Boolean) && (
        <div className="border border-gold/10 p-5 space-y-3">
          <p className="text-offwhite/40 text-xs tracking-widest uppercase mb-2">Preferências de caimento</p>
          {(Object.entries(profile.fitPreferences) as [string, string][]).map(([cat, pref]) => {
            const labels: Record<string, string> = { tops: 'Blusas', bottoms: 'Calças', dresses: 'Vestidos', outerwear: 'Casacos' }
            const prefLabels: Record<string, string> = { very_fitted: 'Muito justo', fitted: 'Justo', regular: 'Regular', relaxed: 'Solto', oversized: 'Oversized' }
            return pref ? (
              <div key={cat} className="flex justify-between text-sm">
                <span className="text-offwhite/50">{labels[cat] ?? cat}</span>
                <span className="text-offwhite/70">{prefLabels[pref] ?? pref}</span>
              </div>
            ) : null
          })}
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3 pt-2">
        <Link
          href="/conta/tamanhos/criar"
          className="flex-1 text-center border border-gold/30 text-gold py-3 text-xs tracking-widest uppercase hover:bg-gold hover:text-primary transition-colors"
        >
          Atualizar perfil
        </Link>

        {!confirmDelete ? (
          <button
            onClick={() => setConfirmDelete(true)}
            className="flex-1 border border-red-500/20 text-red-400/60 py-3 text-xs tracking-widest uppercase hover:border-red-500/40 hover:text-red-400 transition-colors"
          >
            Excluir perfil
          </button>
        ) : (
          <div className="flex-1 flex gap-2">
            <button
              onClick={onDelete}
              className="flex-1 bg-red-500/10 border border-red-500/30 text-red-400 py-3 text-xs tracking-widest uppercase hover:bg-red-500/20 transition-colors"
            >
              Confirmar exclusão
            </button>
            <button
              onClick={() => setConfirmDelete(false)}
              className="px-4 border border-gold/20 text-offwhite/40 py-3 text-xs hover:text-offwhite transition-colors"
            >
              Cancelar
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default function TamanhosPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [profile, setProfile] = useState<SizeProfile | null | undefined>(undefined)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    if (!isLoading && !user) router.push('/login')
  }, [user, isLoading, router])

  useEffect(() => {
    if (!user) return
    getUserProfile(user.id).then(setProfile)
  }, [user])

  const handleDelete = async () => {
    if (!user) return
    setDeleting(true)
    await deleteUserProfile(user.id)
    setProfile(null)
    setDeleting(false)
  }

  if (isLoading || profile === undefined) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-4 h-4 border border-gold border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <Link href="/conta" className="text-offwhite/30 text-xs hover:text-offwhite transition-colors">← Minha conta</Link>
        <p className="text-gold/60 text-xs tracking-[0.3em] uppercase mt-4 mb-2">Minha conta</p>
        <h1 className="text-offwhite text-3xl font-light">Meus tamanhos</h1>
        <p className="text-offwhite/40 text-sm mt-2">
          Seu perfil personalizado de tamanhos. Quanto mais completo, mais precisas as recomendações.
        </p>
      </div>

      {deleting && (
        <div className="flex justify-center py-12">
          <div className="w-4 h-4 border border-gold border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {!deleting && profile && (
        <ProfileSection profile={profile} onDelete={handleDelete} />
      )}

      {!deleting && !profile && (
        <div className="border border-dashed border-gold/20 p-10 text-center space-y-5">
          <div className="w-12 h-12 border border-gold/20 rounded-full flex items-center justify-center mx-auto">
            <svg className="w-5 h-5 text-gold/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
            </svg>
          </div>
          <div>
            <p className="text-offwhite font-light mb-1">Nenhum perfil criado ainda</p>
            <p className="text-offwhite/30 text-sm leading-relaxed">
              Crie seu perfil de tamanhos para receber recomendações personalizadas em cada produto.
            </p>
          </div>
          <Link
            href="/conta/tamanhos/criar"
            className="inline-block bg-gold text-primary px-8 py-3 text-xs tracking-[0.2em] uppercase hover:bg-gold/90 transition-colors"
          >
            Criar meu perfil
          </Link>
        </div>
      )}
    </div>
  )
}
