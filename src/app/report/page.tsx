'use client'

import { useState } from 'react'
import { MainLayout } from '@/components/layout'
import { Card, CardHeader, Button, Select } from '@/components/ui'
import {
  TrendingUp,
  TrendingDown,
  Users,
  ShoppingCart,
  Receipt,
  Package,
  Euro,
  Calendar,
  Download,
  ArrowUpRight,
  ArrowDownRight,
  Eye,
  Glasses,
  Sun,
  CircleDot,
} from 'lucide-react'
import { clsx } from 'clsx'

// Mock data
const mockStats = {
  fatturato: {
    valore: 45678.90,
    variazione: 12.5,
    periodoPrec: 40603.02,
  },
  ordini: {
    valore: 89,
    variazione: 8.2,
    periodoPrec: 82,
  },
  clientiNuovi: {
    valore: 23,
    variazione: -5.1,
    periodoPrec: 24,
  },
  scontrinoMedio: {
    valore: 513.25,
    variazione: 4.0,
    periodoPrec: 493.51,
  },
}

const mockVenditeMensili = [
  { mese: 'Gen', vendite: 32500 },
  { mese: 'Feb', vendite: 38200 },
  { mese: 'Mar', vendite: 45679 },
  { mese: 'Apr', vendite: 0 },
  { mese: 'Mag', vendite: 0 },
  { mese: 'Giu', vendite: 0 },
]

const mockTopProdotti = [
  { nome: 'Ray-Ban RB5154', categoria: 'Montature Vista', vendite: 28, fatturato: 5040 },
  { nome: 'Essilor Varilux X', categoria: 'Lenti', vendite: 22, fatturato: 7700 },
  { nome: 'Oakley Holbrook', categoria: 'Montature Sole', vendite: 18, fatturato: 2700 },
  { nome: 'Acuvue Oasys', categoria: 'LAC', vendite: 45, fatturato: 2025 },
  { nome: 'Gucci GG0027O', categoria: 'Montature Vista', vendite: 8, fatturato: 2560 },
]

const mockCategorieVendite = [
  { nome: 'Montature Vista', valore: 18500, percentuale: 40.5, colore: 'bg-primary' },
  { nome: 'Lenti Oftalmiche', valore: 12300, percentuale: 26.9, colore: 'bg-secondary' },
  { nome: 'Montature Sole', valore: 8200, percentuale: 17.9, colore: 'bg-info' },
  { nome: 'Lenti a Contatto', valore: 4500, percentuale: 9.9, colore: 'bg-success' },
  { nome: 'Accessori', valore: 2178, percentuale: 4.8, colore: 'bg-warning' },
]

const mockTopClienti = [
  { nome: 'Mario Rossi', ordini: 5, fatturato: 2850 },
  { nome: 'Azienda ABC Srl', ordini: 12, fatturato: 8500 },
  { nome: 'Anna Bianchi', ordini: 3, fatturato: 1250 },
  { nome: 'Studio Legale XYZ', ordini: 8, fatturato: 4200 },
]

