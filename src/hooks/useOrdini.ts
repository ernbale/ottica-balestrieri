'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import type { Ordine, StatoOrdine } from '@/types/database'

export function useOrdini() {
  const [ordini, setOrdini] = useState<Ordine[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchOrdini = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const { data, error: fetchError } = await supabase
        .from('ordini')
        .select(`
          *,
          cliente:clienti(id, nome, cognome, codice, telefono),
          montatura:prodotti(id, nome, marca, prezzo_vendita)
        `)
        .order('data_ordine', { ascending: false })

      if (fetchError) throw fetchError
      setOrdini(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore nel caricamento ordini')
      console.error('Errore fetch ordini:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchOrdini()
  }, [fetchOrdini])

  const createOrdine = async (ordine: Partial<Ordine>) => {
    try {
      // Genera numero ordine
      const { data: numeroData } = await supabase.rpc('generate_order_number')
      const numero = numeroData || `ORD-${Date.now()}`

      const { data, error: createError } = await supabase
        .from('ordini')
        .insert([{ ...ordine, numero }])
        .select()
        .single()

      if (createError) throw createError

      await fetchOrdini() // Refresh per avere le relations
      return { data, error: null }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Errore nella creazione ordine'
      return { data: null, error: errorMsg }
    }
  }

  const updateOrdine = async (id: string, updates: Partial<Ordine>) => {
    try {
      const { data, error: updateError } = await supabase
        .from('ordini')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (updateError) throw updateError

      await fetchOrdini()
      return { data, error: null }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Errore nell\'aggiornamento ordine'
      return { data: null, error: errorMsg }
    }
  }

  const updateStato = async (id: string, stato: StatoOrdine) => {
    return updateOrdine(id, { stato })
  }

  const deleteOrdine = async (id: string) => {
    try {
      const { error: deleteError } = await supabase
        .from('ordini')
        .delete()
        .eq('id', id)

      if (deleteError) throw deleteError

      setOrdini(prev => prev.filter(o => o.id !== id))
      return { error: null }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Errore nell\'eliminazione ordine'
      return { error: errorMsg }
    }
  }

  // Statistiche ordini
  const stats = {
    totali: ordini.length,
    nuovi: ordini.filter(o => o.stato === 'nuovo').length,
    inLavorazione: ordini.filter(o => o.stato === 'in_lavorazione').length,
    attesaLenti: ordini.filter(o => o.stato === 'attesa_lenti').length,
    pronti: ordini.filter(o => o.stato === 'pronto').length,
    consegnati: ordini.filter(o => o.stato === 'consegnato').length,
  }

  return {
    ordini,
    loading,
    error,
    stats,
    refresh: fetchOrdini,
    createOrdine,
    updateOrdine,
    updateStato,
    deleteOrdine,
  }
}
