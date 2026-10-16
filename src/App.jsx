import { useEffect, useState } from 'react'
import './App.css'
import {
  ArrowUpRight,
  ChartNoAxesColumnIncreasing,
  CookingPot,
  CreditCard,
  ReceiptText,
  WalletCards,
} from 'lucide-react'
import CashDetailsView from './components/CashDetailsView.jsx'
import CashierView from './components/CashierView.jsx'
import ProductExpensesView from './components/ProductExpensesView.jsx'
import SalesStatisticsView from './components/SalesStatisticsView.jsx'
import {
  loadCashBoxes,
  loadProductPurchases,
  saveCashBoxes,
  saveProductPurchases,
} from './utils/cashBoxStorage.js'

const modules = [
  {
    number: '01',
    title: 'Caja registradora',
    description: 'Registra las ventas y lleva el control de cada jornada.',
    category: 'VENTAS',
    icon: CreditCard,
    color: 'tomato',
    view: 'cashier',
  },
  {
    number: '02',
    title: 'Gastos de productos',
    description: 'Anota compras e insumos para tener tus costos al día.',
    category: 'PRODUCTOS',
    icon: ReceiptText,
    color: 'leaf',
    view: 'expenses',
  },
  {
    number: '03',
    title: 'Estadísticas de ventas',
    description: 'Consulta el rendimiento de tu negocio de un vistazo.',
    category: 'ANÁLISIS',
    icon: ChartNoAxesColumnIncreasing,
    color: 'blue',
    view: 'stats',
  },
  {
    number: '04',
    title: 'Detalle de cajas',
    description: 'Revisa aperturas, cierres y movimientos de caja.',
    category: 'CONTROL',
    icon: WalletCards,
    color: 'gold',
    view: 'details',
  },
]

function getPageFromHash() {
  const page = window.location.hash.slice(1)
  return page === 'cashier' || page === 'details' || page === 'stats' || page === 'expenses'
    ? page
    : 'home'
}

