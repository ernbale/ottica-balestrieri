/**
 * Generatore di Codice Fiscale Italiano
 * Implementa l'algoritmo ufficiale dell'Agenzia delle Entrate
 */

// Mappa dei mesi per il codice fiscale
const MESI: Record<number, string> = {
  1: 'A', 2: 'B', 3: 'C', 4: 'D', 5: 'E', 6: 'H',
  7: 'L', 8: 'M', 9: 'P', 10: 'R', 11: 'S', 12: 'T'
}

// Valori per il calcolo del carattere di controllo (posizioni dispari)
const DISPARI: Record<string, number> = {
  '0': 1, '1': 0, '2': 5, '3': 7, '4': 9, '5': 13, '6': 15, '7': 17, '8': 19, '9': 21,
  'A': 1, 'B': 0, 'C': 5, 'D': 7, 'E': 9, 'F': 13, 'G': 15, 'H': 17, 'I': 19, 'J': 21,
  'K': 2, 'L': 4, 'M': 18, 'N': 20, 'O': 11, 'P': 3, 'Q': 6, 'R': 8, 'S': 12, 'T': 14,
  'U': 16, 'V': 10, 'W': 22, 'X': 25, 'Y': 24, 'Z': 23
}

// Valori per il calcolo del carattere di controllo (posizioni pari)
const PARI: Record<string, number> = {
  '0': 0, '1': 1, '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9,
  'A': 0, 'B': 1, 'C': 2, 'D': 3, 'E': 4, 'F': 5, 'G': 6, 'H': 7, 'I': 8, 'J': 9,
  'K': 10, 'L': 11, 'M': 12, 'N': 13, 'O': 14, 'P': 15, 'Q': 16, 'R': 17, 'S': 18, 'T': 19,
  'U': 20, 'V': 21, 'W': 22, 'X': 23, 'Y': 24, 'Z': 25
}

// Caratteri di controllo
const CONTROLLO = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'

