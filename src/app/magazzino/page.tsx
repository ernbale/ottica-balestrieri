'use client'

import { useState } from 'react'
import { MainLayout } from '@/components/layout'
import { Card, CardHeader, Button, Input, Select, Modal, Table, Badge } from '@/components/ui'
import type { Column } from '@/components/ui/Table'
import {
  Plus,
  Search,
  Filter,
  Download,
  Eye,
  Edit2,
  Package,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Glasses,
  Sun,
  CircleDot,
  Sparkles,
} from 'lucide-react'
import { clsx } from 'clsx'

// Mock data
const categorie = [
  { id: '1', nome: 'Montature Vista', tipo: 'montatura', icon: Glasses, color: 'primary' },
  { id: '2', nome: 'Montature Sole', tipo: 'sole', icon: Sun, color: 'secondary' },
  { id: '3', nome: 'Lenti Oftalmiche', tipo: 'lente', icon: CircleDot, color: 'info' },
  { id: '4', nome: 'Lenti a Contatto', tipo: 'lac', icon: CircleDot, color: 'success' },
  { id: '5', nome: 'Accessori', tipo: 'accessorio', icon: Sparkles, color: 'warning' },
]

const mockProdotti = [
  {
    id: '1',
    codice: 'MV-001',
    nome: 'Ray-Ban RB5154',
    marca: 'Ray-Ban',
    modello: 'RB5154',
    colore: 'Tartaruga',
    categoria: 'Montature Vista',
    categoria_tipo: 'montatura',
    prezzo_vendita: 180.00,
    prezzo_acquisto: 95.00,
    quantita: 5,
    quantita_minima: 2,
  },
  {
    id: '2',
    codice: 'MS-001',
    nome: 'Oakley Holbrook',
    marca: 'Oakley',
    modello: 'Holbrook',
    colore: 'Nero',
    categoria: 'Montature Sole',
    categoria_tipo: 'sole',
    prezzo_vendita: 150.00,
    prezzo_acquisto: 80.00,
    quantita: 3,
    quantita_minima: 2,
  },
  {
    id: '3',
    codice: 'LO-001',
    nome: 'Essilor Varilux X',
    marca: 'Essilor',
    modello: 'Varilux X',
    colore: '',
    categoria: 'Lenti Oftalmiche',
    categoria_tipo: 'lente',
    prezzo_vendita: 350.00,
    prezzo_acquisto: 180.00,
    quantita: 10,
    quantita_minima: 5,
  },
  {
    id: '4',
    codice: 'LC-001',
    nome: 'Acuvue Oasys',
    marca: 'Johnson & Johnson',
    modello: 'Acuvue Oasys',
    colore: '',
    categoria: 'Lenti a Contatto',
    categoria_tipo: 'lac',
    prezzo_vendita: 45.00,
    prezzo_acquisto: 25.00,
    quantita: 1,
    quantita_minima: 5,
  },
  {
    id: '5',
    codice: 'AC-001',
    nome: 'Spray Pulizia',
    marca: 'Generic',
    modello: '',
    colore: '',
    categoria: 'Accessori',
    categoria_tipo: 'accessorio',
    prezzo_vendita: 8.00,
    prezzo_acquisto: 3.00,
    quantita: 25,
    quantita_minima: 10,
  },
]

type Prodotto = typeof mockProdotti[0]

