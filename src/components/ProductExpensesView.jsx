import { useEffect, useRef, useState } from 'react'
import { ArrowLeft, CalendarDays, CircleDollarSign, PackagePlus, Plus, Trash2 } from 'lucide-react'
import { formatCurrency, formatDate } from '../utils/formatters.js'

const categories = [
  'Aderezos',
  'Verduras',
  'Carnes',
  'Lácteos',
  'Panificados',
  'Bebidas',
  'Otros',
]

const units = [
  { value: 'kg', label: 'kg' },
  { value: 'g', label: 'g' },
  { value: 'litro', label: 'litro' },
  { value: 'ml', label: 'ml' },
  { value: 'unidad', label: 'unidad' },
  { value: 'paquete', label: 'paquete' },
]

function getTodayLocalDate() {
  const today = new Date()
  const year = today.getFullYear()
  const month = `${today.getMonth() + 1}`.padStart(2, '0')
  const day = `${today.getDate()}`.padStart(2, '0')
  return `${year}-${month}-${day}`
}

function getPurchaseItems(purchase) {
  if (Array.isArray(purchase.items)) return purchase.items

  return [{
    id: `legacy-${purchase.id}`,
    name: purchase.name,
    category: purchase.category,
    amount: purchase.amount,
    quantity: null,
    unit: null,
  }]
}

function getPurchaseTotal(purchase) {
  return getPurchaseItems(purchase).reduce((total, item) => total + item.amount, 0)
}

