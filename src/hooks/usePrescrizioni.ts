'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'

// Tipo prescrizione con struttura L/P/I/V
export interface PrescrizioneRiga {
  od_sph: number | null
  od_cyl: number | null
  od_ax: number | null
  od_add?: number | null
  os_sph: number | null
  os_cyl: number | null
  os_ax: number | null
  os_add?: number | null
}

export interface Prescrizione {
  id: string
  cliente_id: string
  store_id: string
  data_prescrizione: string
  prescrittore: string | null
  lontano: PrescrizioneRiga
  permanente: PrescrizioneRiga
  intermedio: PrescrizioneRiga
  vicino: PrescrizioneRiga
  dip_lontano: number | null
  dip_vicino: number | null
  dip_od: number | null
  dip_os: number | null
  altezza_od: number | null
  altezza_os: number | null
  note: string | null
  created_at: string
  updated_at: string
}

// Funzione per convertire da DB flat a struttura nested
function dbToPrescrizione(row: any): Prescrizione {
  return {
    id: row.id,
    cliente_id: row.cliente_id,
    store_id: row.store_id,
    data_prescrizione: row.data_prescrizione,
    prescrittore: row.prescrittore,
    lontano: {
      od_sph: row.l_od_sph,
      od_cyl: row.l_od_cyl,
      od_ax: row.l_od_ax,
      os_sph: row.l_os_sph,
      os_cyl: row.l_os_cyl,
      os_ax: row.l_os_ax,
    },
    permanente: {
      od_sph: row.p_od_sph,
      od_cyl: row.p_od_cyl,
      od_ax: row.p_od_ax,
      os_sph: row.p_os_sph,
      os_cyl: row.p_os_cyl,
      os_ax: row.p_os_ax,
    },
    intermedio: {
      od_sph: row.i_od_sph,
      od_cyl: row.i_od_cyl,
      od_ax: row.i_od_ax,
      od_add: row.i_od_add,
      os_sph: row.i_os_sph,
      os_cyl: row.i_os_cyl,
      os_ax: row.i_os_ax,
      os_add: row.i_os_add,
    },
    vicino: {
      od_sph: row.v_od_sph,
      od_cyl: row.v_od_cyl,
      od_ax: row.v_od_ax,
      od_add: row.v_od_add,
      os_sph: row.v_os_sph,
      os_cyl: row.v_os_cyl,
      os_ax: row.v_os_ax,
      os_add: row.v_os_add,
    },
    dip_lontano: row.dip_lontano,
    dip_vicino: row.dip_vicino,
    dip_od: row.dip_od,
    dip_os: row.dip_os,
    altezza_od: row.altezza_od,
    altezza_os: row.altezza_os,
    note: row.note,
    created_at: row.created_at,
    updated_at: row.updated_at,
  }
}

