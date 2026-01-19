# STATO PROGETTO - Gestionale Ottica Balestrieri

**Data ultimo aggiornamento:** 19 Gennaio 2026
**Versione:** 0.4.0 - Wizard Ordini Completo

---

## RIEPILOGO SESSIONE ODIERNA

### Cosa abbiamo fatto oggi:

#### 1. Wizard Ordini 5 Step (COMPLETATO)
Implementato wizard professionale per la creazione ordini con 5 step:

**Step 1 - Selezione Cliente:**
- Ricerca clienti per nome, codice o telefono
- Card cliente con avatar, codice e contatti
- Selezione con feedback visivo (ring + check)
- Pulsante "Nuovo Cliente" (predisposto)

**Step 2 - Selezione Prescrizione:**
- Lista prescrizioni del cliente selezionato
- Mini-tabella prescrizione con L/V, OD/OS, SPH/CYL/AX
- Visualizzazione DIP e ADD
- Selezione tipo utilizzo (Lontano, Vicino, Progressiva, Intermedio)
- Pulsante "Nuova Rx" (predisposto)

**Step 3 - Selezione Montatura:**
- Ricerca per nome o marca
- Filtri per categoria: Tutti / Vista / Sole
- Card montatura con icona, nome, marca, colore
- Prezzo e disponibilità visualizzati
- Badge colorati per stock (verde >2, giallo 1-2, rosso 0)

**Step 4 - Configurazione Lenti:**
- Selezione tipo lente (Monofocale, Bifocale, Progressiva, Office)
- Selezione materiale/indice (CR39, Policarbonato, 1.56, 1.60, 1.67, 1.74)
- Checkbox trattamenti multipli (Antiriflesso, Fotocromatico, Blue Control, Polarizzato, Transitions, Antigraffio, Idrorepellente)
- Selezione fornitore (Essilor, Hoya, Zeiss, Rodenstock, Indo)
- Calcolo automatico prezzo lenti (tipo + materiale + trattamenti) x2

**Step 5 - Riepilogo e Conferma:**
- Riepilogo cliente con avatar e contatti
- Tabella prescrizione completa L/V
- Box montatura con prezzo
- Box lenti con tipo, materiale, trattamenti e prezzo
- Input sconto % e sconto Euro
- Input acconto
- Data consegna prevista (obbligatoria)
- Note ordine
- TOTALE con dettaglio: Montatura + Lenti - Sconti = Totale - Acconto = Saldo

#### 2. Listino Lenti con Prezzi
Creato sistema di pricing per lenti oftalmiche:
```
Tipi Lente (prezzo base per lente):
- Monofocale: 60 EUR
- Bifocale: 120 EUR
- Progressiva: 200 EUR
- Office: 180 EUR

Materiali (sovrapprezzo):
- CR39 (1.50): Base
- Policarbonato (1.59): +30 EUR
- Organico 1.56: +40 EUR
- Organico 1.60: +60 EUR
- Organico 1.67: +100 EUR
- Organico 1.74: +160 EUR

Trattamenti:
- Antiriflesso: +40 EUR
- Fotocromatico: +80 EUR
- Blue Control: +50 EUR
- Polarizzato: +70 EUR
- Transitions: +120 EUR
- Antigraffio: +20 EUR
- Idrorepellente: +25 EUR
```

---

## STRUTTURA PROGETTO ATTUALE

```
ottica-balestrieri/
├── src/
│   ├── app/
│   │   ├── page.tsx              ✅ Dashboard con KPI
│   │   ├── layout.tsx            ✅ Root layout
│   │   ├── globals.css           ✅ Design system completo
│   │   ├── clienti/page.tsx      ✅ Gestione clienti
│   │   ├── prescrizioni/page.tsx ✅ Prescrizioni con widget asse
│   │   ├── magazzino/page.tsx    ✅ Gestione magazzino
│   │   ├── ordini/page.tsx       ✅ WIZARD 5 STEP COMPLETO
│   │   ├── buste-lavoro/page.tsx ✅ Kanban lavorazioni
│   │   ├── appuntamenti/page.tsx ✅ Calendario
│   │   ├── vendite/page.tsx      ✅ POS base
│   │   ├── fatture/page.tsx      ✅ Fatturazione base
│   │   ├── report/page.tsx       ✅ Dashboard analytics
│   │   └── impostazioni/page.tsx ✅ Configurazione store
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Sidebar.tsx       ✅ Navigazione laterale
│   │   │   ├── Header.tsx        ✅ Header con search
│   │   │   ├── MainLayout.tsx    ✅ Layout principale
│   │   │   └── index.ts          ✅ Export
│   │   └── ui/
│   │       ├── Button.tsx        ✅ Pulsanti
│   │       ├── Card.tsx          ✅ Card con glassmorphism
│   │       ├── Input.tsx         ✅ Input fields
│   │       ├── Select.tsx        ✅ Select dropdown
│   │       ├── Modal.tsx         ✅ Modali
│   │       ├── Table.tsx         ✅ Tabelle
│   │       ├── Badge.tsx         ✅ Badge/Tag
│   │       ├── AxisWidget.tsx    ✅ Widget asse prescrizioni
│   │       └── index.ts          ✅ Export
│   └── lib/
│       └── supabase.ts           ✅ Client Supabase
├── .env.local                    ⚠️ Da configurare con credenziali reali
├── package.json                  ✅ Dipendenze
├── tailwind.config.ts            ✅ Configurazione Tailwind
└── next.config.ts                ✅ Configurazione Next.js
```

