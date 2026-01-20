'use client'

import { useState, useEffect, useRef } from 'react'
import { MainLayout } from '@/components/layout'
import { Card, Button, Input, Select, Modal, Table, Badge, AxisWidget } from '@/components/ui'
import { PrintPrescription } from '@/components/print'
import type { Column } from '@/components/ui/Table'
import {
  Plus,
  Search,
  Eye,
  Printer,
  User,
  Glasses,
  CircleDot,
  X,
} from 'lucide-react'
import { clsx } from 'clsx'
import { useReactToPrint } from 'react-to-print'

// Mock data
const mockPrescrizioni = [
  {
    id: '1',
    cliente_nome: 'Mario Rossi',
    cliente_id: '1',
    data_prescrizione: '2024-03-15',
    prescrittore: 'Dott. Bianchi',
    tipo: 'occhiali',
    lontano_od_sph: -2.50, lontano_od_cyl: -0.75, lontano_od_ax: 180,
    lontano_os_sph: -2.25, lontano_os_cyl: -0.50, lontano_os_ax: 175,
    vicino_od_sph: -0.50, vicino_od_cyl: -0.75, vicino_od_ax: 180,
    vicino_os_sph: -0.25, vicino_os_cyl: -0.50, vicino_os_ax: 175,
    add_od: 2.00,
    add_os: 2.00,
    dip: 63,
  },
  {
    id: '2',
    cliente_nome: 'Anna Bianchi',
    cliente_id: '2',
    data_prescrizione: '2024-03-10',
    prescrittore: 'Dott. Verdi',
    tipo: 'occhiali',
    lontano_od_sph: 1.00, lontano_od_cyl: -0.25, lontano_od_ax: 90,
    lontano_os_sph: 0.75, lontano_os_cyl: -0.50, lontano_os_ax: 85,
    vicino_od_sph: 3.50, vicino_od_cyl: -0.25, vicino_od_ax: 90,
    vicino_os_sph: 3.25, vicino_os_cyl: -0.50, vicino_os_ax: 85,
    add_od: 2.50,
    add_os: 2.50,
    dip: 62,
  },
]

type Prescrizione = typeof mockPrescrizioni[0]

type TipoRiga = 'lontano' | 'permanente' | 'intermedio' | 'vicino'

interface RigaValues {
  od_sph: number | null
  od_cyl: number | null
  od_ax: number | null
  od_add: number | null  // ADD per OD
  os_sph: number | null
  os_cyl: number | null
  os_ax: number | null
  os_add: number | null  // ADD per OS
}

interface PrescrizioneFormData {
  cliente_id: string
  data_prescrizione: string
  prescrittore: string
  tipo: 'occhiali' | 'lac'
  lontano: RigaValues
  permanente: RigaValues
  intermedio: RigaValues
  vicino: RigaValues
  dip: number | null
  note: string
}

const emptyRiga: RigaValues = {
  od_sph: null, od_cyl: null, od_ax: null, od_add: null,
  os_sph: null, os_cyl: null, os_ax: null, os_add: null,
}

const emptyForm: PrescrizioneFormData = {
  cliente_id: '',
  data_prescrizione: new Date().toISOString().split('T')[0],
  prescrittore: '',
  tipo: 'occhiali',
  lontano: { ...emptyRiga },
  permanente: { ...emptyRiga },
  intermedio: { ...emptyRiga },
  vicino: { ...emptyRiga },
  dip: null,
  note: '',
}

function formatDiottria(value: number | null): string {
  if (value === null || value === undefined) return '-'
  const sign = value >= 0 ? '+' : ''
  return `${sign}${value.toFixed(2)}`
}

// Componente per visualizzare l'asse nel sistema TABO - Stile prescrizione italiana
// Linea che PARTE dal centro (NON attraversa)
interface ViewAxisSemicircleProps {
  axis: number | null
  eye: 'OD' | 'OS'
}

