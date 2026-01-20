'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { MainLayout } from '@/components/layout'
import { Card, Button, Badge, Modal, Input, Select } from '@/components/ui'
import {
  Plus,
  ChevronLeft,
  ChevronRight,
  Clock,
  User,
  Phone,
  Eye,
  Stethoscope,
  Package,
  Wrench,
  MoreHorizontal,
} from 'lucide-react'
import { clsx } from 'clsx'

type TipoAppuntamento = 'visita' | 'ritiro' | 'controllo' | 'riparazione' | 'altro'
type StatoAppuntamento = 'programmato' | 'confermato' | 'completato' | 'annullato' | 'no_show'

interface Appuntamento {
  id: string
  cliente_nome: string
  cliente_telefono: string
  tipo: TipoAppuntamento
  titolo: string
  data_ora: string
  durata_minuti: number
  stato: StatoAppuntamento
  note: string | null
}

const mockAppuntamenti: Appuntamento[] = [
  {
    id: '1',
    cliente_nome: 'Mario Rossi',
    cliente_telefono: '333 1234567',
    tipo: 'visita',
    titolo: 'Visita optometrica',
    data_ora: '2024-03-18T09:00:00',
    durata_minuti: 30,
    stato: 'confermato',
    note: null,
  },
  {
    id: '2',
    cliente_nome: 'Anna Bianchi',
    cliente_telefono: '339 8765432',
    tipo: 'ritiro',
    titolo: 'Ritiro occhiali',
    data_ora: '2024-03-18T10:30:00',
    durata_minuti: 15,
    stato: 'programmato',
    note: 'Ordine ORD-2024002',
  },
  {
    id: '3',
    cliente_nome: 'Luigi Verdi',
    cliente_telefono: '340 1122334',
    tipo: 'controllo',
    titolo: 'Controllo adattamento',
    data_ora: '2024-03-18T14:00:00',
    durata_minuti: 20,
    stato: 'programmato',
    note: null,
  },
  {
    id: '4',
    cliente_nome: 'Sara Neri',
    cliente_telefono: '347 9988776',
    tipo: 'visita',
    titolo: 'Prima visita',
    data_ora: '2024-03-18T16:00:00',
    durata_minuti: 45,
    stato: 'programmato',
    note: 'Nuovo cliente',
  },
  {
    id: '5',
    cliente_nome: 'Paolo Bianchi',
    cliente_telefono: '335 5566778',
    tipo: 'riparazione',
    titolo: 'Riparazione montatura',
    data_ora: '2024-03-19T11:00:00',
    durata_minuti: 15,
    stato: 'programmato',
    note: 'Asta rotta',
  },
]

const tipoConfig: Record<TipoAppuntamento, { label: string; icon: any; color: string }> = {
  visita: { label: 'Visita', icon: Stethoscope, color: 'primary' },
  ritiro: { label: 'Ritiro', icon: Package, color: 'success' },
  controllo: { label: 'Controllo', icon: Eye, color: 'info' },
  riparazione: { label: 'Riparazione', icon: Wrench, color: 'warning' },
  altro: { label: 'Altro', icon: MoreHorizontal, color: 'neutral' },
}

const statoConfig: Record<StatoAppuntamento, { label: string; color: string }> = {
  programmato: { label: 'Programmato', color: 'info' },
  confermato: { label: 'Confermato', color: 'success' },
  completato: { label: 'Completato', color: 'neutral' },
  annullato: { label: 'Annullato', color: 'error' },
  no_show: { label: 'No Show', color: 'warning' },
}

const orari = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '12:30',
  '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30', '18:00', '18:30',
]

const giorniSettimana = ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab']