---

## STATO DEI MODULI

| Modulo | Stato | Note |
|--------|-------|------|
| Layout & Design System | ✅ Completo | Sidebar, Header, tema caldo |
| Dashboard | ✅ Completo | KPI cards, grafici |
| Clienti | ✅ Completo | CRUD, ricerca |
| Prescrizioni | ✅ Completo | Widget asse, calcolo ADD, 4 righe |
| Magazzino | ✅ Completo | Categorie ottica, stock |
| **Ordini** | ✅ **COMPLETO** | **Wizard 5 step con listino lenti** |
| Buste Lavoro | ✅ Completo | Kanban drag & drop |
| Appuntamenti | ✅ Completo | Calendario |
| Vendite POS | ✅ Base | Funzionale |
| Fatturazione | ✅ Base | Funzionale |
| Report | ✅ Completo | Analytics |
| Impostazioni | ✅ Completo | Config store |

---

## PROSSIMI PASSI DA FARE

### Priorità Alta:
1. **Collegamento a Supabase**
   - Configurare `.env.local` con credenziali reali
   - Creare tabelle nel database
   - Sostituire mock data con dati reali

2. **Form Creazione Inline nel Wizard**
   - Nuovo Cliente nello Step 1
   - Nuova Prescrizione nello Step 2

### Priorità Media:
3. **Stampa Documenti**
   - Prescrizione in formato A4
   - Busta lavoro per laboratorio
   - Ordine/Preventivo
   - Fattura

4. **Conversione Notazione Cilindro**
   - Toggle -CYL / +CYL
   - Conversione automatica (SPH_new = SPH + CYL, AXIS_new = AXIS ± 90)

### Priorità Bassa:
5. **Multi-Store**
   - Selezione punto vendita
   - Dati separati per store

6. **Ottimizzazioni**
   - Performance
   - PWA per tablet
   - Responsive migliorato

---

## COME AVVIARE IL PROGETTO

### Metodo 1: Doppio click sul file .bat
```
Doppio click su: avvia-ottica.bat
```

### Metodo 2: Manuale
```bash
cd C:\Users\Pc Soggiorno\ottica-balestrieri
npm run dev
```

### URL di accesso:
- **Locale:** http://localhost:3001
- **Produzione:** (da configurare su Vercel)

---

## TECNOLOGIE UTILIZZATE

- **Next.js 16** - Framework React
- **TypeScript** - Tipizzazione statica
- **Tailwind CSS 4** - Styling utility-first
- **Supabase** - Database PostgreSQL + Auth
- **Lucide React** - Icone
- **clsx** - Utility per classi CSS

---

## NOTE TECNICHE IMPORTANTI

### Wizard Ordini (`ordini/page.tsx`)
```typescript
// Struttura wizardData:
{
  // Step 1
  cliente_id: string
  cliente: Cliente | null

  // Step 2
  prescrizione_id: string
  prescrizione: Prescrizione | null
  uso_prescrizione: 'lontano' | 'vicino' | 'intermedio' | 'progressiva'

  // Step 3
  montatura_id: string
  montatura: Montatura | null

  // Step 4
  lente_tipo: string           // 'monofocale' | 'bifocale' | 'progressiva' | 'office'
  lente_materiale: string      // 'cr39' | 'policarbonato' | 'organico156' | ...
  lente_trattamenti: string[]  // ['antiriflesso', 'blue_control', ...]
  lente_fornitore: string      // 'essilor' | 'hoya' | 'zeiss' | ...
  lente_note: string

  // Step 5
  sconto_percentuale: number
  sconto_euro: number
  acconto: number
  data_consegna_prevista: string
  note: string
}
```

### Calcolo Prezzo Lenti
```typescript
// Prezzo per paio = (tipo.prezzo_base + materiale.sovrapprezzo + SUM(trattamenti.prezzo)) * 2
const calcolaPrezzolenti = useMemo(() => {
  let prezzo = 0
  if (tipo) prezzo += tipo.prezzo_base
  if (materiale) prezzo += materiale.sovrapprezzo
  trattamenti.forEach(t => prezzo += t.prezzo)
  return prezzo * 2  // x2 per il paio
}, [tipo, materiale, trattamenti])
```

### Widget AXIS (`AxisWidget.tsx`)
```typescript
// Props principali:
value: number | null           // Valore asse corrente
onChange: (value) => void      // Callback modifica
cylinder: number | null        // Se 0 o null, widget disabilitato
additionalAxes?: AxisLine[]    // Linee aggiuntive colorate
mainColor?: string             // Colore linea principale (default blu)
mainLabel?: string             // Etichetta linea (default "L")
eye?: 'OD' | 'OS'             // Indicatore occhio
```

---

## CREDENZIALI E CONFIGURAZIONE

### File `.env.local` (da completare):
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

---

## CONTATTI E RIFERIMENTI

- **Progetto:** Gestionale Ottica Balestrieri
- **Cartella:** `C:\Users\Pc Soggiorno\ottica-balestrieri`
- **Piano completo:** `.claude\plans\glimmering-conjuring-frost.md`

---

*Documento generato automaticamente - 19/01/2026*
