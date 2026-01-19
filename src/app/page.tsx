'use client'

import { useEffect, useState } from 'react'
import { MainLayout } from '@/components/layout'
import { Card } from '@/components/ui'
import {
  Users,
  ShoppingCart,
  Package,
  Receipt,
  TrendingUp,
  TrendingDown,
  Calendar,
  Clock,
  AlertCircle,
  Eye,
  ArrowRight,
} from 'lucide-react'
import Link from 'next/link'
import { clsx } from 'clsx'

// Mock data for dashboard
const mockStats = {
  clientiTotali: 1234,
  clientiNuovi: 45,
  ordiniMese: 89,
  ordiniPendenti: 12,
  fatturato: 45678.90,
  fatturatoTrend: 12.5,
  prodottiSottoscorta: 8,
  appuntamentiOggi: 6,
}

const mockOrdiniRecenti = [
  { id: '1', numero: 'ORD-2024001', cliente: 'Mario Rossi', stato: 'in_lavorazione', totale: 450.00 },
  { id: '2', numero: 'ORD-2024002', cliente: 'Anna Bianchi', stato: 'pronto', totale: 320.00 },
  { id: '3', numero: 'ORD-2024003', cliente: 'Luigi Verdi', stato: 'nuovo', totale: 580.00 },
  { id: '4', numero: 'ORD-2024004', cliente: 'Sara Neri', stato: 'attesa_lenti', totale: 290.00 },
]

const mockAppuntamenti = [
  { id: '1', ora: '09:00', cliente: 'Marco Bianchi', tipo: 'visita' },
  { id: '2', ora: '10:30', cliente: 'Giulia Rossi', tipo: 'ritiro' },
  { id: '3', ora: '14:00', cliente: 'Paolo Verdi', tipo: 'controllo' },
  { id: '4', ora: '16:00', cliente: 'Elena Neri', tipo: 'visita' },
]

const statoColors: Record<string, string> = {
  nuovo: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  in_lavorazione: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  attesa_lenti: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  pronto: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  consegnato: 'bg-stone-100 text-stone-700 dark:bg-stone-900/30 dark:text-stone-400',
}

const tipoAppColors: Record<string, string> = {
  visita: 'bg-primary/10 text-primary',
  ritiro: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  controllo: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
}

