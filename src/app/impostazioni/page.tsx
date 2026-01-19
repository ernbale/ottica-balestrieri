'use client'

import { useState } from 'react'
import { MainLayout } from '@/components/layout'
import { Card, CardHeader, Button, Input, Textarea } from '@/components/ui'
import { Save, Upload, Building2, Phone, Mail, Globe, Clock, MapPin } from 'lucide-react'

// Mock store data
const mockStore = {
  id: '1',
  nome: 'Ottica Balestrieri',
  indirizzo: 'Via Roma, 1',
  citta: 'Milano',
  cap: '20100',
  provincia: 'MI',
  telefono: '02 1234567',
  email: 'info@otticabalestrieri.it',
  piva: '12345678901',
  codice_fiscale: '12345678901',
  logo_url: null,
  sito_web: 'www.otticabalestrieri.it',
  orari_apertura: {
    lunedi: { apertura: '09:00', chiusura: '19:00', chiuso: false },
    martedi: { apertura: '09:00', chiusura: '19:00', chiuso: false },
    mercoledi: { apertura: '09:00', chiusura: '19:00', chiuso: false },
    giovedi: { apertura: '09:00', chiusura: '19:00', chiuso: false },
    venerdi: { apertura: '09:00', chiusura: '19:00', chiuso: false },
    sabato: { apertura: '09:00', chiusura: '13:00', chiuso: false },
    domenica: { apertura: '', chiusura: '', chiuso: true },
  },
  note: '',
}

const giorniSettimana = [
  { key: 'lunedi', label: 'Lunedi' },
  { key: 'martedi', label: 'Martedi' },
  { key: 'mercoledi', label: 'Mercoledi' },
  { key: 'giovedi', label: 'Giovedi' },
  { key: 'venerdi', label: 'Venerdi' },
  { key: 'sabato', label: 'Sabato' },
  { key: 'domenica', label: 'Domenica' },
]

