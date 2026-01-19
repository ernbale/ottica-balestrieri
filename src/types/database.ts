// Database Types for Ottica Balestrieri

export interface Store {
  id: string
  nome: string
  indirizzo: string
  citta: string
  cap: string
  provincia: string
  telefono: string
  email: string
  piva: string
  codice_fiscale: string
  logo_url: string | null
  sito_web: string | null
  orari_apertura: Record<string, { apertura: string; chiusura: string; chiuso: boolean }> | null
  note: string | null
  created_at: string
  updated_at: string
}

export interface Cliente {
  id: string
  codice: string
  nome: string
  cognome: string
  data_nascita: string | null
  codice_fiscale: string | null
  telefono: string | null
  cellulare: string | null
  email: string | null
  indirizzo: string | null
  citta: string | null
  cap: string | null
  provincia: string | null
  note: string | null
  consenso_privacy: boolean
  consenso_marketing: boolean
  created_at: string
  updated_at: string
}

export interface Prescrizione {
  id: string
  store_id: string
  cliente_id: string
  data_prescrizione: string
  prescrittore: string | null
  tipo: 'occhiali' | 'lac'

  // Occhio Destro (OD)
  od_sfera: number | null
  od_cilindro: number | null
  od_asse: number | null
  od_addizione: number | null
  od_prisma: number | null
  od_base_prisma: string | null
  od_pd: number | null
  od_altezza: number | null

  // Occhio Sinistro (OS)
  os_sfera: number | null
  os_cilindro: number | null
  os_asse: number | null
  os_addizione: number | null
  os_prisma: number | null
  os_base_prisma: string | null
  os_pd: number | null
  os_altezza: number | null

  // LAC specifici
  od_raggio: number | null
  od_diametro: number | null
  os_raggio: number | null
  os_diametro: number | null

  visus_od: string | null
  visus_os: string | null
  note: string | null

  created_at: string
  updated_at: string

  // Relations
  cliente?: Cliente
}

export interface Categoria {
  id: string
  nome: string
  tipo: 'montatura' | 'lente' | 'lac' | 'sole' | 'accessorio'
  descrizione: string | null
  created_at: string
}

export interface Fornitore {
  id: string
  nome: string
  codice: string | null
  indirizzo: string | null
  citta: string | null
  cap: string | null
  provincia: string | null
  telefono: string | null
  email: string | null
  piva: string | null
  note: string | null
  created_at: string
  updated_at: string
}

export interface Prodotto {
  id: string
  store_id: string
  categoria_id: string
  fornitore_id: string | null
  codice: string
  barcode: string | null
  nome: string
  marca: string | null
  modello: string | null
  colore: string | null
  materiale: string | null
  calibro: string | null
  ponte: string | null
  aste: string | null
  prezzo_acquisto: number
  prezzo_vendita: number
  iva: number
  quantita: number
  quantita_minima: number
  ubicazione: string | null
  note: string | null
  attivo: boolean
  created_at: string
  updated_at: string

  // Relations
  categoria?: Categoria
  fornitore?: Fornitore
}

export interface Movimento {
  id: string
  store_id: string
  prodotto_id: string
  tipo: 'carico' | 'scarico' | 'rettifica' | 'vendita' | 'reso'
  quantita: number
  quantita_precedente: number
  quantita_successiva: number
  riferimento: string | null
  note: string | null
  created_at: string

  // Relations
  prodotto?: Prodotto
}

export type StatoOrdine = 'nuovo' | 'in_lavorazione' | 'attesa_lenti' | 'attesa_montatura' | 'pronto' | 'consegnato' | 'annullato'

export interface Ordine {
  id: string
  store_id: string
  cliente_id: string
  prescrizione_id: string | null
  numero: string
  data_ordine: string
  data_consegna_prevista: string | null
  data_consegna: string | null
  stato: StatoOrdine

  // Montatura
  montatura_id: string | null
  montatura_descrizione: string | null
  montatura_prezzo: number

  // Lenti
  lente_tipo: string | null
  lente_materiale: string | null
  lente_trattamenti: string[] | null
  lente_fornitore: string | null
  lente_prezzo: number