export default function DashboardPage() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  return (
    <MainLayout title="Dashboard">
      <div className="space-y-6 animate-fade-in">
        {/* Welcome Section */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Buongiorno!
            </h1>
            <p className="text-foreground-muted mt-1">
              Ecco un riepilogo della tua attivita
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm text-foreground-muted">
            <Calendar className="w-4 h-4" />
            {new Date().toLocaleDateString('it-IT', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 stagger-children">
          {/* Clienti */}
          <Card variant="gradient" gradient="primary" padding="md">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-white/80 text-sm font-medium">Clienti Totali</p>
                <p className="text-3xl font-bold text-white mt-1">
                  {mockStats.clientiTotali.toLocaleString()}
                </p>
                <p className="text-white/70 text-sm mt-2">
                  +{mockStats.clientiNuovi} questo mese
                </p>
              </div>
              <div className="p-3 rounded-xl bg-white/20">
                <Users className="w-6 h-6 text-white" />
              </div>
            </div>
          </Card>

          {/* Ordini */}
          <Card variant="gradient" gradient="secondary" padding="md">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-white/80 text-sm font-medium">Ordini Mese</p>
                <p className="text-3xl font-bold text-white mt-1">
                  {mockStats.ordiniMese}
                </p>
                <p className="text-white/70 text-sm mt-2">
                  {mockStats.ordiniPendenti} in lavorazione
                </p>
              </div>
              <div className="p-3 rounded-xl bg-white/20">
                <ShoppingCart className="w-6 h-6 text-white" />
              </div>
            </div>
          </Card>

          {/* Fatturato */}
          <Card variant="gradient" gradient="success" padding="md">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-white/80 text-sm font-medium">Fatturato Mese</p>
                <p className="text-3xl font-bold text-white mt-1">
                  {mockStats.fatturato.toLocaleString('it-IT', { style: 'currency', currency: 'EUR' })}
                </p>
                <div className="flex items-center gap-1 mt-2">
                  {mockStats.fatturatoTrend > 0 ? (
                    <TrendingUp className="w-4 h-4 text-white/80" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-white/80" />
                  )}
                  <span className="text-white/70 text-sm">
                    {mockStats.fatturatoTrend > 0 ? '+' : ''}{mockStats.fatturatoTrend}% vs mese prec.
                  </span>
                </div>
              </div>
              <div className="p-3 rounded-xl bg-white/20">
                <Receipt className="w-6 h-6 text-white" />
              </div>
            </div>
          </Card>

          {/* Scorte */}
          <Card variant="gradient" gradient="info" padding="md">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-white/80 text-sm font-medium">Prodotti Sottoscorta</p>
                <p className="text-3xl font-bold text-white mt-1">
                  {mockStats.prodottiSottoscorta}
                </p>
                <p className="text-white/70 text-sm mt-2">
                  Da riordinare
                </p>
              </div>
              <div className="p-3 rounded-xl bg-white/20">
                <Package className="w-6 h-6 text-white" />
              </div>
            </div>
          </Card>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Ordini Recenti */}
          <Card className="lg:col-span-2" padding="none">
            <div className="p-6 border-b border-border">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Eye className="w-5 h-5 text-primary" />
                  </div>
                  <h2 className="text-lg font-semibold text-foreground">Ordini Recenti</h2>
                </div>
                <Link
                  href="/ordini"
                  className="text-sm text-primary hover:text-primary-dark flex items-center gap-1 transition-colors"
                >
                  Vedi tutti
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
            <div className="divide-y divide-border">
              {mockOrdiniRecenti.map((ordine) => (
                <div
                  key={ordine.id}
                  className="p-4 hover:bg-background-secondary/50 transition-colors cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-foreground">{ordine.numero}</p>
                      <p className="text-sm text-foreground-muted">{ordine.cliente}</p>
                    </div>
                    <div className="text-right">
                      <span
                        className={clsx(
                          'inline-flex px-2.5 py-1 rounded-full text-xs font-medium',
                          statoColors[ordine.stato]
                        )}
                      >
                        {ordine.stato.replace('_', ' ')}
                      </span>
                      <p className="text-sm font-medium text-foreground mt-1">
                        {ordine.totale.toLocaleString('it-IT', { style: 'currency', currency: 'EUR' })}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Appuntamenti Oggi */}
          <Card padding="none">
            <div className="p-6 border-b border-border">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-secondary/10">
                    <Calendar className="w-5 h-5 text-secondary" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-foreground">Oggi</h2>
                    <p className="text-sm text-foreground-muted">
                      {mockStats.appuntamentiOggi} appuntamenti
                    </p>
                  </div>
                </div>
                <Link
                  href="/appuntamenti"
                  className="text-sm text-primary hover:text-primary-dark transition-colors"
                >
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
            <div className="divide-y divide-border">
              {mockAppuntamenti.map((app) => (
                <div
                  key={app.id}
                  className="p-4 hover:bg-background-secondary/50 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-background-secondary">
                      <Clock className="w-5 h-5 text-foreground-muted" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground truncate">{app.cliente}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-sm text-foreground-muted">{app.ora}</span>
                        <span
                          className={clsx(
                            'px-2 py-0.5 rounded text-xs font-medium',
                            tipoAppColors[app.tipo]
                          )}
                        >
                          {app.tipo}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card padding="md">
          <h2 className="text-lg font-semibold text-foreground mb-4">Azioni Rapide</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Link
              href="/clienti?nuovo=true"
              className="flex flex-col items-center gap-2 p-4 rounded-xl bg-background-secondary hover:bg-primary/10 transition-colors group"
            >
              <div className="p-3 rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <span className="text-sm font-medium text-foreground">Nuovo Cliente</span>
            </Link>
            <Link
              href="/ordini?nuovo=true"
              className="flex flex-col items-center gap-2 p-4 rounded-xl bg-background-secondary hover:bg-secondary/10 transition-colors group"
            >
              <div className="p-3 rounded-xl bg-secondary/10 group-hover:bg-secondary/20 transition-colors">
                <ShoppingCart className="w-6 h-6 text-secondary" />
              </div>
              <span className="text-sm font-medium text-foreground">Nuovo Ordine</span>
            </Link>
            <Link
              href="/appuntamenti?nuovo=true"
              className="flex flex-col items-center gap-2 p-4 rounded-xl bg-background-secondary hover:bg-success/10 transition-colors group"
            >
              <div className="p-3 rounded-xl bg-success/10 group-hover:bg-success/20 transition-colors">
                <Calendar className="w-6 h-6 text-success" />
              </div>
              <span className="text-sm font-medium text-foreground">Nuovo Appuntamento</span>
            </Link>
            <Link
              href="/vendite?nuovo=true"
              className="flex flex-col items-center gap-2 p-4 rounded-xl bg-background-secondary hover:bg-info/10 transition-colors group"
            >
              <div className="p-3 rounded-xl bg-info/10 group-hover:bg-info/20 transition-colors">
                <Receipt className="w-6 h-6 text-info" />
              </div>
              <span className="text-sm font-medium text-foreground">Nuova Vendita</span>
            </Link>
          </div>
        </Card>

        {/* Alerts */}
        {mockStats.prodottiSottoscorta > 0 && (
          <Card className="border-warning/50 bg-warning/5" padding="md">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-warning/10">
                <AlertCircle className="w-5 h-5 text-warning" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-foreground">Attenzione: Scorte Basse</h3>
                <p className="text-sm text-foreground-muted mt-1">
                  Ci sono {mockStats.prodottiSottoscorta} prodotti sotto la quantita minima.
                  <Link href="/magazzino?filtro=sottoscorta" className="text-primary hover:underline ml-1">
                    Visualizza prodotti
                  </Link>
                </p>
              </div>
            </div>
          </Card>
        )}
      </div>
    </MainLayout>
  )
}
