'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import {
  apriCassetto,
  stampaScontrino,
  testConnessione,
  chiusuraGiornaliera,
  chiusuraFiscale,
  REPARTI_IVA,
  calcolaTotale,
  calcolaIVA,
  type ArticoloScontrino,
  type CassaResponse,
} from '@/lib/cassa'

interface ArticoloCarrello extends ArticoloScontrino {
  id: string
}

interface Cliente {
  id: string
  codice: string
  nome: string
  cognome: string
  codice_fiscale?: string
}

export default function CassaPage() {
  const [carrello, setCarrello] = useState<ArticoloCarrello[]>([])
  const [cassaConnessa, setCassaConnessa] = useState<boolean | null>(null)
  const [loading, setLoading] = useState(false)
  const [messaggio, setMessaggio] = useState<{ tipo: 'success' | 'error'; testo: string } | null>(null)
  const [metodoPagamento, setMetodoPagamento] = useState<'contanti' | 'carta' | 'misto'>('contanti')
  const [codiceLotteria, setCodiceLotteria] = useState('')

  // Cliente selezionato
  const [clienteSelezionato, setClienteSelezionato] = useState<Cliente | null>(null)
  const [ricercaCliente, setRicercaCliente] = useState('')
  const [clientiTrovati, setClientiTrovati] = useState<Cliente[]>([])
  const [mostraRicercaCliente, setMostraRicercaCliente] = useState(false)

  // Form articolo rapido
  const [descrizioneRapida, setDescrizioneRapida] = useState('')
  const [prezzoRapido, setPrezzoRapido] = useState('')
  const [repartoSelezionato, setRepartoSelezionato] = useState<number | null>(null)

  // supabase è importato da @/lib/supabase

  // Test connessione all'avvio
  useEffect(() => {
    verificaConnessione()
  }, [])

  // Ricerca cliente
  useEffect(() => {
    const cercaClienti = async () => {
      if (ricercaCliente.length < 2) {
        setClientiTrovati([])
        return
      }

      const { data } = await supabase
        .from('clienti')
        .select('id, codice, nome, cognome, codice_fiscale')
        .or(`cognome.ilike.%${ricercaCliente}%,nome.ilike.%${ricercaCliente}%,codice_fiscale.ilike.%${ricercaCliente}%`)
        .limit(5)

      setClientiTrovati(data || [])
    }

    const debounce = setTimeout(cercaClienti, 300)
    return () => clearTimeout(debounce)
  }, [ricercaCliente])

  const verificaConnessione = async () => {
    const result = await testConnessione()
    setCassaConnessa(result.success)
    if (!result.success) {
      setMessaggio({ tipo: 'error', testo: result.message + (result.error ? `: ${result.error}` : '') })
    }
  }

  const mostraMsg = (result: CassaResponse) => {
    setMessaggio({
      tipo: result.success ? 'success' : 'error',
      testo: result.message + (result.error ? `: ${result.error}` : ''),
    })
    setTimeout(() => setMessaggio(null), 5000)
  }

  const handleApriCassetto = async () => {
    setLoading(true)
    const result = await apriCassetto()
    mostraMsg(result)
    setLoading(false)
  }

  // Aggiungi articolo con reparto rapido
  const handleAggiungiRapido = (repartoId: number, repartoNome: string) => {
    if (repartoSelezionato === repartoId && descrizioneRapida && prezzoRapido) {
      // Se già selezionato e abbiamo i dati, aggiungi
      const prezzo = parseFloat(prezzoRapido)
      if (!isNaN(prezzo) && prezzo > 0) {
        const articolo: ArticoloCarrello = {
          id: Date.now().toString(),
          descrizione: descrizioneRapida || repartoNome,
          prezzo,
          quantita: 1,
          reparto: repartoId,
        }
        setCarrello([...carrello, articolo])
        setDescrizioneRapida('')
        setPrezzoRapido('')
        setRepartoSelezionato(null)
        setMessaggio(null)
      }
    } else {
      // Seleziona questo reparto
      setRepartoSelezionato(repartoId)
      if (!descrizioneRapida) {
        setDescrizioneRapida(repartoNome)
      }
    }
  }

  const handleRimuoviArticolo = (id: string) => {
    setCarrello(carrello.filter(a => a.id !== id))
  }

  const handleStampaScontrino = async () => {
    if (carrello.length === 0) {
      setMessaggio({ tipo: 'error', testo: 'Il carrello è vuoto' })
      return
    }

    setLoading(true)
    const articoliScontrino: ArticoloScontrino[] = carrello.map(({ id, ...rest }) => rest)
    const result = await stampaScontrino(articoliScontrino, metodoPagamento)
    mostraMsg(result)

    if (result.success) {
      setCarrello([])
      setClienteSelezionato(null)
      setCodiceLotteria('')
    }
    setLoading(false)
  }

  const handleChiusuraGiornaliera = async () => {
    if (!confirm('Eseguire la chiusura giornaliera (Report X)?')) return
    setLoading(true)
    const result = await chiusuraGiornaliera()
    mostraMsg(result)
    setLoading(false)
  }

  const handleChiusuraFiscale = async () => {
    if (!confirm('ATTENZIONE: Eseguire la chiusura fiscale (Report Z)? Questa operazione è irreversibile.')) return
    setLoading(true)
    const result = await chiusuraFiscale()
    mostraMsg(result)
    setLoading(false)
  }

  const selezionaCliente = (cliente: Cliente) => {
    setClienteSelezionato(cliente)
    setRicercaCliente('')
    setClientiTrovati([])
    setMostraRicercaCliente(false)
  }

  const totale = calcolaTotale(carrello)
  const ivaCalcolata = calcolaIVA(carrello)

  const getRepartoIva = (id: number) => {
    const reparto = Object.values(REPARTI_IVA).find(r => r.id === id)
    return reparto?.iva || 22
  }

  // Data e ora correnti
  const now = new Date()
  const dataCorrente = now.toLocaleDateString('it-IT')
  const oraCorrente = now.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Punto Cassa</h1>
            <p className="text-sm text-gray-500">Emissione scontrini fiscali</p>
          </div>
          <div className="flex items-center gap-6">
            {/* Status connessione */}
            <div className="flex items-center gap-2">
              <div
                className={`w-3 h-3 rounded-full animate-pulse ${
                  cassaConnessa === null ? 'bg-yellow-400' : cassaConnessa ? 'bg-green-500' : 'bg-red-500'
                }`}
              />
              <span className="text-sm font-medium text-gray-700">
                {cassaConnessa === null ? 'Connessione...' : cassaConnessa ? 'Cassa Online' : 'Cassa Offline'}
              </span>
              <button onClick={verificaConnessione} className="text-blue-600 hover:text-blue-800 text-sm">
                Riprova
              </button>
            </div>
            {/* Data e ora */}
            <div className="text-right">
              <p className="text-2xl font-bold text-blue-600">{oraCorrente}</p>
              <p className="text-sm text-gray-500">{dataCorrente}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Messaggio */}
      {messaggio && (
        <div className={`mx-6 mt-4 p-4 rounded-xl shadow-lg ${
          messaggio.tipo === 'success'
            ? 'bg-green-500 text-white'
            : 'bg-red-500 text-white'
        }`}>
          {messaggio.testo}
        </div>
      )}

      <div className="p-6">
        <div className="grid grid-cols-12 gap-6">
          {/* Colonna sinistra - Cliente e Carrello */}
          <div className="col-span-7 space-y-4">
            {/* Cliente */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-semibold text-gray-800">Cliente</h2>
                {clienteSelezionato && (
                  <button
                    onClick={() => setClienteSelezionato(null)}
                    className="text-sm text-red-600 hover:text-red-800"
                  >
                    Rimuovi
                  </button>
                )}
              </div>

              {clienteSelezionato ? (
                <div className="flex items-center gap-4 p-3 bg-blue-50 rounded-xl">
                  <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                    {clienteSelezionato.nome[0]}{clienteSelezionato.cognome[0]}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">
                      {clienteSelezionato.nome} {clienteSelezionato.cognome}
                    </p>
                    <p className="text-sm text-gray-600">
                      {clienteSelezionato.codice_fiscale || 'CF non presente'}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-gray-500">Codice</span>
                    <p className="font-mono font-bold text-blue-600">{clienteSelezionato.codice}</p>
                  </div>
                </div>
              ) : (
                <div className="relative">
                  <input
                    type="text"
                    value={ricercaCliente}
                    onChange={(e) => {
                      setRicercaCliente(e.target.value)
                      setMostraRicercaCliente(true)
                    }}
                    onFocus={() => setMostraRicercaCliente(true)}
                    placeholder="Cerca cliente per nome, cognome o CF..."
                    className="w-full px-4 py-3 bg-gray-50 border-0 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                  />
                  {mostraRicercaCliente && clientiTrovati.length > 0 && (
                    <div className="absolute z-10 w-full mt-2 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden">
                      {clientiTrovati.map((cliente) => (
                        <button
                          key={cliente.id}
                          onClick={() => selezionaCliente(cliente)}
                          className="w-full px-4 py-3 text-left hover:bg-blue-50 transition-colors flex items-center gap-3"
                        >
                          <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-sm font-medium">
                            {cliente.nome[0]}{cliente.cognome[0]}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{cliente.nome} {cliente.cognome}</p>
                            <p className="text-xs text-gray-500">{cliente.codice_fiscale || cliente.codice}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Codice Lotteria */}
              <div className="mt-3">
                <input
                  type="text"
                  value={codiceLotteria}
                  onChange={(e) => setCodiceLotteria(e.target.value.toUpperCase())}
                  placeholder="Codice Lotteria (opzionale)"
                  maxLength={8}
                  className="w-full px-4 py-2 bg-gray-50 border-0 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all font-mono"
                />
              </div>
            </div>

            {/* Input rapido */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  value={descrizioneRapida}
                  onChange={(e) => setDescrizioneRapida(e.target.value)}
                  placeholder="Descrizione articolo"
                  maxLength={30}
                  className="px-4 py-3 bg-gray-50 border-0 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                />
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">€</span>
                  <input
                    type="number"
                    step="0.01"
                    value={prezzoRapido}
                    onChange={(e) => setPrezzoRapido(e.target.value)}
                    placeholder="0,00"
                    className="w-full pl-8 pr-4 py-3 bg-gray-50 border-0 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-right text-xl font-bold"
                  />
                </div>
              </div>
              {repartoSelezionato && (
                <p className="mt-2 text-sm text-blue-600">
                  Premi di nuovo il reparto per confermare o inserisci prezzo e descrizione
                </p>
              )}
            </div>

            {/* Carrello */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex-1">
              <div className="p-4 border-b border-gray-100">
                <h2 className="font-semibold text-gray-800">
                  Scontrino ({carrello.length} {carrello.length === 1 ? 'articolo' : 'articoli'})
                </h2>
              </div>
              <div className="p-4 max-h-[300px] overflow-y-auto">
                {carrello.length === 0 ? (
                  <div className="text-center py-12 text-gray-400">
                    <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    <p>Nessun articolo</p>
                    <p className="text-sm mt-1">Seleziona un reparto per iniziare</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {carrello.map((articolo, index) => (
                      <div
                        key={articolo.id}
                        className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl group hover:bg-gray-100 transition-colors"
                      >
                        <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold">
                          {index + 1}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 truncate">{articolo.descrizione}</p>
                          <p className="text-xs text-gray-500">
                            IVA {getRepartoIva(articolo.reparto)}% • Qta: {articolo.quantita}
                          </p>
                        </div>
                        <p className="font-bold text-gray-900 tabular-nums">
                          € {(articolo.prezzo * articolo.quantita).toFixed(2)}
                        </p>
                        <button
                          onClick={() => handleRimuoviArticolo(articolo.id)}
                          className="opacity-0 group-hover:opacity-100 p-2 text-red-500 hover:bg-red-100 rounded-lg transition-all"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Colonna destra - Reparti e Totale */}
          <div className="col-span-5 space-y-4">
            {/* Tasti Reparti */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
              <h2 className="font-semibold text-gray-800 mb-3">Reparti</h2>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(REPARTI_IVA).map(([key, reparto]) => {
                  const isSelected = repartoSelezionato === reparto.id
                  const colorClass = reparto.iva === 4
                    ? isSelected ? 'bg-emerald-600 text-white' : 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                    : isSelected ? 'bg-orange-600 text-white' : 'bg-orange-100 text-orange-800 hover:bg-orange-200'

                  return (
                    <button
                      key={key}
                      onClick={() => handleAggiungiRapido(reparto.id, reparto.nome)}
                      className={`p-3 rounded-xl text-sm font-medium transition-all ${colorClass} ${isSelected ? 'ring-2 ring-offset-2 ring-blue-500' : ''}`}
                    >
                      <span className="block truncate">{reparto.nome}</span>
                      <span className="text-xs opacity-75">IVA {reparto.iva}%</span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Totale */}
            <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl shadow-lg p-6 text-white">
              <div className="space-y-2 text-blue-100 text-sm">
                {ivaCalcolata.iva4 > 0 && (
                  <div className="flex justify-between">
                    <span>IVA 4%</span>
                    <span>€ {ivaCalcolata.iva4.toFixed(2)}</span>
                  </div>
                )}
                {ivaCalcolata.iva22 > 0 && (
                  <div className="flex justify-between">
                    <span>IVA 22%</span>
                    <span>€ {ivaCalcolata.iva22.toFixed(2)}</span>
                  </div>
                )}
              </div>
              <div className="mt-4 pt-4 border-t border-blue-500">
                <div className="flex justify-between items-end">
                  <span className="text-blue-200 font-medium">TOTALE</span>
                  <span className="text-4xl font-bold tabular-nums">€ {totale.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Metodo Pagamento */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
              <h2 className="font-semibold text-gray-800 mb-3">Pagamento</h2>
              <div className="grid grid-cols-3 gap-2">
                {([
                  { key: 'contanti', label: 'Contanti', icon: '💵' },
                  { key: 'carta', label: 'Carta', icon: '💳' },
                  { key: 'misto', label: 'Misto', icon: '🔄' },
                ] as const).map(({ key, label, icon }) => (
                  <button
                    key={key}
                    onClick={() => setMetodoPagamento(key)}
                    className={`p-3 rounded-xl text-sm font-medium transition-all ${
                      metodoPagamento === key
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-200'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <span className="text-xl block mb-1">{icon}</span>
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Pulsante Stampa */}
            <button
              onClick={handleStampaScontrino}
              disabled={loading || carrello.length === 0}
              className="w-full py-5 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-2xl font-bold text-xl shadow-lg shadow-green-200 hover:shadow-xl hover:shadow-green-300 disabled:from-gray-300 disabled:to-gray-400 disabled:shadow-none transition-all flex items-center justify-center gap-3"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              {loading ? 'Stampa in corso...' : 'STAMPA SCONTRINO'}
            </button>

            {/* Azioni Rapide */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handleApriCassetto}
                disabled={loading}
                className="py-3 bg-yellow-500 text-white rounded-xl font-medium hover:bg-yellow-600 disabled:bg-gray-300 transition-all flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                </svg>
                Apri Cassetto
              </button>
              <button
                onClick={handleChiusuraGiornaliera}
                disabled={loading}
                className="py-3 bg-gray-600 text-white rounded-xl font-medium hover:bg-gray-700 disabled:bg-gray-300 transition-all"
              >
                Report X
              </button>
            </div>

            <button
              onClick={handleChiusuraFiscale}
              disabled={loading}
              className="w-full py-3 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 disabled:bg-gray-300 transition-all"
            >
              Chiusura Fiscale (Z)
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
