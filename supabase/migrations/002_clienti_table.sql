-- Tabella Clienti per Ottica Balestrieri
-- Creazione tabella con tutti i campi necessari

CREATE TABLE IF NOT EXISTS clienti (
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

-- Indici per performance
CREATE INDEX IF NOT EXISTS idx_clienti_cognome ON clienti(cognome);
CREATE INDEX IF NOT EXISTS idx_clienti_codice_fiscale ON clienti(codice_fiscale);
CREATE INDEX IF NOT EXISTS idx_clienti_email ON clienti(email);
CREATE INDEX IF NOT EXISTS idx_clienti_cellulare ON clienti(cellulare);

-- Abilita Row Level Security
ALTER TABLE clienti ENABLE ROW LEVEL SECURITY;

-- Policy per permettere tutte le operazioni (in produzione limitare per utente)
CREATE POLICY "Allow all operations on clienti" ON clienti
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Commento sulla tabella
COMMENT ON TABLE clienti IS 'Anagrafica clienti dell''ottica con dati personali e consensi';