export default function MagazzinoPage() {
  const [prodotti, setProdotti] = useState(mockProdotti)
  const [search, setSearch] = useState('')
  const [categoriaFiltro, setCategoriaFiltro] = useState<string>('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedProdotto, setSelectedProdotto] = useState<Prodotto | null>(null)

  const filteredProdotti = prodotti.filter((p) => {
    const matchSearch =
      p.nome.toLowerCase().includes(search.toLowerCase()) ||
      p.codice.toLowerCase().includes(search.toLowerCase()) ||
      p.marca?.toLowerCase().includes(search.toLowerCase())
    const matchCategoria = !categoriaFiltro || p.categoria_tipo === categoriaFiltro
    return matchSearch && matchCategoria
  })

  const sottoscorta = prodotti.filter((p) => p.quantita <= p.quantita_minima)
  const valoreMagazzino = prodotti.reduce((acc, p) => acc + p.prezzo_acquisto * p.quantita, 0)
  const valoreVendita = prodotti.reduce((acc, p) => acc + p.prezzo_vendita * p.quantita, 0)

  const getCategoriaColor = (tipo: string) => {
    const cat = categorie.find((c) => c.tipo === tipo)
    return cat?.color || 'neutral'
  }

  const columns: Column<Prodotto>[] = [
    {
      key: 'codice',
      header: 'Codice',
      render: (item) => (
        <span className="font-mono text-sm text-primary">{item.codice}</span>
      ),
    },
    {
      key: 'nome',
      header: 'Prodotto',
      render: (item) => (
        <div>
          <p className="font-medium text-foreground">{item.nome}</p>
          <p className="text-sm text-foreground-muted">
            {item.marca} {item.modello && `- ${item.modello}`}
          </p>
        </div>
      ),
    },
    {
      key: 'categoria',
      header: 'Categoria',
      render: (item) => (
        <Badge variant={getCategoriaColor(item.categoria_tipo) as any} size="sm">
          {item.categoria}
        </Badge>
      ),
    },
    {
      key: 'prezzo',
      header: 'Prezzo',
      align: 'right',
      render: (item) => (
        <div className="text-right">
          <p className="font-medium">
            {item.prezzo_vendita.toLocaleString('it-IT', { style: 'currency', currency: 'EUR' })}
          </p>
          <p className="text-xs text-foreground-muted">
            Acq: {item.prezzo_acquisto.toLocaleString('it-IT', { style: 'currency', currency: 'EUR' })}
          </p>
        </div>
      ),
    },
    {
      key: 'quantita',
      header: 'Giacenza',
      align: 'center',
      render: (item) => (
        <div className="flex items-center justify-center gap-2">
          <span
            className={clsx(
              'font-medium',
              item.quantita <= item.quantita_minima ? 'text-error' : 'text-foreground'
            )}
          >
            {item.quantita}
          </span>
          {item.quantita <= item.quantita_minima && (
            <AlertTriangle className="w-4 h-4 text-error" />
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
              setSelectedProdotto(item)
              setIsModalOpen(true)
            }}
            className="p-2 rounded-lg hover:bg-background-secondary transition-colors"
          >
            <Edit2 className="w-4 h-4 text-foreground-muted" />
          </button>
        </div>
      ),
    },
  ]

  return (
    <MainLayout title="Magazzino">
      <div className="space-y-6 animate-fade-in">
        {/* Category Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          <button
            onClick={() => setCategoriaFiltro('')}
            className={clsx(
              'px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors',
              !categoriaFiltro
                ? 'bg-primary text-white'
                : 'bg-background-secondary text-foreground-secondary hover:bg-background-secondary/80'
            )}
          >
            Tutti
          </button>
          {categorie.map((cat) => {
            const Icon = cat.icon
            return (
              <button
                key={cat.id}
                onClick={() => setCategoriaFiltro(cat.tipo)}
                className={clsx(
                  'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors',
                  categoriaFiltro === cat.tipo
                    ? 'bg-primary text-white'
                    : 'bg-background-secondary text-foreground-secondary hover:bg-background-secondary/80'
                )}
              >
                <Icon className="w-4 h-4" />
                {cat.nome}
              </button>
            )
          })}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card padding="sm">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Package className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{prodotti.length}</p>
                <p className="text-sm text-foreground-muted">Prodotti</p>
              </div>
            </div>
          </Card>
          <Card padding="sm">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-error/10">
                <AlertTriangle className="w-5 h-5 text-error" />
              </div>
              <div>
                <p className="text-2xl font-bold text-error">{sottoscorta.length}</p>
                <p className="text-sm text-foreground-muted">Sottoscorta</p>
              </div>
            </div>
          </Card>
          <Card padding="sm">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-secondary/10">
                <TrendingDown className="w-5 h-5 text-secondary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {valoreMagazzino.toLocaleString('it-IT', { style: 'currency', currency: 'EUR' })}
                </p>
                <p className="text-sm text-foreground-muted">Valore Acquisto</p>
              </div>
            </div>
          </Card>
          <Card padding="sm">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-success/10">
                <TrendingUp className="w-5 h-5 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {valoreVendita.toLocaleString('it-IT', { style: 'currency', currency: 'EUR' })}
                </p>
                <p className="text-sm text-foreground-muted">Valore Vendita</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Header Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground-muted" />
            <input
              type="text"
              placeholder="Cerca per codice, nome, marca..."
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
              onClick={() => {
                setSelectedProdotto(null)
                setIsModalOpen(true)
              }}
            >
              Nuovo Prodotto
            </Button>
          </div>
        </div>

        {/* Sottoscorta Alert */}
        {sottoscorta.length > 0 && (
          <Card className="border-error/30 bg-error/5" padding="sm">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-error" />
              <p className="text-sm">
                <span className="font-medium text-error">{sottoscorta.length} prodotti</span>
                <span className="text-foreground-muted"> sotto la quantita minima: </span>
                <span className="text-foreground">{sottoscorta.map((p) => p.nome).join(', ')}</span>
              </p>
            </div>
          </Card>
        )}

        {/* Table */}
        <Card padding="none">
          <Table
            columns={columns}
            data={filteredProdotti}
            keyExtractor={(item) => item.id}
            onRowClick={(item) => {
              setSelectedProdotto(item)
              setIsModalOpen(true)
            }}
            emptyMessage="Nessun prodotto trovato"
          />
        </Card>
      </div>

      {/* Product Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedProdotto ? 'Modifica Prodotto' : 'Nuovo Prodotto'}
        size="lg"
      >
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Codice *"
              defaultValue={selectedProdotto?.codice || ''}
              placeholder="MV-001"
            />
            <Select
              label="Categoria *"
              defaultValue={selectedProdotto?.categoria_tipo || ''}
              options={categorie.map((c) => ({ value: c.tipo, label: c.nome }))}
              placeholder="Seleziona categoria"
            />
            <Input
              label="Nome *"
              defaultValue={selectedProdotto?.nome || ''}
              placeholder="Nome prodotto"
              className="md:col-span-2"
            />
            <Input
              label="Marca"
              defaultValue={selectedProdotto?.marca || ''}
              placeholder="Ray-Ban"
            />
            <Input
              label="Modello"
              defaultValue={selectedProdotto?.modello || ''}
              placeholder="RB5154"
            />
            <Input
              label="Colore"
              defaultValue={selectedProdotto?.colore || ''}
              placeholder="Tartaruga"
            />
            <Input
              label="Barcode"
              placeholder="8012345678901"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              label="Prezzo Acquisto"
              type="number"
              step="0.01"
              defaultValue={selectedProdotto?.prezzo_acquisto || ''}
              placeholder="95.00"
            />
            <Input
              label="Prezzo Vendita"
              type="number"
              step="0.01"
              defaultValue={selectedProdotto?.prezzo_vendita || ''}
              placeholder="180.00"
            />
            <Select
              label="IVA"
              defaultValue="22"
              options={[
                { value: '22', label: '22%' },
                { value: '10', label: '10%' },
                { value: '4', label: '4%' },
              ]}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              label="Quantita"
              type="number"
              defaultValue={selectedProdotto?.quantita || ''}
              placeholder="5"
            />
            <Input
              label="Quantita Minima"
              type="number"
              defaultValue={selectedProdotto?.quantita_minima || ''}
              placeholder="2"
            />
            <Input
              label="Ubicazione"
              placeholder="Scaffale A1"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <Button variant="ghost" onClick={() => setIsModalOpen(false)}>
              Annulla
            </Button>
            <Button variant="primary" onClick={() => setIsModalOpen(false)}>
              {selectedProdotto ? 'Salva Modifiche' : 'Crea Prodotto'}
            </Button>
          </div>
        </div>
      </Modal>
    </MainLayout>
  )
}
