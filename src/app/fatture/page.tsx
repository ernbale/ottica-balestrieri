'use client'

import { useState } from 'react'
import { MainLayout } from '@/components/layout'
import { Card, Button, Input, Table, Badge, Modal, Select } from '@/components/ui'
import type { Column } from '@/components/ui/Table'
import {
  Plus,
  Search,
  Filter,
  Download,
  Eye,
  Printer,
  Send,
  FileText,
  User,
  Calendar,
  Euro,
  CheckCircle2,
  Clock,
  AlertCircle,
  XCircle,
} from 'lucide-react'
import { clsx } from 'clsx'

type StatoFattura = 'emessa' | 'pagata' | 'scaduta' | 'annullata'

interface Fattura {
  id: string
  numero: string
  cliente_nome: string
  cliente_piva: string
  data_fattura: string
  data_scadenza: string
  imponibile: number
  iva: number
  totale: number
  stato: StatoFattura
  sdi_stato: string | null
}

const mockFatture: Fattura[] = [
  {
    id: '1',
    numero: 'FT-2024/001',
    cliente_nome: 'Mario Rossi',
    cliente_piva: '12345678901',
    data_fattura: '2024-03-15',
    data_scadenza: '2024-04-15',
    imponibile: 368.85,
    iva: 81.15,
    totale: 450.00,
    stato: 'pagata',
    sdi_stato: 'Consegnata',
  },
  {
    id: '2',
    numero: 'FT-2024/002',
    cliente_nome: 'Azienda ABC Srl',
    cliente_piva: '98765432101',
    data_fattura: '2024-03-14',
    data_scadenza: '2024-04-14',
    imponibile: 262.30,
    iva: 57.70,
    totale: 320.00,
    stato: 'emessa',
    sdi_stato: 'In elaborazione',
  },
  {
    id: '3',
    numero: 'FT-2024/003',
    cliente_nome: 'Luigi Verdi',
    cliente_piva: '11122233344',
    data_fattura: '2024-02-28',
    data_scadenza: '2024-03-30',
    imponibile: 475.41,
    iva: 104.59,
    totale: 580.00,
    stato: 'scaduta',
    sdi_stato: 'Consegnata',
  },
  {
    id: '4',
    numero: 'FT-2024/004',
    cliente_nome: 'Sara Neri',
    cliente_piva: '55566677788',
    data_fattura: '2024-03-10',
    data_scadenza: '2024-04-10',
    imponibile: 237.70,
    iva: 52.30,
    totale: 290.00,
    stato: 'emessa',
    sdi_stato: 'Consegnata',
  },
]

const statoConfig: Record<StatoFattura, { label: string; color: string; icon: any }> = {
  emessa: { label: 'Emessa', color: 'info', icon: Clock },
  pagata: { label: 'Pagata', color: 'success', icon: CheckCircle2 },
  scaduta: { label: 'Scaduta', color: 'error', icon: AlertCircle },
  annullata: { label: 'Annullata', color: 'neutral', icon: XCircle },
}

