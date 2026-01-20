'use client'

import { useState, useEffect, useMemo, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { MainLayout } from '@/components/layout'
import { Card, CardHeader, Button, Input, Select, Modal, Table, Badge, StatusBadge } from '@/components/ui'
import type { Column } from '@/components/ui/Table'
import {
  Plus,
  Search,
  Eye,
  Edit2,
  User,
  FileText,
  Glasses,
  CircleDot,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Calendar,
  Printer,
  Sun,
  Phone,
  Mail,
  Package,
  Sparkles,
  X,
  AlertCircle,
} from 'lucide-react'
import { clsx } from 'clsx'

// ============================================
// MOCK DATA ESTESI
// ============================================

const mockClienti = [
  {
    id: '1',
    codice: 'CLI-001',
    nome: 'Mario',
    cognome: 'Rossi',
    nome_completo: 'Mario Rossi',
    telefono: '333 1234567',
    email: 'mario.rossi@email.it',
    citta: 'Milano',
  },
  {
    id: '2',
    codice: 'CLI-002',
    nome: 'Anna',
    cognome: 'Bianchi',
    nome_completo: 'Anna Bianchi',
    telefono: '339 8765432',
    email: 'anna.bianchi@email.it',
    citta: 'Roma',
  },
  {
    id: '3',
    codice: 'CLI-003',
    nome: 'Luigi',
    cognome: 'Verdi',
    nome_completo: 'Luigi Verdi',
    telefono: '340 1122334',
    email: 'luigi.verdi@email.it',
    citta: 'Napoli',
  },
  {
    id: '4',
    codice: 'CLI-004',
    nome: 'Sara',
    cognome: 'Neri',
    nome_completo: 'Sara Neri',
    telefono: '347 9988776',
    email: 'sara.neri@email.it',
    citta: 'Torino',
  },
]

// Prescrizioni con struttura completa L/P/I/V
const mockPrescrizioni = [
  {
    id: '1',
    cliente_id: '1',
    data: '2024-03-15',
    prescrittore: 'Dott. Bianchi',
    lontano: { od_sph: -2.50, od_cyl: -0.75, od_ax: 180, os_sph: -2.25, os_cyl: -0.50, os_ax: 175 },
    permanente: { od_sph: null, od_cyl: null, od_ax: null, os_sph: null, os_cyl: null, os_ax: null },
    intermedio: { od_sph: -1.00, od_cyl: -0.75, od_ax: 180, od_add: 1.50, os_sph: -0.75, os_cyl: -0.50, os_ax: 175, os_add: 1.50 },
    vicino: { od_sph: -0.50, od_cyl: -0.75, od_ax: 180, od_add: 2.00, os_sph: -0.25, os_cyl: -0.50, os_ax: 175, os_add: 2.00 },
    dip: 63,
  },
  {
    id: '2',
    cliente_id: '1',
    data: '2023-09-10',
    prescrittore: 'Dott. Verdi',
    lontano: { od_sph: -2.25, od_cyl: -0.50, od_ax: 180, os_sph: -2.00, os_cyl: -0.50, os_ax: 175 },
    permanente: { od_sph: null, od_cyl: null, od_ax: null, os_sph: null, os_cyl: null, os_ax: null },
    intermedio: { od_sph: null, od_cyl: null, od_ax: null, os_sph: null, os_cyl: null, os_ax: null },
    vicino: { od_sph: -0.25, od_cyl: -0.50, od_ax: 180, od_add: 2.00, os_sph: 0.00, os_cyl: -0.50, os_ax: 175, os_add: 2.00 },
    dip: 63,
  },
  {
    id: '3',
    cliente_id: '2',
    data: '2024-03-10',
    prescrittore: 'Dott. Rossi',
    lontano: { od_sph: 1.00, od_cyl: -0.25, od_ax: 90, os_sph: 0.75, os_cyl: -0.50, os_ax: 85 },
    permanente: { od_sph: null, od_cyl: null, od_ax: null, os_sph: null, os_cyl: null, os_ax: null },
    intermedio: { od_sph: null, od_cyl: null, od_ax: null, os_sph: null, os_cyl: null, os_ax: null },
    vicino: { od_sph: 3.50, od_cyl: -0.25, od_ax: 90, od_add: 2.50, os_sph: 3.25, os_cyl: -0.50, os_ax: 85, os_add: 2.50 },
    dip: 62,
  },
]

// Montature con dettagli
const mockMontature = [
  { id: '1', codice: 'MV-001', nome: 'Ray-Ban RB5154', marca: 'Ray-Ban', modello: 'RB5154', categoria: 'vista', colore: 'Tartaruga', prezzo: 180, quantita: 5 },
  { id: '2', codice: 'MV-002', nome: 'Oakley OX8046', marca: 'Oakley', modello: 'OX8046', categoria: 'vista', colore: 'Nero Opaco', prezzo: 150, quantita: 3 },
  { id: '3', codice: 'MV-003', nome: 'Persol PO3007V', marca: 'Persol', modello: 'PO3007V', categoria: 'vista', colore: 'Havana', prezzo: 220, quantita: 4 },
  { id: '4', codice: 'MV-004', nome: 'Gucci GG0027O', marca: 'Gucci', modello: 'GG0027O', categoria: 'vista', colore: 'Nero', prezzo: 320, quantita: 2 },
  { id: '5', codice: 'MV-005', nome: 'Tom Ford FT5401', marca: 'Tom Ford', modello: 'FT5401', categoria: 'vista', colore: 'Blu', prezzo: 280, quantita: 2 },
  { id: '6', codice: 'MS-001', nome: 'Ray-Ban Aviator', marca: 'Ray-Ban', modello: 'RB3025', categoria: 'sole', colore: 'Oro/Verde', prezzo: 160, quantita: 6 },
  { id: '7', codice: 'MS-002', nome: 'Oakley Holbrook', marca: 'Oakley', modello: 'Holbrook', categoria: 'sole', colore: 'Nero', prezzo: 140, quantita: 4 },
  { id: '8', codice: 'MS-003', nome: 'Persol 714', marca: 'Persol', modello: '714', categoria: 'sole', colore: 'Havana', prezzo: 280, quantita: 3 },
]

// Listino lenti con prezzi
const tipiLente = [
  { value: 'monofocale', label: 'Monofocale', prezzo_base: 60 },
  { value: 'bifocale', label: 'Bifocale', prezzo_base: 120 },
  { value: 'progressiva', label: 'Progressiva', prezzo_base: 200 },
  { value: 'office', label: 'Office/Degressive', prezzo_base: 180 },
]

const materialiLente = [
  { value: 'cr39', label: 'CR39 (1.50)', indice: 1.50, sovrapprezzo: 0 },
  { value: 'policarbonato', label: 'Policarbonato (1.59)', indice: 1.59, sovrapprezzo: 30 },
  { value: 'organico156', label: 'Organico 1.56', indice: 1.56, sovrapprezzo: 40 },
  { value: 'organico160', label: 'Organico 1.60', indice: 1.60, sovrapprezzo: 60 },
  { value: 'organico167', label: 'Organico 1.67', indice: 1.67, sovrapprezzo: 100 },
  { value: 'organico174', label: 'Organico 1.74', indice: 1.74, sovrapprezzo: 160 },
]

const trattamentiLente = [
  { value: 'antiriflesso', label: 'Antiriflesso', prezzo: 40 },
  { value: 'fotocromatico', label: 'Fotocromatico', prezzo: 80 },
  { value: 'blue_control', label: 'Blue Control', prezzo: 50 },
  { value: 'polarizzato', label: 'Polarizzato', prezzo: 70 },
  { value: 'transitions', label: 'Transitions', prezzo: 120 },
  { value: 'antigraffio', label: 'Antigraffio', prezzo: 20 },
  { value: 'idrorepellente', label: 'Idrorepellente', prezzo: 25 },
]

const fornitoriLenti = [
  { value: 'essilor', label: 'Essilor' },
  { value: 'hoya', label: 'Hoya' },
  { value: 'zeiss', label: 'Zeiss' },
  { value: 'rodenstock', label: 'Rodenstock' },
  { value: 'indo', label: 'Indo' },
  { value: 'altro', label: 'Altro' },
]

// Tipi stato ordine
type StatoOrdine = 'nuovo' | 'in_lavorazione' | 'attesa_lenti' | 'pronto' | 'consegnato'

// Ordini esistenti
const mockOrdini: {
  id: string
  numero: string
  cliente_nome: string
  data_ordine: string
  data_consegna_prevista: string
  stato: StatoOrdine
  montatura: string
  totale: number
  acconto: number
  saldo: number
}[] = [
  {
    id: '1',
    numero: 'ORD-2024001',
    cliente_nome: 'Mario Rossi',
    data_ordine: '2024-03-15',
    data_consegna_prevista: '2024-03-22',
    stato: 'in_lavorazione',
    montatura: 'Ray-Ban RB5154',
    totale: 450.00,
    acconto: 200.00,
    saldo: 250.00,
  },
  {
    id: '2',
    numero: 'ORD-2024002',
    cliente_nome: 'Anna Bianchi',
    data_ordine: '2024-03-14',
    data_consegna_prevista: '2024-03-21',
    stato: 'pronto',
    montatura: 'Oakley OX8046',
    totale: 320.00,
    acconto: 320.00,
    saldo: 0,
  },
  {
    id: '3',
    numero: 'ORD-2024003',
    cliente_nome: 'Luigi Verdi',
    data_ordine: '2024-03-13',
    data_consegna_prevista: '2024-03-20',
    stato: 'nuovo',
    montatura: 'Persol PO3007V',
    totale: 580.00,
    acconto: 100.00,
    saldo: 480.00,
  },
  {
    id: '4',
    numero: 'ORD-2024004',
    cliente_nome: 'Sara Neri',
    data_ordine: '2024-03-10',
    data_consegna_prevista: '2024-03-17',
    stato: 'consegnato',
    montatura: 'Gucci GG0027O',
    totale: 620.00,
    acconto: 620.00,
    saldo: 0,
  },
  {
    id: '5',
    numero: 'ORD-2024005',
    cliente_nome: 'Marco Gialli',
    data_ordine: '2024-03-12',
    data_consegna_prevista: '2024-03-19',
    stato: 'attesa_lenti',
    montatura: 'Tom Ford FT5401',
    totale: 520.00,
    acconto: 200.00,
    saldo: 320.00,
  },
]

type Ordine = typeof mockOrdini[0]
type Cliente = typeof mockClienti[0]
type Prescrizione = typeof mockPrescrizioni[0]
type Montatura = typeof mockMontature[0]

// ============================================
// WIZARD STEPS CONFIG
// ============================================

const steps = [
  { id: 1, name: 'Cliente', icon: User },
  { id: 2, name: 'Prescrizione', icon: FileText },
  { id: 3, name: 'Montatura', icon: Glasses },
  { id: 4, name: 'Lenti', icon: CircleDot },
  { id: 5, name: 'Conferma', icon: CheckCircle2 },
]

// ============================================
// HELPER FUNCTIONS
// ============================================

function formatDiottria(value: number | null | undefined): string {
  if (value === null || value === undefined) return '-'
  const sign = value >= 0 ? '+' : ''
  return `${sign}${value.toFixed(2)}`
}

function formatCurrency(value: number): string {
  return value.toLocaleString('it-IT', { style: 'currency', currency: 'EUR' })
}

// ============================================
// MAIN COMPONENT
// ============================================

function OrdiniPageContent() {
  const searchParams = useSearchParams()
  const [ordini, setOrdini] = useState(mockOrdini)
  const [search, setSearch] = useState('')
  const [statoFiltro, setStatoFiltro] = useState<string>('')
  const [isWizardOpen, setIsWizardOpen] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const [selectedOrdine, setSelectedOrdine] = useState<Ordine | null>(null)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)

  // ============================================
  // WIZARD STATE
  // ============================================

  const [wizardData, setWizardData] = useState({
    // Step 1 - Cliente
    cliente_id: '',
    cliente: null as Cliente | null,

    // Step 2 - Prescrizione
    prescrizione_id: '',
    prescrizione: null as Prescrizione | null,
    uso_prescrizione: 'lontano' as 'lontano' | 'vicino' | 'intermedio' | 'progressiva',

    // Step 3 - Montatura
    montatura_tipo: 'database' as 'database' | 'cliente' | 'libera',
    montatura_id: '',
    montatura: null as Montatura | null,
    montatura_cliente_descrizione: '',
    montatura_libera_nome: '',
    montatura_libera_prezzo: 0,

    // Step 4 - Lenti
    lente_tipo: '',
    lente_materiale: '',
    lente_trattamenti: [] as string[],
    lente_fornitore: '',
    lente_note: '',

    // Step 5 - Conferma
    sconto_percentuale: 0,
    sconto_euro: 0,
    acconto: 0,
    data_consegna_prevista: '',
    note: '',
  })

  // Search states per step
  const [clienteSearch, setClienteSearch] = useState('')
  const [montaturaSearch, setMontaturaSearch] = useState('')
  const [montaturaCategoria, setMontaturaCategoria] = useState<'tutti' | 'vista' | 'sole'>('tutti')

  useEffect(() => {
    if (searchParams.get('nuovo') === 'true') {
      setIsWizardOpen(true)
    }
  }, [searchParams])

  const filteredOrdini = ordini.filter((o) => {
    const matchSearch =
      o.numero.toLowerCase().includes(search.toLowerCase()) ||
      o.cliente_nome.toLowerCase().includes(search.toLowerCase())
    const matchStato = !statoFiltro || o.stato === statoFiltro
    return matchSearch && matchStato
  })

  // Filtered data per wizard
  const filteredClienti = useMemo(() => {
    if (!clienteSearch) return mockClienti
    const s = clienteSearch.toLowerCase()
    return mockClienti.filter(c =>
      c.nome_completo.toLowerCase().includes(s) ||
      c.codice.toLowerCase().includes(s) ||
      c.telefono.includes(s)
    )
  }, [clienteSearch])

  const clientePrescrizioni = useMemo(() => {
    if (!wizardData.cliente_id) return []
    return mockPrescrizioni.filter(p => p.cliente_id === wizardData.cliente_id)
  }, [wizardData.cliente_id])

  const filteredMontature = useMemo(() => {
    return mockMontature.filter(m => {
      const matchSearch = !montaturaSearch ||
        m.nome.toLowerCase().includes(montaturaSearch.toLowerCase()) ||
        m.marca.toLowerCase().includes(montaturaSearch.toLowerCase())
      const matchCategoria = montaturaCategoria === 'tutti' || m.categoria === montaturaCategoria
      return matchSearch && matchCategoria
    })
  }, [montaturaSearch, montaturaCategoria])

  // Calcolo prezzo lenti
  const calcolaPrezzolenti = useMemo(() => {
    let prezzo = 0
    const tipo = tipiLente.find(t => t.value === wizardData.lente_tipo)
    const materiale = materialiLente.find(m => m.value === wizardData.lente_materiale)

    if (tipo) prezzo += tipo.prezzo_base
    if (materiale) prezzo += materiale.sovrapprezzo

    wizardData.lente_trattamenti.forEach(t => {
      const trattamento = trattamentiLente.find(tr => tr.value === t)
      if (trattamento) prezzo += trattamento.prezzo
    })

    // Prezzo per paio (x2)
    return prezzo * 2
  }, [wizardData.lente_tipo, wizardData.lente_materiale, wizardData.lente_trattamenti])

  // Calcolo totale ordine
  const calcolaTotale = useMemo(() => {
    let montatura = 0
    if (wizardData.montatura_tipo === 'database') {
      montatura = wizardData.montatura?.prezzo || 0
    } else if (wizardData.montatura_tipo === 'libera') {
      montatura = wizardData.montatura_libera_prezzo || 0
    }
    // montatura_tipo === 'cliente' => prezzo 0 (il cliente porta la sua)

    const lenti = calcolaPrezzolenti
    const subtotale = montatura + lenti
    const scontoPerc = subtotale * (wizardData.sconto_percentuale / 100)
    const scontoEuro = wizardData.sconto_euro
    const totale = subtotale - scontoPerc - scontoEuro
    const saldo = totale - wizardData.acconto

    return { montatura, lenti, subtotale, scontoPerc, scontoEuro, totale, saldo: Math.max(0, saldo) }
  }, [wizardData.montatura, wizardData.montatura_tipo, wizardData.montatura_libera_prezzo, calcolaPrezzolenti, wizardData.sconto_percentuale, wizardData.sconto_euro, wizardData.acconto])

  const resetWizard = () => {
    setCurrentStep(1)
    setClienteSearch('')
    setMontaturaSearch('')
    setMontaturaCategoria('tutti')
    setWizardData({
      cliente_id: '',
      cliente: null,
      prescrizione_id: '',
      prescrizione: null,
      uso_prescrizione: 'lontano',
      montatura_tipo: 'database',
      montatura_id: '',
      montatura: null,
      montatura_cliente_descrizione: '',
      montatura_libera_nome: '',
      montatura_libera_prezzo: 0,
      lente_tipo: '',
      lente_materiale: '',
      lente_trattamenti: [],
      lente_fornitore: '',
      lente_note: '',
      sconto_percentuale: 0,
      sconto_euro: 0,
      acconto: 0,
      data_consegna_prevista: '',
      note: '',
    })
  }

  const handleCloseWizard = () => {
    setIsWizardOpen(false)
    resetWizard()
  }

  const canProceed = (step: number): boolean => {
    switch (step) {
      case 1: return !!wizardData.cliente_id
      case 2: return !!wizardData.prescrizione_id
      case 3:
        if (wizardData.montatura_tipo === 'database') return !!wizardData.montatura_id
        if (wizardData.montatura_tipo === 'cliente') return !!wizardData.montatura_cliente_descrizione
        if (wizardData.montatura_tipo === 'libera') return !!wizardData.montatura_libera_nome
        return false
      case 4: return !!wizardData.lente_tipo && !!wizardData.lente_materiale
      case 5: return !!wizardData.data_consegna_prevista
      default: return true
    }
  }

  // ============================================
  // COLUMNS DEFINITION
  // ============================================

  const columns: Column<Ordine>[] = [
    {
      key: 'numero',
      header: 'Ordine',
      render: (item) => (
        <div>
          <p className="font-mono text-sm text-primary font-medium">{item.numero}</p>
          <p className="text-xs text-foreground-muted">
            {new Date(item.data_ordine).toLocaleDateString('it-IT')}
          </p>
        </div>
      ),
    },
    {
      key: 'cliente',
      header: 'Cliente',
      render: (item) => <span className="font-medium">{item.cliente_nome}</span>,
    },
    {
      key: 'montatura',
      header: 'Montatura',
      render: (item) => <span className="text-sm">{item.montatura}</span>,
    },
    {
      key: 'consegna',
      header: 'Consegna',
      render: (item) => (
        <div className="flex items-center gap-1 text-sm">
          <Calendar className="w-3.5 h-3.5 text-foreground-muted" />
          {new Date(item.data_consegna_prevista).toLocaleDateString('it-IT')}
        </div>
      ),
    },
    {
      key: 'stato',
      header: 'Stato',
      render: (item) => <StatusBadge status={item.stato} />,
    },
    {
      key: 'totale',
      header: 'Totale',
      align: 'right',
      render: (item) => (
        <div className="text-right">
          <p className="font-medium">{formatCurrency(item.totale)}</p>
          {item.saldo > 0 && (
            <p className="text-xs text-error">Saldo: {formatCurrency(item.saldo)}</p>
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
            onClick={(e) => { e.stopPropagation(); setSelectedOrdine(item); setIsViewModalOpen(true) }}
            className="p-2 rounded-lg hover:bg-background-secondary transition-colors"
          >
            <Eye className="w-4 h-4 text-foreground-muted" />
          </button>
          <button onClick={(e) => e.stopPropagation()} className="p-2 rounded-lg hover:bg-background-secondary transition-colors">
            <Printer className="w-4 h-4 text-foreground-muted" />
          </button>
        </div>
      ),
    },
  ]

  // ============================================
  // RENDER STEP CONTENT
  // ============================================

  const renderStepContent = () => {
    switch (currentStep) {
      // ========== STEP 1: CLIENTE ==========
      case 1:
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Seleziona Cliente</h3>
              <Button variant="outline" size="sm" leftIcon={<Plus className="w-4 h-4" />}>
                Nuovo Cliente
              </Button>
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground-muted" />
              <input
                type="text"
                placeholder="Cerca per nome, codice o telefono..."
                value={clienteSearch}
                onChange={(e) => setClienteSearch(e.target.value)}
                className="input-base pl-10"
              />
            </div>

            <div className="space-y-2 max-h-[320px] overflow-y-auto">
              {filteredClienti.map((cliente) => (
                <button
                  key={cliente.id}
                  onClick={() => setWizardData({
                    ...wizardData,
                    cliente_id: cliente.id,
                    cliente: cliente,
                    prescrizione_id: '',
                    prescrizione: null,
                  })}
                  className={clsx(
                    'w-full flex items-center gap-3 p-3 rounded-lg border transition-all text-left',
                    wizardData.cliente_id === cliente.id
                      ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                      : 'border-border hover:border-primary/50 hover:bg-background-secondary'
                  )}
                >
                  <div className="w-11 h-11 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <User className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{cliente.nome_completo}</p>
                    <div className="flex items-center gap-3 text-sm text-foreground-muted">
                      <span className="font-mono text-xs">{cliente.codice}</span>
                      <span className="flex items-center gap-1">
                        <Phone className="w-3 h-3" />
                        {cliente.telefono}
                      </span>
                    </div>
                  </div>
                  {wizardData.cliente_id === cliente.id && (
                    <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                  )}
                </button>
              ))}
              {filteredClienti.length === 0 && (
                <p className="text-center text-foreground-muted py-8">Nessun cliente trovato</p>
              )}
            </div>
          </div>
        )

      // ========== STEP 2: PRESCRIZIONE ==========
      case 2:
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">Seleziona Prescrizione</h3>
                <p className="text-sm text-foreground-muted">
                  Cliente: <span className="font-medium text-foreground">{wizardData.cliente?.nome_completo}</span>
                </p>
              </div>
              <Button variant="outline" size="sm" leftIcon={<Plus className="w-4 h-4" />}>
                Nuova Rx
              </Button>
            </div>

            {clientePrescrizioni.length === 0 ? (
              <div className="text-center py-12 bg-background-secondary rounded-lg">
                <FileText className="w-12 h-12 text-foreground-muted mx-auto mb-3" />
                <p className="text-foreground-muted">Nessuna prescrizione per questo cliente</p>
                <Button variant="primary" size="sm" className="mt-4" leftIcon={<Plus className="w-4 h-4" />}>
                  Crea Prima Prescrizione
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {clientePrescrizioni.map((rx) => (
                  <button
                    key={rx.id}
                    onClick={() => setWizardData({ ...wizardData, prescrizione_id: rx.id, prescrizione: rx })}
                    className={clsx(
                      'w-full p-4 rounded-lg border transition-all text-left',
                      wizardData.prescrizione_id === rx.id
                        ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                        : 'border-border hover:border-primary/50'
                    )}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-foreground-muted" />
                        <span className="font-medium">
                          {new Date(rx.data).toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-foreground-muted">{rx.prescrittore}</span>
                        {wizardData.prescrizione_id === rx.id && (
                          <CheckCircle2 className="w-5 h-5 text-primary" />
                        )}
                      </div>
                    </div>

                    {/* Mini tabella prescrizione */}
                    <div className="bg-background-secondary rounded-lg overflow-hidden">
                      <table className="w-full text-xs font-mono">
                        <thead>
                          <tr className="bg-stone-200 dark:bg-stone-700">
                            <th className="p-1.5 text-left w-8"></th>
                            <th className="p-1.5 text-center text-primary" colSpan={3}>OD</th>
                            <th className="p-1.5 text-center text-secondary" colSpan={3}>OS</th>
                          </tr>
                          <tr className="text-foreground-muted">
                            <th className="p-1"></th>
                            <th className="p-1">SPH</th>
                            <th className="p-1">CYL</th>
                            <th className="p-1">AX</th>
                            <th className="p-1">SPH</th>
                            <th className="p-1">CYL</th>
                            <th className="p-1">AX</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td className="p-1 font-bold text-blue-600">L</td>
                            <td className="p-1 text-center">{formatDiottria(rx.lontano.od_sph)}</td>
                            <td className="p-1 text-center">{formatDiottria(rx.lontano.od_cyl)}</td>
                            <td className="p-1 text-center">{rx.lontano.od_ax || '-'}</td>
                            <td className="p-1 text-center">{formatDiottria(rx.lontano.os_sph)}</td>
                            <td className="p-1 text-center">{formatDiottria(rx.lontano.os_cyl)}</td>
                            <td className="p-1 text-center">{rx.lontano.os_ax || '-'}</td>
                          </tr>
                          {(rx.vicino.od_add || rx.vicino.os_add) && (
                            <tr className="border-t border-border">
                              <td className="p-1 font-bold text-green-600">V</td>
                              <td className="p-1 text-center">{formatDiottria(rx.vicino.od_sph)}</td>
                              <td className="p-1 text-center">{formatDiottria(rx.vicino.od_cyl)}</td>
                              <td className="p-1 text-center">{rx.vicino.od_ax || '-'}</td>
                              <td className="p-1 text-center">{formatDiottria(rx.vicino.os_sph)}</td>
                              <td className="p-1 text-center">{formatDiottria(rx.vicino.os_cyl)}</td>
                              <td className="p-1 text-center">{rx.vicino.os_ax || '-'}</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>

                    <div className="flex items-center gap-4 mt-2 text-sm">
                      {rx.dip && (
                        <span className="text-blue-600">DIP: {rx.dip}mm</span>
                      )}
                      {rx.vicino.od_add && (
                        <span className="text-green-600">ADD: +{rx.vicino.od_add.toFixed(2)}</span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* Uso prescrizione */}
            {wizardData.prescrizione && (
              <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                <label className="block text-sm font-medium text-amber-800 dark:text-amber-200 mb-2">
                  Tipo di utilizzo
                </label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { value: 'lontano', label: 'Solo Lontano' },
                    { value: 'vicino', label: 'Solo Vicino' },
                    { value: 'progressiva', label: 'Progressiva (L+V)' },
                    { value: 'intermedio', label: 'Intermedio/Office' },
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setWizardData({ ...wizardData, uso_prescrizione: opt.value as any })}
                      className={clsx(
                        'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                        wizardData.uso_prescrizione === opt.value
                          ? 'bg-amber-600 text-white'
                          : 'bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-200 hover:bg-amber-200'
                      )}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )

      // ========== STEP 3: MONTATURA ==========
      case 3:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Seleziona Montatura</h3>

            {/* Tipo di montatura */}
            <div className="flex flex-wrap gap-2">
              {[
                { value: 'database', label: 'Da Magazzino', icon: Package },
                { value: 'cliente', label: 'Del Cliente', icon: User },
                { value: 'libera', label: 'Inserimento Libero', icon: Edit2 },
              ].map((tipo) => {
                const Icon = tipo.icon
                return (
                  <button
                    key={tipo.value}
                    onClick={() => setWizardData({
                      ...wizardData,
                      montatura_tipo: tipo.value as 'database' | 'cliente' | 'libera',
                      // Reset selezioni quando si cambia tipo
                      montatura_id: '',
                      montatura: null,
                      montatura_cliente_descrizione: '',
                      montatura_libera_nome: '',
                      montatura_libera_prezzo: 0,
                    })}
                    className={clsx(
                      'flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors border',
                      wizardData.montatura_tipo === tipo.value
                        ? 'bg-primary text-white border-primary'
                        : 'bg-background-secondary border-border hover:border-primary/50'
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    {tipo.label}
                  </button>
                )
              })}
            </div>

            {/* Contenuto in base al tipo */}
            {wizardData.montatura_tipo === 'database' && (
              <>
                {/* Filtri */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground-muted" />
                    <input
                      type="text"
                      placeholder="Cerca per nome o marca..."
                      value={montaturaSearch}
                      onChange={(e) => setMontaturaSearch(e.target.value)}
                      className="input-base pl-10"
                    />
                  </div>
                  <div className="flex gap-2">
                    {[
                      { value: 'tutti', label: 'Tutti', icon: Package },
                      { value: 'vista', label: 'Vista', icon: Glasses },
                      { value: 'sole', label: 'Sole', icon: Sun },
                    ].map((cat) => {
                      const Icon = cat.icon
                      return (
                        <button
                          key={cat.value}
                          onClick={() => setMontaturaCategoria(cat.value as any)}
                          className={clsx(
                            'flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                            montaturaCategoria === cat.value
                              ? 'bg-primary text-white'
                              : 'bg-background-secondary hover:bg-background-secondary/80'
                          )}
                        >
                          <Icon className="w-4 h-4" />
                          {cat.label}
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Grid montature */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[280px] overflow-y-auto">
                  {filteredMontature.map((mont) => (
                    <button
                      key={mont.id}
                      onClick={() => setWizardData({
                        ...wizardData,
                        montatura_id: mont.id,
                        montatura: mont,
                      })}
                      className={clsx(
                        'flex items-start gap-3 p-3 rounded-lg border transition-all text-left',
                        wizardData.montatura_id === mont.id
                          ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                          : 'border-border hover:border-primary/50'
                      )}
                    >
                      <div className={clsx(
                        'w-14 h-14 rounded-lg flex items-center justify-center flex-shrink-0',
                        mont.categoria === 'vista' ? 'bg-primary/10' : 'bg-secondary/10'
                      )}>
                        {mont.categoria === 'vista'
                          ? <Glasses className="w-7 h-7 text-primary" />
                          : <Sun className="w-7 h-7 text-secondary" />
                        }
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="font-medium">{mont.nome}</p>
                            <p className="text-sm text-foreground-muted">{mont.marca} • {mont.colore}</p>
                          </div>
                          {wizardData.montatura_id === mont.id && (
                            <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                          )}
                        </div>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-primary font-semibold">{formatCurrency(mont.prezzo)}</span>
                          <span className={clsx(
                            'text-xs px-2 py-0.5 rounded-full',
                            mont.quantita > 2
                              ? 'bg-success/10 text-success'
                              : mont.quantita > 0
                                ? 'bg-warning/10 text-warning'
                                : 'bg-error/10 text-error'
                          )}>
                            {mont.quantita > 0 ? `${mont.quantita} disp.` : 'Esaurito'}
                          </span>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>

                {filteredMontature.length === 0 && (
                  <p className="text-center text-foreground-muted py-8">Nessuna montatura trovata</p>
                )}
              </>
            )}

            {wizardData.montatura_tipo === 'cliente' && (
              <div className="p-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-800 flex items-center justify-center flex-shrink-0">
                    <User className="w-6 h-6 text-blue-600 dark:text-blue-300" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-1">Montatura del Cliente</h4>
                    <p className="text-sm text-blue-600 dark:text-blue-300 mb-4">
                      Il cliente porta la propria montatura. Non verrà addebitato alcun costo per la montatura.
                    </p>
                    <div>
                      <label className="block text-sm font-medium text-blue-800 dark:text-blue-200 mb-1.5">
                        Descrizione montatura *
                      </label>
                      <input
                        type="text"
                        value={wizardData.montatura_cliente_descrizione}
                        onChange={(e) => setWizardData({ ...wizardData, montatura_cliente_descrizione: e.target.value })}
                        placeholder="Es: Montatura propria del cliente - Ray-Ban nera"
                        className="input-base"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {wizardData.montatura_tipo === 'libera' && (
              <div className="p-6 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-800 flex items-center justify-center flex-shrink-0">
                    <Edit2 className="w-6 h-6 text-amber-600 dark:text-amber-300" />
                  </div>
                  <div className="flex-1 space-y-4">
                    <div>
                      <h4 className="font-semibold text-amber-800 dark:text-amber-200 mb-1">Montatura Libera</h4>
                      <p className="text-sm text-amber-600 dark:text-amber-300">
                        Inserisci i dati di una montatura non presente nel magazzino.
                      </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-amber-800 dark:text-amber-200 mb-1.5">
                          Nome/Descrizione montatura *
                        </label>
                        <input
                          type="text"
                          value={wizardData.montatura_libera_nome}
                          onChange={(e) => setWizardData({ ...wizardData, montatura_libera_nome: e.target.value })}
                          placeholder="Es: Ray-Ban RB5154 Tartaruga"
                          className="input-base"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-amber-800 dark:text-amber-200 mb-1.5">
                          Prezzo (€)
                        </label>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={wizardData.montatura_libera_prezzo || ''}
                          onChange={(e) => setWizardData({ ...wizardData, montatura_libera_prezzo: parseFloat(e.target.value) || 0 })}
                          placeholder="0.00"
                          className="input-base"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )

      // ========== STEP 4: LENTI ==========
      case 4:
        return (
          <div className="space-y-5">
            <h3 className="text-lg font-semibold">Configura Lenti</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Tipo Lente */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Tipo Lente *</label>
                <div className="space-y-2">
                  {tipiLente.map((tipo) => (
                    <button
                      key={tipo.value}
                      onClick={() => setWizardData({ ...wizardData, lente_tipo: tipo.value })}
                      className={clsx(
                        'w-full flex items-center justify-between p-3 rounded-lg border transition-all',
                        wizardData.lente_tipo === tipo.value
                          ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                          : 'border-border hover:border-primary/50'
                      )}
                    >
                      <span className="font-medium">{tipo.label}</span>
                      <span className="text-sm text-foreground-muted">da {formatCurrency(tipo.prezzo_base)}/lente</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Materiale */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Materiale/Indice *</label>
                <div className="space-y-2">
                  {materialiLente.map((mat) => (
                    <button
                      key={mat.value}
                      onClick={() => setWizardData({ ...wizardData, lente_materiale: mat.value })}
                      className={clsx(
                        'w-full flex items-center justify-between p-3 rounded-lg border transition-all',
                        wizardData.lente_materiale === mat.value
                          ? 'border-secondary bg-secondary/5 ring-2 ring-secondary/20'
                          : 'border-border hover:border-secondary/50'
                      )}
                    >
                      <span className="font-medium">{mat.label}</span>
                      <span className="text-sm text-foreground-muted">
                        {mat.sovrapprezzo > 0 ? `+${formatCurrency(mat.sovrapprezzo)}` : 'Base'}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Trattamenti */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Trattamenti</label>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                {trattamentiLente.map((tratt) => {
                  const isSelected = wizardData.lente_trattamenti.includes(tratt.value)
                  return (
                    <button
                      key={tratt.value}
                      onClick={() => {
                        if (isSelected) {
                          setWizardData({
                            ...wizardData,
                            lente_trattamenti: wizardData.lente_trattamenti.filter(t => t !== tratt.value)
                          })
                        } else {
                          setWizardData({
                            ...wizardData,
                            lente_trattamenti: [...wizardData.lente_trattamenti, tratt.value]
                          })
                        }
                      }}
                      className={clsx(
                        'flex items-center justify-between p-2.5 rounded-lg border transition-all text-sm',
                        isSelected
                          ? 'border-success bg-success/10 text-success'
                          : 'border-border hover:border-success/50'
                      )}
                    >
                      <span className="flex items-center gap-2">
                        {isSelected ? <CheckCircle2 className="w-4 h-4" /> : <Sparkles className="w-4 h-4 text-foreground-muted" />}
                        {tratt.label}
                      </span>
                      <span className="text-xs">+{formatCurrency(tratt.prezzo)}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Fornitore e Note */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                label="Fornitore Lenti"
                value={wizardData.lente_fornitore}
                onChange={(e) => setWizardData({ ...wizardData, lente_fornitore: e.target.value })}
                options={fornitoriLenti}
                placeholder="Seleziona fornitore"
              />
              <Input
                label="Note Lenti"
                value={wizardData.lente_note}
                onChange={(e) => setWizardData({ ...wizardData, lente_note: e.target.value })}
                placeholder="Es: Centratura particolare, forma speciale..."
              />
            </div>

            {/* Riepilogo prezzo lenti */}
            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="font-medium text-green-800 dark:text-green-200">Prezzo Lenti (paio)</span>
                <span className="text-xl font-bold text-green-600">{formatCurrency(calcolaPrezzolenti)}</span>
              </div>
              {wizardData.lente_tipo && wizardData.lente_materiale && (
                <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                  {tipiLente.find(t => t.value === wizardData.lente_tipo)?.label} • {materialiLente.find(m => m.value === wizardData.lente_materiale)?.label}
                  {wizardData.lente_trattamenti.length > 0 && ` • ${wizardData.lente_trattamenti.length} trattamenti`}
                </p>
              )}
            </div>
          </div>
        )

      // ========== STEP 5: CONFERMA ==========
      case 5:
        return (
          <div className="space-y-5">
            <h3 className="text-lg font-semibold">Riepilogo Ordine</h3>

            {/* Cliente */}
            <div className="p-4 bg-background-secondary rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold">{wizardData.cliente?.nome_completo}</p>
                  <p className="text-sm text-foreground-muted">{wizardData.cliente?.telefono} • {wizardData.cliente?.email}</p>
                </div>
              </div>
            </div>

            {/* Prescrizione */}
            {wizardData.prescrizione && (
              <div className="p-4 border border-border rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-medium flex items-center gap-2">
                    <FileText className="w-4 h-4 text-foreground-muted" />
                    Prescrizione
                  </span>
                  <Badge variant="info">{wizardData.uso_prescrizione}</Badge>
                </div>
                <div className="bg-background-secondary rounded-lg overflow-hidden">
                  <table className="w-full text-xs font-mono">
                    <thead>
                      <tr className="bg-stone-200 dark:bg-stone-700">
                        <th className="p-1.5"></th>
                        <th className="p-1.5 text-primary">SPH</th>
                        <th className="p-1.5 text-primary">CYL</th>
                        <th className="p-1.5 text-primary">AX</th>
                        <th className="p-1.5 text-secondary">SPH</th>
                        <th className="p-1.5 text-secondary">CYL</th>
                        <th className="p-1.5 text-secondary">AX</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="p-1.5 font-bold text-blue-600">L</td>
                        <td className="p-1.5 text-center">{formatDiottria(wizardData.prescrizione.lontano.od_sph)}</td>
                        <td className="p-1.5 text-center">{formatDiottria(wizardData.prescrizione.lontano.od_cyl)}</td>
                        <td className="p-1.5 text-center">{wizardData.prescrizione.lontano.od_ax || '-'}</td>
                        <td className="p-1.5 text-center">{formatDiottria(wizardData.prescrizione.lontano.os_sph)}</td>
                        <td className="p-1.5 text-center">{formatDiottria(wizardData.prescrizione.lontano.os_cyl)}</td>
                        <td className="p-1.5 text-center">{wizardData.prescrizione.lontano.os_ax || '-'}</td>
                      </tr>
                      {wizardData.prescrizione.vicino.od_add && (
                        <tr className="border-t border-border">
                          <td className="p-1.5 font-bold text-green-600">V</td>
                          <td className="p-1.5 text-center">{formatDiottria(wizardData.prescrizione.vicino.od_sph)}</td>
                          <td className="p-1.5 text-center">{formatDiottria(wizardData.prescrizione.vicino.od_cyl)}</td>
                          <td className="p-1.5 text-center">{wizardData.prescrizione.vicino.od_ax || '-'}</td>
                          <td className="p-1.5 text-center">{formatDiottria(wizardData.prescrizione.vicino.os_sph)}</td>
                          <td className="p-1.5 text-center">{formatDiottria(wizardData.prescrizione.vicino.os_cyl)}</td>
                          <td className="p-1.5 text-center">{wizardData.prescrizione.vicino.os_ax || '-'}</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
                <div className="flex gap-4 mt-2 text-sm">
                  {wizardData.prescrizione.dip && <span className="text-blue-600">DIP: {wizardData.prescrizione.dip}mm</span>}
                  {wizardData.prescrizione.vicino.od_add && <span className="text-green-600">ADD: +{wizardData.prescrizione.vicino.od_add.toFixed(2)}</span>}
                </div>
              </div>
            )}

            {/* Montatura e Lenti */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Montatura */}
              <div className={clsx(
                'p-4 border rounded-lg',
                wizardData.montatura_tipo === 'cliente' ? 'border-blue-300 bg-blue-50/50 dark:bg-blue-900/10' :
                wizardData.montatura_tipo === 'libera' ? 'border-amber-300 bg-amber-50/50 dark:bg-amber-900/10' :
                'border-border'
              )}>
                <span className="font-medium flex items-center gap-2 mb-2">
                  {wizardData.montatura_tipo === 'cliente' ? (
                    <User className="w-4 h-4 text-blue-500" />
                  ) : wizardData.montatura_tipo === 'libera' ? (
                    <Edit2 className="w-4 h-4 text-amber-500" />
                  ) : (
                    <Glasses className="w-4 h-4 text-foreground-muted" />
                  )}
                  Montatura
                  {wizardData.montatura_tipo === 'cliente' && (
                    <Badge variant="info" size="sm">Del Cliente</Badge>
                  )}
                  {wizardData.montatura_tipo === 'libera' && (
                    <Badge variant="warning" size="sm">Libera</Badge>
                  )}
                </span>
                {wizardData.montatura_tipo === 'database' && wizardData.montatura && (
                  <>
                    <p className="font-semibold">{wizardData.montatura.nome}</p>
                    <p className="text-sm text-foreground-muted">{wizardData.montatura.marca} • {wizardData.montatura.colore}</p>
                    <p className="text-primary font-semibold mt-2">{formatCurrency(wizardData.montatura.prezzo)}</p>
                  </>
                )}
                {wizardData.montatura_tipo === 'cliente' && (
                  <>
                    <p className="font-semibold">{wizardData.montatura_cliente_descrizione}</p>
                    <p className="text-sm text-blue-600 dark:text-blue-400 mt-2">Prezzo: €0,00 (montatura del cliente)</p>
                  </>
                )}
                {wizardData.montatura_tipo === 'libera' && (
                  <>
                    <p className="font-semibold">{wizardData.montatura_libera_nome}</p>
                    <p className="text-primary font-semibold mt-2">{formatCurrency(wizardData.montatura_libera_prezzo)}</p>
                  </>
                )}
              </div>

              {/* Lenti */}
              <div className="p-4 border border-border rounded-lg">
                <span className="font-medium flex items-center gap-2 mb-2">
                  <CircleDot className="w-4 h-4 text-foreground-muted" />
                  Lenti
                </span>
                <p className="font-semibold">{tipiLente.find(t => t.value === wizardData.lente_tipo)?.label}</p>
                <p className="text-sm text-foreground-muted">
                  {materialiLente.find(m => m.value === wizardData.lente_materiale)?.label}
                </p>
                {wizardData.lente_trattamenti.length > 0 && (
                  <p className="text-xs text-foreground-muted mt-1">
                    Trattamenti: {wizardData.lente_trattamenti.map(t => trattamentiLente.find(tr => tr.value === t)?.label).join(', ')}
                  </p>
                )}
                <p className="text-primary font-semibold mt-2">{formatCurrency(calcolaPrezzolenti)}</p>
              </div>
            </div>

            {/* Sconti e Acconto */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                label="Sconto %"
                type="number"
                min="0"
                max="100"
                value={wizardData.sconto_percentuale || ''}
                onChange={(e) => setWizardData({ ...wizardData, sconto_percentuale: parseFloat(e.target.value) || 0 })}
                placeholder="0"
              />
              <Input
                label="Sconto Euro"
                type="number"
                min="0"
                step="0.01"
                value={wizardData.sconto_euro || ''}
                onChange={(e) => setWizardData({ ...wizardData, sconto_euro: parseFloat(e.target.value) || 0 })}
                placeholder="0.00"
              />
              <Input
                label="Acconto"
                type="number"
                min="0"
                step="0.01"
                value={wizardData.acconto || ''}
                onChange={(e) => setWizardData({ ...wizardData, acconto: parseFloat(e.target.value) || 0 })}
                placeholder="0.00"
              />
            </div>

            {/* Data Consegna e Note */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Data Consegna Prevista *"
                type="date"
                value={wizardData.data_consegna_prevista}
                onChange={(e) => setWizardData({ ...wizardData, data_consegna_prevista: e.target.value })}
              />
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Note Ordine</label>
                <textarea
                  value={wizardData.note}
                  onChange={(e) => setWizardData({ ...wizardData, note: e.target.value })}
                  className="input-base min-h-[42px]"
                  placeholder="Note per l'ordine..."
                />
              </div>
            </div>

            {/* TOTALE */}
            <div className="p-4 bg-primary/5 border-2 border-primary rounded-lg">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Montatura</span>
                  <span>{formatCurrency(calcolaTotale.montatura)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Lenti</span>
                  <span>{formatCurrency(calcolaTotale.lenti)}</span>
                </div>
                <hr className="border-border" />
                <div className="flex justify-between">
                  <span>Subtotale</span>
                  <span className="font-medium">{formatCurrency(calcolaTotale.subtotale)}</span>
                </div>
                {(calcolaTotale.scontoPerc > 0 || calcolaTotale.scontoEuro > 0) && (
                  <div className="flex justify-between text-sm text-success">
                    <span>Sconto</span>
                    <span>-{formatCurrency(calcolaTotale.scontoPerc + calcolaTotale.scontoEuro)}</span>
                  </div>
                )}
                <hr className="border-border" />
                <div className="flex justify-between text-xl font-bold">
                  <span>TOTALE</span>
                  <span className="text-primary">{formatCurrency(calcolaTotale.totale)}</span>
                </div>
                {wizardData.acconto > 0 && (
                  <>
                    <div className="flex justify-between text-sm">
                      <span>Acconto</span>
                      <span className="text-success">-{formatCurrency(wizardData.acconto)}</span>
                    </div>
                    <div className="flex justify-between font-semibold text-error">
                      <span>SALDO DOVUTO</span>
                      <span>{formatCurrency(calcolaTotale.saldo)}</span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {!wizardData.data_consegna_prevista && (
              <div className="flex items-center gap-2 p-3 bg-error/10 text-error rounded-lg text-sm">
                <AlertCircle className="w-4 h-4" />
                Inserisci la data di consegna prevista per procedere
              </div>
            )}
          </div>
        )

      default:
        return null
    }
  }

  // ============================================
  // RENDER
  // ============================================

  return (
    <MainLayout title="Ordini">
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground-muted" />
            <input
              type="text"
              placeholder="Cerca per numero ordine o cliente..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-base pl-10"
            />
          </div>

          <div className="flex gap-2">
            <Select
              value={statoFiltro}
              onChange={(e) => setStatoFiltro(e.target.value)}
              options={[
                { value: '', label: 'Tutti gli stati' },
                { value: 'nuovo', label: 'Nuovo' },
                { value: 'in_lavorazione', label: 'In Lavorazione' },
                { value: 'attesa_lenti', label: 'Attesa Lenti' },
                { value: 'pronto', label: 'Pronto' },
                { value: 'consegnato', label: 'Consegnato' },
              ]}
            />
            <Button
              variant="primary"
              size="sm"
              leftIcon={<Plus className="w-4 h-4" />}
              onClick={() => setIsWizardOpen(true)}
            >
              Nuovo Ordine
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {[
            { label: 'Totali', value: ordini.length, color: 'primary' },
            { label: 'Nuovi', value: ordini.filter((o) => o.stato === 'nuovo').length, color: 'info' },
            { label: 'In Lavorazione', value: ordini.filter((o) => o.stato === 'in_lavorazione').length, color: 'warning' },
            { label: 'Pronti', value: ordini.filter((o) => o.stato === 'pronto').length, color: 'success' },
            { label: 'Consegnati', value: ordini.filter((o) => o.stato === 'consegnato').length, color: 'neutral' },
          ].map((stat) => (
            <Card key={stat.label} padding="sm" className="text-center">
              <p className={clsx('text-2xl font-bold', stat.color === 'primary' && 'text-primary')}>{stat.value}</p>
              <p className="text-xs text-foreground-muted">{stat.label}</p>
            </Card>
          ))}
        </div>

        {/* Table */}
        <Card padding="none">
          <Table
            columns={columns}
            data={filteredOrdini}
            keyExtractor={(item) => item.id}
            onRowClick={(item) => {
              setSelectedOrdine(item)
              setIsViewModalOpen(true)
            }}
          />
        </Card>
      </div>

      {/* ============================================ */}
      {/* WIZARD MODAL */}
      {/* ============================================ */}
      <Modal
        isOpen={isWizardOpen}
        onClose={handleCloseWizard}
        title="Nuovo Ordine"
        size="xl"
        showClose={false}
      >
        <div className="space-y-6">
          {/* Steps Indicator */}
          <div className="flex items-center justify-between px-2">
            {steps.map((step, index) => {
              const Icon = step.icon
              const isActive = currentStep === step.id
              const isCompleted = currentStep > step.id
              return (
                <div key={step.id} className="flex items-center">
                  <div className="flex flex-col items-center">
                    <div
                      className={clsx(
                        'flex items-center justify-center w-10 h-10 rounded-full transition-colors',
                        isActive && 'bg-primary text-white',
                        isCompleted && 'bg-success text-white',
                        !isActive && !isCompleted && 'bg-background-secondary text-foreground-muted'
                      )}
                    >
                      {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                    </div>
                    <span className={clsx(
                      'text-xs mt-1 hidden sm:block',
                      isActive ? 'text-primary font-medium' : 'text-foreground-muted'
                    )}>
                      {step.name}
                    </span>
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={clsx(
                        'w-8 sm:w-16 h-1 mx-1 sm:mx-2 rounded',
                        isCompleted ? 'bg-success' : 'bg-background-secondary'
                      )}
                    />
                  )}
                </div>
              )
            })}
          </div>

          {/* Step Content */}
          <div className="min-h-[400px]">
            {renderStepContent()}
          </div>

          {/* Navigation */}
          <div className="flex justify-between pt-4 border-t border-border">
            <Button
              variant="ghost"
              onClick={currentStep === 1 ? handleCloseWizard : () => setCurrentStep(currentStep - 1)}
              leftIcon={<ChevronLeft className="w-4 h-4" />}
            >
              {currentStep === 1 ? 'Annulla' : 'Indietro'}
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                if (currentStep === 5) {
                  // TODO: Save order
                  handleCloseWizard()
                } else {
                  setCurrentStep(currentStep + 1)
                }
              }}
              disabled={!canProceed(currentStep)}
              rightIcon={currentStep < 5 ? <ChevronRight className="w-4 h-4" /> : undefined}
            >
              {currentStep === 5 ? 'Crea Ordine' : 'Avanti'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* ============================================ */}
      {/* VIEW MODAL */}
      {/* ============================================ */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        title="Dettaglio Ordine"
        size="lg"
      >
        {selectedOrdine && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold font-mono">{selectedOrdine.numero}</h3>
                <p className="text-sm text-foreground-muted">
                  {new Date(selectedOrdine.data_ordine).toLocaleDateString('it-IT')}
                </p>
              </div>
              <StatusBadge status={selectedOrdine.stato} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-foreground-muted uppercase">Cliente</label>
                <p className="font-medium">{selectedOrdine.cliente_nome}</p>
              </div>
              <div>
                <label className="text-xs text-foreground-muted uppercase">Montatura</label>
                <p className="font-medium">{selectedOrdine.montatura}</p>
              </div>
              <div>
                <label className="text-xs text-foreground-muted uppercase">Consegna Prevista</label>
                <p className="font-medium">
                  {new Date(selectedOrdine.data_consegna_prevista).toLocaleDateString('it-IT')}
                </p>
              </div>
              <div>
                <label className="text-xs text-foreground-muted uppercase">Totale</label>
                <p className="font-medium text-primary">{formatCurrency(selectedOrdine.totale)}</p>
              </div>
              <div>
                <label className="text-xs text-foreground-muted uppercase">Acconto</label>
                <p className="font-medium">{formatCurrency(selectedOrdine.acconto)}</p>
              </div>
              <div>
                <label className="text-xs text-foreground-muted uppercase">Saldo</label>
                <p className={clsx('font-medium', selectedOrdine.saldo > 0 && 'text-error')}>
                  {formatCurrency(selectedOrdine.saldo)}
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-border">
              <Button variant="ghost" onClick={() => setIsViewModalOpen(false)}>
                Chiudi
              </Button>
              <Button variant="outline" leftIcon={<Printer className="w-4 h-4" />}>
                Stampa
              </Button>
              <Button variant="primary" leftIcon={<Edit2 className="w-4 h-4" />}>
                Modifica
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </MainLayout>
  )
}

export default function OrdiniPage() {
  return (
    <Suspense fallback={
      <MainLayout title="Ordini">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </MainLayout>
    }>
      <OrdiniPageContent />
    </Suspense>
  )
}
