'use client'

import { useState, useEffect, useCallback, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { MainLayout } from '@/components/layout'
import { Card, Button, Input, Table, Modal, Badge, ConfirmModal } from '@/components/ui'
import type { Column } from '@/components/ui/Table'
import {
  Plus,
  Search,
  Filter,
  Download,
  Eye,
  Edit2,
  Trash2,
  Phone,
  Mail,
  MapPin,
  User,
  Calendar,
  FileText,
  Loader2,
  Calculator,
  AlertCircle,
  CheckCircle,
} from 'lucide-react'
import { clsx } from 'clsx'
import { supabase } from '@/lib/supabase'
import {
  generaCodiceFiscale,
  validaCodiceFiscale,
  cercaComuni,
  COMUNI_ITALIANI,
  type DatiCodiceFiscale,
} from '@/lib/codiceFiscale'

interface Cliente {
  id: string
  codice: string
  nome: string
  cognome: string
  data_nascita: string | null
  codice_fiscale: string | null
  sesso: 'M' | 'F' | null
  luogo_nascita: string | null
  luogo_nascita_codice: string | null
  telefono: string | null
  cellulare: string | null
  email: string | null
  indirizzo: string | null
  citta: string | null
  cap: string | null
  provincia: string | null
  note: string | null
  consenso_privacy: boolean
  consenso_marketing: boolean
  created_at: string
  updated_at: string
}

interface ClienteFormData {
  nome: string
  cognome: string
  data_nascita: string
  sesso: 'M' | 'F' | ''
  luogo_nascita: string
  luogo_nascita_codice: string
  codice_fiscale: string
  telefono: string
  cellulare: string
  email: string
  indirizzo: string
  citta: string
  cap: string
  provincia: string
  note: string
  consenso_privacy: boolean
  consenso_marketing: boolean
}

const emptyForm: ClienteFormData = {
  nome: '',
  cognome: '',
  data_nascita: '',
  sesso: '',
  luogo_nascita: '',
  luogo_nascita_codice: '',
  codice_fiscale: '',
  telefono: '',
  cellulare: '',
  email: '',
  indirizzo: '',
  citta: '',
  cap: '',
  provincia: '',
  note: '',
  consenso_privacy: false,
  consenso_marketing: false,
}

// Genera un codice cliente univoco
function generateClientCode(): string {
  const timestamp = Date.now().toString(36).toUpperCase()
  const random = Math.random().toString(36).substring(2, 5).toUpperCase()
  return `CLI-${timestamp.slice(-4)}${random}`
}

function ClientiPageContent() {
  const searchParams = useSearchParams()
  const [clienti, setClienti] = useState<Cliente[]>([])
  const [search, setSearch] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [selectedCliente, setSelectedCliente] = useState<Cliente | null>(null)
  const [formData, setFormData] = useState<ClienteFormData>(emptyForm)
  const [isEditing, setIsEditing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // Ricerca comuni
  const [comuniSuggestions, setComuniSuggestions] = useState<typeof COMUNI_ITALIANI>([])
  const [showComuniDropdown, setShowComuniDropdown] = useState(false)

  // Carica clienti da Supabase
  const loadClienti = useCallback(async () => {
    try {
      setIsLoading(true)
      const { data, error } = await supabase
        .from('clienti')
        .select('*')
        .order('cognome', { ascending: true })

      if (error) throw error
      setClienti(data || [])
    } catch (err) {
      console.error('Errore caricamento clienti:', err)
      setError('Errore nel caricamento dei clienti')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadClienti()
  }, [loadClienti])

  useEffect(() => {
    if (searchParams.get('nuovo') === 'true') {
      handleNewCliente()
    }
  }, [searchParams])

  // Auto-hide success message
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(null), 3000)
      return () => clearTimeout(timer)
    }
  }, [success])

  // Filtra clienti
  const filteredClienti = clienti.filter(
    (c) =>
      c.nome.toLowerCase().includes(search.toLowerCase()) ||
      c.cognome.toLowerCase().includes(search.toLowerCase()) ||
      c.codice.toLowerCase().includes(search.toLowerCase()) ||
      c.email?.toLowerCase().includes(search.toLowerCase()) ||
      c.cellulare?.includes(search) ||
      c.telefono?.includes(search) ||
      c.codice_fiscale?.toLowerCase().includes(search.toLowerCase())
  )

  // Statistiche
  const stats = {
    totale: clienti.length,
    nuoviMese: clienti.filter(c => {
      const created = new Date(c.created_at)
      const now = new Date()
      return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear()
    }).length,
    conEmail: clienti.filter(c => c.email).length,
    conConsensoMarketing: clienti.filter(c => c.consenso_marketing).length,
  }

  const handleNewCliente = () => {
    setFormData(emptyForm)
    setIsEditing(false)
    setError(null)
    setIsModalOpen(true)
  }

  const handleEditCliente = (cliente: Cliente) => {
    setFormData({
      nome: cliente.nome,
      cognome: cliente.cognome,
      data_nascita: cliente.data_nascita || '',
      sesso: cliente.sesso || '',
      luogo_nascita: cliente.luogo_nascita || '',
      luogo_nascita_codice: cliente.luogo_nascita_codice || '',
      codice_fiscale: cliente.codice_fiscale || '',
      telefono: cliente.telefono || '',
      cellulare: cliente.cellulare || '',
      email: cliente.email || '',
      indirizzo: cliente.indirizzo || '',
      citta: cliente.citta || '',
      cap: cliente.cap || '',
      provincia: cliente.provincia || '',
      note: cliente.note || '',
      consenso_privacy: cliente.consenso_privacy,
      consenso_marketing: cliente.consenso_marketing,
    })
    setSelectedCliente(cliente)
    setIsEditing(true)
    setError(null)
    setIsModalOpen(true)
  }

  const handleViewCliente = (cliente: Cliente) => {
    setSelectedCliente(cliente)
    setIsViewModalOpen(true)
  }

  const handleDeleteClick = (cliente: Cliente) => {
    setSelectedCliente(cliente)
    setIsDeleteModalOpen(true)
  }

  // Genera Codice Fiscale
  const handleGeneraCF = () => {
    if (!formData.nome || !formData.cognome || !formData.data_nascita || !formData.sesso || !formData.luogo_nascita_codice) {
      setError('Inserisci nome, cognome, data di nascita, sesso e luogo di nascita per generare il CF')
      return
    }

    try {
      const dati: DatiCodiceFiscale = {
        nome: formData.nome,
        cognome: formData.cognome,
        dataNascita: new Date(formData.data_nascita),
        sesso: formData.sesso as 'M' | 'F',
        comuneNascita: formData.luogo_nascita_codice,
      }

      const cf = generaCodiceFiscale(dati)
      setFormData({ ...formData, codice_fiscale: cf })
      setError(null)
    } catch (err) {
      setError('Errore nella generazione del codice fiscale')
    }
  }

  // Gestione ricerca comuni
  const handleLuogoNascitaChange = (value: string) => {
    setFormData({ ...formData, luogo_nascita: value, luogo_nascita_codice: '' })
    if (value.length >= 2) {
      const results = cercaComuni(value)
      setComuniSuggestions(results)
      setShowComuniDropdown(results.length > 0)
    } else {
      setComuniSuggestions([])
      setShowComuniDropdown(false)
    }
  }

  const handleSelectComune = (comune: typeof COMUNI_ITALIANI[0]) => {
    setFormData({
      ...formData,
      luogo_nascita: comune.nome,
      luogo_nascita_codice: comune.codice,
    })
    setShowComuniDropdown(false)
  }

  // Salva cliente
  const handleSave = async () => {
    // Validazione
    if (!formData.nome.trim() || !formData.cognome.trim()) {
      setError('Nome e cognome sono obbligatori')
      return
    }

    if (!formData.consenso_privacy) {
      setError('Il consenso privacy è obbligatorio')
      return
    }

    // Valida CF se presente
    if (formData.codice_fiscale && !validaCodiceFiscale(formData.codice_fiscale)) {
      setError('Il codice fiscale inserito non è valido')
      return
    }

    setIsSaving(true)
    setError(null)

    try {
      // Dati base sempre presenti
      const clienteData: Record<string, any> = {
        nome: formData.nome.trim(),
        cognome: formData.cognome.trim(),
        data_nascita: formData.data_nascita || null,
        codice_fiscale: formData.codice_fiscale || null,
        telefono: formData.telefono || null,
        cellulare: formData.cellulare || null,
        email: formData.email || null,
        indirizzo: formData.indirizzo || null,
        citta: formData.citta || null,
        cap: formData.cap || null,
        provincia: formData.provincia || null,
        note: formData.note || null,
        consenso_privacy: formData.consenso_privacy,
        consenso_marketing: formData.consenso_marketing,
        updated_at: new Date().toISOString(),
      }

      // Aggiungi campi opzionali (potrebbero non esistere nel DB)
      if (formData.sesso) clienteData.sesso = formData.sesso
      if (formData.luogo_nascita) clienteData.luogo_nascita = formData.luogo_nascita
      if (formData.luogo_nascita_codice) clienteData.luogo_nascita_codice = formData.luogo_nascita_codice

      if (isEditing && selectedCliente) {
        // Update
        const { error } = await supabase
          .from('clienti')
          .update(clienteData)
          .eq('id', selectedCliente.id)

        if (error) throw error
        setSuccess('Cliente aggiornato con successo!')
      } else {
        // Insert
        const { error } = await supabase
          .from('clienti')
          .insert({
            ...clienteData,
            codice: generateClientCode(),
            created_at: new Date().toISOString(),
          })

        if (error) throw error
        setSuccess('Cliente creato con successo!')
      }

      setIsModalOpen(false)
      setFormData(emptyForm)
      loadClienti()
    } catch (err: any) {
      console.error('Errore salvataggio:', err)
      setError(err.message || 'Errore nel salvataggio del cliente')
    } finally {
      setIsSaving(false)
    }
  }

  // Elimina cliente
  const handleDelete = async () => {
    if (!selectedCliente) return

    setIsSaving(true)
    try {
      const { error } = await supabase
        .from('clienti')
        .delete()
        .eq('id', selectedCliente.id)

      if (error) throw error

      setSuccess('Cliente eliminato con successo!')
      setIsDeleteModalOpen(false)
      setSelectedCliente(null)
      loadClienti()
    } catch (err: any) {
      console.error('Errore eliminazione:', err)
      setError(err.message || 'Errore nell\'eliminazione del cliente')
    } finally {
      setIsSaving(false)
    }
  }

  const columns: Column<Cliente>[] = [
    {
      key: 'codice',
      header: 'Codice',
      render: (item) => (
        <span className="font-mono text-sm text-primary">{item.codice}</span>
      ),
    },
    {
      key: 'nome',
      header: 'Cliente',
      render: (item) => (
        <div>
          <p className="font-medium text-foreground">
            {item.cognome} {item.nome}
          </p>
          <p className="text-sm text-foreground-muted">{item.citta || '-'}</p>
        </div>
      ),
    },
    {
      key: 'cf',
      header: 'Codice Fiscale',
      render: (item) => (
        <span className="font-mono text-xs text-foreground-muted">
          {item.codice_fiscale || '-'}
        </span>
      ),
    },
    {
      key: 'contatti',
      header: 'Contatti',
      render: (item) => (
        <div className="space-y-1">
          {item.cellulare && (
            <div className="flex items-center gap-1.5 text-sm">
              <Phone className="w-3.5 h-3.5 text-foreground-muted" />
              <span>{item.cellulare}</span>
            </div>
          )}
          {item.email && (
            <div className="flex items-center gap-1.5 text-sm">
              <Mail className="w-3.5 h-3.5 text-foreground-muted" />
              <span className="truncate max-w-[180px]">{item.email}</span>
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'consensi',
      header: 'Consensi',
      render: (item) => (
        <div className="flex gap-1">
          <Badge variant={item.consenso_privacy ? 'success' : 'neutral'} size="sm">
            Privacy
          </Badge>
          {item.consenso_marketing && (
            <Badge variant="info" size="sm">
              Mktg
            </Badge>
          )}
        </div>
      ),
    },
    {
      key: 'actions',
      header: '',
      align: 'right',
      render: (item) => (
        <div className="flex items-center justify-end gap-1">
          <button
            onClick={(e) => {
              e.stopPropagation()
              handleViewCliente(item)
            }}
            className="p-2 rounded-lg hover:bg-background-secondary transition-colors"
            title="Visualizza"
          >
            <Eye className="w-4 h-4 text-foreground-muted" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              handleEditCliente(item)
            }}
            className="p-2 rounded-lg hover:bg-background-secondary transition-colors"
            title="Modifica"
          >
            <Edit2 className="w-4 h-4 text-foreground-muted" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              handleDeleteClick(item)
            }}
            className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
            title="Elimina"
          >
            <Trash2 className="w-4 h-4 text-red-500" />
          </button>
        </div>
      ),
    },
  ]

  return (
    <MainLayout title="Clienti">
      <div className="space-y-6 animate-fade-in">
        {/* Success/Error Messages */}
        {success && (
          <div className="flex items-center gap-2 p-3 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-lg">
            <CheckCircle className="w-5 h-5" />
            {success}
          </div>
        )}

        {/* Header Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground-muted" />
            <input
              type="text"
              placeholder="Cerca per nome, codice, CF, telefono..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-base pl-10"
            />
          </div>

          <div className="flex gap-2">
            <Button variant="outline" size="sm" leftIcon={<Download className="w-4 h-4" />}>
              Esporta
            </Button>
            <Button
              variant="primary"
              size="sm"
              leftIcon={<Plus className="w-4 h-4" />}
              onClick={handleNewCliente}
            >
              Nuovo Cliente
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card padding="sm" className="text-center">
            <p className="text-2xl font-bold text-foreground">{stats.totale}</p>
            <p className="text-sm text-foreground-muted">Clienti Totali</p>
          </Card>
          <Card padding="sm" className="text-center">
            <p className="text-2xl font-bold text-primary">{stats.nuoviMese}</p>
            <p className="text-sm text-foreground-muted">Nuovi questo mese</p>
          </Card>
          <Card padding="sm" className="text-center">
            <p className="text-2xl font-bold text-secondary">{stats.conEmail}</p>
            <p className="text-sm text-foreground-muted">Con email</p>
          </Card>
          <Card padding="sm" className="text-center">
            <p className="text-2xl font-bold text-success">{stats.conConsensoMarketing}</p>
            <p className="text-sm text-foreground-muted">Consenso marketing</p>
          </Card>
        </div>

        {/* Table */}
        <Card padding="none">
          <Table
            columns={columns}
            data={filteredClienti}
            keyExtractor={(item) => item.id}
            onRowClick={handleViewCliente}
            emptyMessage="Nessun cliente trovato"
            isLoading={isLoading}
          />
        </Card>
      </div>

      {/* New/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={isEditing ? 'Modifica Cliente' : 'Nuovo Cliente'}
        size="xl"
      >
        <div className="space-y-6">
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              {error}
            </div>
          )}

          {/* Personal Info */}
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
              <User className="w-4 h-4" />
              Dati Personali
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Nome *"
                value={formData.nome}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                placeholder="Mario"
              />
              <Input
                label="Cognome *"
                value={formData.cognome}
                onChange={(e) => setFormData({ ...formData, cognome: e.target.value })}
                placeholder="Rossi"
              />
              <Input
                label="Data di Nascita"
                type="date"
                value={formData.data_nascita}
                onChange={(e) => setFormData({ ...formData, data_nascita: e.target.value })}
              />
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Sesso</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, sesso: 'M' })}
                    className={clsx(
                      'flex-1 py-2 px-4 rounded-lg border text-sm font-medium transition-colors',
                      formData.sesso === 'M'
                        ? 'bg-blue-500 text-white border-blue-500'
                        : 'bg-surface border-border hover:bg-background-secondary'
                    )}
                  >
                    Maschio
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, sesso: 'F' })}
                    className={clsx(
                      'flex-1 py-2 px-4 rounded-lg border text-sm font-medium transition-colors',
                      formData.sesso === 'F'
                        ? 'bg-pink-500 text-white border-pink-500'
                        : 'bg-surface border-border hover:bg-background-secondary'
                    )}
                  >
                    Femmina
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Luogo nascita e CF */}
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
              <Calculator className="w-4 h-4" />
              Codice Fiscale
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <Input
                  label="Luogo di Nascita"
                  value={formData.luogo_nascita}
                  onChange={(e) => handleLuogoNascitaChange(e.target.value)}
                  onFocus={() => formData.luogo_nascita.length >= 2 && setShowComuniDropdown(comuniSuggestions.length > 0)}
                  onBlur={() => setTimeout(() => setShowComuniDropdown(false), 200)}
                  placeholder="Inizia a digitare il comune..."
                />
                {showComuniDropdown && (
                  <div className="absolute z-50 w-full mt-1 bg-surface border border-border rounded-lg shadow-lg max-h-48 overflow-auto">
                    {comuniSuggestions.map((comune) => (
                      <button
                        key={comune.codice}
                        type="button"
                        onClick={() => handleSelectComune(comune)}
                        className="w-full px-3 py-2 text-left hover:bg-background-secondary text-sm flex justify-between items-center"
                      >
                        <span>{comune.nome}</span>
                        <span className="text-foreground-muted text-xs">({comune.provincia})</span>
                      </button>
                    ))}
                  </div>
                )}
                {formData.luogo_nascita_codice && (
                  <p className="text-xs text-foreground-muted mt-1">
                    Codice catastale: {formData.luogo_nascita_codice}
                  </p>
                )}
              </div>
              <div>
                <div className="flex items-end gap-2">
                  <div className="flex-1">
                    <Input
                      label="Codice Fiscale"
                      value={formData.codice_fiscale}
                      onChange={(e) => setFormData({ ...formData, codice_fiscale: e.target.value.toUpperCase() })}
                      maxLength={16}
                      placeholder="RSSMRA85C15F205X"
                    />
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleGeneraCF}
                    className="mb-0.5"
                    title="Genera CF"
                  >
                    <Calculator className="w-4 h-4" />
                  </Button>
                </div>
                {formData.codice_fiscale && (
                  <p className={clsx(
                    'text-xs mt-1 flex items-center gap-1',
                    validaCodiceFiscale(formData.codice_fiscale) ? 'text-green-600' : 'text-red-500'
                  )}>
                    {validaCodiceFiscale(formData.codice_fiscale) ? (
                      <><CheckCircle className="w-3 h-3" /> CF valido</>
                    ) : (
                      <><AlertCircle className="w-3 h-3" /> CF non valido</>
                    )}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
              <Phone className="w-4 h-4" />
              Contatti
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Cellulare"
                value={formData.cellulare}
                onChange={(e) => setFormData({ ...formData, cellulare: e.target.value })}
                placeholder="333 1234567"
              />
              <Input
                label="Telefono Fisso"
                value={formData.telefono}
                onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                placeholder="02 1234567"
              />
              <Input
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="mario.rossi@email.it"
                className="md:col-span-2"
              />
            </div>
          </div>

          {/* Address */}
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Indirizzo di Residenza
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Indirizzo"
                value={formData.indirizzo}
                onChange={(e) => setFormData({ ...formData, indirizzo: e.target.value })}
                placeholder="Via Roma, 1"
                className="md:col-span-2"
              />
              <Input
                label="Città"
                value={formData.citta}
                onChange={(e) => setFormData({ ...formData, citta: e.target.value })}
                placeholder="Milano"
              />
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="CAP"
                  value={formData.cap}
                  onChange={(e) => setFormData({ ...formData, cap: e.target.value })}
                  placeholder="20100"
                  maxLength={5}
                />
                <Input
                  label="Prov."
                  value={formData.provincia}
                  onChange={(e) => setFormData({ ...formData, provincia: e.target.value.toUpperCase() })}
                  placeholder="MI"
                  maxLength={2}
                />
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Note</label>
            <textarea
              value={formData.note}
              onChange={(e) => setFormData({ ...formData, note: e.target.value })}
              className="input-base min-h-[80px]"
              placeholder="Note aggiuntive sul cliente..."
            />
          </div>

          {/* Privacy */}
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Consensi
            </h4>
            <div className="space-y-3">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.consenso_privacy}
                  onChange={(e) => setFormData({ ...formData, consenso_privacy: e.target.checked })}
                  className="mt-0.5 w-4 h-4 rounded border-border text-primary focus:ring-primary"
                />
                <div>
                  <span className="text-sm font-medium text-foreground">Consenso Privacy *</span>
                  <p className="text-xs text-foreground-muted">
                    Il cliente acconsente al trattamento dei dati personali ai sensi del GDPR
                  </p>
                </div>
              </label>
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.consenso_marketing}
                  onChange={(e) => setFormData({ ...formData, consenso_marketing: e.target.checked })}
                  className="mt-0.5 w-4 h-4 rounded border-border text-primary focus:ring-primary"
                />
                <div>
                  <span className="text-sm font-medium text-foreground">Consenso Marketing</span>
                  <p className="text-xs text-foreground-muted">
                    Il cliente acconsente a ricevere comunicazioni commerciali e promozionali
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <Button variant="ghost" onClick={() => setIsModalOpen(false)} disabled={isSaving}>
              Annulla
            </Button>
            <Button variant="primary" onClick={handleSave} isLoading={isSaving}>
              {isEditing ? 'Salva Modifiche' : 'Crea Cliente'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* View Modal */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        title="Dettaglio Cliente"
        size="lg"
      >
        {selectedCliente && (
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="w-8 h-8 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-foreground">
                  {selectedCliente.cognome} {selectedCliente.nome}
                </h3>
                <p className="text-sm text-foreground-muted font-mono">{selectedCliente.codice}</p>
                {selectedCliente.codice_fiscale && (
                  <p className="text-xs text-foreground-muted font-mono mt-1">
                    CF: {selectedCliente.codice_fiscale}
                  </p>
                )}
                <div className="flex gap-2 mt-2">
                  <Badge variant={selectedCliente.consenso_privacy ? 'success' : 'neutral'}>
                    Privacy {selectedCliente.consenso_privacy ? '✓' : '✗'}
                  </Badge>
                  {selectedCliente.consenso_marketing && (
                    <Badge variant="info">Marketing ✓</Badge>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <div>
                  <label className="text-xs text-foreground-muted uppercase tracking-wider">Data di Nascita</label>
                  <p className="text-foreground">
                    {selectedCliente.data_nascita
                      ? new Date(selectedCliente.data_nascita).toLocaleDateString('it-IT')
                      : '-'}
                  </p>
                </div>
                <div>
                  <label className="text-xs text-foreground-muted uppercase tracking-wider">Luogo di Nascita</label>
                  <p className="text-foreground">{selectedCliente.luogo_nascita || '-'}</p>
                </div>
                <div>
                  <label className="text-xs text-foreground-muted uppercase tracking-wider">Cellulare</label>
                  <p className="text-foreground">{selectedCliente.cellulare || '-'}</p>
                </div>
                <div>
                  <label className="text-xs text-foreground-muted uppercase tracking-wider">Telefono</label>
                  <p className="text-foreground">{selectedCliente.telefono || '-'}</p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-xs text-foreground-muted uppercase tracking-wider">Email</label>
                  <p className="text-foreground">{selectedCliente.email || '-'}</p>
                </div>
                <div>
                  <label className="text-xs text-foreground-muted uppercase tracking-wider">Indirizzo</label>
                  <p className="text-foreground">
                    {selectedCliente.indirizzo
                      ? `${selectedCliente.indirizzo}, ${selectedCliente.cap || ''} ${selectedCliente.citta || ''} (${selectedCliente.provincia || ''})`
                      : selectedCliente.citta || '-'}
                  </p>
                </div>
                <div>
                  <label className="text-xs text-foreground-muted uppercase tracking-wider">Cliente dal</label>
                  <p className="text-foreground">
                    {new Date(selectedCliente.created_at).toLocaleDateString('it-IT')}
                  </p>
                </div>
              </div>
            </div>

            {selectedCliente.note && (
              <div>
                <label className="text-xs text-foreground-muted uppercase tracking-wider">Note</label>
                <p className="text-foreground mt-1 p-3 bg-background-secondary rounded-lg">
                  {selectedCliente.note}
                </p>
              </div>
            )}

            <div className="flex justify-between gap-3 pt-4 border-t border-border">
              <Button
                variant="danger"
                onClick={() => {
                  setIsViewModalOpen(false)
                  handleDeleteClick(selectedCliente)
                }}
                leftIcon={<Trash2 className="w-4 h-4" />}
              >
                Elimina
              </Button>
              <div className="flex gap-3">
                <Button variant="ghost" onClick={() => setIsViewModalOpen(false)}>
                  Chiudi
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsViewModalOpen(false)
                    handleEditCliente(selectedCliente)
                  }}
                  leftIcon={<Edit2 className="w-4 h-4" />}
                >
                  Modifica
                </Button>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Elimina Cliente"
        description={`Sei sicuro di voler eliminare il cliente "${selectedCliente?.cognome} ${selectedCliente?.nome}"? Questa azione non può essere annullata.`}
        confirmText="Elimina"
        variant="danger"
        isLoading={isSaving}
      />
    </MainLayout>
  )
}

export default function ClientiPage() {
  return (
    <Suspense fallback={
      <MainLayout title="Clienti">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </MainLayout>
    }>
      <ClientiPageContent />
    </Suspense>
  )
}
