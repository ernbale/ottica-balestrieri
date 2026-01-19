'use client'

import { useState } from 'react'
import { MainLayout } from '@/components/layout'
import { Card, Button, Input, Badge, Modal, Select } from '@/components/ui'
import {
  Plus,
  Search,
  Trash2,
  User,
  CreditCard,
  Banknote,
  Building,
  FileText,
  Calculator,
  Percent,
  ShoppingCart,
  Barcode,
  Package,
} from 'lucide-react'
import { clsx } from 'clsx'

interface CartItem {
  id: string
  codice: string
  nome: string
  prezzo: number
  quantita: number
  sconto: number
  iva: number
}

interface Prodotto {
  id: string
  codice: string
  nome: string
  marca: string
  prezzo: number
  quantita_disponibile: number
  iva: number
}

const mockProdotti: Prodotto[] = [
  { id: '1', codice: 'MV-001', nome: 'Ray-Ban RB5154', marca: 'Ray-Ban', prezzo: 180, quantita_disponibile: 5, iva: 22 },
  { id: '2', codice: 'MS-001', nome: 'Oakley Holbrook', marca: 'Oakley', prezzo: 150, quantita_disponibile: 3, iva: 22 },
  { id: '3', codice: 'LO-001', nome: 'Essilor Varilux X', marca: 'Essilor', prezzo: 350, quantita_disponibile: 10, iva: 22 },
  { id: '4', codice: 'LC-001', nome: 'Acuvue Oasys (6pz)', marca: 'J&J', prezzo: 45, quantita_disponibile: 20, iva: 22 },
  { id: '5', codice: 'AC-001', nome: 'Spray Pulizia', marca: 'Generic', prezzo: 8, quantita_disponibile: 50, iva: 22 },
  { id: '6', codice: 'AC-002', nome: 'Panno Microfibra', marca: 'Generic', prezzo: 5, quantita_disponibile: 100, iva: 22 },
  { id: '7', codice: 'AC-003', nome: 'Astuccio Rigido', marca: 'Generic', prezzo: 15, quantita_disponibile: 30, iva: 22 },
]

const mockVenditeRecenti = [
  { id: '1', numero: 'VEN-001', cliente: 'Mario Rossi', data: '2024-03-18 10:30', totale: 195, metodo: 'carta' },
  { id: '2', numero: 'VEN-002', cliente: 'Walk-in', data: '2024-03-18 11:15', totale: 53, metodo: 'contanti' },
  { id: '3', numero: 'VEN-003', cliente: 'Anna Bianchi', data: '2024-03-18 14:00', totale: 380, metodo: 'carta' },
]

