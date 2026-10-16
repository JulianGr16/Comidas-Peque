import { useState } from 'react'
import { ArrowLeft, ChartNoAxesColumnIncreasing, TrendingUp } from 'lucide-react'
import { formatCurrency, formatDate } from '../utils/formatters.js'

function getPeriodStart(date, period) {
  if (period === 'week') {
    const start = new Date(date.getFullYear(), date.getMonth(), date.getDate())
    start.setDate(start.getDate() - ((start.getDay() + 6) % 7))
    return start
  }

  if (period === 'month') return new Date(date.getFullYear(), date.getMonth(), 1)
  return new Date(date.getFullYear(), 0, 1)
}

function getRevenueInPeriod(sales, start, end) {
  return sales.reduce((total, sale) => {
    const soldAt = new Date(sale.soldAt)
    if (soldAt < start || soldAt > end) return total

    return total + sale.items.reduce((saleTotal, item) => (
      saleTotal + item.price * item.quantity
    ), 0)
  }, 0)
}

function getProductRanking(sales) {
  const products = new Map()

  sales.forEach((sale) => {
    sale.items.forEach((item) => {
      const productId = item.id ?? item.name
      const product = products.get(productId) ?? {
        id: productId,
        name: item.name,
        quantity: 0,
        revenue: 0,
      }

      product.quantity += item.quantity
      product.revenue += item.price * item.quantity
      products.set(productId, product)
    })
  })

  return [...products.values()]
    .sort((first, second) => second.quantity - first.quantity || second.revenue - first.revenue)
    .slice(0, 8)
}

function SalesStatisticsView({ cashBoxes, onBack }) {
  const [now] = useState(() => new Date())
  const allSales = cashBoxes.flatMap((cashBox) => cashBox.sales)
  const ranking = getProductRanking(allSales)
  const maxQuantity = ranking[0]?.quantity ?? 0
  const periods = [
    {
      id: 'week',
      label: 'Semana actual',
      range: `Desde ${formatDate(getPeriodStart(now, 'week'), { day: 'numeric', month: 'short' })}`,
    },
    {
      id: 'month',
      label: 'Mes actual',
      range: formatDate(now, { month: 'long', year: 'numeric' }),
    },
    {
      id: 'year',
      label: 'Año actual',
      range: `${now.getFullYear()}`,
    },
  ]

  return (
    <section className="work-section">
      <button className="back-button" type="button" onClick={onBack}>
        <ArrowLeft size={17} /> Volver al inicio
      </button>

      <div className="work-heading">
        <div>
          <p className="eyebrow">ANÁLISIS</p>
          <h1>Estadísticas de ventas</h1>
          <p className="work-subtitle">Productos más vendidos e ingresos de tu negocio.</p>
        </div>
        <span className="stats-period-note"><TrendingUp size={17} /> Datos de todos los turnos</span>
      </div>

      <div className="stats-period-grid">
        {periods.map((period) => (
          <article className="stats-period-card" key={period.id}>
            <span className="stats-period-label">{period.label}</span>
            <strong>{formatCurrency(getRevenueInPeriod(
              allSales,
              getPeriodStart(now, period.id),
              now,
            ))}</strong>
            <span className="stats-period-range">{period.range}</span>
          </article>
        ))}
      </div>

      <p className="stats-disclaimer">
        Son ingresos por ventas registradas; todavía no se descuentan los costos de productos.
      </p>

      <section className="stats-products-panel" aria-labelledby="top-products-title">
        <div className="panel-heading stats-products-heading">
          <div>
            <p className="eyebrow">RANKING HISTÓRICO</p>
            <h2 id="top-products-title">Productos más vendidos</h2>
          </div>
          <ChartNoAxesColumnIncreasing size={21} aria-hidden="true" />
        </div>

        {ranking.length === 0 ? (
          <div className="stats-empty">
            <span className="empty-icon"><ChartNoAxesColumnIncreasing size={24} /></span>
            <h3>Aún no hay ventas para analizar</h3>
            <p>Cuando registres ventas con la caja abierta, aparecerán aquí.</p>
          </div>
        ) : (
          <div className="product-ranking">
            {ranking.map((product, index) => (
              <article className="product-rank-row" key={product.id}>
                <span className="product-rank-number">{`${index + 1}`.padStart(2, '0')}</span>
                <div className="product-rank-main">
                  <div className="product-rank-heading">
                    <strong>{product.name}</strong>
                    <span>{product.quantity} {product.quantity === 1 ? 'unidad' : 'unidades'}</span>
                  </div>
                  <div
                    className="product-rank-track"
                    role="img"
                    aria-label={`${product.name}: ${product.quantity} ${product.quantity === 1 ? 'unidad vendida' : 'unidades vendidas'}`}
                  >
                    <span style={{ width: `${(product.quantity / maxQuantity) * 100}%` }} />
                  </div>
                </div>
                <strong className="product-rank-revenue">{formatCurrency(product.revenue)}</strong>
              </article>
            ))}
          </div>
        )}
      </section>
    </section>
  )
}

export default SalesStatisticsView