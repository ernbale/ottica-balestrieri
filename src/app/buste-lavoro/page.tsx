'use client'

import { useState } from 'react'
import { MainLayout } from '@/components/layout'
import { Card, Button, Badge, Modal, Input, Select } from '@/components/ui'
import {
  Plus,
  Search,
  Filter,
  Clock,
  User,
  Glasses,
  CheckCircle2,
  AlertTriangle,
  GripVertical,
  Eye,
  Calendar,
  ChevronDown,
} from 'lucide-react'
import { clsx } from 'clsx'

type StatoBusta = 'da_iniziare' | 'in_lavorazione' | 'in_attesa' | 'completata'
type Priorita = 'bassa' | 'normale' | 'alta' | 'urgente'

interface BustaLavoro {
  id: string
  numero: string
  ordine_numero: string
  cliente_nome: string
  montatura: string
  stato: StatoBusta
  priorita: Priorita
  assegnato_a: string | null
  data_consegna: string
  note: string | null
  checklist: { item: string; completato: boolean }[]
}

const mockBuste: BustaLavoro[] = [
  {
    id: '1',
    numero: 'BL-001',
    ordine_numero: 'ORD-2024001',
    cliente_nome: 'Mario Rossi',
    montatura: 'Ray-Ban RB5154',
    stato: 'da_iniziare',
    priorita: 'alta',
    assegnato_a: null,
    data_consegna: '2024-03-22',
    note: 'Lenti progressive',
    checklist: [
      { item: 'Verifica prescrizione', completato: false },
      { item: 'Ordine lenti', completato: false },
      { item: 'Montaggio', completato: false },
      { item: 'Controllo qualita', completato: false },
    ],
  },
  {
    id: '2',
    numero: 'BL-002',
    ordine_numero: 'ORD-2024002',
    cliente_nome: 'Anna Bianchi',
    montatura: 'Oakley OX8046',
    stato: 'in_lavorazione',
    priorita: 'normale',
    assegnato_a: 'Marco',
    data_consegna: '2024-03-21',
    note: null,
    checklist: [
      { item: 'Verifica prescrizione', completato: true },
      { item: 'Ordine lenti', completato: true },
      { item: 'Montaggio', completato: false },
      { item: 'Controllo qualita', completato: false },
    ],
  },
  {
    id: '3',
    numero: 'BL-003',
    ordine_numero: 'ORD-2024003',
    cliente_nome: 'Luigi Verdi',
    montatura: 'Persol PO3007V',
    stato: 'in_attesa',
    priorita: 'urgente',
    assegnato_a: 'Giulia',
    data_consegna: '2024-03-20',
    note: 'In attesa lenti dal fornitore',
    checklist: [
      { item: 'Verifica prescrizione', completato: true },
      { item: 'Ordine lenti', completato: true },
      { item: 'Montaggio', completato: false },
      { item: 'Controllo qualita', completato: false },
    ],
  },
  {
    id: '4',
    numero: 'BL-004',
    ordine_numero: 'ORD-2024004',
    cliente_nome: 'Sara Neri',
    montatura: 'Gucci GG0027O',
    stato: 'completata',
    priorita: 'normale',
    assegnato_a: 'Marco',
    data_consegna: '2024-03-19',
    note: null,
    checklist: [
      { item: 'Verifica prescrizione', completato: true },
      { item: 'Ordine lenti', completato: true },
      { item: 'Montaggio', completato: true },
      { item: 'Controllo qualita', completato: true },
    ],
  },
  {
    id: '5',
    numero: 'BL-005',
    ordine_numero: 'ORD-2024005',
    cliente_nome: 'Paolo Bianchi',
    montatura: 'Tom Ford FT5401',
    stato: 'in_lavorazione',
    priorita: 'bassa',
    assegnato_a: 'Giulia',
    data_consegna: '2024-03-25',
    note: null,
    checklist: [
      { item: 'Verifica prescrizione', completato: true },
      { item: 'Ordine lenti', completato: false },
      { item: 'Montaggio', completato: false },
      { item: 'Controllo qualita', completato: false },
    ],
  },
]

const colonne: { stato: StatoBusta; titolo: string; colore: string }[] = [
  { stato: 'da_iniziare', titolo: 'Da Iniziare', colore: 'bg-blue-500' },
  { stato: 'in_lavorazione', titolo: 'In Lavorazione', colore: 'bg-amber-500' },
  { stato: 'in_attesa', titolo: 'In Attesa', colore: 'bg-orange-500' },
  { stato: 'completata', titolo: 'Completata', colore: 'bg-green-500' },
]

const prioritaConfig: Record<Priorita, { label: string; color: string; badge: string }> = {
  bassa: { label: 'Bassa', color: 'text-foreground-muted', badge: 'neutral' },
  normale: { label: 'Normale', color: 'text-info', badge: 'info' },
  alta: { label: 'Alta', color: 'text-warning', badge: 'warning' },
  urgente: { label: 'Urgente', color: 'text-error', badge: 'error' },
}