export default function VenditePage() {
  const [cart, setCart] = useState<CartItem[]>([])
  const [searchProdotto, setSearchProdotto] = useState('')
  const [cliente, setCliente] = useState('')
  const [metodoPagamento, setMetodoPagamento] = useState<'contanti' | 'carta' | 'bonifico' | 'misto'>('contanti')
  const [scontoGlobale, setScontoGlobale] = useState(0)
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false)
  const [contantiRicevuti, setContantiRicevuti] = useState('')

  const filteredProdotti = mockProdotti.filter(
    (p) =>
      p.nome.toLowerCase().includes(searchProdotto.toLowerCase()) ||
      p.codice.toLowerCase().includes(searchProdotto.toLowerCase()) ||
      p.marca.toLowerCase().includes(searchProdotto.toLowerCase())
  )

  const addToCart = (prodotto: Prodotto) => {
    const existing = cart.find((item) => item.id === prodotto.id)
    if (existing) {
      setCart(cart.map((item) =>
        item.id === prodotto.id
          ? { ...item, quantita: item.quantita + 1 }
          : item
      ))
    } else {
      setCart([...cart, {
        id: prodotto.id,
        codice: prodotto.codice,
        nome: prodotto.nome,
        prezzo: prodotto.prezzo,
        quantita: 1,
        sconto: 0,
        iva: prodotto.iva,
      }])
    }
    setSearchProdotto('')
  }

  const updateQuantity = (id: string, quantita: number) => {
    if (quantita <= 0) {
      removeFromCart(id)
    } else {
      setCart(cart.map((item) =>
        item.id === id ? { ...item, quantita } : item
      ))
    }
  }

  const updateSconto = (id: string, sconto: number) => {
    setCart(cart.map((item) =>
      item.id === id ? { ...item, sconto: Math.min(100, Math.max(0, sconto)) } : item
    ))
  }

  const removeFromCart = (id: string) => {
    setCart(cart.filter((item) => item.id !== id))
  }

  const clearCart = () => {
    setCart([])
    setCliente('')
    setScontoGlobale(0)
  }

  // Calcoli
  const subtotale = cart.reduce((acc, item) => {
    const itemTotal = item.prezzo * item.quantita
    const itemSconto = itemTotal * (item.sconto / 100)
    return acc + (itemTotal - itemSconto)
  }, 0)

  const scontoGlobaleImporto = subtotale * (scontoGlobale / 100)
  const imponibile = subtotale - scontoGlobaleImporto
  const ivaImporto = cart.reduce((acc, item) => {
    const itemTotal = item.prezzo * item.quantita * (1 - item.sconto / 100)
    return acc + (itemTotal * (item.iva / 100))
  }, 0) * (1 - scontoGlobale / 100)
  const totale = imponibile + ivaImporto

  const resto = parseFloat(contantiRicevuti) - totale

  const handleCompletaVendita = () => {
    // Simulate sale completion
    setIsPaymentModalOpen(false)
    clearCart()
    setContantiRicevuti('')
  }

  return (
    <MainLayout title="Punto Vendita">
      <div className="flex flex-col lg:flex-row gap-6 animate-fade-in h-[calc(100vh-120px)]">
        {/* Left Panel - Products */}
        <div className="flex-1 flex flex-col min-h-0">
          {/* Search */}
          <div className="mb-4">
            <div className="relative">
              <Barcode className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground-muted" />
              <input
                type="text"
                placeholder="Cerca o scansiona prodotto..."
                value={searchProdotto}
                onChange={(e) => setSearchProdotto(e.target.value)}
                className="input-base pl-10 text-lg"
                autoFocus
              />
            </div>
          </div>

          {/* Product Grid */}
          <Card className="flex-1 overflow-hidden" padding="none">
            <div className="p-4 border-b border-border">
              <h3 className="font-semibold text-foreground">Prodotti Disponibili</h3>
            </div>
            <div className="p-4 grid grid-cols-2 md:grid-cols-3 gap-3 overflow-y-auto max-h-[calc(100vh-350px)]">
              {filteredProdotti.map((prodotto) => (
                <button
                  key={prodotto.id}
                  onClick={() => addToCart(prodotto)}
                  className="flex flex-col items-start p-3 rounded-lg border border-border hover:border-primary hover:bg-primary/5 transition-colors text-left"
                >
                  <div className="w-10 h-10 rounded-lg bg-background-secondary flex items-center justify-center mb-2">
                    <Package className="w-5 h-5 text-foreground-muted" />
                  </div>
                  <p className="font-medium text-sm truncate w-full">{prodotto.nome}</p>
                  <p className="text-xs text-foreground-muted">{prodotto.marca}</p>
                  <p className="text-primary font-bold mt-1">
                    {prodotto.prezzo.toLocaleString('it-IT', { style: 'currency', currency: 'EUR' })}
                  </p>
                  <p className="text-xs text-foreground-muted">Disp: {prodotto.quantita_disponibile}</p>
                </button>
              ))}
            </div>
          </Card>

          {/* Recent Sales */}
          <Card className="mt-4" padding="sm">
            <h4 className="font-semibold text-sm text-foreground mb-2">Vendite Recenti</h4>
            <div className="flex gap-2 overflow-x-auto">
              {mockVenditeRecenti.map((v) => (
                <div
                  key={v.id}
                  className="flex-shrink-0 px-3 py-2 rounded-lg bg-background-secondary text-xs"
                >
                  <p className="font-medium">{v.numero}</p>
                  <p className="text-foreground-muted">{v.cliente}</p>
                  <p className="text-primary font-bold">
                    {v.totale.toLocaleString('it-IT', { style: 'currency', currency: 'EUR' })}
                  </p>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Right Panel - Cart */}
        <div className="w-full lg:w-[400px] flex flex-col min-h-0">
          <Card className="flex-1 flex flex-col" padding="none">
            {/* Cart Header */}
            <div className="p-4 border-b border-border">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5 text-primary" />
                  <h3 className="font-semibold text-foreground">Carrello</h3>
                  <Badge variant="primary">{cart.length}</Badge>
                </div>
                {cart.length > 0 && (
                  <Button variant="ghost" size="sm" onClick={clearCart}>
                    Svuota
                  </Button>
                )}
              </div>

              {/* Cliente */}
              <div className="mt-3">
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground-muted" />
                  <input
                    type="text"
                    placeholder="Cliente (opzionale)"
                    value={cliente}
                    onChange={(e) => setCliente(e.target.value)}
                    className="input-base pl-10 text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {cart.length === 0 ? (
                <div className="text-center py-8 text-foreground-muted">
                  <ShoppingCart className="w-12 h-12 mx-auto mb-2 opacity-30" />
                  <p>Carrello vuoto</p>
                  <p className="text-sm">Aggiungi prodotti per iniziare</p>
                </div>
              ) : (
                cart.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 rounded-lg bg-background-secondary/50 border border-border"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-medium text-sm">{item.nome}</p>
                        <p className="text-xs text-foreground-muted">{item.codice}</p>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="p-1 rounded hover:bg-error/10 text-error transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex items-center border border-border rounded">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantita - 1)}
                          className="px-2 py-1 hover:bg-background-secondary"
                        >
                          -
                        </button>
                        <span className="px-3 py-1 font-medium">{item.quantita}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantita + 1)}
                          className="px-2 py-1 hover:bg-background-secondary"
                        >
                          +
                        </button>
                      </div>

                      <div className="flex items-center gap-1">
                        <Percent className="w-3 h-3 text-foreground-muted" />
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={item.sconto}
                          onChange={(e) => updateSconto(item.id, parseInt(e.target.value) || 0)}
                          className="w-12 px-2 py-1 text-sm border border-border rounded text-center"
                        />
                      </div>

                      <span className="ml-auto font-bold text-primary">
                        {((item.prezzo * item.quantita) * (1 - item.sconto / 100)).toLocaleString('it-IT', { style: 'currency', currency: 'EUR' })}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Totals */}
            {cart.length > 0 && (
              <div className="p-4 border-t border-border space-y-2">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-sm text-foreground-muted">Sconto globale:</span>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={scontoGlobale}
                    onChange={(e) => setScontoGlobale(parseInt(e.target.value) || 0)}
                    className="w-16 px-2 py-1 text-sm border border-border rounded text-center"
                  />
                  <span className="text-sm text-foreground-muted">%</span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-foreground-muted">Subtotale:</span>
                  <span>{subtotale.toLocaleString('it-IT', { style: 'currency', currency: 'EUR' })}</span>
                </div>
                {scontoGlobale > 0 && (
                  <div className="flex justify-between text-sm text-success">
                    <span>Sconto ({scontoGlobale}%):</span>
                    <span>-{scontoGlobaleImporto.toLocaleString('it-IT', { style: 'currency', currency: 'EUR' })}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-foreground-muted">IVA:</span>
                  <span>{ivaImporto.toLocaleString('it-IT', { style: 'currency', currency: 'EUR' })}</span>
                </div>
                <hr className="border-border" />
                <div className="flex justify-between text-xl font-bold">
                  <span>Totale:</span>
                  <span className="text-primary">{totale.toLocaleString('it-IT', { style: 'currency', currency: 'EUR' })}</span>
                </div>
              </div>
            )}

            {/* Payment Buttons */}
            {cart.length > 0 && (
              <div className="p-4 border-t border-border space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant={metodoPagamento === 'contanti' ? 'primary' : 'outline'}
                    onClick={() => setMetodoPagamento('contanti')}
                    className="flex-col py-3"
                  >
                    <Banknote className="w-5 h-5 mb-1" />
                    <span className="text-xs">Contanti</span>
                  </Button>
                  <Button
                    variant={metodoPagamento === 'carta' ? 'primary' : 'outline'}
                    onClick={() => setMetodoPagamento('carta')}
                    className="flex-col py-3"
                  >
                    <CreditCard className="w-5 h-5 mb-1" />
                    <span className="text-xs">Carta</span>
                  </Button>
                  <Button
                    variant={metodoPagamento === 'bonifico' ? 'primary' : 'outline'}
                    onClick={() => setMetodoPagamento('bonifico')}
                    className="flex-col py-3"
                  >
                    <Building className="w-5 h-5 mb-1" />
                    <span className="text-xs">Bonifico</span>
                  </Button>
                  <Button
                    variant={metodoPagamento === 'misto' ? 'primary' : 'outline'}
                    onClick={() => setMetodoPagamento('misto')}
                    className="flex-col py-3"
                  >
                    <Calculator className="w-5 h-5 mb-1" />
                    <span className="text-xs">Misto</span>
                  </Button>
                </div>

                <Button
                  variant="primary"
                  fullWidth
                  size="lg"
                  onClick={() => setIsPaymentModalOpen(true)}
                  className="font-bold"
                >
                  Incassa {totale.toLocaleString('it-IT', { style: 'currency', currency: 'EUR' })}
                </Button>
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Payment Modal */}
      <Modal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        title="Completa Pagamento"
        size="sm"
      >
        <div className="space-y-6">
          <div className="text-center">
            <p className="text-foreground-muted">Totale da incassare</p>
            <p className="text-4xl font-bold text-primary">
              {totale.toLocaleString('it-IT', { style: 'currency', currency: 'EUR' })}
            </p>
          </div>

          {metodoPagamento === 'contanti' && (
            <div className="space-y-4">
              <Input
                label="Contanti ricevuti"
                type="number"
                step="0.01"
                value={contantiRicevuti}
                onChange={(e) => setContantiRicevuti(e.target.value)}
                placeholder="0.00"
                className="text-2xl text-center"
              />

              {parseFloat(contantiRicevuti) >= totale && (
                <div className="p-4 rounded-lg bg-success/10 text-center">
                  <p className="text-foreground-muted text-sm">Resto da dare</p>
                  <p className="text-3xl font-bold text-success">
                    {resto.toLocaleString('it-IT', { style: 'currency', currency: 'EUR' })}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-4 gap-2">
                {[5, 10, 20, 50, 100, 200].map((amount) => (
                  <Button
                    key={amount}
                    variant="outline"
                    size="sm"
                    onClick={() => setContantiRicevuti(amount.toString())}
                  >
                    {amount}
                  </Button>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setContantiRicevuti(totale.toFixed(2))}
                  className="col-span-2"
                >
                  Esatto
                </Button>
              </div>
            </div>
          )}

          {metodoPagamento === 'carta' && (
            <div className="text-center p-6 rounded-lg bg-background-secondary">
              <CreditCard className="w-12 h-12 mx-auto mb-3 text-primary" />
              <p className="text-foreground-muted">
                Inserire la carta nel terminale POS
              </p>
            </div>
          )}

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="emettiFattura"
              className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
            />
            <label htmlFor="emettiFattura" className="text-sm">
              Emetti fattura
            </label>
          </div>

          <div className="flex gap-3">
            <Button
              variant="ghost"
              fullWidth
              onClick={() => setIsPaymentModalOpen(false)}
            >
              Annulla
            </Button>
            <Button
              variant="primary"
              fullWidth
              onClick={handleCompletaVendita}
              disabled={metodoPagamento === 'contanti' && parseFloat(contantiRicevuti) < totale}
            >
              Conferma
            </Button>
          </div>
        </div>
      </Modal>
    </MainLayout>
  )
}
