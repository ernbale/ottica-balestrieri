'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { MainLayout } from '@/components/layout'
import { Card, Button, Input, Table, Modal, Badge } from '@/components/ui'
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
} from 'lucide-react'
import { clsx } from 'clsx'

// Mock data
const mockClienti = [
  {
    id: '1',
    codice: 'CLI-001',
    nome: 'Mario',
    cognome: 'Rossi',
    telefono: '333 1234567',
    cellulare: '333 1234567',
    email: 'mario.rossi@email.it',
    citta: 'Milano',
    data_nascita: '1985-03-15',
    created_at: '2024-01-15',
    prescrizioni: 3,
    ordini: 5,
  },
  {
    id: '2',
    codice: 'CLI-002',
    nome: 'Anna',
    cognome: 'Bianchi',
    telefono: '02 9876543',
    cellulare: '339 8765432',
    email: 'anna.bianchi@email.it',
    citta: 'Roma',
    data_nascita: '1990-07-22',
    created_at: '2024-02-10',
    prescrizioni: 2,
    ordini: 3,
  },
  {
    id: '3',
    codice: 'CLI-003',
    nome: 'Luigi',
    cognome: 'Verdi',
    telefono: '',
    cellulare: '340 1122334',
    email: 'luigi.verdi@email.it',
    citta: 'Napoli',
    data_nascita: '1978-11-08',
    created_at: '2024-03-05',
    prescrizioni: 1,
    ordini: 2,
  },
  {
    id: '4',
    codice: 'CLI-004',
    nome: 'Sara',
    cognome: 'Neri',
    telefono: '06 5544332',
    cellulare: '347 9988776',
    email: 'sara.neri@email.it',
    citta: 'Torino',
    data_nascita: '1995-01-30',
    created_at: '2024-03-20',
    prescrizioni: 0,
    ordini: 1,
  },
]

type Cliente = typeof mockClienti[0]

interface ClienteFormData {
  nome: string
  cognome: string
  data_nascita: string
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

export default function ClientiPage() {
  const searchParams = useSearchParams()
  const [clienti, setClienti] = useState(mockClienti)
  const [search, setSearch] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [selectedCliente, setSelectedCliente] = useState<Cliente | null>(null)
  const [formData, setFormData] = useState<ClienteFormData>(emptyForm)
  const [isEditing, setIsEditing] = useState(false)

  useEffect(() => {
    if (searchParams.get('nuovo') === 'true') {
      handleNewCliente()
    }
  }, [searchParams])

  const filteredClienti = clienti.filter(
    (c) =>
      c.nome.toLowerCase().includes(search.toLowerCase()) ||
      c.cognome.toLowerCase().includes(search.toLowerCase()) ||
      c.codice.toLowerCase().includes(search.toLowerCase()) ||
      c.email?.toLowerCase().includes(search.toLowerCase()) ||
      c.cellulare?.includes(search) ||
      c.telefono?.includes(search)
  )

  const handleNewCliente = () => {
    setFormData(emptyForm)
    setIsEditing(false)
    setIsModalOpen(true)
  }

  const handleEditCliente = (cliente: Cliente) => {
    setFormData({
      nome: cliente.nome,
      cognome: cliente.cognome,
      data_nascita: cliente.data_nascita || '',
      codice_fiscale: '',
      telefono: cliente.telefono || '',
      cellulare: cliente.cellulare || '',
      email: cliente.email || '',
      indirizzo: '',
      citta: cliente.citta || '',
      cap: '',
      provincia: '',
      note: '',
      consenso_privacy: true,
      consenso_marketing: false,
    })
    setSelectedCliente(cliente)
    setIsEditing(true)
    setIsModalOpen(true)
  }

  const handleViewCliente = (cliente: Cliente) => {
    setSelectedCliente(cliente)
    setIsViewModalOpen(true)
  }

  const handleSave = () => {
    // Simulate save
    setIsModalOpen(false)
    setFormData(emptyForm)
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
          <p className="text-sm text-foreground-muted">{item.citta}</p>
        </div>
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
      key: 'stats',
      header: 'Attivita',
      render: (item) => (
        <div className="flex gap-2">
          <Badge variant="primary" size="sm">
            {item.prescrizioni} Rx
          </Badge>
          <Badge variant="secondary" size="sm">
            {item.ordini} Ordini
          </Badge>
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
        </div>
      ),
    },
  ]

  return (
    <MainLayout title="Clienti">
      <div className="space-y-6 animate-fade-in">
        {/* Header Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground-muted" />
            <input
              type="text"
              placeholder="Cerca per nome, codice, telefono..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-base pl-10"
            />
          </div>

          <div className="flex gap-2">
            <Button variant="outline" size="sm" leftIcon={<Filter className="w-4 h-4" />}>
              Filtri
            </Button>
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
            <p className="text-2xl font-bold text-foreground">{clienti.length}</p>
            <p className="text-sm text-foreground-muted">Clienti Totali</p>
          </Card>
          <Card padding="sm" className="text-center">
            <p className="text-2xl font-bold text-primary">12</p>
            <p className="text-sm text-foreground-muted">Nuovi questo mese</p>
          </Card>
          <Card padding="sm" className="text-center">
            <p className="text-2xl font-bold text-secondary">45</p>
            <p className="text-sm text-foreground-muted">Con prescrizioni</p>
          </Card>
          <Card padding="sm" className="text-center">
            <p className="text-2xl font-bold text-success">89%</p>
            <p className="text-sm text-foreground-muted">Tasso fidelizzazione</p>
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
              <Input
                label="Codice Fiscale"
                value={formData.codice_fiscale}
                onChange={(e) => setFormData({ ...formData, codice_fiscale: e.target.value.toUpperCase() })}
                maxLength={16}
                placeholder="RSSMRA85C15F205X"
              />
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
              Indirizzo
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
                label="Citta"
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
                    Il cliente acconsente al trattamento dei dati personali
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
                    Il cliente acconsente a ricevere comunicazioni commerciali
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <Button variant="ghost" onClick={() => setIsModalOpen(false)}>
              Annulla
            </Button>
            <Button variant="primary" onClick={handleSave}>
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
              <div>
                <h3 className="text-xl font-semibold text-foreground">
                  {selectedCliente.cognome} {selectedCliente.nome}
                </h3>
                <p className="text-sm text-foreground-muted font-mono">{selectedCliente.codice}</p>
                <div className="flex gap-2 mt-2">
                  <Badge variant="primary">{selectedCliente.prescrizioni} Prescrizioni</Badge>
                  <Badge variant="secondary">{selectedCliente.ordini} Ordini</Badge>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4">
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
                  <label className="text-xs text-foreground-muted uppercase tracking-wider">Citta</label>
                  <p className="text-foreground">{selectedCliente.citta || '-'}</p>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-border">
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
        )}
      </Modal>
    </MainLayout>
  )
}