export default function BusteLavoroPage() {
  const [buste, setBuste] = useState(mockBuste)
  const [search, setSearch] = useState('')
  const [selectedBusta, setSelectedBusta] = useState<BustaLavoro | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [draggedBusta, setDraggedBusta] = useState<BustaLavoro | null>(null)

  const filteredBuste = buste.filter(
    (b) =>
      b.numero.toLowerCase().includes(search.toLowerCase()) ||
      b.cliente_nome.toLowerCase().includes(search.toLowerCase()) ||
      b.ordine_numero.toLowerCase().includes(search.toLowerCase())
  )

  const getBusteByStato = (stato: StatoBusta) =>
    filteredBuste.filter((b) => b.stato === stato)

  const handleDragStart = (busta: BustaLavoro) => {
    setDraggedBusta(busta)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (stato: StatoBusta) => {
    if (draggedBusta) {
      setBuste(buste.map((b) =>
        b.id === draggedBusta.id ? { ...b, stato } : b
      ))
      setDraggedBusta(null)
    }
  }

  const getChecklistProgress = (checklist: BustaLavoro['checklist']) => {
    const completed = checklist.filter((c) => c.completato).length
    return { completed, total: checklist.length }
  }

  const isOverdue = (data: string) => {
    return new Date(data) < new Date()
  }

  return (
    <MainLayout title="Buste Lavoro">
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground-muted" />
            <input
              type="text"
              placeholder="Cerca per numero, cliente, ordine..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-base pl-10"
            />
          </div>

          <div className="flex gap-2">
            <Button variant="outline" size="sm" leftIcon={<Filter className="w-4 h-4" />}>
              Filtri
            </Button>
            <Button variant="primary" size="sm" leftIcon={<Plus className="w-4 h-4" />}>
              Nuova Busta
            </Button>
          </div>
        </div>

        {/* Kanban Board */}
        <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 md:mx-0 md:px-0">
          {colonne.map((colonna) => {
            const busteColonna = getBusteByStato(colonna.stato)
            return (
              <div
                key={colonna.stato}
                className="kanban-column flex-shrink-0 flex flex-col"
                onDragOver={handleDragOver}
                onDrop={() => handleDrop(colonna.stato)}
              >
                {/* Column Header */}
                <div className="p-4 border-b border-border">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={clsx('w-3 h-3 rounded-full', colonna.colore)} />
                      <h3 className="font-semibold text-foreground">{colonna.titolo}</h3>
                    </div>
                    <span className="text-sm text-foreground-muted bg-background-secondary px-2 py-0.5 rounded-full">
                      {busteColonna.length}
                    </span>
                  </div>
                </div>

                {/* Cards */}
                <div className="flex-1 p-3 space-y-3 overflow-y-auto max-h-[calc(100vh-320px)]">
                  {busteColonna.length === 0 ? (
                    <div className="text-center py-8 text-foreground-muted text-sm">
                      Nessuna busta
                    </div>
                  ) : (
                    busteColonna.map((busta) => {
                      const progress = getChecklistProgress(busta.checklist)
                      const overdue = isOverdue(busta.data_consegna) && busta.stato !== 'completata'

                      return (
                        <div
                          key={busta.id}
                          draggable
                          onDragStart={() => handleDragStart(busta)}
                          onClick={() => {
                            setSelectedBusta(busta)
                            setIsModalOpen(true)
                          }}
                          className={clsx(
                            'kanban-card',
                            draggedBusta?.id === busta.id && 'opacity-50',
                            overdue && 'border-error/50'
                          )}
                        >
                          {/* Header */}
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <GripVertical className="w-4 h-4 text-foreground-muted cursor-grab" />
                              <span className="font-mono text-xs text-primary">{busta.numero}</span>
                            </div>
                            <Badge
                              variant={prioritaConfig[busta.priorita].badge as any}
                              size="sm"
                            >
                              {prioritaConfig[busta.priorita].label}
                            </Badge>
                          </div>

                          {/* Cliente */}
                          <div className="flex items-center gap-2 mb-2">
                            <User className="w-4 h-4 text-foreground-muted" />
                            <span className="font-medium text-sm truncate">{busta.cliente_nome}</span>
                          </div>

                          {/* Montatura */}
                          <div className="flex items-center gap-2 mb-3 text-sm text-foreground-muted">
                            <Glasses className="w-4 h-4" />
                            <span className="truncate">{busta.montatura}</span>
                          </div>

                          {/* Progress */}
                          <div className="mb-3">
                            <div className="flex items-center justify-between text-xs mb-1">
                              <span className="text-foreground-muted">Progresso</span>
                              <span className="font-medium">{progress.completed}/{progress.total}</span>
                            </div>
                            <div className="w-full h-1.5 bg-background-secondary rounded-full overflow-hidden">
                              <div
                                className="h-full bg-primary rounded-full transition-all"
                                style={{ width: `${(progress.completed / progress.total) * 100}%` }}
                              />
                            </div>
                          </div>

                          {/* Footer */}
                          <div className="flex items-center justify-between text-xs">
                            <div className={clsx(
                              'flex items-center gap-1',
                              overdue ? 'text-error' : 'text-foreground-muted'
                            )}>
                              {overdue && <AlertTriangle className="w-3 h-3" />}
                              <Calendar className="w-3 h-3" />
                              <span>{new Date(busta.data_consegna).toLocaleDateString('it-IT')}</span>
                            </div>
                            {busta.assegnato_a && (
                              <div className="flex items-center gap-1 text-foreground-muted">
                                <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center text-xs font-medium text-primary">
                                  {busta.assegnato_a.charAt(0)}
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Note */}
                          {busta.note && (
                            <div className="mt-2 pt-2 border-t border-border text-xs text-foreground-muted">
                              {busta.note}
                            </div>
                          )}
                        </div>
                      )
                    })
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Detail Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedBusta?.numero || 'Dettaglio Busta'}
        size="lg"
      >
        {selectedBusta && (
          <div className="space-y-6">
            {/* Header Info */}
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-foreground-muted">Ordine: {selectedBusta.ordine_numero}</p>
                <h3 className="text-xl font-semibold">{selectedBusta.cliente_nome}</h3>
                <p className="text-foreground-muted">{selectedBusta.montatura}</p>
              </div>
              <Badge
                variant={prioritaConfig[selectedBusta.priorita].badge as any}
              >
                Priorita: {prioritaConfig[selectedBusta.priorita].label}
              </Badge>
            </div>

            {/* Status & Assignment */}
            <div className="grid grid-cols-2 gap-4">
              <Select
                label="Stato"
                value={selectedBusta.stato}
                options={colonne.map((c) => ({ value: c.stato, label: c.titolo }))}
                onChange={(e) => {
                  setBuste(buste.map((b) =>
                    b.id === selectedBusta.id
                      ? { ...b, stato: e.target.value as StatoBusta }
                      : b
                  ))
                  setSelectedBusta({ ...selectedBusta, stato: e.target.value as StatoBusta })
                }}
              />
              <Select
                label="Assegnato a"
                value={selectedBusta.assegnato_a || ''}
                options={[
                  { value: '', label: 'Non assegnato' },
                  { value: 'Marco', label: 'Marco' },
                  { value: 'Giulia', label: 'Giulia' },
                  { value: 'Luca', label: 'Luca' },
                ]}
                onChange={(e) => {
                  setBuste(buste.map((b) =>
                    b.id === selectedBusta.id
                      ? { ...b, assegnato_a: e.target.value || null }
                      : b
                  ))
                  setSelectedBusta({ ...selectedBusta, assegnato_a: e.target.value || null })
                }}
              />
            </div>

            {/* Checklist */}
            <div>
              <h4 className="font-medium text-foreground mb-3">Checklist Lavorazione</h4>
              <div className="space-y-2">
                {selectedBusta.checklist.map((item, index) => (
                  <label
                    key={index}
                    className={clsx(
                      'flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors',
                      item.completato
                        ? 'bg-success/5 border-success/30'
                        : 'bg-background-secondary/50 border-border hover:border-primary/50'
                    )}
                  >
                    <input
                      type="checkbox"
                      checked={item.completato}
                      onChange={(e) => {
                        const newChecklist = [...selectedBusta.checklist]
                        newChecklist[index].completato = e.target.checked
                        setBuste(buste.map((b) =>
                          b.id === selectedBusta.id
                            ? { ...b, checklist: newChecklist }
                            : b
                        ))
                        setSelectedBusta({ ...selectedBusta, checklist: newChecklist })
                      }}
                      className="w-4 h-4 rounded border-border text-success focus:ring-success"
                    />
                    <span className={clsx(
                      'flex-1',
                      item.completato && 'line-through text-foreground-muted'
                    )}>
                      {item.item}
                    </span>
                    {item.completato && (
                      <CheckCircle2 className="w-4 h-4 text-success" />
                    )}
                  </label>
                ))}
              </div>
            </div>

            {/* Date */}
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Data Consegna Prevista"
                type="date"
                value={selectedBusta.data_consegna}
                readOnly
              />
            </div>

            {/* Note */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Note</label>
              <textarea
                value={selectedBusta.note || ''}
                onChange={(e) => {
                  setBuste(buste.map((b) =>
                    b.id === selectedBusta.id
                      ? { ...b, note: e.target.value || null }
                      : b
                  ))
                  setSelectedBusta({ ...selectedBusta, note: e.target.value || null })
                }}
                className="input-base min-h-[80px]"
                placeholder="Note sulla lavorazione..."
              />
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t border-border">
              <Button variant="ghost" onClick={() => setIsModalOpen(false)}>
                Chiudi
              </Button>
              <Button variant="outline" leftIcon={<Eye className="w-4 h-4" />}>
                Vedi Ordine
              </Button>
              <Button variant="primary">
                Salva
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </MainLayout>
  )
}