// Database comuni italiani principali con codici catastali
export const COMUNI_ITALIANI: Array<{ nome: string; codice: string; provincia: string }> = [
  // Lombardia
  { nome: 'MILANO', codice: 'F205', provincia: 'MI' },
  { nome: 'BRESCIA', codice: 'B157', provincia: 'BS' },
  { nome: 'BERGAMO', codice: 'A794', provincia: 'BG' },
  { nome: 'MONZA', codice: 'F704', provincia: 'MB' },
  { nome: 'COMO', codice: 'C933', provincia: 'CO' },
  { nome: 'VARESE', codice: 'L682', provincia: 'VA' },
  { nome: 'PAVIA', codice: 'G388', provincia: 'PV' },
  { nome: 'CREMONA', codice: 'D150', provincia: 'CR' },
  { nome: 'MANTOVA', codice: 'E897', provincia: 'MN' },
  { nome: 'LECCO', codice: 'E507', provincia: 'LC' },
  { nome: 'LODI', codice: 'E648', provincia: 'LO' },
  { nome: 'SONDRIO', codice: 'I829', provincia: 'SO' },
  // Lazio
  { nome: 'ROMA', codice: 'H501', provincia: 'RM' },
  { nome: 'LATINA', codice: 'E472', provincia: 'LT' },
  { nome: 'FROSINONE', codice: 'D810', provincia: 'FR' },
  { nome: 'VITERBO', codice: 'M082', provincia: 'VT' },
  { nome: 'RIETI', codice: 'H282', provincia: 'RI' },
  // Campania
  { nome: 'NAPOLI', codice: 'F839', provincia: 'NA' },
  { nome: 'SALERNO', codice: 'H703', provincia: 'SA' },
  { nome: 'CASERTA', codice: 'B963', provincia: 'CE' },
  { nome: 'AVELLINO', codice: 'A509', provincia: 'AV' },
  { nome: 'BENEVENTO', codice: 'A783', provincia: 'BN' },
  // Piemonte
  { nome: 'TORINO', codice: 'L219', provincia: 'TO' },
  { nome: 'NOVARA', codice: 'F952', provincia: 'NO' },
  { nome: 'ALESSANDRIA', codice: 'A182', provincia: 'AL' },
  { nome: 'ASTI', codice: 'A479', provincia: 'AT' },
  { nome: 'CUNEO', codice: 'D205', provincia: 'CN' },
  { nome: 'VERCELLI', codice: 'L750', provincia: 'VC' },
  { nome: 'BIELLA', codice: 'A859', provincia: 'BI' },
  { nome: 'VERBANIA', codice: 'L746', provincia: 'VB' },
  // Veneto
  { nome: 'VENEZIA', codice: 'L736', provincia: 'VE' },
  { nome: 'VERONA', codice: 'L781', provincia: 'VR' },
  { nome: 'PADOVA', codice: 'G224', provincia: 'PD' },
  { nome: 'VICENZA', codice: 'L840', provincia: 'VI' },
  { nome: 'TREVISO', codice: 'L407', provincia: 'TV' },
  { nome: 'ROVIGO', codice: 'H620', provincia: 'RO' },
  { nome: 'BELLUNO', codice: 'A757', provincia: 'BL' },
  // Emilia-Romagna
  { nome: 'BOLOGNA', codice: 'A944', provincia: 'BO' },
  { nome: 'MODENA', codice: 'F257', provincia: 'MO' },
  { nome: 'PARMA', codice: 'G337', provincia: 'PR' },
  { nome: 'REGGIO EMILIA', codice: 'H223', provincia: 'RE' },
  { nome: 'REGGIO NELL\'EMILIA', codice: 'H223', provincia: 'RE' },
  { nome: 'FERRARA', codice: 'D548', provincia: 'FE' },
  { nome: 'RAVENNA', codice: 'H199', provincia: 'RA' },
  { nome: 'FORLI', codice: 'D704', provincia: 'FC' },
  { nome: 'CESENA', codice: 'C573', provincia: 'FC' },
  { nome: 'RIMINI', codice: 'H294', provincia: 'RN' },
  { nome: 'PIACENZA', codice: 'G535', provincia: 'PC' },
  // Toscana
  { nome: 'FIRENZE', codice: 'D612', provincia: 'FI' },
  { nome: 'PRATO', codice: 'G999', provincia: 'PO' },
  { nome: 'LIVORNO', codice: 'E625', provincia: 'LI' },
  { nome: 'PISA', codice: 'G702', provincia: 'PI' },
  { nome: 'LUCCA', codice: 'E715', provincia: 'LU' },
  { nome: 'AREZZO', codice: 'A390', provincia: 'AR' },
  { nome: 'SIENA', codice: 'I726', provincia: 'SI' },
  { nome: 'PISTOIA', codice: 'G713', provincia: 'PT' },
  { nome: 'GROSSETO', codice: 'E202', provincia: 'GR' },
  { nome: 'MASSA', codice: 'F023', provincia: 'MS' },
  // Puglia
  { nome: 'BARI', codice: 'A662', provincia: 'BA' },
  { nome: 'TARANTO', codice: 'L049', provincia: 'TA' },
  { nome: 'FOGGIA', codice: 'D643', provincia: 'FG' },
  { nome: 'LECCE', codice: 'E506', provincia: 'LE' },
  { nome: 'BRINDISI', codice: 'B180', provincia: 'BR' },
  { nome: 'BARLETTA', codice: 'A669', provincia: 'BT' },
  // Sicilia
  { nome: 'PALERMO', codice: 'G273', provincia: 'PA' },
  { nome: 'CATANIA', codice: 'C351', provincia: 'CT' },
  { nome: 'MESSINA', codice: 'F158', provincia: 'ME' },
  { nome: 'SIRACUSA', codice: 'I754', provincia: 'SR' },
  { nome: 'RAGUSA', codice: 'H163', provincia: 'RG' },
  { nome: 'TRAPANI', codice: 'L331', provincia: 'TP' },
  { nome: 'AGRIGENTO', codice: 'A089', provincia: 'AG' },
  { nome: 'CALTANISSETTA', codice: 'B429', provincia: 'CL' },
  { nome: 'ENNA', codice: 'C342', provincia: 'EN' },
  // Sardegna
  { nome: 'CAGLIARI', codice: 'B354', provincia: 'CA' },
  { nome: 'SASSARI', codice: 'I452', provincia: 'SS' },
  { nome: 'NUORO', codice: 'F979', provincia: 'NU' },
  { nome: 'ORISTANO', codice: 'G113', provincia: 'OR' },
  // Liguria
  { nome: 'GENOVA', codice: 'D969', provincia: 'GE' },
  { nome: 'LA SPEZIA', codice: 'E463', provincia: 'SP' },
  { nome: 'SAVONA', codice: 'I480', provincia: 'SV' },
  { nome: 'IMPERIA', codice: 'E290', provincia: 'IM' },
  // Friuli-Venezia Giulia
  { nome: 'TRIESTE', codice: 'L424', provincia: 'TS' },
  { nome: 'UDINE', codice: 'L483', provincia: 'UD' },
  { nome: 'PORDENONE', codice: 'G888', provincia: 'PN' },
  { nome: 'GORIZIA', codice: 'E098', provincia: 'GO' },
  // Trentino-Alto Adige
  { nome: 'TRENTO', codice: 'L378', provincia: 'TN' },
  { nome: 'BOLZANO', codice: 'A952', provincia: 'BZ' },
  // Marche
  { nome: 'ANCONA', codice: 'A271', provincia: 'AN' },
  { nome: 'PESARO', codice: 'G479', provincia: 'PU' },
  { nome: 'FERMO', codice: 'D542', provincia: 'FM' },
  { nome: 'MACERATA', codice: 'E783', provincia: 'MC' },
  { nome: 'ASCOLI PICENO', codice: 'A462', provincia: 'AP' },
  // Abruzzo
  { nome: 'L\'AQUILA', codice: 'A345', provincia: 'AQ' },
  { nome: 'PESCARA', codice: 'G482', provincia: 'PE' },
  { nome: 'CHIETI', codice: 'C632', provincia: 'CH' },
  { nome: 'TERAMO', codice: 'L103', provincia: 'TE' },
  // Umbria
  { nome: 'PERUGIA', codice: 'G478', provincia: 'PG' },
  { nome: 'TERNI', codice: 'L117', provincia: 'TR' },
  // Calabria
  { nome: 'REGGIO CALABRIA', codice: 'H224', provincia: 'RC' },
  { nome: 'CATANZARO', codice: 'C352', provincia: 'CZ' },
  { nome: 'COSENZA', codice: 'D086', provincia: 'CS' },
  { nome: 'CROTONE', codice: 'D122', provincia: 'KR' },
  { nome: 'VIBO VALENTIA', codice: 'F537', provincia: 'VV' },
  // Basilicata
  { nome: 'POTENZA', codice: 'G942', provincia: 'PZ' },
  { nome: 'MATERA', codice: 'F052', provincia: 'MT' },
  // Molise
  { nome: 'CAMPOBASSO', codice: 'B519', provincia: 'CB' },
  { nome: 'ISERNIA', codice: 'E335', provincia: 'IS' },
  // Valle d'Aosta
  { nome: 'AOSTA', codice: 'A326', provincia: 'AO' },
].sort((a, b) => a.nome.localeCompare(b.nome))

