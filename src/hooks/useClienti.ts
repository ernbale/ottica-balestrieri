'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import type { Cliente } from '@/types/database'

export function useClienti() {
  const [clienti, setClienti] = useState<Cliente[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchClienti = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const { data, error: fetchError } = await supabase
        .from('clienti')
        .select('*')
        .order('cognome', { ascending: true })

      if (fetchError) throw fetchError
      setClienti(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore nel caricamento clienti')
      console.error('Errore fetch clienti:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchClienti()
  }, [fetchClienti])

  const createCliente = async (cliente: Partial<Cliente>) => {
    try {
      // Genera codice cliente
      const { data: codeData } = await supabase.rpc('generate_client_code')
      const codice = codeData || `CLI-${Date.now()}`

      const { data, error: createError } = await supabase
        .from('clienti')
        .insert([{ ...cliente, codice }])
        .select()
        .single()

      if (createError) throw createError

      setClienti(prev => [...prev, data])
      return { data, error: null }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Errore nella creazione cliente'
      return { data: null, error: errorMsg }
    }
  }

  const updateCliente = async (id: string, updates: Partial<Cliente>) => {
    try {
      const { data, error: updateError } = await supabase
        .from('clienti')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (updateError) throw updateError

      setClienti(prev => prev.map(c => c.id === id ? data : c))
      return { data, error: null }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Errore nell\'aggiornamento cliente'
      return { data: null, error: errorMsg }
    }
  }

  const deleteCliente = async (id: string) => {
    try {
      const { error: deleteError } = await supabase
        .from('clienti')
        .delete()
        .eq('id', id)

      if (deleteError) throw deleteError

      setClienti(prev => prev.filter(c => c.id !== id))
      return { error: null }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Errore nell\'eliminazione cliente'
      return { error: errorMsg }
    }
  }

  const searchClienti = async (query: string) => {
    if (!query.trim()) {
      return clienti
    }

    const searchTerm = query.toLowerCase()
    return clienti.filter(c =>
      c.nome.toLowerCase().includes(searchTerm) ||
      c.cognome.toLowerCase().includes(searchTerm) ||
      c.codice.toLowerCase().includes(searchTerm) ||
      c.telefono?.includes(searchTerm) ||
      c.cellulare?.includes(searchTerm)
    )
  }

  return {
    clienti,
    loading,
    error,
    refresh: fetchClienti,
    createCliente,
    updateCliente,
    deleteCliente,
    searchClienti,
  }
}

export function useCliente(id: string | null) {
  const [cliente, setCliente] = useState<Cliente | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) {
      setCliente(null)
      return
    }

    const fetchCliente = async () => {
      try {
        setLoading(true)
        setError(null)

        const { data, error: fetchError } = await supabase
          .from('clienti')
          .select('*')
          .eq('id', id)
          .single()

        if (fetchError) throw fetchError
        setCliente(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Errore nel caricamento cliente')
      } finally {
        setLoading(false)
      }
    }

    fetchCliente()
  }, [id])

  return { cliente, loading, error }
}
