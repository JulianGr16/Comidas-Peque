import './App.css'
import {
  ArrowUpRight,
  ChartNoAxesColumnIncreasing,
  CookingPot,
  CreditCard,
  ReceiptText,
  WalletCards,
} from 'lucide-react'

const modules = [
  {
    number: '01',
    title: 'Caja registradora',
    description: 'Registra las ventas y lleva el control de cada jornada.',
    category: 'VENTAS',
    icon: CreditCard,
    color: 'tomato',
  },
  {
    number: '02',
    title: 'Gastos de productos',
    description: 'Anota compras e insumos para tener tus costos al día.',
    category: 'PRODUCTOS',
    icon: ReceiptText,
    color: 'leaf',
  },
  {
    number: '03',
    title: 'Estadísticas de ventas',
    description: 'Consulta el rendimiento de tu negocio de un vistazo.',
    category: 'ANÁLISIS',
    icon: ChartNoAxesColumnIncreasing,
    color: 'blue',
  },
  {
    number: '04',
    title: 'Detalle de cajas',
    description: 'Revisa aperturas, cierres y movimientos de caja.',
    category: 'CONTROL',
    icon: WalletCards,
    color: 'gold',
  },
]

function App() {
  return (
    <main className="dashboard">
      <header className="topbar">
        <a className="brand" href="#inicio" aria-label="ComidasPeque, inicio">
          <span className="brand-mark"><CookingPot size={21} strokeWidth={2} /></span>
          <span>Comidas<span className="brand-accent">Peque</span></span>
        </a>
        <div className="topbar-status"><span className="status-dot" /> Panel de gestión</div>
      </header>

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
          {modules.map(({ number, title, description, category, icon: Icon, color }) => (
            <article className={`module-card ${color}`} key={number}>
              <div className="card-topline">
                <span className="module-icon"><Icon size={22} strokeWidth={1.8} /></span>
                <span className="module-number">{number}</span>
              </div>
              <div className="card-copy">
                <p className="module-category">{category}</p>
                <h3>{title}</h3>
                <p className="module-description">{description}</p>
              </div>
              <ArrowUpRight className="card-arrow" size={20} strokeWidth={1.8} aria-hidden="true" />
            </article>
          ))}
        </div>
      </section>

      <footer className="dashboard-footer">
        <span>ComidasPeque</span>
        <span>Gestión sencilla, cada día.</span>
      </footer>
    </main>
  )
}

export default App
