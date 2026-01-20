/**
 * Integrazione Cassa Fiscale Custom via WposWS
 * Comunicazione con stampante fiscale tramite API REST locale
 */

// Configurazione WposWS
// WposWS gira sul PC 192.168.1.230, che comunica con la cassa 192.168.1.4
const WPOS_CONFIG = {
  baseUrl: 'https://192.168.1.230/WposWS',
  printerId: '1',
  timeout: 10000,
}

/**
 * Reparti IVA configurati sulla cassa
 */
export const REPARTI_IVA = {
  OCCHIALI_DA_SOLE: { id: 1, nome: 'Occhiali da sole', iva: 22 },
  SOLUZIONI: { id: 2, nome: 'Soluzioni', iva: 22 },
  MONTATURA: { id: 3, nome: 'Montatura', iva: 22 },
  OCCHIALI_DA_VISTA: { id: 4, nome: 'Occhiali da vista', iva: 4 },
  LENTI_A_CONTATTO: { id: 5, nome: 'Lenti a contatto', iva: 4 },
  LENTI_OFTALMICHE: { id: 7, nome: 'Lenti oftalmiche grad', iva: 4 },
  IVA_4: { id: 8, nome: 'IVA 4%', iva: 4 },
  IVA_22: { id: 10, nome: 'IVA 22%', iva: 22 },
  ACCESSORI: { id: 11, nome: 'Accessori', iva: 22 },
} as const

export type RepartoKey = keyof typeof REPARTI_IVA

/**
 * Mappa categoria prodotto -> reparto IVA
 */
export function getRepartoByCategoria(categoria: string): typeof REPARTI_IVA[RepartoKey] {
  const catLower = categoria.toLowerCase()

  if (catLower.includes('sole')) return REPARTI_IVA.OCCHIALI_DA_SOLE
  if (catLower.includes('vista')) return REPARTI_IVA.OCCHIALI_DA_VISTA
  if (catLower.includes('montatur')) return REPARTI_IVA.MONTATURA
  if (catLower.includes('lenti a contatto') || catLower.includes('lac')) return REPARTI_IVA.LENTI_A_CONTATTO
  if (catLower.includes('lenti') || catLower.includes('oftalmich')) return REPARTI_IVA.LENTI_OFTALMICHE
  if (catLower.includes('soluzion') || catLower.includes('liquido')) return REPARTI_IVA.SOLUZIONI
  if (catLower.includes('accessor')) return REPARTI_IVA.ACCESSORI

  // Default: IVA 22%
  return REPARTI_IVA.IVA_22
}

/**
 * Interfaccia per un articolo da stampare sullo scontrino
 */
export interface ArticoloScontrino {
  descrizione: string
  prezzo: number
  quantita: number
  reparto: number // ID reparto sulla cassa
}

/**
 * Interfaccia per il risultato di una chiamata alla cassa
 */
export interface CassaResponse {
  success: boolean
  message: string
  error?: string
}

/**
 * Invia un comando alla cassa fiscale
 */
async function sendCommand(command: string): Promise<CassaResponse> {
  const url = `${WPOS_CONFIG.baseUrl}/api/print/${WPOS_CONFIG.printerId}`

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain',
      },
      body: command,
    })

    if (response.ok) {
      const text = await response.text()
      return {
        success: true,
        message: text || 'Comando eseguito con successo',
      }
    } else {
      return {
        success: false,
        message: 'Errore dalla cassa',
        error: `HTTP ${response.status}: ${response.statusText}`,
      }
    }
  } catch (error: any) {
    // Errore di rete - probabilmente cassa non raggiungibile
    return {
      success: false,
      message: 'Impossibile comunicare con la cassa',
      error: error.message || 'Errore di connessione',
    }
  }
}

/**
 * Apre il cassetto della cassa
 */
export async function apriCassetto(): Promise<CassaResponse> {
  return sendCommand('OPEN,N1;')
}