function App() {
  const [page, setPage] = useState(getPageFromHash)
  const [cashBoxes, setCashBoxes] = useState([])
  const [productPurchases, setProductPurchases] = useState([])
  const [storageStatus, setStorageStatus] = useState('loading')

  useEffect(() => {
    const syncPageWithHash = () => setPage(getPageFromHash())
    window.addEventListener('hashchange', syncPageWithHash)
    return () => window.removeEventListener('hashchange', syncPageWithHash)
  }, [])

  useEffect(() => {
    let cancelled = false

    Promise.all([loadCashBoxes(), loadProductPurchases()])
      .then(([storedCashBoxes, storedPurchases]) => {
        if (cancelled) return
        setCashBoxes(storedCashBoxes)
        setProductPurchases(storedPurchases)
        setStorageStatus('ready')
      })
      .catch(() => {
        if (!cancelled) setStorageStatus('error')
      })

    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (storageStatus !== 'ready') return

    saveCashBoxes(cashBoxes).catch(() => setStorageStatus('error'))
  }, [cashBoxes, storageStatus])

  useEffect(() => {
    if (storageStatus !== 'ready') return

    saveProductPurchases(productPurchases).catch(() => setStorageStatus('error'))
  }, [productPurchases, storageStatus])

  const activeBox = cashBoxes.find((cashBox) => !cashBox.closedAt) ?? null

  const navigateTo = (nextPage) => {
    const nextHash = nextPage === 'home' ? '' : `#${nextPage}`
    if (window.location.hash === nextHash) {
      setPage(nextPage)
      return
    }
    window.location.hash = nextHash
  }

  const openCashBox = () => {
    if (activeBox) return

    setCashBoxes((current) => [{
      id: `${Date.now()}`,
      openedAt: new Date().toISOString(),
      closedAt: null,
      sales: [],
      expenses: [],
    }, ...current])
  }

  const closeCashBox = () => {
    if (!activeBox) return

    const closedAt = new Date().toISOString()
    setCashBoxes((current) => current.map((cashBox) => (
      cashBox.id === activeBox.id ? { ...cashBox, closedAt } : cashBox
    )))
  }

  const registerSale = (items) => {
    if (!activeBox || items.length === 0) return false

    const sale = {
      id: `${Date.now()}`,
      soldAt: new Date().toISOString(),
      items: items.map(({ id, name, price, quantity }) => ({ id, name, price, quantity })),
    }

    setCashBoxes((current) => current.map((cashBox) => (
      cashBox.id === activeBox.id
        ? { ...cashBox, sales: [...cashBox.sales, sale] }
        : cashBox
    )))

    return sale
  }

  const registerCashExpense = (concept, amount) => {
    const cleanConcept = concept.trim()
    if (!activeBox || !cleanConcept || !Number.isFinite(amount) || amount <= 0) return false

    const expense = {
      id: `${Date.now()}`,
      concept: cleanConcept,
      amount,
      recordedAt: new Date().toISOString(),
    }

    setCashBoxes((current) => current.map((cashBox) => (
      cashBox.id === activeBox.id
        ? { ...cashBox, expenses: [...(cashBox.expenses ?? []), expense] }
        : cashBox
    )))

    return expense
  }

  const deleteCashBox = (cashBoxId) => {
    setCashBoxes((current) => current.filter((cashBox) => cashBox.id !== cashBoxId))
  }

  const addProductPurchase = (purchaseDetails) => {
    const purchase = {
      ...purchaseDetails,
      id: `${Date.now()}`,
      createdAt: new Date().toISOString(),
    }

    setProductPurchases((current) => [purchase, ...current])
  }

  const deleteProductPurchase = (purchaseId) => {
    setProductPurchases((current) => current.filter((purchase) => purchase.id !== purchaseId))
  }

  if (storageStatus !== 'ready') {
    return (
      <main className="dashboard">
        <div className={`storage-state ${storageStatus}`} role={storageStatus === 'error' ? 'alert' : 'status'}>
          {storageStatus === 'loading'
            ? 'Preparando el almacenamiento local…'
            : 'No se pudo abrir IndexedDB. Revisa la configuración de almacenamiento del navegador.'}
        </div>
      </main>
    )
  }

  return (
    <main className="dashboard">
      <header className="topbar">
        <button className="brand" type="button" onClick={() => navigateTo('home')} aria-label="Volver al inicio">
          <span className="brand-mark"><CookingPot size={21} strokeWidth={2} /></span>
          <span>Comidas<span className="brand-accent">Peque</span></span>
        </button>
        <div className="topbar-status">
          <span className={`status-dot ${activeBox ? 'is-open' : ''}`} />
          {activeBox ? 'Caja abierta' : 'Caja cerrada'}
        </div>
      </header>

      {page === 'home' && (
        <>
          <section className="welcome" id="inicio" aria-labelledby="welcome-title">
            <div className="welcome-copy">
              <p className="eyebrow">TU ESPACIO DE TRABAJO</p>
              <h1 id="welcome-title">Todo empieza<br />por aquí<span>.</span></h1>
              <p className="welcome-description">Organiza las tareas de tu negocio desde un solo lugar.</p>
            </div>
            <div className="welcome-illustration" aria-hidden="true">
              <div className="illustration-disc"><CookingPot size={94} strokeWidth={1.15} /></div>
              <span className="illustration-spark spark-one">✳</span>
              <span className="illustration-spark spark-two">✳</span>
            </div>
          </section>

          <section className="modules-section" aria-labelledby="modules-title">
            <div className="section-heading">
              <div>
                <p className="eyebrow">OPERACIÓN</p>
                <h2 id="modules-title">Tus módulos</h2>
              </div>
              <span className="module-count">04 ÁREAS</span>
            </div>

            <div className="module-grid">
              {modules.map(({ number, title, description, category, icon: Icon, color, view }) => (
                <button
                  className={`module-card ${color} ${view ? 'is-available' : 'is-coming'}`}
                  key={number}
                  type="button"
                  disabled={!view}
                  onClick={() => view && navigateTo(view)}
                >
                  <span className="card-topline">
                    <span className="module-icon"><Icon size={22} strokeWidth={1.8} /></span>
                    <span className="module-number">{number}</span>
                  </span>
                  <span className="card-copy">
                    <span className="module-category">{category}</span>
                    <span className="module-title">{title}</span>
                    <span className="module-description">{description}</span>
                  </span>
                  {view && <ArrowUpRight className="card-arrow" size={20} strokeWidth={1.8} aria-hidden="true" />}
                </button>
              ))}
            </div>
          </section>
        </>
      )}

      {page === 'cashier' && (
        <CashierView
          activeBox={activeBox}
          onBack={() => navigateTo('home')}
          onOpenBox={openCashBox}
          onCloseBox={closeCashBox}
          onRegisterSale={registerSale}
          onRegisterCashExpense={registerCashExpense}
        />
      )}

      {page === 'details' && (
        <CashDetailsView
          cashBoxes={cashBoxes}
          onBack={() => navigateTo('home')}
          onDeleteCashBox={deleteCashBox}
        />
      )}

      {page === 'stats' && (
        <SalesStatisticsView cashBoxes={cashBoxes} onBack={() => navigateTo('home')} />
      )}

      {page === 'expenses' && (
        <ProductExpensesView
          purchases={productPurchases}
          onAddPurchase={addProductPurchase}
          onDeletePurchase={deleteProductPurchase}
          onBack={() => navigateTo('home')}
        />
      )}

      {page === 'home' && (
        <footer className="dashboard-footer">
          <span>ComidasPeque</span>
          <span>Gestión sencilla, cada día.</span>
        </footer>
      )}
    </main>
  )
}

export default App
