import { ArrowLeft, Check, HandCoins } from 'lucide-react'
import { formatCurrency, formatDateTime } from '../utils/formatters.js'

function CurrentAccountView({ cashBoxes, onBack, onMarkPaid }) {
  const accountSales = cashBoxes
    .flatMap((cashBox) => (cashBox.sales ?? [])
      .filter((sale) => sale.paymentMethod === 'cuenta-corriente' && !sale.accountPaidAt)
      .map((sale) => ({ ...sale, cashBoxId: cashBox.id })))
    .sort((first, second) => new Date(second.soldAt) - new Date(first.soldAt))

  return (
    <section className="work-section">
      <button className="back-button" type="button" onClick={onBack}>
        <ArrowLeft size={17} /> Volver al inicio
      </button>
      <div className="work-heading">
        <div>
          <p className="eyebrow">CLIENTES</p>
          <h1>Cuenta corriente</h1>
          <p className="work-subtitle">Fiados cargados desde la caja registradora.</p>
        </div>
      </div>
      <div className="account-records">
        {accountSales.length === 0 ? (
          <div className="account-empty">
            <HandCoins size={28} />
            <p>Todavía no hay fiados registrados.</p>
          </div>
        ) : accountSales.map((sale) => {
          const total = sale.items.reduce((sum, item) => sum + item.price * item.quantity, 0)
          const items = sale.items.map((item) => `${item.quantity} × ${item.name}`).join(', ')
          return (
            <article className="account-record" key={sale.id}>
              <div className="account-record-heading">
                <div>
                  <strong>{sale.customer?.fullName || 'Cliente sin nombre'}</strong>
                  <span>Fiado del {formatDateTime(sale.soldAt)}</span>
                </div>
                <strong>{formatCurrency(total)}</strong>
              </div>
              <div className="account-customer-details">
                <span>DNI: {sale.customer?.dni || 'Sin dato'}</span>
                <span>Celular: {sale.customer?.phone || 'Sin dato'}</span>
              </div>
              <p>{items}</p>
              <button
                className="button secondary account-paid-button"
                type="button"
                onClick={() => {
                  const confirmed = window.confirm(`¿Marcar como pagado el fiado de ${sale.customer?.fullName || 'este cliente'}? Se quitará de Cuenta corriente y quedará en el historial de caja.`)
                  if (confirmed) onMarkPaid(sale.cashBoxId, sale.id)
                }}
              >
                <Check size={15} /> Marcar pagado y quitar
              </button>
            </article>
          )
        })}
      </div>
    </section>
  )
}

export default CurrentAccountView