export default function FatturePage() {
  const [fatture, setFatture] = useState(mockFatture)
  const [search, setSearch] = useState('')
  const [statoFiltro, setStatoFiltro] = useState<string>('')
  const [selectedFattura, setSelectedFattura] = useState<Fattura | null>(null)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [isNewModalOpen, setIsNewModalOpen] = useState(false)

  const filteredFatture = fatture.filter((f) => {
    const matchSearch =
      f.numero.toLowerCase().includes(search.toLowerCase()) ||
      f.cliente_nome.toLowerCase().includes(search.toLowerCase())
    const matchStato = !statoFiltro || f.stato === statoFiltro
    return matchSearch && matchStato
  })

  const totaleEmesse = fatture.filter((f) => f.stato === 'emessa').reduce((acc, f) => acc + f.totale, 0)
  const totalePagate = fatture.filter((f) => f.stato === 'pagata').reduce((acc, f) => acc + f.totale, 0)
  const totaleScadute = fatture.filter((f) => f.stato === 'scaduta').reduce((acc, f) => acc + f.totale, 0)

  const columns: Column<Fattura>[] = [
    {
      key: 'numero',
      header: 'Numero',
      render: (item) => (
        <div>
          <p className="font-mono text-sm text-primary font-medium">{item.numero}</p>
          <p className="text-xs text-foreground-muted">
            {new Date(item.data_fattura).toLocaleDateString('it-IT')}
          </p>
        </div>
      ),
    },
    {
      key: 'cliente',
      header: 'Cliente',
      render: (item) => (
        <div>
          <p className="font-medium">{item.cliente_nome}</p>
          <p className="text-xs text-foreground-muted font-mono">{item.cliente_piva}</p>
        </div>
      ),
    },
    {
      key: 'scadenza',
      header: 'Scadenza',
      render: (item) => {
        const isOverdue = new Date(item.data_scadenza) < new Date() && item.stato !== 'pagata'
        return (
          <span className={clsx('text-sm', isOverdue && 'text-error font-medium')}>
            {new Date(item.data_scadenza).toLocaleDateString('it-IT')}
          </span>
        )
      },
    },
    {
      key: 'totale',
      header: 'Importo',
      align: 'right',
      render: (item) => (
        <div className="text-right">
          <p className="font-medium">
            {item.totale.toLocaleString('it-IT', { style: 'currency', currency: 'EUR' })}
          </p>
          <p className="text-xs text-foreground-muted">
            IVA: {item.iva.toLocaleString('it-IT', { style: 'currency', currency: 'EUR' })}
          </p>
        </div>
      ),
    },
    {
      key: 'stato',
      header: 'Stato',
      render: (item) => {
        const config = statoConfig[item.stato]
        return (
          <Badge variant={config.color as any}>
            {config.label}
          </Badge>
        )
      },
    },
    {
      key: 'sdi',
      header: 'SDI',
      render: (item) => (
        <span className="text-sm text-foreground-muted">
          {item.sdi_stato || '-'}
        </span>
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
              setSelectedFattura(item)
              setIsViewModalOpen(true)
            }}
            className="p-2 rounded-lg hover:bg-background-secondary transition-colors"
          >
            <Eye className="w-4 h-4 text-foreground-muted" />
          </button>
          <button
            onClick={(e) => e.stopPropagation()}
            className="p-2 rounded-lg hover:bg-background-secondary transition-colors"
          >
            <Printer className="w-4 h-4 text-foreground-muted" />
          </button>
          <button
            onClick={(e) => e.stopPropagation()}
            className="p-2 rounded-lg hover:bg-background-secondary transition-colors"
          >
            <Download className="w-4 h-4 text-foreground-muted" />
          </button>
        </div>
      ),
    },
  ]

  return (
    <MainLayout title="Fatture">
      <div className="space-y-6 animate-fade-in">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card padding="sm">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <FileText className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{fatture.length}</p>
                <p className="text-sm text-foreground-muted">Totali</p>
              </div>
            </div>
          </Card>
          <Card padding="sm">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-info/10">
                <Clock className="w-5 h-5 text-info" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {totaleEmesse.toLocaleString('it-IT', { style: 'currency', currency: 'EUR' })}
                </p>
                <p className="text-sm text-foreground-muted">Da incassare</p>
              </div>
            </div>
          </Card>
          <Card padding="sm">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-success/10">
                <CheckCircle2 className="w-5 h-5 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {totalePagate.toLocaleString('it-IT', { style: 'currency', currency: 'EUR' })}
                </p>
                <p className="text-sm text-foreground-muted">Incassate</p>
              </div>
            </div>
          </Card>
          <Card padding="sm">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-error/10">
                <AlertCircle className="w-5 h-5 text-error" />
              </div>
              <div>
                <p className="text-2xl font-bold text-error">
                  {totaleScadute.toLocaleString('it-IT', { style: 'currency', currency: 'EUR' })}
                </p>
                <p className="text-sm text-foreground-muted">Scadute</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Header */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground-muted" />
            <input
              type="text"
              placeholder="Cerca per numero o cliente..."
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
                { value: 'emessa', label: 'Emessa' },
                { value: 'pagata', label: 'Pagata' },
                { value: 'scaduta', label: 'Scaduta' },
                { value: 'annullata', label: 'Annullata' },
              ]}
            />
            <Button variant="outline" size="sm" leftIcon={<Download className="w-4 h-4" />}>
              Esporta
            </Button>
            <Button
              variant="primary"
              size="sm"
              leftIcon={<Plus className="w-4 h-4" />}
              onClick={() => setIsNewModalOpen(true)}
            >
              Nuova Fattura
            </Button>
          </div>
        </div>

        {/* Table */}
        <Card padding="none">
          <Table
            columns={columns}
            data={filteredFatture}
            keyExtractor={(item) => item.id}
            onRowClick={(item) => {
              setSelectedFattura(item)
              setIsViewModalOpen(true)
            }}
          />
        </Card>
      </div>

      {/* View Modal */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        title="Dettaglio Fattura"
        size="lg"
      >
        {selectedFattura && (
          <div className="space-y-6">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-2xl font-bold font-mono">{selectedFattura.numero}</h3>
                <p className="text-foreground-muted">
                  Emessa il {new Date(selectedFattura.data_fattura).toLocaleDateString('it-IT')}
                </p>
              </div>
              <Badge variant={statoConfig[selectedFattura.stato].color as any} size="sm">
                {statoConfig[selectedFattura.stato].label}
              </Badge>
            </div>

            <Card className="bg-background-secondary/50">
              <div className="flex items-start gap-3">
                <User className="w-5 h-5 text-foreground-muted mt-0.5" />
                <div>
                  <p className="font-medium">{selectedFattura.cliente_nome}</p>
                  <p className="text-sm text-foreground-muted">P.IVA: {selectedFattura.cliente_piva}</p>
                </div>
              </div>
            </Card>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-foreground-muted uppercase">Data Emissione</label>
                <p className="font-medium">
                  {new Date(selectedFattura.data_fattura).toLocaleDateString('it-IT')}
                </p>
              </div>
              <div>
                <label className="text-xs text-foreground-muted uppercase">Data Scadenza</label>
                <p className={clsx(
                  'font-medium',
                  new Date(selectedFattura.data_scadenza) < new Date() && selectedFattura.stato !== 'pagata' && 'text-error'
                )}>
                  {new Date(selectedFattura.data_scadenza).toLocaleDateString('it-IT')}
                </p>
              </div>
            </div>

            <hr className="border-border" />

            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-foreground-muted">Imponibile:</span>
                <span>{selectedFattura.imponibile.toLocaleString('it-IT', { style: 'currency', currency: 'EUR' })}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-foreground-muted">IVA 22%:</span>
                <span>{selectedFattura.iva.toLocaleString('it-IT', { style: 'currency', currency: 'EUR' })}</span>
              </div>
              <hr className="border-border" />
              <div className="flex justify-between text-xl font-bold">
                <span>Totale:</span>
                <span className="text-primary">{selectedFattura.totale.toLocaleString('it-IT', { style: 'currency', currency: 'EUR' })}</span>
              </div>
            </div>

            <div>
              <label className="text-xs text-foreground-muted uppercase">Stato SDI</label>
              <p className="font-medium">{selectedFattura.sdi_stato || 'Non inviata'}</p>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-border">
              <Button variant="ghost" onClick={() => setIsViewModalOpen(false)}>
                Chiudi
              </Button>
              <Button variant="outline" leftIcon={<Printer className="w-4 h-4" />}>
                Stampa
              </Button>
              <Button variant="outline" leftIcon={<Download className="w-4 h-4" />}>
                PDF
              </Button>
              {selectedFattura.stato === 'emessa' && (
                <>
                  <Button variant="outline" leftIcon={<Send className="w-4 h-4" />}>
                    Invia SDI
                  </Button>
                  <Button
                    variant="primary"
                    onClick={() => {
                      setFatture(fatture.map((f) =>
                        f.id === selectedFattura.id ? { ...f, stato: 'pagata' as StatoFattura } : f
                      ))
                      setSelectedFattura({ ...selectedFattura, stato: 'pagata' })
                    }}
                  >
                    Segna Pagata
                  </Button>
                </>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* New Invoice Modal */}
      <Modal
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
        title="Nuova Fattura"
        size="lg"
      >
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Cliente"
              options={[
                { value: '1', label: 'Mario Rossi - 12345678901' },
                { value: '2', label: 'Azienda ABC Srl - 98765432101' },
                { value: '3', label: 'Luigi Verdi - 11122233344' },
              ]}
              placeholder="Seleziona cliente"
            />
            <Select
              label="Da Vendita"
              options={[
                { value: '', label: 'Nessuna (manuale)' },
                { value: '1', label: 'VEN-001 - 195.00' },
                { value: '2', label: 'VEN-002 - 53.00' },
              ]}
              placeholder="Collega vendita"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Data Fattura"
              type="date"
              defaultValue={new Date().toISOString().split('T')[0]}
            />
            <Input
              label="Data Scadenza"
              type="date"
            />
          </div>

          {/* Righe Fattura */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium">Righe Fattura</label>
              <Button variant="ghost" size="sm" leftIcon={<Plus className="w-4 h-4" />}>
                Aggiungi Riga
              </Button>
            </div>

            <div className="space-y-2">
              <div className="grid grid-cols-[1fr_80px_100px_80px_100px_40px] gap-2 text-xs text-foreground-muted uppercase">
                <span>Descrizione</span>
                <span>Qta</span>
                <span>Prezzo</span>
                <span>IVA</span>
                <span>Totale</span>
                <span></span>
              </div>
              <div className="grid grid-cols-[1fr_80px_100px_80px_100px_40px] gap-2 items-center">
                <Input placeholder="Descrizione prodotto/servizio" />
                <Input type="number" defaultValue="1" />
                <Input type="number" placeholder="0.00" />
                <Select
                  options={[
                    { value: '22', label: '22%' },
                    { value: '10', label: '10%' },
                    { value: '4', label: '4%' },
                  ]}
                  defaultValue="22"
                />
                <span className="text-right font-medium">0.00</span>
                <button className="p-2 rounded hover:bg-error/10 text-error">
                  <XCircle className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          <Card className="bg-background-secondary/50">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-foreground-muted">Imponibile:</span>
                <span>0.00</span>
              </div>
              <div className="flex justify-between">
                <span className="text-foreground-muted">IVA:</span>
                <span>0.00</span>
              </div>
              <hr className="border-border" />
              <div className="flex justify-between text-lg font-bold">
                <span>Totale:</span>
                <span className="text-primary">0.00</span>
              </div>
            </div>
          </Card>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Note</label>
            <textarea
              className="input-base min-h-[60px]"
              placeholder="Note fattura..."
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <Button variant="ghost" onClick={() => setIsNewModalOpen(false)}>
              Annulla
            </Button>
            <Button variant="outline">
              Salva Bozza
            </Button>
            <Button variant="primary">
              Emetti Fattura
            </Button>
          </div>
        </div>
      </Modal>
    </MainLayout>
  )
}