function AppuntamentiPageContent() {
  const searchParams = useSearchParams()
  const [appuntamenti, setAppuntamenti] = useState(mockAppuntamenti)
  const [currentDate, setCurrentDate] = useState(new Date())
  const [viewMode, setViewMode] = useState<'week' | 'day'>('week')
  const [selectedAppuntamento, setSelectedAppuntamento] = useState<Appuntamento | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isNewModalOpen, setIsNewModalOpen] = useState(false)

  // New appointment form
  const [newAppuntamento, setNewAppuntamento] = useState({
    cliente_nome: '',
    cliente_telefono: '',
    tipo: 'visita' as TipoAppuntamento,
    titolo: '',
    data: '',
    ora: '',
    durata_minuti: 30,
    note: '',
  })

  useEffect(() => {
    if (searchParams.get('nuovo') === 'true') {
      setIsNewModalOpen(true)
    }
  }, [searchParams])

  const getWeekDays = () => {
    const startOfWeek = new Date(currentDate)
    const day = startOfWeek.getDay()
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1)
    startOfWeek.setDate(diff)

    return Array.from({ length: 6 }, (_, i) => {
      const date = new Date(startOfWeek)
      date.setDate(startOfWeek.getDate() + i)
      return date
    })
  }

  const weekDays = getWeekDays()

  const getAppuntamentiForDay = (date: Date) => {
    return appuntamenti.filter((app) => {
      const appDate = new Date(app.data_ora)
      return appDate.toDateString() === date.toDateString()
    })
  }

  const getAppuntamentiForSlot = (date: Date, time: string) => {
    return appuntamenti.filter((app) => {
      const appDate = new Date(app.data_ora)
      const appTime = appDate.toTimeString().slice(0, 5)
      return appDate.toDateString() === date.toDateString() && appTime === time
    })
  }

  const navigateWeek = (direction: number) => {
    const newDate = new Date(currentDate)
    newDate.setDate(newDate.getDate() + direction * 7)
    setCurrentDate(newDate)
  }

  const isToday = (date: Date) => {
    return date.toDateString() === new Date().toDateString()
  }

  const formatWeekRange = () => {
    const start = weekDays[0]
    const end = weekDays[5]
    return `${start.getDate()} ${start.toLocaleDateString('it-IT', { month: 'short' })} - ${end.getDate()} ${end.toLocaleDateString('it-IT', { month: 'short', year: 'numeric' })}`
  }

  return (
    <MainLayout title="Appuntamenti">
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigateWeek(-1)}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="text-lg font-semibold min-w-[200px] text-center">
                {formatWeekRange()}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigateWeek(1)}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCurrentDate(new Date())}
            >
              Oggi
            </Button>
          </div>

          <Button
            variant="primary"
            size="sm"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={() => setIsNewModalOpen(true)}
          >
            Nuovo Appuntamento
          </Button>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-4">
          {Object.entries(tipoConfig).map(([tipo, config]) => {
            const Icon = config.icon
            return (
              <div key={tipo} className="flex items-center gap-2 text-sm">
                <div className={clsx(
                  'w-3 h-3 rounded-full',
                  config.color === 'primary' && 'bg-primary',
                  config.color === 'success' && 'bg-success',
                  config.color === 'info' && 'bg-info',
                  config.color === 'warning' && 'bg-warning',
                  config.color === 'neutral' && 'bg-foreground-muted'
                )} />
                <span className="text-foreground-muted">{config.label}</span>
              </div>
            )
          })}
        </div>

        {/* Calendar Grid */}
        <Card padding="none" className="overflow-hidden">
          {/* Header */}
          <div className="grid grid-cols-[60px_repeat(6,1fr)] border-b border-border">
            <div className="p-2 bg-background-secondary" />
            {weekDays.map((day, index) => (
              <div
                key={day.toISOString()}
                className={clsx(
                  'p-3 text-center border-l border-border',
                  isToday(day) && 'bg-primary/5'
                )}
              >
                <p className="text-xs text-foreground-muted uppercase">{giorniSettimana[index]}</p>
                <p className={clsx(
                  'text-lg font-semibold',
                  isToday(day) ? 'text-primary' : 'text-foreground'
                )}>
                  {day.getDate()}
                </p>
              </div>
            ))}
          </div>

          {/* Time Grid */}
          <div className="max-h-[600px] overflow-y-auto">
            {orari.map((time) => (
              <div key={time} className="grid grid-cols-[60px_repeat(6,1fr)] border-b border-border last:border-b-0">
                <div className="p-2 text-xs text-foreground-muted text-right pr-3 bg-background-secondary/50">
                  {time}
                </div>
                {weekDays.map((day) => {
                  const slotAppuntamenti = getAppuntamentiForSlot(day, time)
                  return (
                    <div
                      key={`${day.toISOString()}-${time}`}
                      className={clsx(
                        'min-h-[50px] p-1 border-l border-border hover:bg-background-secondary/30 transition-colors cursor-pointer',
                        isToday(day) && 'bg-primary/5'
                      )}
                      onClick={() => {
                        setNewAppuntamento({
                          ...newAppuntamento,
                          data: day.toISOString().split('T')[0],
                          ora: time,
                        })
                        setIsNewModalOpen(true)
                      }}
                    >
                      {slotAppuntamenti.map((app) => {
                        const config = tipoConfig[app.tipo]
                        return (
                          <div
                            key={app.id}
                            onClick={(e) => {
                              e.stopPropagation()
                              setSelectedAppuntamento(app)
                              setIsModalOpen(true)
                            }}
                            className={clsx(
                              'p-1.5 rounded text-xs cursor-pointer transition-opacity hover:opacity-80',
                              config.color === 'primary' && 'bg-primary/20 text-primary border-l-2 border-primary',
                              config.color === 'success' && 'bg-success/20 text-success border-l-2 border-success',
                              config.color === 'info' && 'bg-info/20 text-info border-l-2 border-info',
                              config.color === 'warning' && 'bg-warning/20 text-warning border-l-2 border-warning',
                              config.color === 'neutral' && 'bg-foreground-muted/20 text-foreground-muted border-l-2 border-foreground-muted'
                            )}
                          >
                            <p className="font-medium truncate">{app.cliente_nome}</p>
                            <p className="truncate opacity-80">{app.titolo}</p>
                          </div>
                        )
                      })}
                    </div>
                  )
                })}
              </div>
            ))}
          </div>
        </Card>

        {/* Today's Appointments Summary */}
        <Card>
          <h3 className="font-semibold text-foreground mb-4">Appuntamenti di Oggi</h3>
          <div className="space-y-3">
            {getAppuntamentiForDay(new Date()).length === 0 ? (
              <p className="text-foreground-muted text-sm">Nessun appuntamento per oggi</p>
            ) : (
              getAppuntamentiForDay(new Date()).map((app) => {
                const config = tipoConfig[app.tipo]
                const Icon = config.icon
                return (
                  <div
                    key={app.id}
                    onClick={() => {
                      setSelectedAppuntamento(app)
                      setIsModalOpen(true)
                    }}
                    className="flex items-center gap-4 p-3 rounded-lg bg-background-secondary/50 hover:bg-background-secondary cursor-pointer transition-colors"
                  >
                    <div className={clsx(
                      'w-10 h-10 rounded-lg flex items-center justify-center',
                      config.color === 'primary' && 'bg-primary/10 text-primary',
                      config.color === 'success' && 'bg-success/10 text-success',
                      config.color === 'info' && 'bg-info/10 text-info',
                      config.color === 'warning' && 'bg-warning/10 text-warning',
                      config.color === 'neutral' && 'bg-foreground-muted/10 text-foreground-muted'
                    )}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium truncate">{app.cliente_nome}</p>
                        <Badge variant={statoConfig[app.stato].color as any} size="sm">
                          {statoConfig[app.stato].label}
                        </Badge>
                      </div>
                      <p className="text-sm text-foreground-muted">{app.titolo}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">
                        {new Date(app.data_ora).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                      <p className="text-xs text-foreground-muted">{app.durata_minuti} min</p>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </Card>
      </div>

      {/* Detail Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Dettaglio Appuntamento"
        size="md"
      >
        {selectedAppuntamento && (
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className={clsx(
                'w-12 h-12 rounded-lg flex items-center justify-center',
                tipoConfig[selectedAppuntamento.tipo].color === 'primary' && 'bg-primary/10 text-primary',
                tipoConfig[selectedAppuntamento.tipo].color === 'success' && 'bg-success/10 text-success',
                tipoConfig[selectedAppuntamento.tipo].color === 'info' && 'bg-info/10 text-info',
                tipoConfig[selectedAppuntamento.tipo].color === 'warning' && 'bg-warning/10 text-warning'
              )}>
                {(() => {
                  const Icon = tipoConfig[selectedAppuntamento.tipo].icon
                  return <Icon className="w-6 h-6" />
                })()}
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold">{selectedAppuntamento.titolo}</h3>
                <p className="text-foreground-muted">{tipoConfig[selectedAppuntamento.tipo].label}</p>
              </div>
              <Badge variant={statoConfig[selectedAppuntamento.stato].color as any}>
                {statoConfig[selectedAppuntamento.stato].label}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-foreground-muted" />
                <div>
                  <p className="text-xs text-foreground-muted">Cliente</p>
                  <p className="font-medium">{selectedAppuntamento.cliente_nome}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-foreground-muted" />
                <div>
                  <p className="text-xs text-foreground-muted">Telefono</p>
                  <p className="font-medium">{selectedAppuntamento.cliente_telefono}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-foreground-muted" />
                <div>
                  <p className="text-xs text-foreground-muted">Data e Ora</p>
                  <p className="font-medium">
                    {new Date(selectedAppuntamento.data_ora).toLocaleDateString('it-IT', {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'long',
                    })} alle {new Date(selectedAppuntamento.data_ora).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
              <div>
                <p className="text-xs text-foreground-muted">Durata</p>
                <p className="font-medium">{selectedAppuntamento.durata_minuti} minuti</p>
              </div>
            </div>

            {selectedAppuntamento.note && (
              <div>
                <p className="text-xs text-foreground-muted uppercase mb-1">Note</p>
                <p className="text-foreground">{selectedAppuntamento.note}</p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Aggiorna Stato</label>
              <div className="flex flex-wrap gap-2">
                {Object.entries(statoConfig).map(([stato, config]) => (
                  <Button
                    key={stato}
                    variant={selectedAppuntamento.stato === stato ? 'primary' : 'outline'}
                    size="sm"
                    onClick={() => {
                      setAppuntamenti(appuntamenti.map((a) =>
                        a.id === selectedAppuntamento.id
                          ? { ...a, stato: stato as StatoAppuntamento }
                          : a
                      ))
                      setSelectedAppuntamento({ ...selectedAppuntamento, stato: stato as StatoAppuntamento })
                    }}
                  >
                    {config.label}
                  </Button>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-border">
              <Button variant="ghost" onClick={() => setIsModalOpen(false)}>
                Chiudi
              </Button>
              <Button variant="danger">
                Elimina
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* New Appointment Modal */}
      <Modal
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
        title="Nuovo Appuntamento"
        size="md"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Nome Cliente"
              value={newAppuntamento.cliente_nome}
              onChange={(e) => setNewAppuntamento({ ...newAppuntamento, cliente_nome: e.target.value })}
              placeholder="Mario Rossi"
            />
            <Input
              label="Telefono"
              value={newAppuntamento.cliente_telefono}
              onChange={(e) => setNewAppuntamento({ ...newAppuntamento, cliente_telefono: e.target.value })}
              placeholder="333 1234567"
            />
          </div>

          <Select
            label="Tipo Appuntamento"
            value={newAppuntamento.tipo}
            onChange={(e) => setNewAppuntamento({ ...newAppuntamento, tipo: e.target.value as TipoAppuntamento })}
            options={Object.entries(tipoConfig).map(([value, config]) => ({
              value,
              label: config.label,
            }))}
          />

          <Input
            label="Titolo"
            value={newAppuntamento.titolo}
            onChange={(e) => setNewAppuntamento({ ...newAppuntamento, titolo: e.target.value })}
            placeholder="Descrizione appuntamento"
          />

          <div className="grid grid-cols-3 gap-4">
            <Input
              label="Data"
              type="date"
              value={newAppuntamento.data}
              onChange={(e) => setNewAppuntamento({ ...newAppuntamento, data: e.target.value })}
            />
            <Select
              label="Ora"
              value={newAppuntamento.ora}
              onChange={(e) => setNewAppuntamento({ ...newAppuntamento, ora: e.target.value })}
              options={orari.map((time) => ({ value: time, label: time }))}
              placeholder="Seleziona"
            />
            <Select
              label="Durata"
              value={newAppuntamento.durata_minuti.toString()}
              onChange={(e) => setNewAppuntamento({ ...newAppuntamento, durata_minuti: parseInt(e.target.value) })}
              options={[
                { value: '15', label: '15 min' },
                { value: '30', label: '30 min' },
                { value: '45', label: '45 min' },
                { value: '60', label: '60 min' },
              ]}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Note</label>
            <textarea
              value={newAppuntamento.note}
              onChange={(e) => setNewAppuntamento({ ...newAppuntamento, note: e.target.value })}
              className="input-base min-h-[80px]"
              placeholder="Note aggiuntive..."
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <Button variant="ghost" onClick={() => setIsNewModalOpen(false)}>
              Annulla
            </Button>
            <Button variant="primary" onClick={() => setIsNewModalOpen(false)}>
              Crea Appuntamento
            </Button>
          </div>
        </div>
      </Modal>
    </MainLayout>
  )
}

export default function AppuntamentiPage() {
  return (
    <Suspense fallback={
      <MainLayout title="Appuntamenti">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </MainLayout>
    }>
      <AppuntamentiPageContent />
    </Suspense>
  )
}