/**
 * Estrae le consonanti da una stringa
 */
function getConsonanti(str: string): string {
  return str.toUpperCase().replace(/[^A-Z]/g, '').replace(/[AEIOU]/g, '')
}

/**
 * Estrae le vocali da una stringa
 */
function getVocali(str: string): string {
  return str.toUpperCase().replace(/[^AEIOU]/g, '')
}

/**
 * Calcola i 3 caratteri del cognome
 */
function calcolaCognome(cognome: string): string {
  const consonanti = getConsonanti(cognome)
  const vocali = getVocali(cognome)
  const lettere = consonanti + vocali + 'XXX'
  return lettere.substring(0, 3)
}

/**
 * Calcola i 3 caratteri del nome
 * Se ci sono più di 3 consonanti, prende la 1a, 3a e 4a
 */
function calcolaNome(nome: string): string {
  const consonanti = getConsonanti(nome)
  const vocali = getVocali(nome)

  if (consonanti.length > 3) {
    // Prende 1a, 3a e 4a consonante
    return consonanti[0] + consonanti[2] + consonanti[3]
  }

  const lettere = consonanti + vocali + 'XXX'
  return lettere.substring(0, 3)
}

/**
 * Calcola i caratteri per la data di nascita e sesso
 */
function calcolaDataNascita(dataNascita: Date, sesso: 'M' | 'F'): string {
  const anno = dataNascita.getFullYear().toString().slice(-2)
  const mese = MESI[dataNascita.getMonth() + 1]
  let giorno = dataNascita.getDate()

  // Per le donne si aggiunge 40 al giorno
  if (sesso === 'F') {
    giorno += 40
  }

  return anno + mese + giorno.toString().padStart(2, '0')
}

