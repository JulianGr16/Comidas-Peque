import { useState } from 'react'
import {
  ArrowLeft,
  Check,
  Clock3,
  CircleDollarSign,
  Download,
  LockKeyhole,
  Minus,
  Pencil,
  Plus,
  ShoppingCart,
  Trash2,
  UnlockKeyhole,
} from 'lucide-react'
import { formatCurrency, formatDateTime } from '../utils/formatters.js'
import { cashMenuCategories } from '../utils/cashMenu.js'
import { getIngredientOptions, getRecipeUnitCost } from '../utils/productCosting.js'
import { downloadSaleTicket } from '../utils/salesTicket.js'

function CashierView({
  activeBox,
  menuProducts,
  productPurchases,
  onBack,
  onOpenBox,
  onCloseBox,
  onRegisterSale,
  onRegisterCashExpense,
  onAddMenuProduct,
  onUpdateMenuProduct,
}) {
  const [selectedCategory, setSelectedCategory] = useState(cashMenuCategories[0])
  const [cart, setCart] = useState([])
  const [feedback, setFeedback] = useState('')
  const [lastSale, setLastSale] = useState(null)
  const [ticketFeedback, setTicketFeedback] = useState('')
  const [cashExpenseConcept, setCashExpenseConcept] = useState('')
  const [cashExpenseAmount, setCashExpenseAmount] = useState('')
  const [cashExpenseFeedback, setCashExpenseFeedback] = useState('')
  const [isMenuEditing, setIsMenuEditing] = useState(false)
  const [selectedMenuProduct, setSelectedMenuProduct] = useState('new')
  const [menuProductName, setMenuProductName] = useState('')
  const [menuProductPrice, setMenuProductPrice] = useState('')
  const [recipeItems, setRecipeItems] = useState([])
  const [nextRecipeItemId, setNextRecipeItemId] = useState(1)
  const [menuFeedback, setMenuFeedback] = useState('')
  const ingredientOptions = getIngredientOptions(productPurchases)
  const categoryProducts = menuProducts.filter((product) => product.category === selectedCategory)
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0)
  const boxExpenses = activeBox?.expenses ?? []
  const boxExpenseTotal = boxExpenses.reduce((sum, expense) => sum + expense.amount, 0)

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

  const selectMenuProduct = (productId) => {
    setSelectedMenuProduct(productId)
    setMenuFeedback('')

    const product = menuProducts.find((item) => item.id === productId)
    setMenuProductName(product?.name ?? '')
    setMenuProductPrice(product ? `${product.price}` : '')
    setRecipeItems((product?.recipe ?? []).map((item, index) => ({ ...item, id: index })))
    setNextRecipeItemId((product?.recipe?.length ?? 0) + 1)
    if (product) setSelectedCategory(product.category)
  }

  const updateRecipeItem = (itemId, field, value) => {
    setRecipeItems((current) => current.map((item) => (
      item.id === itemId ? { ...item, [field]: value } : item
    )))
  }

  const addRecipeItem = () => {
    setRecipeItems((current) => [
      ...current,
      { id: nextRecipeItemId, name: '', quantity: '', unit: 'kg' },
    ])
    setNextRecipeItemId((current) => current + 1)
  }

  const removeRecipeItem = (itemId) => {
    setRecipeItems((current) => current.filter((item) => item.id !== itemId))
  }

  const saveMenuProduct = (event) => {
    event.preventDefault()
    const name = menuProductName.trim()
    const price = Number(menuProductPrice)

    if (!name || !Number.isFinite(price) || price <= 0) {
      setMenuFeedback('Ingresa un nombre y un precio mayor a cero.')
      return
    }

    const recipe = recipeItems.map((item) => ({
      name: item.name.trim(),
      quantity: Number(item.quantity),
      unit: item.unit,
    }))
    if (recipe.some((item) => !item.name || !Number.isFinite(item.quantity) || item.quantity <= 0)) {
      setMenuFeedback('Completa el insumo, la cantidad y la unidad de cada línea de receta.')
      return
    }

    if (selectedMenuProduct === 'new') {
      const product = onAddMenuProduct({ name, price, category: 'Comidas varias', recipe })
      setSelectedCategory(product.category)
      setMenuFeedback('Producto agregado a Comidas varias.')
    } else {
      onUpdateMenuProduct(selectedMenuProduct, { name, price, recipe })
      setMenuFeedback('Producto actualizado.')
    }

    setSelectedMenuProduct('new')
    setMenuProductName('')
    setMenuProductPrice('')
    setRecipeItems([])
    setNextRecipeItemId(1)
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

  const addCashExpense = (event) => {
    event.preventDefault()
    const amount = Number(cashExpenseAmount)
    if (!activeBox || !cashExpenseConcept.trim() || !Number.isFinite(amount) || amount <= 0) {
      setCashExpenseFeedback('Ingresa un concepto y un importe mayor a cero con la caja abierta.')
      return
    }

    if (!onRegisterCashExpense(cashExpenseConcept, amount)) {
      setCashExpenseFeedback('No se pudo registrar el retiro. Verifica que la caja siga abierta.')
      return
    }

    setCashExpenseConcept('')
    setCashExpenseAmount('')
    setCashExpenseFeedback('Gasto registrado en este turno.')
  }

  const closeBox = () => {
    if (itemCount > 0) {
      setFeedback('Registra o vacía el carrito antes de cerrar la caja.')
      return
    }

    const confirmed = window.confirm('¿Deseas cerrar la caja? Se registrará la fecha y hora de cierre.')
    if (!confirmed) return

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

      <section className="cash-expenses-panel" aria-labelledby="cash-expenses-title">
        <div className="cash-expenses-heading">
          <div>
            <p className="eyebrow">RETIROS DEL TURNO</p>
            <h2 id="cash-expenses-title">Gastos varios</h2>
          </div>
          <div className="cash-expense-total">
            <span>Total retirado</span>
            <strong>{formatCurrency(boxExpenseTotal)}</strong>
          </div>
        </div>

        <form className="cash-expense-form" onSubmit={addCashExpense}>
          <label className="expense-field">
            <span>Concepto</span>
            <input
              autoComplete="off"
              maxLength={100}
              onChange={(event) => setCashExpenseConcept(event.target.value)}
              placeholder="Ej. Compra de hielo"
              required
              value={cashExpenseConcept}
            />
          </label>
          <label className="expense-field">
            <span>Importe retirado</span>
            <span className="amount-input-wrap">
              <span>$</span>
              <input
                inputMode="decimal"
                min="1"
                onChange={(event) => setCashExpenseAmount(event.target.value)}
                placeholder="0"
                required
                step="1"
                type="number"
                value={cashExpenseAmount}
              />
            </span>
          </label>
          <button className="button secondary cash-expense-submit" type="submit" disabled={!activeBox}>
            <CircleDollarSign size={16} /> Registrar retiro
          </button>
        </form>
        {!activeBox && <p className="checkout-hint">Abre la caja para registrar un gasto del turno.</p>}
        {cashExpenseFeedback && <p className="feedback-message" role="status">{cashExpenseFeedback}</p>}

        {boxExpenses.length > 0 && (
          <div className="cash-expense-list">
            {boxExpenses.map((expense) => (
              <div className="cash-expense-row" key={expense.id}>
                <div>
                  <strong>{expense.concept}</strong>
                  <span>{formatDateTime(expense.recordedAt)}</span>
                </div>
                <strong>{formatCurrency(expense.amount)}</strong>
              </div>
            ))}
          </div>
        )}
      </section>

      <div className="sales-layout">
        <section className="menu-panel" aria-labelledby="menu-title">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">MENÚ</p>
              <h2 id="menu-title">Productos</h2>
            </div>
            <button
              className={`button ${isMenuEditing ? 'secondary' : 'menu-edit-toggle'}`}
              type="button"
              onClick={() => {
                setIsMenuEditing((current) => !current)
                selectMenuProduct('new')
              }}
            >
              {isMenuEditing ? <Check size={15} /> : <Pencil size={15} />}
              {isMenuEditing ? 'Listo' : 'Editar menú'}
            </button>
          </div>

          {isMenuEditing && (
            <form className="menu-editor" onSubmit={saveMenuProduct}>
              <p className="eyebrow">EDITAR CATÁLOGO</p>
              <label className="expense-field">
                <span>Producto</span>
                <select value={selectedMenuProduct} onChange={(event) => selectMenuProduct(event.target.value)}>
                  <option value="new">Nuevo producto · Comidas varias</option>
                  {menuProducts.map((product) => (
                    <option key={product.id} value={product.id}>{product.name} · {product.category}</option>
                  ))}
                </select>
              </label>
              <div className="menu-editor-fields">
                <label className="expense-field">
                  <span>Nombre</span>
                  <input
                    autoComplete="off"
                    maxLength={80}
                    onChange={(event) => setMenuProductName(event.target.value)}
                    placeholder="Nombre del producto"
                    required
                    value={menuProductName}
                  />
                </label>
                <label className="expense-field">
                  <span>Precio</span>
                  <span className="amount-input-wrap">
                    <span>$</span>
                    <input
                      inputMode="decimal"
                      min="1"
                      onChange={(event) => setMenuProductPrice(event.target.value)}
                      placeholder="0"
                      required
                      step="1"
                      type="number"
                      value={menuProductPrice}
                    />
                  </span>
                </label>
              </div>
              <div className="recipe-editor">
                <div className="recipe-editor-heading">
                  <div>
                    <strong>Receta por porción</strong>
                    <span>Los costos salen de Gastos de productos.</span>
                  </div>
                  <button className="add-recipe-item" type="button" onClick={addRecipeItem}>
                    <Plus size={15} /> Insumo
                  </button>
                </div>
                {recipeItems.length === 0 && (
                  <p className="recipe-empty">Agrega los insumos usados para calcular la ganancia.</p>
                )}
                {ingredientOptions.length === 0 && recipeItems.length > 0 && (
                  <p className="recipe-warning">Primero registra compras con cantidad y unidad en Gastos de productos.</p>
                )}
                {recipeItems.map((item, index) => (
                  <div className="recipe-row" key={item.id}>
                    <label className="expense-field">
                      <span>Insumo {index + 1}</span>
                      <select
                        value={item.name}
                        onChange={(event) => updateRecipeItem(item.id, 'name', event.target.value)}
                        required
                      >
                        <option value="">Elegir insumo</option>
                        {ingredientOptions.map((ingredient) => (
                          <option key={ingredient.id} value={ingredient.name}>{ingredient.name}</option>
                        ))}
                      </select>
                    </label>
                    <label className="expense-field">
                      <span>Cantidad</span>
                      <input
                        inputMode="decimal"
                        min="0.001"
                        onChange={(event) => updateRecipeItem(item.id, 'quantity', event.target.value)}
                        placeholder="0"
                        required
                        step="any"
                        type="number"
                        value={item.quantity}
                      />
                    </label>
                    <label className="expense-field">
                      <span>Unidad</span>
                      <select value={item.unit} onChange={(event) => updateRecipeItem(item.id, 'unit', event.target.value)}>
                        <option value="kg">kg</option>
                        <option value="g">g</option>
                        <option value="litro">litro</option>
                        <option value="ml">ml</option>
                        <option value="unidad">unidad</option>
                        <option value="paquete">paquete</option>
                      </select>
                    </label>
                    <button
                      className="remove-recipe-item"
                      type="button"
                      aria-label={`Quitar insumo ${index + 1}`}
                      onClick={() => removeRecipeItem(item.id)}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
                {selectedMenuProduct !== 'new' && (() => {
                  const product = menuProducts.find((item) => item.id === selectedMenuProduct)
                  const costing = product ? getRecipeUnitCost({ ...product, recipe }, productPurchases) : null
                  if (!costing) return null
                  return costing.complete
                    ? <p className="recipe-cost">Costo estimado por porción: <strong>{formatCurrency(costing.cost)}</strong></p>
                    : <p className="recipe-warning">Costo incompleto: falta registrar cantidad/unidad comprada de {costing.missingIngredients.join(', ')}.</p>
                })()}
              </div>
              <button className="button primary menu-editor-submit" type="submit">
                {selectedMenuProduct === 'new' ? <Plus size={15} /> : <Check size={15} />}
                {selectedMenuProduct === 'new' ? 'Agregar a Comidas varias' : 'Guardar cambios'}
              </button>
              {menuFeedback && <p className="feedback-message" role="status">{menuFeedback}</p>}
            </form>
          )}

          <div className="category-list" role="tablist" aria-label="Categorías del menú">
            {cashMenuCategories.map((categoryName) => (
              <button
                className={`category-tab ${selectedCategory === categoryName ? 'selected' : ''}`}
                key={categoryName}
                type="button"
                role="tab"
                aria-selected={selectedCategory === categoryName}
                onClick={() => setSelectedCategory(categoryName)}
              >
                {categoryName}
              </button>
            ))}
          </div>
          <div className="product-grid" role="tabpanel">
            {categoryProducts.map((product) => (
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
            {categoryProducts.length === 0 && (
              <p className="menu-empty">Todavía no hay productos en esta categoría.</p>
            )}
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