function ProductExpensesView({ purchases, onAddPurchase, onDeletePurchase, onBack }) {
  const [items, setItems] = useState([
    { id: 0, name: '', category: categories[0], amount: '', quantity: '', unit: 'kg' },
  ])
  const [nextItemId, setNextItemId] = useState(1)
  const [purchaseDate, setPurchaseDate] = useState(getTodayLocalDate)
  const [feedback, setFeedback] = useState('')
  const itemsListRef = useRef(null)
  const totalSpent = purchases.reduce((total, purchase) => total + getPurchaseTotal(purchase), 0)
  const orderedPurchases = [...purchases].sort((first, second) => (
    new Date(second.purchasedAt).getTime() - new Date(first.purchasedAt).getTime()
  ))

  useEffect(() => {
    const list = itemsListRef.current
    if (!list) return

    list.scrollTo({ top: list.scrollHeight, behavior: 'smooth' })
  }, [items.length])

  const updateItem = (itemId, field, value) => {
    setItems((current) => current.map((item) => (
      item.id === itemId ? { ...item, [field]: value } : item
    )))
  }

  const addItem = () => {
    setItems((current) => [
      ...current,
      { id: nextItemId, name: '', category: categories[0], amount: '', quantity: '', unit: 'kg' },
    ])
    setNextItemId((current) => current + 1)
  }

  const removeItem = (itemId) => {
    setItems((current) => current.length > 1
      ? current.filter((item) => item.id !== itemId)
      : current)
  }

  const deletePurchase = (purchase) => {
    const itemCount = getPurchaseItems(purchase).length
    const confirmed = window.confirm(
      `¿Deseas eliminar esta compra de ${itemCount} ${itemCount === 1 ? 'insumo' : 'insumos'} por ${formatCurrency(getPurchaseTotal(purchase))}? Esta acción no se puede deshacer.`,
    )

    if (confirmed) onDeletePurchase(purchase.id)
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    const purchaseItems = items.map((item) => ({
      name: item.name.trim(),
      category: item.category,
      amount: Number(item.amount),
      quantity: Number(item.quantity),
      unit: item.unit,
    }))

    if (purchaseItems.some((item) => (
      !item.name || !Number.isFinite(item.amount) || item.amount <= 0
      || !Number.isFinite(item.quantity) || item.quantity <= 0 || !item.unit
    )) || !purchaseDate) {
      setFeedback('Completa cada insumo con cantidad, unidad e importe total mayor a cero.')
      return
    }

    onAddPurchase({
      items: purchaseItems,
      purchasedAt: new Date(`${purchaseDate}T12:00:00`).toISOString(),
    })
    setItems([{ id: nextItemId, name: '', category: categories[0], amount: '', quantity: '', unit: 'kg' }])
    setNextItemId((current) => current + 1)
    setFeedback('Compra registrada en una tarjeta.')
  }

  return (
    <section className="work-section">
      <button className="back-button" type="button" onClick={onBack}>
        <ArrowLeft size={17} /> Volver al inicio
      </button>

      <div className="work-heading">
        <div>
          <p className="eyebrow">COMPRAS</p>
          <h1>Gastos de productos</h1>
          <p className="work-subtitle">Registra lo que gastas en los insumos del negocio.</p>
        </div>
        <div className="cash-total-summary expense-summary">
          <span>Gasto acumulado</span>
          <strong>{formatCurrency(totalSpent)}</strong>
        </div>
      </div>

      <div className="expense-layout">
        <form className="expense-form" onSubmit={handleSubmit}>
          <div className="panel-heading expense-form-heading">
            <div>
              <p className="eyebrow">NUEVO REGISTRO</p>
              <h2>Compra de insumos</h2>
            </div>
            <span className="expense-form-icon"><PackagePlus size={20} /></span>
          </div>

          <div className="expense-items-list" ref={itemsListRef}>
            {items.map((item, index) => (
              <fieldset className="expense-item-fields" key={item.id}>
                <legend>Producto {index + 1}</legend>
                {items.length > 1 && (
                  <button
                    className="remove-expense-item"
                    type="button"
                    aria-label={`Quitar producto ${index + 1}`}
                    onClick={() => removeItem(item.id)}
                  >
                    <Trash2 size={15} />
                  </button>
                )}
                <label className="expense-field">
                  <span>Nombre del insumo</span>
                  <input
                    autoComplete="off"
                    maxLength={80}
                    onChange={(event) => updateItem(item.id, 'name', event.target.value)}
                    placeholder="Ej. Tomates"
                    required
                    value={item.name}
                  />
                </label>
                <div className="expense-form-row">
                  <label className="expense-field">
                    <span>Categoría</span>
                    <select value={item.category} onChange={(event) => updateItem(item.id, 'category', event.target.value)}>
                      {categories.map((option) => <option key={option}>{option}</option>)}
                    </select>
                  </label>
                  <label className="expense-field">
                    <span>Importe</span>
                    <span className="amount-input-wrap">
                      <span>$</span>
                      <input
                        inputMode="decimal"
                        min="1"
                        onChange={(event) => updateItem(item.id, 'amount', event.target.value)}
                        placeholder="0"
                        required
                        step="1"
                        type="number"
                        value={item.amount}
                      />
                    </span>
                  </label>
                </div>
                <div className="expense-form-row">
                  <label className="expense-field">
                    <span>Cantidad comprada</span>
                    <input
                      inputMode="decimal"
                      min="0.001"
                      onChange={(event) => updateItem(item.id, 'quantity', event.target.value)}
                      placeholder="Ej. 2"
                      required
                      step="any"
                      type="number"
                      value={item.quantity}
                    />
                  </label>
                  <label className="expense-field">
                    <span>Unidad</span>
                    <select value={item.unit} onChange={(event) => updateItem(item.id, 'unit', event.target.value)}>
                      {units.map((unit) => <option key={unit.value} value={unit.value}>{unit.label}</option>)}
                    </select>
                  </label>
                </div>
              </fieldset>
            ))}
          </div>

          <button className="add-expense-item" type="button" onClick={addItem}>
            <Plus size={16} /> Agregar otro producto
          </button>

          <label className="expense-field">
            <span>Fecha de compra</span>
            <span className="date-input-wrap">
              <CalendarDays size={16} />
              <input
                onChange={(event) => setPurchaseDate(event.target.value)}
                required
                type="date"
                value={purchaseDate}
              />
            </span>
          </label>

          <button className="button primary expense-submit" type="submit">
            <CircleDollarSign size={17} /> Registrar gasto
          </button>
          {feedback && <p className="feedback-message" role="status">{feedback}</p>}
        </form>

        <section className="expense-history" aria-labelledby="expense-history-title">
          <div className="panel-heading expense-history-heading">
            <div>
              <p className="eyebrow">HISTORIAL</p>
              <h2 id="expense-history-title">Compras registradas</h2>
            </div>
            <span className="expense-count">{purchases.length}</span>
          </div>

          {orderedPurchases.length === 0 ? (
            <div className="expense-empty">
              <span className="empty-icon"><PackagePlus size={24} /></span>
              <h3>Aún no hay compras registradas</h3>
              <p>Al guardar una compra, aparecerá aquí como una tarjeta.</p>
            </div>
          ) : (
            <div className="expense-card-list">
              {orderedPurchases.map((purchase) => (
                <article className="expense-card" key={purchase.id}>
                  <div className="expense-card-topline">
                    <span className="expense-category">Compra · {getPurchaseItems(purchase).length} {getPurchaseItems(purchase).length === 1 ? 'producto' : 'productos'}</span>
                    <div className="expense-card-actions">
                      <span className="expense-date">{formatDate(purchase.purchasedAt)}</span>
                      <button
                        className="expense-card-delete"
                        type="button"
                        aria-label={`Eliminar compra del ${formatDate(purchase.purchasedAt)}`}
                        onClick={() => deletePurchase(purchase)}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                  <div className="expense-purchase-items">
                    {getPurchaseItems(purchase).map((item, index) => (
                      <div className="expense-purchase-item" key={item.id ?? `${purchase.id}-${index}`}>
                        <div>
                          <strong>{item.name}</strong>
                          <span>
                            {item.category}
                            {item.quantity && item.unit ? ` · ${item.quantity} ${item.unit}` : ' · cantidad no registrada'}
                          </span>
                        </div>
                        <strong>{formatCurrency(item.amount)}</strong>
                      </div>
                    ))}
                  </div>
                  <div className="expense-card-total">
                    <span>Total de la compra</span>
                    <strong>{formatCurrency(getPurchaseTotal(purchase))}</strong>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </section>
  )
}

export default ProductExpensesView