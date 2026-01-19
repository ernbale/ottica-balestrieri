-- =============================================
-- OTTICA BALESTRIERI - SCHEMA DATABASE
-- Supabase PostgreSQL
-- =============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- STORES (Punti Vendita)
-- =============================================
CREATE TABLE IF NOT EXISTS stores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome VARCHAR(255) NOT NULL,
  indirizzo VARCHAR(255),
  citta VARCHAR(100),
  cap VARCHAR(10),
  provincia VARCHAR(2),
  telefono VARCHAR(20),
  email VARCHAR(255),
  piva VARCHAR(20),
  codice_fiscale VARCHAR(20),
  logo_url TEXT,
  sito_web VARCHAR(255),
  orari_apertura JSONB,
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- CLIENTI (Globali)
-- =============================================
CREATE TABLE IF NOT EXISTS clienti (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  codice VARCHAR(20) UNIQUE NOT NULL,
  nome VARCHAR(100) NOT NULL,
  cognome VARCHAR(100) NOT NULL,
  data_nascita DATE,
  codice_fiscale VARCHAR(16),
  telefono VARCHAR(20),
  cellulare VARCHAR(20),
  email VARCHAR(255),
  indirizzo VARCHAR(255),
  citta VARCHAR(100),
  cap VARCHAR(10),
  provincia VARCHAR(2),
  note TEXT,
  consenso_privacy BOOLEAN DEFAULT FALSE,
  consenso_marketing BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_clienti_cognome ON clienti(cognome);
CREATE INDEX idx_clienti_codice ON clienti(codice);
CREATE INDEX idx_clienti_telefono ON clienti(telefono);
CREATE INDEX idx_clienti_cellulare ON clienti(cellulare);

-- =============================================
-- PRESCRIZIONI (Per Store)
-- =============================================
CREATE TABLE IF NOT EXISTS prescrizioni (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
  cliente_id UUID REFERENCES clienti(id) ON DELETE CASCADE,
  data_prescrizione DATE NOT NULL DEFAULT CURRENT_DATE,
  prescrittore VARCHAR(255),
  tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('occhiali', 'lac')),

  -- Occhio Destro (OD)
  od_sfera DECIMAL(5,2),
  od_cilindro DECIMAL(5,2),
  od_asse INTEGER CHECK (od_asse >= 0 AND od_asse <= 180),
  od_addizione DECIMAL(4,2),
  od_prisma DECIMAL(4,2),
  od_base_prisma VARCHAR(10),
  od_pd DECIMAL(4,1),
  od_altezza DECIMAL(4,1),

  -- Occhio Sinistro (OS)
  os_sfera DECIMAL(5,2),
  os_cilindro DECIMAL(5,2),
  os_asse INTEGER CHECK (os_asse >= 0 AND os_asse <= 180),
  os_addizione DECIMAL(4,2),
  os_prisma DECIMAL(4,2),
  os_base_prisma VARCHAR(10),
  os_pd DECIMAL(4,1),
  os_altezza DECIMAL(4,1),

  -- LAC specifici
  od_raggio DECIMAL(4,2),
  od_diametro DECIMAL(4,2),
  os_raggio DECIMAL(4,2),
  os_diametro DECIMAL(4,2),

  visus_od VARCHAR(20),
  visus_os VARCHAR(20),
  note TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_prescrizioni_cliente ON prescrizioni(cliente_id);
CREATE INDEX idx_prescrizioni_store ON prescrizioni(store_id);
CREATE INDEX idx_prescrizioni_data ON prescrizioni(data_prescrizione DESC);

-- =============================================
-- CATEGORIE PRODOTTI
-- =============================================
CREATE TABLE IF NOT EXISTS categorie (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome VARCHAR(100) NOT NULL,
  tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('montatura', 'lente', 'lac', 'sole', 'accessorio')),
  descrizione TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default categories
INSERT INTO categorie (nome, tipo) VALUES
  ('Montature Vista', 'montatura'),
  ('Montature Sole', 'sole'),
  ('Lenti Oftalmiche', 'lente'),
  ('Lenti a Contatto', 'lac'),
  ('Accessori', 'accessorio')
ON CONFLICT DO NOTHING;

-- =============================================
-- FORNITORI
-- =============================================
CREATE TABLE IF NOT EXISTS fornitori (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome VARCHAR(255) NOT NULL,
  codice VARCHAR(50),
  indirizzo VARCHAR(255),
  citta VARCHAR(100),
  cap VARCHAR(10),
  provincia VARCHAR(2),
  telefono VARCHAR(20),
  email VARCHAR(255),
  piva VARCHAR(20),
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- PRODOTTI (Per Store)
-- =============================================
CREATE TABLE IF NOT EXISTS prodotti (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
  categoria_id UUID REFERENCES categorie(id),
  fornitore_id UUID REFERENCES fornitori(id),
  codice VARCHAR(50) NOT NULL,
  barcode VARCHAR(50),
  nome VARCHAR(255) NOT NULL,
  marca VARCHAR(100),
  modello VARCHAR(100),
  colore VARCHAR(50),
  materiale VARCHAR(50),
  calibro VARCHAR(10),
  ponte VARCHAR(10),
  aste VARCHAR(10),
  prezzo_acquisto DECIMAL(10,2) DEFAULT 0,
  prezzo_vendita DECIMAL(10,2) DEFAULT 0,
  iva INTEGER DEFAULT 22,
  quantita INTEGER DEFAULT 0,
  quantita_minima INTEGER DEFAULT 1,
  ubicazione VARCHAR(50),
  note TEXT,
  attivo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(store_id, codice)
);

CREATE INDEX idx_prodotti_store ON prodotti(store_id);
CREATE INDEX idx_prodotti_categoria ON prodotti(categoria_id);
CREATE INDEX idx_prodotti_codice ON prodotti(codice);
CREATE INDEX idx_prodotti_barcode ON prodotti(barcode);
CREATE INDEX idx_prodotti_marca ON prodotti(marca);

-- =============================================
-- MOVIMENTI MAGAZZINO
-- =============================================
CREATE TABLE IF NOT EXISTS movimenti (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
  prodotto_id UUID REFERENCES prodotti(id) ON DELETE CASCADE,
  tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('carico', 'scarico', 'rettifica', 'vendita', 'reso')),
  quantita INTEGER NOT NULL,
  quantita_precedente INTEGER NOT NULL,
  quantita_successiva INTEGER NOT NULL,
  riferimento VARCHAR(100),
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_movimenti_prodotto ON movimenti(prodotto_id);
CREATE INDEX idx_movimenti_store ON movimenti(store_id);
CREATE INDEX idx_movimenti_data ON movimenti(created_at DESC);

-- =============================================
-- ORDINI
-- =============================================
CREATE TABLE IF NOT EXISTS ordini (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
  cliente_id UUID REFERENCES clienti(id),
  prescrizione_id UUID REFERENCES prescrizioni(id),
  numero VARCHAR(20) UNIQUE NOT NULL,
  data_ordine DATE NOT NULL DEFAULT CURRENT_DATE,
  data_consegna_prevista DATE,
  data_consegna DATE,
  stato VARCHAR(20) NOT NULL DEFAULT 'nuovo' CHECK (stato IN ('nuovo', 'in_lavorazione', 'attesa_lenti', 'attesa_montatura', 'pronto', 'consegnato', 'annullato')),

  -- Montatura
  montatura_id UUID REFERENCES prodotti(id),
  montatura_descrizione TEXT,
  montatura_prezzo DECIMAL(10,2) DEFAULT 0,

  -- Lenti
  lente_tipo VARCHAR(100),
  lente_materiale VARCHAR(100),
  lente_trattamenti TEXT[],
  lente_fornitore VARCHAR(100),
  lente_prezzo DECIMAL(10,2) DEFAULT 0,

  -- Totali
  sconto_percentuale DECIMAL(5,2) DEFAULT 0,
  sconto_importo DECIMAL(10,2) DEFAULT 0,
  totale DECIMAL(10,2) DEFAULT 0,
  acconto DECIMAL(10,2) DEFAULT 0,
  saldo DECIMAL(10,2) DEFAULT 0,

  note TEXT,
  note_laboratorio TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_ordini_store ON ordini(store_id);
CREATE INDEX idx_ordini_cliente ON ordini(cliente_id);
CREATE INDEX idx_ordini_stato ON ordini(stato);
CREATE INDEX idx_ordini_data ON ordini(data_ordine DESC);
CREATE INDEX idx_ordini_numero ON ordini(numero);

-- =============================================
-- BUSTE LAVORO
-- =============================================
CREATE TABLE IF NOT EXISTS buste_lavoro (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
  ordine_id UUID REFERENCES ordini(id) ON DELETE CASCADE,
  numero VARCHAR(20) UNIQUE NOT NULL,
  stato VARCHAR(20) NOT NULL DEFAULT 'da_iniziare' CHECK (stato IN ('da_iniziare', 'in_lavorazione', 'in_attesa', 'completata')),
  priorita VARCHAR(20) DEFAULT 'normale' CHECK (priorita IN ('bassa', 'normale', 'alta', 'urgente')),
  assegnato_a VARCHAR(100),
  data_inizio TIMESTAMPTZ,
  data_completamento TIMESTAMPTZ,
  note TEXT,
  checklist JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_buste_store ON buste_lavoro(store_id);
CREATE INDEX idx_buste_ordine ON buste_lavoro(ordine_id);
CREATE INDEX idx_buste_stato ON buste_lavoro(stato);

-- =============================================
-- APPUNTAMENTI
-- =============================================
CREATE TABLE IF NOT EXISTS appuntamenti (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
  cliente_id UUID REFERENCES clienti(id),
  tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('visita', 'ritiro', 'controllo', 'riparazione', 'altro')),
  titolo VARCHAR(255) NOT NULL,
  data_ora TIMESTAMPTZ NOT NULL,
  durata_minuti INTEGER DEFAULT 30,
  stato VARCHAR(20) DEFAULT 'programmato' CHECK (stato IN ('programmato', 'confermato', 'completato', 'annullato', 'no_show')),
  note TEXT,
  promemoria_inviato BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_appuntamenti_store ON appuntamenti(store_id);
CREATE INDEX idx_appuntamenti_cliente ON appuntamenti(cliente_id);
CREATE INDEX idx_appuntamenti_data ON appuntamenti(data_ora);
CREATE INDEX idx_appuntamenti_stato ON appuntamenti(stato);

-- =============================================
-- VENDITE
-- =============================================
CREATE TABLE IF NOT EXISTS vendite (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
  cliente_id UUID REFERENCES clienti(id),
  numero VARCHAR(20) UNIQUE NOT NULL,
  data_vendita TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  metodo_pagamento VARCHAR(20) NOT NULL CHECK (metodo_pagamento IN ('contanti', 'carta', 'bonifico', 'assegno', 'misto')),
  subtotale DECIMAL(10,2) DEFAULT 0,
  sconto_percentuale DECIMAL(5,2) DEFAULT 0,
  sconto_importo DECIMAL(10,2) DEFAULT 0,
  totale DECIMAL(10,2) DEFAULT 0,
  iva_totale DECIMAL(10,2) DEFAULT 0,
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_vendite_store ON vendite(store_id);
CREATE INDEX idx_vendite_cliente ON vendite(cliente_id);
CREATE INDEX idx_vendite_data ON vendite(data_vendita DESC);

-- =============================================
-- RIGHE VENDITA
-- =============================================
CREATE TABLE IF NOT EXISTS righe_vendita (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vendita_id UUID REFERENCES vendite(id) ON DELETE CASCADE,
  prodotto_id UUID REFERENCES prodotti(id),
  descrizione TEXT NOT NULL,
  quantita INTEGER NOT NULL DEFAULT 1,
  prezzo_unitario DECIMAL(10,2) NOT NULL,
  sconto_percentuale DECIMAL(5,2) DEFAULT 0,
  iva INTEGER DEFAULT 22,
  totale DECIMAL(10,2) NOT NULL
);

CREATE INDEX idx_righe_vendita_vendita ON righe_vendita(vendita_id);

-- =============================================
-- FATTURE
-- =============================================
CREATE TABLE IF NOT EXISTS fatture (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
  cliente_id UUID REFERENCES clienti(id),
  vendita_id UUID REFERENCES vendite(id),
  numero VARCHAR(20) UNIQUE NOT NULL,
  data_fattura DATE NOT NULL DEFAULT CURRENT_DATE,
  data_scadenza DATE,
  stato VARCHAR(20) DEFAULT 'emessa' CHECK (stato IN ('emessa', 'pagata', 'scaduta', 'annullata')),
  imponibile DECIMAL(10,2) DEFAULT 0,
  iva DECIMAL(10,2) DEFAULT 0,
  totale DECIMAL(10,2) DEFAULT 0,
  note TEXT,
  xml_path TEXT,
  pdf_path TEXT,
  sdi_stato VARCHAR(50),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_fatture_store ON fatture(store_id);
CREATE INDEX idx_fatture_cliente ON fatture(cliente_id);
CREATE INDEX idx_fatture_data ON fatture(data_fattura DESC);
CREATE INDEX idx_fatture_stato ON fatture(stato);

-- =============================================
-- RIGHE FATTURA
-- =============================================
CREATE TABLE IF NOT EXISTS righe_fattura (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  fattura_id UUID REFERENCES fatture(id) ON DELETE CASCADE,
  descrizione TEXT NOT NULL,
  quantita DECIMAL(10,3) NOT NULL DEFAULT 1,
  prezzo_unitario DECIMAL(10,2) NOT NULL,
  iva_percentuale INTEGER DEFAULT 22,
  iva_importo DECIMAL(10,2) DEFAULT 0,
  totale DECIMAL(10,2) NOT NULL
);

CREATE INDEX idx_righe_fattura_fattura ON righe_fattura(fattura_id);

-- =============================================
-- IMPOSTAZIONI
-- =============================================
CREATE TABLE IF NOT EXISTS impostazioni (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
  chiave VARCHAR(100) NOT NULL,
  valore TEXT,
  tipo VARCHAR(20) DEFAULT 'string' CHECK (tipo IN ('string', 'number', 'boolean', 'json')),
  descrizione TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(store_id, chiave)
);

-- =============================================
-- TRIGGERS FOR updated_at
-- =============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to all tables with updated_at
CREATE TRIGGER update_stores_updated_at BEFORE UPDATE ON stores FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_clienti_updated_at BEFORE UPDATE ON clienti FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_prescrizioni_updated_at BEFORE UPDATE ON prescrizioni FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_fornitori_updated_at BEFORE UPDATE ON fornitori FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_prodotti_updated_at BEFORE UPDATE ON prodotti FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_ordini_updated_at BEFORE UPDATE ON ordini FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_buste_lavoro_updated_at BEFORE UPDATE ON buste_lavoro FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_appuntamenti_updated_at BEFORE UPDATE ON appuntamenti FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_fatture_updated_at BEFORE UPDATE ON fatture FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_impostazioni_updated_at BEFORE UPDATE ON impostazioni FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================
-- Enable RLS on all tables
ALTER TABLE stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE clienti ENABLE ROW LEVEL SECURITY;
ALTER TABLE prescrizioni ENABLE ROW LEVEL SECURITY;
ALTER TABLE categorie ENABLE ROW LEVEL SECURITY;
ALTER TABLE fornitori ENABLE ROW LEVEL SECURITY;
ALTER TABLE prodotti ENABLE ROW LEVEL SECURITY;
ALTER TABLE movimenti ENABLE ROW LEVEL SECURITY;
ALTER TABLE ordini ENABLE ROW LEVEL SECURITY;
ALTER TABLE buste_lavoro ENABLE ROW LEVEL SECURITY;
ALTER TABLE appuntamenti ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendite ENABLE ROW LEVEL SECURITY;
ALTER TABLE righe_vendita ENABLE ROW LEVEL SECURITY;
ALTER TABLE fatture ENABLE ROW LEVEL SECURITY;
ALTER TABLE righe_fattura ENABLE ROW LEVEL SECURITY;
ALTER TABLE impostazioni ENABLE ROW LEVEL SECURITY;

-- For now, create permissive policies (full access)
-- In production, these should be restricted based on user roles

CREATE POLICY "Allow all access to stores" ON stores FOR ALL USING (true);
CREATE POLICY "Allow all access to clienti" ON clienti FOR ALL USING (true);
CREATE POLICY "Allow all access to prescrizioni" ON prescrizioni FOR ALL USING (true);
CREATE POLICY "Allow all access to categorie" ON categorie FOR ALL USING (true);
CREATE POLICY "Allow all access to fornitori" ON fornitori FOR ALL USING (true);
CREATE POLICY "Allow all access to prodotti" ON prodotti FOR ALL USING (true);
CREATE POLICY "Allow all access to movimenti" ON movimenti FOR ALL USING (true);
CREATE POLICY "Allow all access to ordini" ON ordini FOR ALL USING (true);
CREATE POLICY "Allow all access to buste_lavoro" ON buste_lavoro FOR ALL USING (true);
CREATE POLICY "Allow all access to appuntamenti" ON appuntamenti FOR ALL USING (true);
CREATE POLICY "Allow all access to vendite" ON vendite FOR ALL USING (true);
CREATE POLICY "Allow all access to righe_vendita" ON righe_vendita FOR ALL USING (true);
CREATE POLICY "Allow all access to fatture" ON fatture FOR ALL USING (true);
CREATE POLICY "Allow all access to righe_fattura" ON righe_fattura FOR ALL USING (true);
CREATE POLICY "Allow all access to impostazioni" ON impostazioni FOR ALL USING (true);

-- =============================================
-- INSERT DEFAULT STORE
-- =============================================
INSERT INTO stores (nome, indirizzo, citta, cap, provincia, telefono, email, piva)
VALUES (
  'Ottica Balestrieri',
  'Via Roma, 1',
  'Milano',
  '20100',
  'MI',
  '02 1234567',
  'info@otticabalestrieri.it',
  '12345678901'
)
ON CONFLICT DO NOTHING;