export default function ImpostazioniPage() {
  const [store, setStore] = useState(mockStore)
  const [isSaving, setIsSaving] = useState(false)

  const handleChange = (field: string, value: string) => {
    setStore(prev => ({ ...prev, [field]: value }))
  }

  const handleOrarioChange = (giorno: string, field: string, value: string | boolean) => {
    setStore(prev => ({
      ...prev,
      orari_apertura: {
        ...prev.orari_apertura,
        [giorno]: {
          ...prev.orari_apertura[giorno as keyof typeof prev.orari_apertura],
          [field]: value,
        },
      },
    }))
  }

  const handleSave = async () => {
    setIsSaving(true)
    // Simulate save
    await new Promise(resolve => setTimeout(resolve, 1000))
    setIsSaving(false)
  }

  return (
    <MainLayout title="Impostazioni">
      <div className="max-w-4xl space-y-6 animate-fade-in">
        {/* Store Info */}
        <Card>
          <CardHeader
            title="Dati Punto Vendita"
            subtitle="Informazioni principali dell'ottica"
            action={
              <Button
                variant="primary"
                size="sm"
                leftIcon={<Save className="w-4 h-4" />}
                onClick={handleSave}
                isLoading={isSaving}
              >
                Salva
              </Button>
            }
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Logo upload */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-foreground mb-2">
                Logo
              </label>
              <div className="flex items-center gap-4">
                <div className="w-24 h-24 rounded-xl bg-background-secondary border-2 border-dashed border-border flex items-center justify-center">
                  {store.logo_url ? (
                    <img src={store.logo_url} alt="Logo" className="w-full h-full object-contain rounded-xl" />
                  ) : (
                    <Building2 className="w-8 h-8 text-foreground-muted" />
                  )}
                </div>
                <div>
                  <Button variant="outline" size="sm" leftIcon={<Upload className="w-4 h-4" />}>
                    Carica Logo
                  </Button>
                  <p className="text-xs text-foreground-muted mt-2">
                    PNG, JPG fino a 2MB. Dimensione consigliata: 200x200px
                  </p>
                </div>
              </div>
            </div>

            <Input
              label="Nome Attivita"
              value={store.nome}
              onChange={(e) => handleChange('nome', e.target.value)}
              leftIcon={<Building2 className="w-4 h-4" />}
            />

            <Input
              label="Partita IVA"
              value={store.piva}
              onChange={(e) => handleChange('piva', e.target.value)}
            />

            <Input
              label="Codice Fiscale"
              value={store.codice_fiscale}
              onChange={(e) => handleChange('codice_fiscale', e.target.value)}
            />

            <Input
              label="Telefono"
              value={store.telefono}
              onChange={(e) => handleChange('telefono', e.target.value)}
              leftIcon={<Phone className="w-4 h-4" />}
            />

            <Input
              label="Email"
              type="email"
              value={store.email}
              onChange={(e) => handleChange('email', e.target.value)}
              leftIcon={<Mail className="w-4 h-4" />}
            />

            <Input
              label="Sito Web"
              value={store.sito_web || ''}
              onChange={(e) => handleChange('sito_web', e.target.value)}
              leftIcon={<Globe className="w-4 h-4" />}
            />
          </div>
        </Card>

        {/* Address */}
        <Card>
          <CardHeader
            title="Indirizzo"
            subtitle="Ubicazione del punto vendita"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <Input
                label="Indirizzo"
                value={store.indirizzo}
                onChange={(e) => handleChange('indirizzo', e.target.value)}
                leftIcon={<MapPin className="w-4 h-4" />}
              />
            </div>

            <Input
              label="Citta"
              value={store.citta}
              onChange={(e) => handleChange('citta', e.target.value)}
            />

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="CAP"
                value={store.cap}
                onChange={(e) => handleChange('cap', e.target.value)}
              />
              <Input
                label="Provincia"
                value={store.provincia}
                onChange={(e) => handleChange('provincia', e.target.value)}
                maxLength={2}
              />
            </div>
          </div>
        </Card>

        {/* Opening Hours */}
        <Card>
          <CardHeader
            title="Orari di Apertura"
            subtitle="Configura gli orari del punto vendita"
          />

          <div className="space-y-4">
            {giorniSettimana.map(({ key, label }) => {
              const orario = store.orari_apertura[key as keyof typeof store.orari_apertura]
              return (
                <div
                  key={key}
                  className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-lg bg-background-secondary/50"
                >
                  <div className="w-28 font-medium text-foreground">{label}</div>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={!orario.chiuso}
                      onChange={(e) => handleOrarioChange(key, 'chiuso', !e.target.checked)}
                      className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
                    />
                    <span className="text-sm text-foreground-secondary">Aperto</span>
                  </label>

                  {!orario.chiuso && (
                    <div className="flex items-center gap-2 flex-1">
                      <Clock className="w-4 h-4 text-foreground-muted" />
                      <input
                        type="time"
                        value={orario.apertura}
                        onChange={(e) => handleOrarioChange(key, 'apertura', e.target.value)}
                        className="input-base w-auto"
                      />
                      <span className="text-foreground-muted">-</span>
                      <input
                        type="time"
                        value={orario.chiusura}
                        onChange={(e) => handleOrarioChange(key, 'chiusura', e.target.value)}
                        className="input-base w-auto"
                      />
                    </div>
                  )}

                  {orario.chiuso && (
                    <span className="text-sm text-foreground-muted italic">Chiuso</span>
                  )}
                </div>
              )
            })}
          </div>
        </Card>

        {/* Notes */}
        <Card>
          <CardHeader
            title="Note"
            subtitle="Informazioni aggiuntive"
          />

          <Textarea
            value={store.note || ''}
            onChange={(e) => handleChange('note', e.target.value)}
            placeholder="Inserisci eventuali note..."
            rows={4}
          />
        </Card>

        {/* Save Button (mobile) */}
        <div className="md:hidden">
          <Button
            variant="primary"
            fullWidth
            leftIcon={<Save className="w-4 h-4" />}
            onClick={handleSave}
            isLoading={isSaving}
          >
            Salva Modifiche
          </Button>
        </div>
      </div>
    </MainLayout>
  )
}
