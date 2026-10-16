import { useState } from 'react'
import {
  ArrowLeft,
  Check,
  Clock3,
  Download,
  LockKeyhole,
  Minus,
  Plus,
  ShoppingCart,
  Trash2,
  UnlockKeyhole,
} from 'lucide-react'
import { formatCurrency, formatDateTime } from '../utils/formatters.js'
import { downloadSaleTicket } from '../utils/salesTicket.js'

const menu = [
  {
    id: 'burgers',
    title: 'Hamburguesas',
    products: [
      { id: 'burger-clasica', name: 'Burger clásica', price: 9000 },
      { id: 'burger-especial', name: 'Burger especial', price: 10000 },
      { id: 'peque-burger-2', name: 'Peque Burger 2.0', price: 10000 },
      { id: 'peque-burger-3', name: 'Peque Burger 3.0', price: 12000 },
      { id: 'bacon-burger', name: 'Bacon Burger', price: 11000 },
    ],
  },
  {
    id: 'extras',
    title: 'Agregados',
    products: [
      { id: 'medallon', name: 'Medallón', price: 2500 },
      { id: 'huevo', name: 'Huevo', price: 1000 },
      { id: 'cheddar', name: 'Cheddar', price: 2000 },
      { id: 'bacon-extra', name: 'Bacon', price: 2500 },
    ],
  },
  {
    id: 'fries',
    title: 'Porciones de papas',
    products: [
      { id: 'papas-comunes', name: 'Papas comunes', price: 6000 },
      { id: 'papas-cheddar', name: 'Papas con cheddar', price: 8000 },
    ],
  },
  {
    id: 'sandwiches',
    title: 'Sándwiches y lomitos',
    products: [
      { id: 'sandwich-comun', name: 'Sándwich común', price: 7500 },
      { id: 'sandwich-especial', name: 'Sándwich especial', price: 9000 },
      { id: 'lomito-comun', name: 'Lomito común', price: 10000 },
      { id: 'lomito-especial', name: 'Lomito especial', price: 11500 },
    ],
  },
]