// Funzione per convertire da struttura nested a DB flat
function prescrizioneToDb(rx: Partial<Prescrizione>): any {
  const db: any = {}

  if (rx.cliente_id) db.cliente_id = rx.cliente_id
  if (rx.store_id) db.store_id = rx.store_id
  if (rx.data_prescrizione) db.data_prescrizione = rx.data_prescrizione
  if (rx.prescrittore !== undefined) db.prescrittore = rx.prescrittore
  if (rx.note !== undefined) db.note = rx.note

  // Lontano
  if (rx.lontano) {
    db.l_od_sph = rx.lontano.od_sph
    db.l_od_cyl = rx.lontano.od_cyl
    db.l_od_ax = rx.lontano.od_ax
    db.l_os_sph = rx.lontano.os_sph
    db.l_os_cyl = rx.lontano.os_cyl
    db.l_os_ax = rx.lontano.os_ax
  }

  // Permanente
  if (rx.permanente) {
    db.p_od_sph = rx.permanente.od_sph
    db.p_od_cyl = rx.permanente.od_cyl
    db.p_od_ax = rx.permanente.od_ax
    db.p_os_sph = rx.permanente.os_sph
    db.p_os_cyl = rx.permanente.os_cyl
    db.p_os_ax = rx.permanente.os_ax
  }

  // Intermedio
  if (rx.intermedio) {
    db.i_od_sph = rx.intermedio.od_sph
    db.i_od_cyl = rx.intermedio.od_cyl
    db.i_od_ax = rx.intermedio.od_ax
    db.i_od_add = rx.intermedio.od_add
    db.i_os_sph = rx.intermedio.os_sph
    db.i_os_cyl = rx.intermedio.os_cyl
    db.i_os_ax = rx.intermedio.os_ax
    db.i_os_add = rx.intermedio.os_add
  }

  // Vicino
  if (rx.vicino) {
    db.v_od_sph = rx.vicino.od_sph
    db.v_od_cyl = rx.vicino.od_cyl
    db.v_od_ax = rx.vicino.od_ax
    db.v_od_add = rx.vicino.od_add
    db.v_os_sph = rx.vicino.os_sph
    db.v_os_cyl = rx.vicino.os_cyl
    db.v_os_ax = rx.vicino.os_ax
    db.v_os_add = rx.vicino.os_add
  }

  // DIP e altezze
  if (rx.dip_lontano !== undefined) db.dip_lontano = rx.dip_lontano
  if (rx.dip_vicino !== undefined) db.dip_vicino = rx.dip_vicino
  if (rx.dip_od !== undefined) db.dip_od = rx.dip_od
  if (rx.dip_os !== undefined) db.dip_os = rx.dip_os
  if (rx.altezza_od !== undefined) db.altezza_od = rx.altezza_od
  if (rx.altezza_os !== undefined) db.altezza_os = rx.altezza_os

  return db
}

export function usePrescrizioni(clienteId?: string) {
  const [prescrizioni, setPrescrizioni] = useState<Prescrizione[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchPrescrizioni = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      let query = supabase
        .from('prescrizioni')
        .select('*')
        .order('data_prescrizione', { ascending: false })

      if (clienteId) {
        query = query.eq('cliente_id', clienteId)
      }

      const { data, error: fetchError } = await query

      if (fetchError) throw fetchError
      setPrescrizioni((data || []).map(dbToPrescrizione))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore nel caricamento prescrizioni')
      console.error('Errore fetch prescrizioni:', err)
    } finally {
      setLoading(false)
    }
  }, [clienteId])

  useEffect(() => {
    fetchPrescrizioni()
  }, [fetchPrescrizioni])

  const createPrescrizione = async (rx: Partial<Prescrizione>) => {
    try {
      const dbData = prescrizioneToDb(rx)

      const { data, error: createError } = await supabase
        .from('prescrizioni')
        .insert([dbData])
        .select()
        .single()

      if (createError) throw createError

      const newRx = dbToPrescrizione(data)
      setPrescrizioni(prev => [newRx, ...prev])
      return { data: newRx, error: null }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Errore nella creazione prescrizione'
      return { data: null, error: errorMsg }
    }
  }

  const updatePrescrizione = async (id: string, updates: Partial<Prescrizione>) => {
    try {
      const dbData = prescrizioneToDb(updates)

      const { data, error: updateError } = await supabase
        .from('prescrizioni')
        .update(dbData)
        .eq('id', id)
        .select()
        .single()

      if (updateError) throw updateError

      const updatedRx = dbToPrescrizione(data)
      setPrescrizioni(prev => prev.map(rx => rx.id === id ? updatedRx : rx))
      return { data: updatedRx, error: null }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Errore nell\'aggiornamento prescrizione'
      return { data: null, error: errorMsg }
    }
  }

  const deletePrescrizione = async (id: string) => {
    try {
      const { error: deleteError } = await supabase
        .from('prescrizioni')
        .delete()
        .eq('id', id)

      if (deleteError) throw deleteError

      setPrescrizioni(prev => prev.filter(rx => rx.id !== id))
      return { error: null }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Errore nell\'eliminazione prescrizione'
      return { error: errorMsg }
    }
  }

  return {
    prescrizioni,
    loading,
    error,
    refresh: fetchPrescrizioni,
    createPrescrizione,
    updatePrescrizione,
    deletePrescrizione,
  }
}
