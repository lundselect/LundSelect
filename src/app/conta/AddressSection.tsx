'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'

interface Address {
  id: string
  label: string
  cep: string
  logradouro: string
  numero: string
  complemento: string
  bairro: string
  cidade: string
  estado: string
  is_default: boolean
}

const emptyForm = {
  label: 'Casa',
  cep: '',
  logradouro: '',
  numero: '',
  complemento: '',
  bairro: '',
  cidade: '',
  estado: '',
  is_default: false,
}

export default function AddressSection() {
  const { user } = useAuth()
  const [addresses, setAddresses] = useState<Address[]>([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [cepLoading, setCepLoading] = useState(false)
  const [cepError, setCepError] = useState('')
  const [saving, setSaving] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  useEffect(() => {
    if (user) loadAddresses()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  async function loadAddresses() {
    const { data } = await supabase
      .from('addresses')
      .select('*')
      .eq('user_id', user!.id)
      .order('is_default', { ascending: false })
    setAddresses(data || [])
  }

  async function lookupCep(cep: string) {
    const clean = cep.replace(/\D/g, '')
    if (clean.length !== 8) return
    setCepLoading(true)
    setCepError('')
    try {
      const res = await fetch(`https://viacep.com.br/ws/${clean}/json/`)
      const data = await res.json()
      if (data.erro) {
        setCepError('CEP não encontrado.')
      } else {
        setForm((prev) => ({
          ...prev,
          logradouro: data.logradouro || '',
          bairro: data.bairro || '',
          cidade: data.localidade || '',
          estado: data.uf || '',
        }))
      }
    } catch {
      setCepError('Erro ao buscar CEP.')
    } finally {
      setCepLoading(false)
    }
  }

  function handleCepChange(value: string) {
    const clean = value.replace(/\D/g, '').slice(0, 8)
    const formatted = clean.length > 5 ? `${clean.slice(0, 5)}-${clean.slice(5)}` : clean
    setForm((prev) => ({ ...prev, cep: formatted }))
    if (clean.length === 8) lookupCep(clean)
  }

  function openAdd() {
    setForm(emptyForm)
    setEditingId(null)
    setCepError('')
    setShowForm(true)
  }

  function openEdit(address: Address) {
    setForm({
      label: address.label,
      cep: address.cep,
      logradouro: address.logradouro,
      numero: address.numero,
      complemento: address.complemento || '',
      bairro: address.bairro,
      cidade: address.cidade,
      estado: address.estado,
      is_default: address.is_default,
    })
    setEditingId(address.id)
    setCepError('')
    setShowForm(true)
  }

  async function handleSave() {
    if (!form.cep || !form.logradouro || !form.numero || !form.cidade) return
    setSaving(true)

    if (form.is_default) {
      await supabase
        .from('addresses')
        .update({ is_default: false })
        .eq('user_id', user!.id)
    }

    if (editingId) {
      await supabase
        .from('addresses')
        .update({ ...form, cep: form.cep.replace(/\D/g, '') })
        .eq('id', editingId)
    } else {
      await supabase
        .from('addresses')
        .insert({ ...form, cep: form.cep.replace(/\D/g, ''), user_id: user!.id })
    }

    await loadAddresses()
    setShowForm(false)
    setSaving(false)
  }

  async function handleDelete(id: string) {
    await supabase.from('addresses').delete().eq('id', id)
    setAddresses((prev) => prev.filter((a) => a.id !== id))
  }

  async function setDefault(id: string) {
    await supabase.from('addresses').update({ is_default: false }).eq('user_id', user!.id)
    await supabase.from('addresses').update({ is_default: true }).eq('id', id)
    await loadAddresses()
  }

  const inputClass = 'w-full bg-offwhite/5 border border-gold/20 text-offwhite placeholder-offwhite/20 px-4 py-3 text-sm focus:outline-none focus:border-gold/60 transition-colors'
  const labelClass = 'block text-offwhite/40 text-xs tracking-widest uppercase mb-2'

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-offwhite text-lg font-light">Endereços</h2>
        {!showForm && (
          <button
            onClick={openAdd}
            className="text-gold text-xs tracking-widest uppercase border border-gold/30 px-4 py-2 hover:border-gold transition-colors"
          >
            + Adicionar
          </button>
        )}
      </div>

      {/* Address list */}
      {!showForm && (
        <div className="space-y-3">
          {addresses.length === 0 && (
            <div className="border border-dashed border-gold/20 p-8 text-center">
              <p className="text-offwhite/30 text-sm mb-4">Nenhum endereço cadastrado</p>
              <button
                onClick={openAdd}
                className="text-gold text-xs tracking-widest uppercase border border-gold/30 px-6 py-2 hover:border-gold transition-colors"
              >
                Adicionar endereço
              </button>
            </div>
          )}
          {addresses.map((address) => (
            <div key={address.id} className="border border-gold/10 p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-offwhite text-sm font-medium">{address.label}</span>
                    {address.is_default && (
                      <span className="text-[9px] tracking-widest uppercase bg-gold text-primary px-2 py-0.5">
                        Padrão
                      </span>
                    )}
                  </div>
                  <p className="text-offwhite/50 text-sm">
                    {address.logradouro}, {address.numero}
                    {address.complemento && `, ${address.complemento}`}
                  </p>
                  <p className="text-offwhite/50 text-sm">
                    {address.bairro} — {address.cidade}, {address.estado}
                  </p>
                  <p className="text-offwhite/30 text-xs mt-1">CEP {address.cep.replace(/^(\d{5})(\d{3})$/, '$1-$2')}</p>
                </div>
                <div className="flex flex-col gap-2 items-end">
                  <button
                    onClick={() => openEdit(address)}
                    className="text-offwhite/40 hover:text-gold text-xs tracking-widest uppercase transition-colors"
                  >
                    Editar
                  </button>
                  {!address.is_default && (
                    <button
                      onClick={() => setDefault(address.id)}
                      className="text-offwhite/40 hover:text-gold text-xs tracking-widest uppercase transition-colors"
                    >
                      Definir padrão
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(address.id)}
                    className="text-offwhite/40 hover:text-red-400 text-xs tracking-widest uppercase transition-colors"
                  >
                    Remover
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Form */}
      {showForm && (
        <div className="space-y-4">
          {/* Label */}
          <div>
            <label className={labelClass}>Identificação</label>
            <div className="flex gap-2">
              {['Casa', 'Trabalho', 'Outro'].map((l) => (
                <button
                  key={l}
                  type="button"
                  onClick={() => setForm((prev) => ({ ...prev, label: l }))}
                  className={`px-4 py-2 text-xs tracking-widest uppercase border transition-colors ${
                    form.label === l
                      ? 'border-gold text-gold'
                      : 'border-gold/20 text-offwhite/40 hover:border-gold/40'
                  }`}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>

          {/* CEP */}
          <div>
            <label className={labelClass}>CEP</label>
            <div className="relative">
              <input
                value={form.cep}
                onChange={(e) => handleCepChange(e.target.value)}
                placeholder="00000-000"
                maxLength={9}
                className={inputClass}
              />
              {cepLoading && (
                <div className="absolute right-4 top-1/2 -translate-y-1/2 w-3 h-3 border border-gold border-t-transparent rounded-full animate-spin" />
              )}
            </div>
            {cepError && <p className="text-red-400 text-xs mt-1">{cepError}</p>}
          </div>

          {/* Logradouro + Número */}
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className={labelClass}>Rua / Logradouro</label>
              <input
                value={form.logradouro}
                onChange={(e) => setForm((prev) => ({ ...prev, logradouro: e.target.value }))}
                placeholder="Rua, Avenida..."
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Número</label>
              <input
                value={form.numero}
                onChange={(e) => setForm((prev) => ({ ...prev, numero: e.target.value }))}
                placeholder="123"
                className={inputClass}
              />
            </div>
          </div>

          {/* Complemento */}
          <div>
            <label className={labelClass}>Complemento <span className="normal-case text-offwhite/20">(opcional)</span></label>
            <input
              value={form.complemento}
              onChange={(e) => setForm((prev) => ({ ...prev, complemento: e.target.value }))}
              placeholder="Apto, bloco, sala..."
              className={inputClass}
            />
          </div>

          {/* Bairro */}
          <div>
            <label className={labelClass}>Bairro</label>
            <input
              value={form.bairro}
              onChange={(e) => setForm((prev) => ({ ...prev, bairro: e.target.value }))}
              placeholder="Bairro"
              className={inputClass}
            />
          </div>

          {/* Cidade + Estado */}
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className={labelClass}>Cidade</label>
              <input
                value={form.cidade}
                readOnly
                className={`${inputClass} opacity-50 cursor-not-allowed`}
              />
            </div>
            <div>
              <label className={labelClass}>Estado</label>
              <input
                value={form.estado}
                readOnly
                className={`${inputClass} opacity-50 cursor-not-allowed`}
              />
            </div>
          </div>

          {/* Default */}
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={form.is_default}
              onChange={(e) => setForm((prev) => ({ ...prev, is_default: e.target.checked }))}
              className="accent-gold"
            />
            <span className="text-offwhite/60 text-sm">Definir como endereço padrão</span>
          </label>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={handleSave}
              disabled={saving || !form.logradouro || !form.numero || !form.cidade}
              className="bg-gold text-primary px-8 py-3 text-xs tracking-[0.2em] uppercase hover:bg-gold/90 transition-colors disabled:opacity-50"
            >
              {saving ? 'Salvando...' : 'Salvar endereço'}
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="text-offwhite/40 hover:text-offwhite text-xs tracking-widest uppercase transition-colors px-4"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