/**
 * Stampa uno scontrino fiscale
 * @param articoli Lista degli articoli da stampare
 * @param pagamento Tipo di pagamento: 'contanti' | 'carta' | 'misto'
 */
export async function stampaScontrino(
  articoli: ArticoloScontrino[],
  pagamento: 'contanti' | 'carta' | 'misto' = 'contanti'
): Promise<CassaResponse> {
  if (articoli.length === 0) {
    return {
      success: false,
      message: 'Nessun articolo da stampare',
    }
  }

  // Costruisci il comando per la cassa
  // Formato: REPARTO,DESCRIZIONE,PREZZO,QUANTITA;
  let command = ''

  for (const art of articoli) {
    // Formatta il prezzo con 2 decimali
    const prezzoStr = art.prezzo.toFixed(2)
    // Tronca la descrizione a 30 caratteri
    const desc = art.descrizione.substring(0, 30)
    // Aggiungi la riga
    command += `${art.reparto},${desc},${prezzoStr},${art.quantita};`
  }

  // Aggiungi chiusura scontrino con tipo pagamento
  // T = Totale contanti, T1 = Carta, T2 = Misto
  switch (pagamento) {
    case 'carta':
      command += 'T1;'
      break
    case 'misto':
      command += 'T2;'
      break
    default:
      command += 'T;'
  }

  return sendCommand(command)
}

/**
 * Stampa uno scontrino di cortesia (non fiscale)
 */
export async function stampaTestoCortesia(testo: string): Promise<CassaResponse> {
  // NF = Non Fiscale
  const command = `NF,${testo};CNF;`
  return sendCommand(command)
}

/**
 * Esegue la chiusura giornaliera (X report)
 */
export async function chiusuraGiornaliera(): Promise<CassaResponse> {
  return sendCommand('X;')
}

/**
 * Esegue la chiusura fiscale (Z report)
 */
export async function chiusuraFiscale(): Promise<CassaResponse> {
  return sendCommand('Z;')
}

/**
 * Annulla l'ultimo documento
 */
export async function annullaDocumento(): Promise<CassaResponse> {
  return sendCommand('K;')
}

/**
 * Verifica la connessione con la cassa
 */
export async function testConnessione(): Promise<CassaResponse> {
  try {
    const url = `${WPOS_CONFIG.baseUrl}/api/print/${WPOS_CONFIG.printerId}`
    const response = await fetch(url, {
      method: 'GET',
    })

    if (response.ok) {
      return {
        success: true,
        message: 'Cassa connessa e funzionante',
      }
    } else {
      return {
        success: false,
        message: 'Cassa non risponde correttamente',
        error: `HTTP ${response.status}`,
      }
    }
  } catch (error: any) {
    return {
      success: false,
      message: 'Cassa non raggiungibile',
      error: error.message,
    }
  }
}

/**
 * Calcola il totale di una lista di articoli
 */
export function calcolaTotale(articoli: ArticoloScontrino[]): number {
  return articoli.reduce((sum, art) => sum + (art.prezzo * art.quantita), 0)
}

/**
 * Calcola l'IVA totale di una lista di articoli
 */
export function calcolaIVA(articoli: ArticoloScontrino[]): { iva4: number; iva22: number; totaleIva: number } {
  let iva4 = 0
  let iva22 = 0

  for (const art of articoli) {
    const totaleArticolo = art.prezzo * art.quantita
    const reparto = Object.values(REPARTI_IVA).find(r => r.id === art.reparto)
    const aliquota = reparto?.iva || 22

    if (aliquota === 4) {
      iva4 += totaleArticolo * 0.04 / 1.04
    } else {
      iva22 += totaleArticolo * 0.22 / 1.22
    }
  }

  return {
    iva4: Math.round(iva4 * 100) / 100,
    iva22: Math.round(iva22 * 100) / 100,
    totaleIva: Math.round((iva4 + iva22) * 100) / 100,
  }
}