  // Totali
  sconto_percentuale: number
  sconto_importo: number
  totale: number
  acconto: number
  saldo: number

  note: string | null
  note_laboratorio: string | null

  created_at: string
  updated_at: string

  // Relations
  cliente?: Cliente
  prescrizione?: Prescrizione
  montatura?: Prodotto
}

export type StatoBusta = 'da_iniziare' | 'in_lavorazione' | 'in_attesa' | 'completata'

export interface BustaLavoro {
  id: string
  store_id: string
  ordine_id: string
  numero: string
  stato: StatoBusta
  priorita: 'bassa' | 'normale' | 'alta' | 'urgente'
  assegnato_a: string | null
  data_inizio: string | null
  data_completamento: string | null
  note: string | null
  checklist: Array<{ item: string; completato: boolean }> | null
  created_at: string
  updated_at: string

  // Relations
  ordine?: Ordine
}

export type TipoAppuntamento = 'visita' | 'ritiro' | 'controllo' | 'riparazione' | 'altro'

export interface Appuntamento {
  id: string
  store_id: string
  cliente_id: string | null
  tipo: TipoAppuntamento
  titolo: string
  data_ora: string
  durata_minuti: number
  stato: 'programmato' | 'confermato' | 'completato' | 'annullato' | 'no_show'
  note: string | null
  promemoria_inviato: boolean
  created_at: string
  updated_at: string

  // Relations
  cliente?: Cliente
}

export interface Vendita {
  id: string
  store_id: string
  cliente_id: string | null
  numero: string
  data_vendita: string
  metodo_pagamento: 'contanti' | 'carta' | 'bonifico' | 'assegno' | 'misto'
  subtotale: number
  sconto_percentuale: number
  sconto_importo: number
  totale: number
  iva_totale: number
  note: string | null
  created_at: string

  // Relations
  cliente?: Cliente
  righe?: RigaVendita[]
}

export interface RigaVendita {
  id: string
  vendita_id: string
  prodotto_id: string | null
  descrizione: string
  quantita: number
  prezzo_unitario: number
  sconto_percentuale: number
  iva: number
  totale: number

  // Relations
  prodotto?: Prodotto
}

export interface Fattura {
  id: string
  store_id: string
  cliente_id: string
  vendita_id: string | null
  numero: string
  data_fattura: string
  data_scadenza: string | null
  stato: 'emessa' | 'pagata' | 'scaduta' | 'annullata'
  imponibile: number
  iva: number
  totale: number
  note: string | null
  xml_path: string | null
  pdf_path: string | null
  sdi_stato: string | null
  created_at: string
  updated_at: string

  // Relations
  cliente?: Cliente
  vendita?: Vendita
  righe?: RigaFattura[]
}

export interface RigaFattura {
  id: string
  fattura_id: string
  descrizione: string
  quantita: number
  prezzo_unitario: number
  iva_percentuale: number
  iva_importo: number
  totale: number
}

export interface Impostazione {
  id: string
  store_id: string
  chiave: string
  valore: string
  tipo: 'string' | 'number' | 'boolean' | 'json'
  descrizione: string | null
  created_at: string
  updated_at: string
}

// Form types for creating/updating
export type ClienteForm = Omit<Cliente, 'id' | 'codice' | 'created_at' | 'updated_at'>
export type PrescrizioneForm = Omit<Prescrizione, 'id' | 'created_at' | 'updated_at' | 'cliente'>
export type ProdottoForm = Omit<Prodotto, 'id' | 'created_at' | 'updated_at' | 'categoria' | 'fornitore'>
export type OrdineForm = Omit<Ordine, 'id' | 'numero' | 'created_at' | 'updated_at' | 'cliente' | 'prescrizione' | 'montatura'>
export type AppuntamentoForm = Omit<Appuntamento, 'id' | 'created_at' | 'updated_at' | 'cliente'>
export type VenditaForm = Omit<Vendita, 'id' | 'numero' | 'created_at' | 'cliente' | 'righe'>
export type FatturaForm = Omit<Fattura, 'id' | 'numero' | 'created_at' | 'updated_at' | 'cliente' | 'vendita' | 'righe'>