function CashierView({ activeBox, onBack, onOpenBox, onCloseBox, onRegisterSale }) {
  const [selectedCategory, setSelectedCategory] = useState(menu[0].id)
  const [cart, setCart] = useState([])
  const [feedback, setFeedback] = useState('')
  const [lastSale, setLastSale] = useState(null)
  const [ticketFeedback, setTicketFeedback] = useState('')
  const category = menu.find((item) => item.id === selectedCategory)
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0)

  const addProduct = (product) => {
    setFeedback('')
    setLastSale(null)
    setTicketFeedback('')
    setCart((current) => {
      const existingItem = current.find((item) => item.id === product.id)
      if (existingItem) {
        return current.map((item) => (
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        ))
      }
      return [...current, { ...product, quantity: 1 }]
    })
  }

  const changeQuantity = (productId, change) => {
    setCart((current) => current
      .map((item) => item.id === productId
        ? { ...item, quantity: item.quantity + change }
        : item)
      .filter((item) => item.quantity > 0))
  }

  const finalizeSale = () => {
    if (!activeBox) {
      setFeedback('Abre la caja para poder facturar.')
      return
    }
    if (cart.length === 0) return

    const sale = onRegisterSale(cart)
    if (!sale) {
      setFeedback('No se pudo registrar la venta. Verifica que la caja siga abierta.')
      return
    }

    setCart([])
    setLastSale(sale)
    setFeedback('Venta registrada correctamente. Ticket listo.')
  }

  const downloadTicket = () => {
    if (!lastSale) return

    try {
      downloadSaleTicket(lastSale)
      setTicketFeedback('Se inició la descarga del ticket.')
    } catch {
      setTicketFeedback('No se pudo descargar el ticket. Intenta compartirlo por WhatsApp.')
    }
  }

  const closeBox = () => {
    if (itemCount > 0) {
      setFeedback('Registra o vacía el carrito antes de cerrar la caja.')
      return
    }
    onCloseBox()
    setFeedback('Caja cerrada y registrada.')
  }

  return (
    <section className="work-section">
      <button className="back-button" type="button" onClick={onBack}>
        <ArrowLeft size={17} /> Volver al inicio
      </button>
      <div className="work-heading">
        <div>
          <p className="eyebrow">VENTAS</p>
          <h1>Caja registradora</h1>
          <p className="work-subtitle">Selecciona los productos y arma el pedido.</p>
        </div>
        <div className={`cash-status ${activeBox ? 'open' : 'closed'}`}>
          {activeBox ? <UnlockKeyhole size={18} /> : <LockKeyhole size={18} />}
          <span>{activeBox ? 'Caja abierta' : 'Caja cerrada'}</span>
        </div>
      </div>

      <div className="cash-control">
        <div className="cash-control-copy">
          <span className="control-icon"><Clock3 size={19} /></span>
          <div>
            <strong>{activeBox ? 'Turno en curso' : 'No hay una caja abierta'}</strong>
            <span>
              {activeBox
                ? `Abierta el ${formatDateTime(activeBox.openedAt)}`
                : 'Abre la caja para habilitar la facturación.'}
            </span>
          </div>
        </div>
        {activeBox ? (
          <button className="button secondary" type="button" onClick={closeBox}>
            <LockKeyhole size={17} /> Cerrar caja
          </button>
        ) : (
          <button className="button primary" type="button" onClick={onOpenBox}>
            <UnlockKeyhole size={17} /> Abrir caja
          </button>
        )}
      </div>

      <div className="sales-layout">
        <section className="menu-panel" aria-labelledby="menu-title">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">MENÚ</p>
              <h2 id="menu-title">Productos</h2>
            </div>
          </div>
          <div className="category-list" role="tablist" aria-label="Categorías del menú">
            {menu.map((item) => (
              <button
                className={`category-tab ${selectedCategory === item.id ? 'selected' : ''}`}
                key={item.id}
                type="button"
                role="tab"
                aria-selected={selectedCategory === item.id}
                onClick={() => setSelectedCategory(item.id)}
              >
                {item.title}
              </button>
            ))}
          </div>
          <div className="product-grid" role="tabpanel">
            {category.products.map((product) => (
              <button
                className="product-option"
                key={product.id}
                type="button"
                onClick={() => addProduct(product)}
                aria-label={`Agregar ${product.name}, ${formatCurrency(product.price)}`}
              >
                <span className="product-option-copy">
                  <strong>{product.name}</strong>
                  <span>{formatCurrency(product.price)}</span>
                </span>
                <span className="product-add"><Plus size={17} /></span>
              </button>
            ))}
          </div>
        </section>

        <aside className="cart-panel" aria-labelledby="cart-title">
          <div className="panel-heading cart-heading">
            <div>
              <p className="eyebrow">PEDIDO ACTUAL</p>
              <h2 id="cart-title">Carrito</h2>
            </div>
            <span className="cart-count"><ShoppingCart size={15} /> {itemCount}</span>
          </div>
          {cart.length === 0 ? (
            <div className="cart-empty">
              <ShoppingCart size={25} strokeWidth={1.5} />
              <span>Agrega productos para comenzar.</span>
            </div>
          ) : (
            <div className="cart-items">
              {cart.map((item) => (
                <div className="cart-item" key={item.id}>
                  <div className="cart-item-copy">
                    <strong>{item.name}</strong>
                    <span>{formatCurrency(item.price * item.quantity)}</span>
                  </div>
                  <div className="quantity-control" aria-label={`Cantidad de ${item.name}`}>
                    <button type="button" aria-label={`Quitar una unidad de ${item.name}`} onClick={() => changeQuantity(item.id, -1)}>
                      <Minus size={14} />
                    </button>
                    <span>{item.quantity}</span>
                    <button type="button" aria-label={`Agregar una unidad de ${item.name}`} onClick={() => changeQuantity(item.id, 1)}>
                      <Plus size={14} />
                    </button>
                  </div>
                </div>
              ))}
              <button className="clear-cart" type="button" onClick={() => setCart([])}>
                <Trash2 size={14} /> Vaciar carrito
              </button>
            </div>
          )}
          <div className="cart-total">
            <span>Total</span>
            <strong>{formatCurrency(total)}</strong>
          </div>
          <button
            className="button primary checkout-button"
            type="button"
            disabled={!activeBox || cart.length === 0}
            onClick={finalizeSale}
          >
            <Check size={17} /> Facturar venta
          </button>
          {!activeBox && <p className="checkout-hint">La caja debe estar abierta para facturar.</p>}
          {feedback && <p className="feedback-message" role="status">{feedback}</p>}
          {lastSale && (
            <div className="ticket-ready">
              <div className="ticket-ready-heading">
                <span className="ticket-icon"><Check size={17} /></span>
                <div>
                  <strong>Ticket listo</strong>
                  <span>{formatDateTime(lastSale.soldAt)}</span>
                </div>
              </div>
              <div className="ticket-actions">
                <button className="button secondary" type="button" onClick={downloadTicket}>
                  <Download size={16} /> Descargar .txt
                </button>
              </div>
              {ticketFeedback && <p className="feedback-message" role="status">{ticketFeedback}</p>}
            </div>
          )}
        </aside>
      </div>
    </section>
  )
}

export default CashierView