/**
 * Calcola il carattere di controllo
 */
function calcolaCarattereControllo(codice: string): string {
  let somma = 0

  for (let i = 0; i < 15; i++) {
    const char = codice[i]
    if ((i + 1) % 2 === 0) {
      // Posizione pari
      somma += PARI[char]
    } else {
      // Posizione dispari
      somma += DISPARI[char]
    }
  }

  return CONTROLLO[somma % 26]
}

export interface DatiCodiceFiscale {
  nome: string
  cognome: string
  dataNascita: Date
  sesso: 'M' | 'F'
  comuneNascita: string // Codice catastale del comune
}

/**
 * Genera il codice fiscale completo
 */
export function generaCodiceFiscale(dati: DatiCodiceFiscale): string {
  const cognome = calcolaCognome(dati.cognome)
  const nome = calcolaNome(dati.nome)
  const dataSesso = calcolaDataNascita(dati.dataNascita, dati.sesso)
  const comune = dati.comuneNascita.toUpperCase()

  const codiceParziale = cognome + nome + dataSesso + comune
  const carattereControllo = calcolaCarattereControllo(codiceParziale)

  return codiceParziale + carattereControllo
}

/**
 * Valida un codice fiscale
 */
export function validaCodiceFiscale(cf: string): boolean {
  if (!cf || cf.length !== 16) return false

  const cfUpper = cf.toUpperCase()

  // Verifica formato base
  const regex = /^[A-Z]{6}[0-9]{2}[A-Z][0-9]{2}[A-Z][0-9]{3}[A-Z]$/
  if (!regex.test(cfUpper)) return false

  // Verifica carattere di controllo
  const carattereAtteso = calcolaCarattereControllo(cfUpper.substring(0, 15))
  return cfUpper[15] === carattereAtteso
}

/**
 * Cerca comuni per nome (parziale)
 */
export function cercaComuni(query: string): typeof COMUNI_ITALIANI {
  if (!query || query.length < 2) return []

  const queryUpper = query.toUpperCase()
  return COMUNI_ITALIANI.filter(c =>
    c.nome.includes(queryUpper) ||
    c.provincia.includes(queryUpper)
  ).slice(0, 10)
}

/**
 * Trova un comune per codice catastale
 */
export function trovaComunePerCodice(codice: string): typeof COMUNI_ITALIANI[0] | undefined {
  return COMUNI_ITALIANI.find(c => c.codice === codice.toUpperCase())
}

/**
 * Trova un comune per nome esatto
 */
export function trovaComunePerNome(nome: string): typeof COMUNI_ITALIANI[0] | undefined {
  return COMUNI_ITALIANI.find(c => c.nome === nome.toUpperCase())
}
