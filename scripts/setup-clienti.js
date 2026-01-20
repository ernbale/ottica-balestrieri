/**
 * Script per creare/aggiornare la tabella clienti su Supabase
 * Esegui con: node scripts/setup-clienti.js
 */

const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

// Leggi .env.local manualmente
const envPath = path.join(__dirname, '..', '.env.local')
const envContent = fs.readFileSync(envPath, 'utf-8')
const envVars = {}
envContent.split('\n').forEach(line => {
  const [key, ...valueParts] = line.split('=')
  if (key && valueParts.length > 0) {
    envVars[key.trim()] = valueParts.join('=').trim()
  }
})

const supabaseUrl = envVars.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Errore: Variabili ambiente Supabase non configurate')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function setupClientiTable() {
  console.log('🔧 Setup tabella clienti...\n')

  // Verifica se la tabella esiste
  const { data: tables, error: checkError } = await supabase
    .from('clienti')
    .select('id')
    .limit(1)

  if (checkError && checkError.code === '42P01') {
    console.log('📦 Tabella clienti non esiste, la creo...')

    // La tabella non esiste - deve essere creata dal pannello Supabase
    console.log('\n⚠️  Per creare la tabella, esegui questo SQL nel pannello Supabase:\n')
    console.log(`
CREATE TABLE clienti (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  codice VARCHAR(20) UNIQUE NOT NULL,
  nome VARCHAR(100) NOT NULL,
  cognome VARCHAR(100) NOT NULL,
  data_nascita DATE,
  sesso CHAR(1) CHECK (sesso IN ('M', 'F')),
  luogo_nascita VARCHAR(100),
  luogo_nascita_codice VARCHAR(10),
  codice_fiscale VARCHAR(16),
  telefono VARCHAR(20),
  cellulare VARCHAR(20),
  email VARCHAR(100),
  indirizzo VARCHAR(200),
  citta VARCHAR(100),
  cap VARCHAR(10),
  provincia VARCHAR(5),
  note TEXT,
  consenso_privacy BOOLEAN DEFAULT FALSE NOT NULL,
  consenso_marketing BOOLEAN DEFAULT FALSE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indici
CREATE INDEX idx_clienti_cognome ON clienti(cognome);
CREATE INDEX idx_clienti_codice_fiscale ON clienti(codice_fiscale);

-- RLS
ALTER TABLE clienti ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations on clienti" ON clienti
  FOR ALL USING (true) WITH CHECK (true);
    `)
    return
  }

  if (checkError) {
    console.error('Errore verifica tabella:', checkError.message)
    return
  }

  console.log('✅ Tabella clienti esiste già!')

  // Verifica colonne mancanti
  const { data: testRow, error: testError } = await supabase
    .from('clienti')
    .select('sesso, luogo_nascita, luogo_nascita_codice')
    .limit(1)

  if (testError && testError.message.includes('column')) {
    console.log('\n⚠️  Alcune colonne mancano. Esegui questo SQL per aggiungerle:\n')
    console.log(`
ALTER TABLE clienti ADD COLUMN IF NOT EXISTS sesso CHAR(1) CHECK (sesso IN ('M', 'F'));
ALTER TABLE clienti ADD COLUMN IF NOT EXISTS luogo_nascita VARCHAR(100);
ALTER TABLE clienti ADD COLUMN IF NOT EXISTS luogo_nascita_codice VARCHAR(10);
    `)
    return
  }

  console.log('✅ Tutte le colonne sono presenti!')

  // Conta clienti
  const { count } = await supabase
    .from('clienti')
    .select('*', { count: 'exact', head: true })

  console.log(`📊 Clienti nel database: ${count || 0}`)
}

setupClientiTable()
  .then(() => {
    console.log('\n✨ Setup completato!')
    process.exit(0)
  })
  .catch(err => {
    console.error('Errore:', err)
    process.exit(1)
  })