function ViewAxisSemicircle({ axis, eye }: ViewAxisSemicircleProps) {
  if (axis === null) return null

  // Dimensioni ottimizzate per modal
  const width = 200
  const height = 130
  const radius = 75
  const cx = width / 2
  const cy = height - 12

  // Sistema TABO: 0° a destra, 90° in alto, 180° a sinistra
  // Formula corretta: axis * π / 180 (NON 180 - axis!)
  const angleRad = (Math.PI * axis) / 180

  // La linea PARTE dal centro e va verso l'asse (NON attraversa)
  const lineExtension = radius + 12
  const x2 = cx + lineExtension * Math.cos(angleRad)
  const y2 = cy - lineExtension * Math.sin(angleRad)

  return (
    <div className="flex flex-col items-center flex-shrink-0">
      <svg width={width} height={height} className="overflow-visible">
        {/* Linea base orizzontale */}
        <line
          x1={cx - radius - 8}
          y1={cy}
          x2={cx + radius + 8}
          y2={cy}
          stroke="#4B5563"
          strokeWidth="2"
        />

        {/* Semicerchio principale */}
        <path
          d={`M ${cx - radius} ${cy} A ${radius} ${radius} 0 0 1 ${cx + radius} ${cy}`}
          fill="none"
          stroke="#6B7280"
          strokeWidth="2.5"
        />

        {/* Tacche gradi - ogni 10° con numeri ogni 30° */}
        {/* Sistema TABO: 0° a destra, 90° in alto, 180° a sinistra */}
        {Array.from({ length: 19 }, (_, i) => i * 10).map((deg) => {
          const rad = (Math.PI * deg) / 180
          const isMain = deg % 30 === 0
          const tickInner = radius - (isMain ? 8 : 4)
          const tickOuter = radius + (isMain ? 6 : 3)

          const x1t = cx + tickInner * Math.cos(rad)
          const y1t = cy - tickInner * Math.sin(rad)
          const x2t = cx + tickOuter * Math.cos(rad)
          const y2t = cy - tickOuter * Math.sin(rad)

          return (
            <g key={deg}>
              <line
                x1={x1t}
                y1={y1t}
                x2={x2t}
                y2={y2t}
                stroke={isMain ? "#374151" : "#9CA3AF"}
                strokeWidth={isMain ? 1.5 : 1}
              />
              {isMain && (
                <text
                  x={cx + (radius + 18) * Math.cos(rad)}
                  y={cy - (radius + 18) * Math.sin(rad)}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize="11"
                  fontWeight="bold"
                  fill="#374151"
                  className="dark:fill-gray-300"
                >
                  {deg}°
                </text>
              )}
            </g>
          )
        })}

        {/* LINEA ASSE - parte dal centro e va verso l'asse */}
        <line
          x1={cx}
          y1={cy}
          x2={x2}
          y2={y2}
          stroke="#3B82F6"
          strokeWidth="3"
          strokeLinecap="round"
        />

        {/* Pallino all'estremità della linea */}
        <circle
          cx={x2}
          cy={y2}
          r="5"
          fill="#3B82F6"
        />

        {/* Punto centrale */}
        <circle cx={cx} cy={cy} r="6" fill="#3B82F6" stroke="white" strokeWidth="2" />

        {/* Etichetta occhio */}
        <text
          x={12}
          y={cy}
          fontSize="14"
          fontWeight="bold"
          fill="#6B7280"
          dominantBaseline="middle"
        >
          {eye}
        </text>

        {/* Valore asse */}
        <text
          x={cx}
          y={cy - radius - 30}
          textAnchor="middle"
          fontSize="16"
          fontWeight="bold"
          fill="#3B82F6"
        >
          {axis}°
        </text>
      </svg>
    </div>
  )
}