export default function ReportPage() {
  const [periodo, setPeriodo] = useState('mese')

  const StatCard = ({
    titolo,
    valore,
    variazione,
    formato = 'numero',
    icona: Icona,
  }: {
    titolo: string
    valore: number
    variazione: number
    formato?: 'numero' | 'valuta'
    icona: any
  }) => (
    <Card>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-foreground-muted">{titolo}</p>
          <p className="text-2xl font-bold text-foreground mt-1">
            {formato === 'valuta'
              ? valore.toLocaleString('it-IT', { style: 'currency', currency: 'EUR' })
              : valore.toLocaleString('it-IT')
            }
          </p>
          <div className={clsx(
            'flex items-center gap-1 mt-2 text-sm',
            variazione >= 0 ? 'text-success' : 'text-error'
          )}>
            {variazione >= 0 ? (
              <ArrowUpRight className="w-4 h-4" />
            ) : (
              <ArrowDownRight className="w-4 h-4" />
            )}
            <span>{Math.abs(variazione)}%</span>
            <span className="text-foreground-muted">vs periodo prec.</span>
          </div>
        </div>
        <div className="p-3 rounded-xl bg-primary/10">
          <Icona className="w-6 h-6 text-primary" />
        </div>
      </div>
    </Card>
  )

  const maxVendita = Math.max(...mockVenditeMensili.map((m) => m.vendite))

  return (
    <MainLayout title="Report & Analytics">
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Dashboard Analytics</h1>
            <p className="text-foreground-muted">Panoramica delle performance del negozio</p>
          </div>

          <div className="flex gap-2">
            <Select
              value={periodo}
              onChange={(e) => setPeriodo(e.target.value)}
              options={[
                { value: 'settimana', label: 'Ultima settimana' },
                { value: 'mese', label: 'Ultimo mese' },
                { value: 'trimestre', label: 'Ultimo trimestre' },
                { value: 'anno', label: 'Ultimo anno' },
              ]}
            />
            <Button variant="outline" size="sm" leftIcon={<Download className="w-4 h-4" />}>
              Esporta
            </Button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            titolo="Fatturato"
            valore={mockStats.fatturato.valore}
            variazione={mockStats.fatturato.variazione}
            formato="valuta"
            icona={Euro}
          />
          <StatCard
            titolo="Ordini"
            valore={mockStats.ordini.valore}
            variazione={mockStats.ordini.variazione}
            icona={ShoppingCart}
          />
          <StatCard
            titolo="Nuovi Clienti"
            valore={mockStats.clientiNuovi.valore}
            variazione={mockStats.clientiNuovi.variazione}
            icona={Users}
          />
          <StatCard
            titolo="Scontrino Medio"
            valore={mockStats.scontrinoMedio.valore}
            variazione={mockStats.scontrinoMedio.variazione}
            formato="valuta"
            icona={Receipt}
          />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Vendite Mensili */}
          <Card className="lg:col-span-2" padding="none">
            <CardHeader
              title="Andamento Vendite"
              subtitle="Fatturato mensile"
              action={
                <div className="text-right">
                  <p className="text-2xl font-bold text-foreground">
                    {mockVenditeMensili.reduce((acc, m) => acc + m.vendite, 0).toLocaleString('it-IT', { style: 'currency', currency: 'EUR' })}
                  </p>
                  <p className="text-xs text-foreground-muted">Totale YTD</p>
                </div>
              }
            />
            <div className="px-6 pb-6">
              <div className="flex items-end justify-between gap-2 h-48">
                {mockVenditeMensili.map((mese, index) => (
                  <div key={mese.mese} className="flex-1 flex flex-col items-center gap-2">
                    <div
                      className={clsx(
                        'w-full rounded-t-lg transition-all',
                        mese.vendite > 0 ? 'bg-primary' : 'bg-background-secondary'
                      )}
                      style={{
                        height: mese.vendite > 0 ? `${(mese.vendite / maxVendita) * 100}%` : '4px',
                        minHeight: '4px',
                      }}
                    />
                    <span className="text-xs text-foreground-muted">{mese.mese}</span>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          {/* Vendite per Categoria */}
          <Card padding="none">
            <CardHeader
              title="Per Categoria"
              subtitle="Distribuzione vendite"
            />
            <div className="px-6 pb-6 space-y-4">
              {mockCategorieVendite.map((cat) => (
                <div key={cat.nome}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">{cat.nome}</span>
                    <span className="text-sm text-foreground-muted">
                      {cat.valore.toLocaleString('it-IT', { style: 'currency', currency: 'EUR' })}
                    </span>
                  </div>
                  <div className="w-full h-2 bg-background-secondary rounded-full overflow-hidden">
                    <div
                      className={clsx('h-full rounded-full', cat.colore)}
                      style={{ width: `${cat.percentuale}%` }}
                    />
                  </div>
                  <p className="text-xs text-foreground-muted mt-1">{cat.percentuale}%</p>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Tables Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Prodotti */}
          <Card padding="none">
            <CardHeader
              title="Top Prodotti"
              subtitle="Prodotti piu venduti nel periodo"
              action={
                <Button variant="ghost" size="sm">
                  Vedi tutti
                </Button>
              }
            />
            <div className="divide-y divide-border">
              {mockTopProdotti.map((prodotto, index) => (
                <div key={prodotto.nome} className="flex items-center gap-4 p-4">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{prodotto.nome}</p>
                    <p className="text-sm text-foreground-muted">{prodotto.categoria}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-primary">
                      {prodotto.fatturato.toLocaleString('it-IT', { style: 'currency', currency: 'EUR' })}
                    </p>
                    <p className="text-sm text-foreground-muted">{prodotto.vendite} vendite</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Top Clienti */}
          <Card padding="none">
            <CardHeader
              title="Top Clienti"
              subtitle="Clienti con maggior fatturato"
              action={
                <Button variant="ghost" size="sm">
                  Vedi tutti
                </Button>
              }
            />
            <div className="divide-y divide-border">
              {mockTopClienti.map((cliente, index) => (
                <div key={cliente.nome} className="flex items-center gap-4 p-4">
                  <div className="w-8 h-8 rounded-full bg-secondary/10 flex items-center justify-center text-sm font-bold text-secondary">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{cliente.nome}</p>
                    <p className="text-sm text-foreground-muted">{cliente.ordini} ordini</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-secondary">
                      {cliente.fatturato.toLocaleString('it-IT', { style: 'currency', currency: 'EUR' })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="text-center" padding="md">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
              <Glasses className="w-6 h-6 text-primary" />
            </div>
            <p className="text-2xl font-bold">156</p>
            <p className="text-sm text-foreground-muted">Occhiali venduti</p>
          </Card>
          <Card className="text-center" padding="md">
            <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center mx-auto mb-3">
              <Sun className="w-6 h-6 text-secondary" />
            </div>
            <p className="text-2xl font-bold">89</p>
            <p className="text-sm text-foreground-muted">Occhiali da sole</p>
          </Card>
          <Card className="text-center" padding="md">
            <div className="w-12 h-12 rounded-full bg-info/10 flex items-center justify-center mx-auto mb-3">
              <CircleDot className="w-6 h-6 text-info" />
            </div>
            <p className="text-2xl font-bold">234</p>
            <p className="text-sm text-foreground-muted">Lenti a contatto</p>
          </Card>
          <Card className="text-center" padding="md">
            <div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-3">
              <Eye className="w-6 h-6 text-success" />
            </div>
            <p className="text-2xl font-bold">78</p>
            <p className="text-sm text-foreground-muted">Visite effettuate</p>
          </Card>
        </div>
      </div>
    </MainLayout>
  )
}
