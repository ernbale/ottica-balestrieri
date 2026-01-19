-- ============================================
-- SCHEMA DATABASE - GESTIONALE OTTICA BALESTRIERI
-- ============================================
-- Esegui questo script nel SQL Editor di Supabase
-- Dashboard > SQL Editor > New Query > Incolla e Run

-- ============================================
-- 1. TABELLA NEGOZIO (STORE)
-- ============================================
CREATE TABLE IF NOT EXISTS stores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  address TEXT,
  city VARCHAR(100),
  phone VARCHAR(50),
  email VARCHAR(255),
  vat_number VARCHAR(20),
  fiscal_code VARCHAR(20),
  logo_url TEXT,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Inserisci store di default
INSERT INTO stores (name, city, phone, email)
VALUES ('Ottica Balestrieri', 'Roma', '06 12345678', 'info@otticabalestrieri.it')
ON CONFLICT DO NOTHING;

-- ============================================
-- 2. TABELLA CLIENTI
-- ============================================
CREATE TABLE IF NOT EXISTS clienti (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
  codice VARCHAR(20) UNIQUE NOT NULL,
  nome VARCHAR(100) NOT NULL,
  cognome VARCHAR(100) NOT NULL,
  data_nascita DATE,
  codice_fiscale VARCHAR(16),
  telefono VARCHAR(50),
  cellulare VARCHAR(50),
  email VARCHAR(255),
  indirizzo TEXT,
  citta VARCHAR(100),
  cap VARCHAR(10),
  provincia VARCHAR(5),
  note TEXT,
  consenso_privacy BOOLEAN DEFAULT FALSE,
  consenso_marketing BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_clienti_store ON clienti(store_id);
CREATE INDEX idx_clienti_cognome ON clienti(cognome);
CREATE INDEX idx_clienti_codice ON clienti(codice);

-- ============================================
-- 3. TABELLA PRESCRIZIONI
-- ============================================
CREATE TABLE IF NOT EXISTS prescrizioni (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id UUID REFERENCES clienti(id) ON DELETE CASCADE,
  store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
  data_prescrizione DATE NOT NULL DEFAULT CURRENT_DATE,
  prescrittore VARCHAR(255),

  -- LONTANO (L)
  l_od_sph DECIMAL(5,2),
  l_od_cyl DECIMAL(5,2),
  l_od_ax INTEGER CHECK (l_od_ax >= 0 AND l_od_ax <= 180),
  l_os_sph DECIMAL(5,2),
  l_os_cyl DECIMAL(5,2),
  l_os_ax INTEGER CHECK (l_os_ax >= 0 AND l_os_ax <= 180),

  -- PERMANENTE (P)
  p_od_sph DECIMAL(5,2),
  p_od_cyl DECIMAL(5,2),
  p_od_ax INTEGER CHECK (p_od_ax >= 0 AND p_od_ax <= 180),
  p_os_sph DECIMAL(5,2),
  p_os_cyl DECIMAL(5,2),
  p_os_ax INTEGER CHECK (p_os_ax >= 0 AND p_os_ax <= 180),

  -- INTERMEDIO (I)
  i_od_sph DECIMAL(5,2),
  i_od_cyl DECIMAL(5,2),
  i_od_ax INTEGER CHECK (i_od_ax >= 0 AND i_od_ax <= 180),
  i_od_add DECIMAL(4,2),
  i_os_sph DECIMAL(5,2),
  i_os_cyl DECIMAL(5,2),
  i_os_ax INTEGER CHECK (i_os_ax >= 0 AND i_os_ax <= 180),
  i_os_add DECIMAL(4,2),

  -- VICINO (V)
  v_od_sph DECIMAL(5,2),
  v_od_cyl DECIMAL(5,2),
  v_od_ax INTEGER CHECK (v_od_ax >= 0 AND v_od_ax <= 180),
  v_od_add DECIMAL(4,2),
  v_os_sph DECIMAL(5,2),
  v_os_cyl DECIMAL(5,2),
  v_os_ax INTEGER CHECK (v_os_ax >= 0 AND v_os_ax <= 180),
  v_os_add DECIMAL(4,2),

  -- Distanze interpupillari
  dip_lontano DECIMAL(4,1),
  dip_vicino DECIMAL(4,1),
  dip_od DECIMAL(4,1),
  dip_os DECIMAL(4,1),

  -- Altezze montaggio
  altezza_od DECIMAL(4,1),
  altezza_os DECIMAL(4,1),

  note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_prescrizioni_cliente ON prescrizioni(cliente_id);
CREATE INDEX idx_prescrizioni_data ON prescrizioni(data_prescrizione DESC);

-- ============================================
-- 4. TABELLA CATEGORIE PRODOTTI
-- ============================================
CREATE TABLE IF NOT EXISTS categorie (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
  nome VARCHAR(100) NOT NULL,
  tipo VARCHAR(50) NOT NULL, -- 'montatura_vista', 'montatura_sole', 'lente', 'lac', 'accessorio'
  colore VARCHAR(20) DEFAULT 'primary',
  ordinamento INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Inserisci categorie di default
INSERT INTO categorie (nome, tipo, colore, ordinamento, store_id)
SELECT nome, tipo, colore, ordinamento, (SELECT id FROM stores LIMIT 1)
FROM (VALUES
  ('Montature Vista', 'montatura_vista', 'primary', 1),
  ('Montature Sole', 'montatura_sole', 'secondary', 2),
  ('Lenti Oftalmiche', 'lente', 'info', 3),
  ('Lenti a Contatto', 'lac', 'success', 4),
  ('Accessori', 'accessorio', 'warning', 5)
) AS v(nome, tipo, colore, ordinamento)
ON CONFLICT DO NOTHING;

-- ============================================
-- 5. TABELLA PRODOTTI (MAGAZZINO)
-- ============================================
CREATE TABLE IF NOT EXISTS prodotti (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
  categoria_id UUID REFERENCES categorie(id),
  codice VARCHAR(50) UNIQUE NOT NULL,
  barcode VARCHAR(50),
  nome VARCHAR(255) NOT NULL,
  marca VARCHAR(100),
  modello VARCHAR(100),
  colore VARCHAR(100),
  descrizione TEXT,
  prezzo_acquisto DECIMAL(10,2) DEFAULT 0,
  prezzo_vendita DECIMAL(10,2) DEFAULT 0,
  iva INTEGER DEFAULT 22,
  quantita INTEGER DEFAULT 0,
  quantita_minima INTEGER DEFAULT 1,
  ubicazione VARCHAR(100),
  fornitore VARCHAR(255),
  attivo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_prodotti_store ON prodotti(store_id);
CREATE INDEX idx_prodotti_categoria ON prodotti(categoria_id);
CREATE INDEX idx_prodotti_codice ON prodotti(codice);
CREATE INDEX idx_prodotti_barcode ON prodotti(barcode);

-- ============================================
-- 6. TABELLA LISTINO LENTI
-- ============================================
CREATE TABLE IF NOT EXISTS listino_lenti (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
  tipo VARCHAR(50) NOT NULL, -- 'monofocale', 'bifocale', 'progressiva', 'office'
  materiale VARCHAR(50) NOT NULL, -- 'cr39', 'policarbonato', 'organico156', etc.
  indice DECIMAL(3,2),
  prezzo_base DECIMAL(10,2) NOT NULL,
  fornitore VARCHAR(100),
  descrizione TEXT,
  attivo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 7. TABELLA TRATTAMENTI LENTI
-- ============================================
CREATE TABLE IF NOT EXISTS trattamenti_lenti (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
  codice VARCHAR(50) NOT NULL,
  nome VARCHAR(100) NOT NULL,
  prezzo DECIMAL(10,2) NOT NULL,
  descrizione TEXT,
  attivo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Inserisci trattamenti di default
INSERT INTO trattamenti_lenti (codice, nome, prezzo, store_id)
SELECT codice, nome, prezzo, (SELECT id FROM stores LIMIT 1)
FROM (VALUES
  ('AR', 'Antiriflesso', 40.00),
  ('FOTO', 'Fotocromatico', 80.00),
  ('BLUE', 'Blue Control', 50.00),
  ('POL', 'Polarizzato', 70.00),
  ('TRANS', 'Transitions', 120.00),
  ('AG', 'Antigraffio', 20.00),
  ('IDRO', 'Idrorepellente', 25.00)
) AS v(codice, nome, prezzo)
ON CONFLICT DO NOTHING;

-- ============================================
-- 8. TABELLA ORDINI
-- ============================================
CREATE TABLE IF NOT EXISTS ordini (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
  cliente_id UUID REFERENCES clienti(id),
  prescrizione_id UUID REFERENCES prescrizioni(id),
  numero VARCHAR(50) UNIQUE NOT NULL,
  data_ordine DATE NOT NULL DEFAULT CURRENT_DATE,
  data_consegna_prevista DATE,
  data_consegna_effettiva DATE,
  stato VARCHAR(50) DEFAULT 'nuovo', -- 'nuovo', 'in_lavorazione', 'attesa_lenti', 'pronto', 'consegnato', 'annullato'

  -- Montatura
  montatura_id UUID REFERENCES prodotti(id),
  montatura_prezzo DECIMAL(10,2),

  -- Lenti
  lente_tipo VARCHAR(50),
  lente_materiale VARCHAR(50),
  lente_indice DECIMAL(3,2),
  lente_fornitore VARCHAR(100),
  lente_prezzo DECIMAL(10,2),
  lente_trattamenti JSONB DEFAULT '[]', -- Array di trattamenti selezionati
  trattamenti_prezzo DECIMAL(10,2) DEFAULT 0,

  -- Tipo utilizzo prescrizione
  uso_prescrizione VARCHAR(50), -- 'lontano', 'vicino', 'intermedio', 'progressiva'

  -- Totali
  subtotale DECIMAL(10,2) DEFAULT 0,
  sconto_percentuale DECIMAL(5,2) DEFAULT 0,
  sconto_euro DECIMAL(10,2) DEFAULT 0,
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

-- ============================================
-- 9. TABELLA PAGAMENTI
-- ============================================
CREATE TABLE IF NOT EXISTS pagamenti (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
  ordine_id UUID REFERENCES ordini(id) ON DELETE CASCADE,
  data_pagamento TIMESTAMPTZ DEFAULT NOW(),
  importo DECIMAL(10,2) NOT NULL,
  metodo VARCHAR(50) NOT NULL, -- 'contanti', 'carta', 'bonifico', 'assegno'
  riferimento VARCHAR(100),
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_pagamenti_ordine ON pagamenti(ordine_id);

-- ============================================
-- 10. TABELLA APPUNTAMENTI
-- ============================================
CREATE TABLE IF NOT EXISTS appuntamenti (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
  cliente_id UUID REFERENCES clienti(id),
  data_ora TIMESTAMPTZ NOT NULL,
  durata_minuti INTEGER DEFAULT 30,
  tipo VARCHAR(50) NOT NULL, -- 'visita', 'ritiro', 'controllo', 'riparazione'
  stato VARCHAR(50) DEFAULT 'confermato', -- 'confermato', 'completato', 'annullato', 'no_show'
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_appuntamenti_data ON appuntamenti(data_ora);
CREATE INDEX idx_appuntamenti_cliente ON appuntamenti(cliente_id);

-- ============================================
-- 11. FUNZIONI UTILITY
-- ============================================

-- Funzione per generare numero ordine
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TEXT AS $$
DECLARE
  year_part TEXT;
  seq_num INTEGER;
  new_number TEXT;
BEGIN
  year_part := TO_CHAR(CURRENT_DATE, 'YYYY');

  SELECT COALESCE(MAX(
    CAST(SUBSTRING(numero FROM 'ORD-' || year_part || '(\d+)') AS INTEGER)
  ), 0) + 1
  INTO seq_num
  FROM ordini
  WHERE numero LIKE 'ORD-' || year_part || '%';

  new_number := 'ORD-' || year_part || LPAD(seq_num::TEXT, 4, '0');
  RETURN new_number;
END;
$$ LANGUAGE plpgsql;

-- Funzione per generare codice cliente
CREATE OR REPLACE FUNCTION generate_client_code()
RETURNS TEXT AS $$
DECLARE
  seq_num INTEGER;
  new_code TEXT;
BEGIN
  SELECT COALESCE(MAX(
    CAST(SUBSTRING(codice FROM 'CLI-(\d+)') AS INTEGER)
  ), 0) + 1
  INTO seq_num
  FROM clienti;

  new_code := 'CLI-' || LPAD(seq_num::TEXT, 4, '0');
  RETURN new_code;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 12. TRIGGER PER UPDATED_AT
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Applica trigger a tutte le tabelle con updated_at
DO $$
DECLARE
  t TEXT;
BEGIN
  FOR t IN SELECT unnest(ARRAY['stores', 'clienti', 'prescrizioni', 'prodotti', 'ordini', 'appuntamenti'])
  LOOP
    EXECUTE format('
      DROP TRIGGER IF EXISTS trigger_updated_at ON %I;
      CREATE TRIGGER trigger_updated_at
        BEFORE UPDATE ON %I
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at();
    ', t, t);
  END LOOP;
END;
$$;

-- ============================================
-- 13. ROW LEVEL SECURITY (RLS)
-- ============================================
-- Abilita RLS su tutte le tabelle (opzionale, per multi-tenancy)
-- ALTER TABLE clienti ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE prescrizioni ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE prodotti ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE ordini ENABLE ROW LEVEL SECURITY;

-- ============================================
-- FINE SCHEMA
-- ============================================
-- Schema creato con successo!
-- Tabelle: stores, clienti, prescrizioni, categorie, prodotti,
--          listino_lenti, trattamenti_lenti, ordini, pagamenti, appuntamenti