// Configurazione righe
const righeConfig: { key: TipoRiga; label: string; short: string; color: string; hasAdd: boolean }[] = [
  { key: 'lontano', label: 'Lontano', short: 'L', color: 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300', hasAdd: false },
  { key: 'permanente', label: 'Permanente', short: 'P', color: 'bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300', hasAdd: true },
  { key: 'intermedio', label: 'PC/Intermedio', short: 'I', color: 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300', hasAdd: true },
  { key: 'vicino', label: 'Vicino', short: 'V', color: 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300', hasAdd: true },
]

export default function PrescrizioniPage() {
  const [prescrizioni] = useState(mockPrescrizioni)
  const [search, setSearch] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [formData, setFormData] = useState<PrescrizioneFormData>(emptyForm)
  const [selectedPrescrizione, setSelectedPrescrizione] = useState<Prescrizione | null>(null)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false)
  const printRef = useRef<HTMLDivElement>(null)

  // Configurazione stampa
  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: selectedPrescrizione ? `Prescrizione_${selectedPrescrizione.cliente_nome}_${selectedPrescrizione.data_prescrizione}` : 'Prescrizione',
  })

  const openPrintPreview = (prescrizione: Prescrizione) => {
    setSelectedPrescrizione(prescrizione)
    setIsPrintModalOpen(true)
  }

  const filteredPrescrizioni = prescrizioni.filter(
    (p) =>
      p.cliente_nome.toLowerCase().includes(search.toLowerCase()) ||
      p.prescrittore?.toLowerCase().includes(search.toLowerCase())
  )

  const handleView = (prescrizione: Prescrizione) => {
    setSelectedPrescrizione(prescrizione)
    setIsViewModalOpen(true)
  }

  // Calcola SPH da ADD: SPH = Lontano_SPH + ADD
  const calcSphFromAdd = (lontanoSph: number | null, add: number | null): number | null => {
    if (lontanoSph === null || add === null) return null
    return Math.round((lontanoSph + add) * 100) / 100
  }

  // Calcola ADD da SPH: ADD = SPH - Lontano_SPH
  const calcAddFromSph = (lontanoSph: number | null, sph: number | null): number | null => {
    if (lontanoSph === null || sph === null) return null
    const add = Math.round((sph - lontanoSph) * 100) / 100
    return add > 0 ? add : null  // ADD deve essere positivo
  }

  // Aggiorna SPH e ricalcola ADD
  const updateSph = (tipo: TipoRiga, eye: 'od' | 'os', value: number | null) => {
    if (tipo === 'lontano') {
      // Se cambio Lontano, non calcolo ADD ma potrei ricalcolare gli SPH delle altre righe
      const newLontano = { ...formData.lontano, [`${eye}_sph`]: value }

      // Ricalcola SPH delle altre righe se hanno ADD
      const newPermanente = { ...formData.permanente }
      const newIntermedio = { ...formData.intermedio }
      const newVicino = { ...formData.vicino }

      if (formData.permanente[`${eye}_add` as keyof RigaValues]) {
        newPermanente[`${eye}_sph` as keyof RigaValues] = calcSphFromAdd(value, formData.permanente[`${eye}_add` as keyof RigaValues] as number) as any
      }
      if (formData.intermedio[`${eye}_add` as keyof RigaValues]) {
        newIntermedio[`${eye}_sph` as keyof RigaValues] = calcSphFromAdd(value, formData.intermedio[`${eye}_add` as keyof RigaValues] as number) as any
      }
      if (formData.vicino[`${eye}_add` as keyof RigaValues]) {
        newVicino[`${eye}_sph` as keyof RigaValues] = calcSphFromAdd(value, formData.vicino[`${eye}_add` as keyof RigaValues] as number) as any
      }

      setFormData({
        ...formData,
        lontano: newLontano,
        permanente: newPermanente,
        intermedio: newIntermedio,
        vicino: newVicino,
      })
    } else {
      // Se cambio SPH di P/I/V, calcola l'ADD
      const lontanoSph = formData.lontano[`${eye}_sph` as keyof RigaValues] as number | null
      const newAdd = calcAddFromSph(lontanoSph, value)

      setFormData({
        ...formData,
        [tipo]: {
          ...formData[tipo],
          [`${eye}_sph`]: value,
          [`${eye}_add`]: newAdd,
        }
      })
    }
  }

  // Aggiorna ADD e ricalcola SPH + copia CYL e AX da Lontano
  const updateAdd = (tipo: TipoRiga, eye: 'od' | 'os', value: number | null) => {
    const lontanoSph = formData.lontano[`${eye}_sph` as keyof RigaValues] as number | null
    const lontanoCyl = formData.lontano[`${eye}_cyl` as keyof RigaValues] as number | null
    const lontanoAx = formData.lontano[`${eye}_ax` as keyof RigaValues] as number | null
    const newSph = calcSphFromAdd(lontanoSph, value)

    // Quando inserisci ADD, copia anche CYL e AX da Lontano
    setFormData({
      ...formData,
      [tipo]: {
        ...formData[tipo],
        [`${eye}_add`]: value,
        [`${eye}_sph`]: newSph,
        [`${eye}_cyl`]: value !== null ? lontanoCyl : formData[tipo][`${eye}_cyl` as keyof RigaValues],
        [`${eye}_ax`]: value !== null ? lontanoAx : formData[tipo][`${eye}_ax` as keyof RigaValues],
      }
    })
  }

  // Aggiorna CYL/AX
  const updateCylAx = (tipo: TipoRiga, field: 'od_cyl' | 'os_cyl' | 'od_ax' | 'os_ax', value: number | null) => {
    const newRiga = { ...formData[tipo], [field]: value }

    // Se CYL viene svuotato o = 0, svuota anche AX
    if (field === 'od_cyl' && (!value || value === 0)) {
      newRiga.od_ax = null
    }
    if (field === 'os_cyl' && (!value || value === 0)) {
      newRiga.os_ax = null
    }

    setFormData({ ...formData, [tipo]: newRiga })
  }

  const columns: Column<Prescrizione>[] = [
    {
      key: 'data',
      header: 'Data',
      render: (item) => (
        <span className="text-sm">
          {new Date(item.data_prescrizione).toLocaleDateString('it-IT')}
        </span>
      ),
    },
    {
      key: 'cliente',
      header: 'Cliente',
      render: (item) => (
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <User className="w-4 h-4 text-primary" />
          </div>
          <span className="font-medium">{item.cliente_nome}</span>
        </div>
      ),
    },
    {
      key: 'od',
      header: 'OD (L)',
      render: (item) => (
        <div className="text-sm font-mono">
          <span>{formatDiottria(item.lontano_od_sph)}</span>
          {item.lontano_od_cyl !== null && (
            <span className="text-foreground-muted">
              {' '}{formatDiottria(item.lontano_od_cyl)} x {item.lontano_od_ax}°
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'os',
      header: 'OS (L)',
      render: (item) => (
        <div className="text-sm font-mono">
          <span>{formatDiottria(item.lontano_os_sph)}</span>
          {item.lontano_os_cyl !== null && (
            <span className="text-foreground-muted">
              {' '}{formatDiottria(item.lontano_os_cyl)} x {item.lontano_os_ax}°
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'add',
      header: 'ADD',
      render: (item) => (
        <span className="text-sm font-mono text-green-600">
          {item.add_od ? `+${item.add_od.toFixed(2)}` : '-'}
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
            onClick={(e) => { e.stopPropagation(); handleView(item) }}
            className="p-2 rounded-lg hover:bg-background-secondary transition-colors"
            title="Visualizza"
          >
            <Eye className="w-4 h-4 text-foreground-muted" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); openPrintPreview(item) }}
            className="p-2 rounded-lg hover:bg-background-secondary transition-colors"
            title="Stampa"
          >
            <Printer className="w-4 h-4 text-foreground-muted" />
          </button>
        </div>
      ),
    },
  ]

  return (
    <MainLayout title="Prescrizioni">
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground-muted" />
            <input
              type="text"
              placeholder="Cerca per cliente o prescrittore..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-base pl-10"
            />
          </div>
          <Button
            variant="primary"
            size="sm"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={() => { setFormData(emptyForm); setIsModalOpen(true) }}
          >
            Nuova Prescrizione
          </Button>
        </div>

        {/* Table */}
        <Card padding="none">
          <Table
            columns={columns}
            data={filteredPrescrizioni}
            keyExtractor={(item) => item.id}
            onRowClick={handleView}
          />
        </Card>
      </div>

      {/* Modal Nuova Prescrizione */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Nuova Prescrizione"
        size="full"
      >
        <div className="space-y-5">
          {/* Info Cliente */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Select
              label="Cliente"
              value={formData.cliente_id}
              onChange={(e) => setFormData({ ...formData, cliente_id: e.target.value })}
              options={[
                { value: '1', label: 'Mario Rossi' },
                { value: '2', label: 'Anna Bianchi' },
                { value: '3', label: 'Luigi Verdi' },
              ]}
              placeholder="Seleziona..."
            />
            <Input
              label="Data"
              type="date"
              value={formData.data_prescrizione}
              onChange={(e) => setFormData({ ...formData, data_prescrizione: e.target.value })}
            />
            <Input
              label="Prescrittore"
              value={formData.prescrittore}
              onChange={(e) => setFormData({ ...formData, prescrittore: e.target.value })}
              placeholder="Dott. ..."
            />
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Tipo</label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, tipo: 'occhiali' })}
                  className={clsx(
                    'flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg border text-sm',
                    formData.tipo === 'occhiali' ? 'bg-primary text-white border-primary' : 'bg-surface border-border'
                  )}
                >
                  <Glasses className="w-4 h-4" /> Occhiali
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, tipo: 'lac' })}
                  className={clsx(
                    'flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg border text-sm',
                    formData.tipo === 'lac' ? 'bg-secondary text-white border-secondary' : 'bg-surface border-border'
                  )}
                >
                  <CircleDot className="w-4 h-4" /> LAC
                </button>
              </div>
            </div>
          </div>

          {/* Widget Asse */}
          {(() => {
            // Verifica se tutti gli assi OD sono uguali
            const odAxes = [formData.lontano.od_ax, formData.permanente.od_ax, formData.intermedio.od_ax, formData.vicino.od_ax].filter(v => v !== null)
            const odAllSame = odAxes.length <= 1 || odAxes.every(v => v === odAxes[0])

            // Verifica se tutti gli assi OS sono uguali
            const osAxes = [formData.lontano.os_ax, formData.permanente.os_ax, formData.intermedio.os_ax, formData.vicino.os_ax].filter(v => v !== null)
            const osAllSame = osAxes.length <= 1 || osAxes.every(v => v === osAxes[0])

            return (
              <div className="grid grid-cols-2 gap-4 p-4 bg-stone-50 dark:bg-stone-900 rounded-lg">
                <div className="flex flex-col items-center">
                  <AxisWidget
                    value={formData.lontano.od_ax}
                    onChange={(value) => updateCylAx('lontano', 'od_ax', value)}
                    cylinder={formData.lontano.od_cyl}
                    eye="OD"
                    size="md"
                    mainColor={odAllSame ? '#F97316' : undefined}
                    mainLabel={odAllSame ? 'AXIS' : 'L'}
                    additionalAxes={odAllSame ? [] : [
                      { value: formData.permanente.od_ax, color: '#A855F7', label: 'Permanente', shortLabel: 'P' },
                      { value: formData.intermedio.od_ax, color: '#F59E0B', label: 'Intermedio', shortLabel: 'I' },
                      { value: formData.vicino.od_ax, color: '#22C55E', label: 'Vicino', shortLabel: 'V' },
                    ]}
                  />
                </div>
                <div className="flex flex-col items-center">
                  <AxisWidget
                    value={formData.lontano.os_ax}
                    onChange={(value) => updateCylAx('lontano', 'os_ax', value)}
                    cylinder={formData.lontano.os_cyl}
                    eye="OS"
                    size="md"
                    mainColor={osAllSame ? '#F97316' : undefined}
                    mainLabel={osAllSame ? 'AXIS' : 'L'}
                    additionalAxes={osAllSame ? [] : [
                      { value: formData.permanente.os_ax, color: '#A855F7', label: 'Permanente', shortLabel: 'P' },
                      { value: formData.intermedio.os_ax, color: '#F59E0B', label: 'Intermedio', shortLabel: 'I' },
                      { value: formData.vicino.os_ax, color: '#22C55E', label: 'Vicino', shortLabel: 'V' },
                    ]}
                  />
                </div>
              </div>
            )
          })()}

          {/* Info calcolo automatico */}
          <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg text-sm text-amber-800 dark:text-amber-200">
            <strong>💡 Calcolo automatico:</strong> Inserisci ADD → calcola SPH automaticamente | Inserisci SPH → calcola ADD automaticamente
          </div>

          {/* Tabella Prescrizione Completa */}
          <div className="border-2 border-border rounded-xl overflow-hidden overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-stone-100 dark:bg-stone-800">
                  <th className="p-2 border-r border-border w-24"></th>
                  <th colSpan={4} className="p-2 border-r border-border text-primary font-semibold">
                    OD - Occhio Destro
                  </th>
                  <th colSpan={4} className="p-2 text-secondary font-semibold">
                    OS - Occhio Sinistro
                  </th>
                </tr>
                <tr className="bg-stone-50 dark:bg-stone-900 text-xs text-foreground-muted">
                  <th className="p-2 border-r border-border">TIPO</th>
                  <th className="p-2 border-r border-border w-20">SPH</th>
                  <th className="p-2 border-r border-border w-20">CYL</th>
                  <th className="p-2 border-r border-border w-16">AX</th>
                  <th className="p-2 border-r border-border w-16 text-green-600">ADD</th>
                  <th className="p-2 border-r border-border w-20">SPH</th>
                  <th className="p-2 border-r border-border w-20">CYL</th>
                  <th className="p-2 border-r border-border w-16">AX</th>
                  <th className="p-2 w-16 text-green-600">ADD</th>
                </tr>
              </thead>
              <tbody>
                {righeConfig.map((riga, idx) => (
                  <tr key={riga.key} className={idx < righeConfig.length - 1 ? 'border-b border-border' : ''}>
                    {/* Label Riga */}
                    <td className={clsx('p-2 border-r border-border font-semibold text-center', riga.color)}>
                      <span className="hidden sm:inline">{riga.label}</span>
                      <span className="sm:hidden">{riga.short}</span>
                    </td>

                    {/* OD SPH */}
                    <td className="p-1 border-r border-border bg-primary/5">
                      <input
                        type="number"
                        step="0.25"
                        value={formData[riga.key].od_sph?.toString() ?? ''}
                        onChange={(e) => updateSph(riga.key, 'od', e.target.value === '' ? null : parseFloat(e.target.value))}
                        className={clsx(
                          "w-full text-center font-mono bg-transparent border-b border-transparent focus:border-primary outline-none py-1",
                          riga.hasAdd && formData[riga.key].od_add ? "text-green-600 font-semibold" : ""
                        )}
                        placeholder="±0.00"
                      />
                    </td>
                    {/* OD CYL */}
                    <td className="p-1 border-r border-border bg-primary/5">
                      <input
                        type="number"
                        step="0.25"
                        value={formData[riga.key].od_cyl?.toString() ?? ''}
                        onChange={(e) => updateCylAx(riga.key, 'od_cyl', e.target.value === '' ? null : parseFloat(e.target.value))}
                        className="w-full text-center font-mono bg-transparent border-b border-transparent focus:border-primary outline-none py-1"
                        placeholder="-0.00"
                      />
                    </td>
                    {/* OD AX */}
                    <td className="p-1 border-r border-border bg-primary/5">
                      <input
                        type="number"
                        min="0"
                        max="180"
                        value={formData[riga.key].od_ax?.toString() ?? ''}
                        onChange={(e) => updateCylAx(riga.key, 'od_ax', e.target.value === '' ? null : parseInt(e.target.value, 10))}
                        disabled={!formData[riga.key].od_cyl}
                        className="w-full text-center font-mono bg-transparent border-b border-transparent focus:border-primary outline-none py-1 disabled:opacity-30"
                        placeholder="0°"
                      />
                    </td>
                    {/* OD ADD */}
                    <td className={clsx(
                      "p-1 border-r border-border",
                      riga.hasAdd ? "bg-green-50 dark:bg-green-900/20" : "bg-stone-100 dark:bg-stone-800"
                    )}>
                      {riga.hasAdd ? (
                        <input
                          type="number"
                          step="0.25"
                          min="0"
                          value={formData[riga.key].od_add?.toString() ?? ''}
                          onChange={(e) => updateAdd(riga.key, 'od', e.target.value === '' ? null : parseFloat(e.target.value))}
                          className="w-full text-center font-mono text-green-600 font-semibold bg-transparent border-b border-transparent focus:border-green-500 outline-none py-1"
                          placeholder="+0.00"
                        />
                      ) : (
                        <span className="block text-center text-stone-400">-</span>
                      )}
                    </td>

                    {/* OS SPH */}
                    <td className="p-1 border-r border-border bg-secondary/5">
                      <input
                        type="number"
                        step="0.25"
                        value={formData[riga.key].os_sph?.toString() ?? ''}
                        onChange={(e) => updateSph(riga.key, 'os', e.target.value === '' ? null : parseFloat(e.target.value))}
                        className={clsx(
                          "w-full text-center font-mono bg-transparent border-b border-transparent focus:border-secondary outline-none py-1",
                          riga.hasAdd && formData[riga.key].os_add ? "text-green-600 font-semibold" : ""
                        )}
                        placeholder="±0.00"
                      />
                    </td>
                    {/* OS CYL */}
                    <td className="p-1 border-r border-border bg-secondary/5">
                      <input
                        type="number"
                        step="0.25"
                        value={formData[riga.key].os_cyl?.toString() ?? ''}
                        onChange={(e) => updateCylAx(riga.key, 'os_cyl', e.target.value === '' ? null : parseFloat(e.target.value))}
                        className="w-full text-center font-mono bg-transparent border-b border-transparent focus:border-secondary outline-none py-1"
                        placeholder="-0.00"
                      />
                    </td>
                    {/* OS AX */}
                    <td className="p-1 border-r border-border bg-secondary/5">
                      <input
                        type="number"
                        min="0"
                        max="180"
                        value={formData[riga.key].os_ax?.toString() ?? ''}
                        onChange={(e) => updateCylAx(riga.key, 'os_ax', e.target.value === '' ? null : parseInt(e.target.value, 10))}
                        disabled={!formData[riga.key].os_cyl}
                        className="w-full text-center font-mono bg-transparent border-b border-transparent focus:border-secondary outline-none py-1 disabled:opacity-30"
                        placeholder="0°"
                      />
                    </td>
                    {/* OS ADD */}
                    <td className={clsx(
                      "p-1",
                      riga.hasAdd ? "bg-green-50 dark:bg-green-900/20" : "bg-stone-100 dark:bg-stone-800"
                    )}>
                      {riga.hasAdd ? (
                        <input
                          type="number"
                          step="0.25"
                          min="0"
                          value={formData[riga.key].os_add?.toString() ?? ''}
                          onChange={(e) => updateAdd(riga.key, 'os', e.target.value === '' ? null : parseFloat(e.target.value))}
                          className="w-full text-center font-mono text-green-600 font-semibold bg-transparent border-b border-transparent focus:border-green-500 outline-none py-1"
                          placeholder="+0.00"
                        />
                      ) : (
                        <span className="block text-center text-stone-400">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* DIP */}
          <div className="flex items-center gap-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <label className="text-sm font-medium text-blue-800 dark:text-blue-200">
              DIP (Distanza Interpupillare):
            </label>
            <input
              type="number"
              step="0.5"
              min="50"
              max="80"
              value={formData.dip?.toString() ?? ''}
              onChange={(e) => setFormData({ ...formData, dip: e.target.value === '' ? null : parseFloat(e.target.value) })}
              className="w-24 text-center font-mono bg-white dark:bg-stone-800 border border-blue-300 dark:border-blue-600 rounded-lg px-3 py-2"
              placeholder="62"
            />
            <span className="text-sm text-blue-600 dark:text-blue-400">mm</span>
          </div>

          {/* Note */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Note</label>
            <textarea
              value={formData.note}
              onChange={(e) => setFormData({ ...formData, note: e.target.value })}
              className="input-base min-h-[60px]"
              placeholder="Note aggiuntive..."
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <Button variant="ghost" onClick={() => setIsModalOpen(false)}>Annulla</Button>
            <Button variant="outline" leftIcon={<Printer className="w-4 h-4" />}>Anteprima</Button>
            <Button variant="primary" onClick={() => setIsModalOpen(false)}>Salva</Button>
          </div>
        </div>
      </Modal>

      {/* Modal Visualizza */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        title="Prescrizione"
        size="xl"
      >
        {selectedPrescrizione && (
          <div className="space-y-6">
            {/* Intestazione */}
            <div className="flex items-center justify-between pb-4 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">{selectedPrescrizione.cliente_nome}</h3>
                  <p className="text-sm text-foreground-muted">
                    {new Date(selectedPrescrizione.data_prescrizione).toLocaleDateString('it-IT')}
                    {selectedPrescrizione.prescrittore && ` • ${selectedPrescrizione.prescrittore}`}
                  </p>
                </div>
              </div>
              <Badge variant={selectedPrescrizione.tipo === 'occhiali' ? 'primary' : 'secondary'}>
                {selectedPrescrizione.tipo === 'occhiali' ? 'Occhiali' : 'LAC'}
              </Badge>
            </div>

            {/* Diagrammi Assi - SOPRA LA TABELLA */}
            {(selectedPrescrizione.lontano_od_ax || selectedPrescrizione.lontano_os_ax) && (
              <div className="flex justify-center items-center gap-6 p-6 bg-stone-50 dark:bg-stone-900 rounded-xl">
                <ViewAxisSemicircle
                  axis={selectedPrescrizione.lontano_od_ax}
                  eye="OD"
                />
                <ViewAxisSemicircle
                  axis={selectedPrescrizione.lontano_os_ax}
                  eye="OS"
                />
              </div>
            )}

            {/* Ricetta Stile Italiano */}
            <div className="border-2 border-border rounded-xl overflow-hidden">
              <table className="w-full text-sm font-mono">
                <thead>
                  <tr className="bg-stone-100 dark:bg-stone-800">
                    <th className="p-3 border-r border-border"></th>
                    <th colSpan={3} className="p-3 border-r border-border text-primary">OD</th>
                    <th className="p-3 border-r border-border text-green-600">ADD</th>
                    <th colSpan={3} className="p-3 border-r border-border text-secondary">OS</th>
                    <th className="p-3 text-green-600">ADD</th>
                  </tr>
                  <tr className="bg-stone-50 dark:bg-stone-900 text-xs">
                    <th className="p-2 border-r border-border">TIPO</th>
                    <th className="p-2 border-r border-border">SPH</th>
                    <th className="p-2 border-r border-border">CYL</th>
                    <th className="p-2 border-r border-border">AX</th>
                    <th className="p-2 border-r border-border"></th>
                    <th className="p-2 border-r border-border">SPH</th>
                    <th className="p-2 border-r border-border">CYL</th>
                    <th className="p-2 border-r border-border">AX</th>
                    <th className="p-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {/* Lontano */}
                  <tr className="border-b border-border">
                    <td className="p-3 border-r border-border bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 font-bold text-center">L</td>
                    <td className="p-3 border-r border-border text-center">{formatDiottria(selectedPrescrizione.lontano_od_sph)}</td>
                    <td className="p-3 border-r border-border text-center">{formatDiottria(selectedPrescrizione.lontano_od_cyl)}</td>
                    <td className="p-3 border-r border-border text-center">{selectedPrescrizione.lontano_od_ax ? `${selectedPrescrizione.lontano_od_ax}°` : '-'}</td>
                    <td className="p-3 border-r border-border text-center bg-stone-50 dark:bg-stone-800">-</td>
                    <td className="p-3 border-r border-border text-center">{formatDiottria(selectedPrescrizione.lontano_os_sph)}</td>
                    <td className="p-3 border-r border-border text-center">{formatDiottria(selectedPrescrizione.lontano_os_cyl)}</td>
                    <td className="p-3 border-r border-border text-center">{selectedPrescrizione.lontano_os_ax ? `${selectedPrescrizione.lontano_os_ax}°` : '-'}</td>
                    <td className="p-3 text-center bg-stone-50 dark:bg-stone-800">-</td>
                  </tr>
                  {/* Vicino */}
                  <tr>
                    <td className="p-3 border-r border-border bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 font-bold text-center">V</td>
                    <td className="p-3 border-r border-border text-center">{formatDiottria(selectedPrescrizione.vicino_od_sph)}</td>
                    <td className="p-3 border-r border-border text-center">{formatDiottria(selectedPrescrizione.vicino_od_cyl)}</td>
                    <td className="p-3 border-r border-border text-center">{selectedPrescrizione.vicino_od_ax ? `${selectedPrescrizione.vicino_od_ax}°` : '-'}</td>
                    <td className="p-3 border-r border-border text-center text-green-600 font-bold bg-green-50 dark:bg-green-900/20">
                      {selectedPrescrizione.add_od ? `+${selectedPrescrizione.add_od.toFixed(2)}` : '-'}
                    </td>
                    <td className="p-3 border-r border-border text-center">{formatDiottria(selectedPrescrizione.vicino_os_sph)}</td>
                    <td className="p-3 border-r border-border text-center">{formatDiottria(selectedPrescrizione.vicino_os_cyl)}</td>
                    <td className="p-3 border-r border-border text-center">{selectedPrescrizione.vicino_os_ax ? `${selectedPrescrizione.vicino_os_ax}°` : '-'}</td>
                    <td className="p-3 text-center text-green-600 font-bold bg-green-50 dark:bg-green-900/20">
                      {selectedPrescrizione.add_os ? `+${selectedPrescrizione.add_os.toFixed(2)}` : '-'}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* DIP */}
            {selectedPrescrizione.dip && (
              <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <span className="text-sm text-blue-600 dark:text-blue-400">DIP: </span>
                <span className="font-mono font-bold text-blue-700 dark:text-blue-300 text-lg">
                  {selectedPrescrizione.dip} mm
                </span>
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t border-border">
              <Button variant="ghost" onClick={() => setIsViewModalOpen(false)}>Chiudi</Button>
              <Button
                variant="outline"
                leftIcon={<Printer className="w-4 h-4" />}
                onClick={() => {
                  setIsViewModalOpen(false)
                  openPrintPreview(selectedPrescrizione)
                }}
              >
                Stampa
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal Anteprima Stampa */}
      <Modal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        title="Anteprima Stampa Prescrizione"
        size="full"
      >
        <div className="space-y-4">
          {/* Toolbar */}
          <div className="flex items-center justify-between p-3 bg-stone-100 dark:bg-stone-800 rounded-lg">
            <p className="text-sm text-foreground-muted">
              Anteprima del documento che verrà stampato
            </p>
            <div className="flex gap-2">
              <Button variant="ghost" onClick={() => setIsPrintModalOpen(false)}>
                Annulla
              </Button>
              <Button variant="primary" leftIcon={<Printer className="w-4 h-4" />} onClick={() => handlePrint()}>
                Stampa
              </Button>
            </div>
          </div>

          {/* Anteprima */}
          <div className="border border-border rounded-lg overflow-auto max-h-[70vh] bg-gray-100 p-4">
            {selectedPrescrizione && (
              <PrintPrescription
                ref={printRef}
                data={{
                  cliente_nome: selectedPrescrizione.cliente_nome,
                  data_prescrizione: selectedPrescrizione.data_prescrizione,
                  prescrittore: selectedPrescrizione.prescrittore,
                  tipo: selectedPrescrizione.tipo as 'occhiali' | 'lac',
                  lontano_od_sph: selectedPrescrizione.lontano_od_sph,
                  lontano_od_cyl: selectedPrescrizione.lontano_od_cyl,
                  lontano_od_ax: selectedPrescrizione.lontano_od_ax,
                  lontano_os_sph: selectedPrescrizione.lontano_os_sph,
                  lontano_os_cyl: selectedPrescrizione.lontano_os_cyl,
                  lontano_os_ax: selectedPrescrizione.lontano_os_ax,
                  vicino_od_sph: selectedPrescrizione.vicino_od_sph,
                  vicino_od_cyl: selectedPrescrizione.vicino_od_cyl,
                  vicino_od_ax: selectedPrescrizione.vicino_od_ax,
                  vicino_os_sph: selectedPrescrizione.vicino_os_sph,
                  vicino_os_cyl: selectedPrescrizione.vicino_os_cyl,
                  vicino_os_ax: selectedPrescrizione.vicino_os_ax,
                  add_od: selectedPrescrizione.add_od,
                  add_os: selectedPrescrizione.add_os,
                  dip: selectedPrescrizione.dip,
                }}
              />
            )}
          </div>
        </div>
      </Modal>
    </MainLayout>
  )
}
