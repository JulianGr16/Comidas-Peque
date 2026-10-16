import { useState } from 'react'
import { ArrowLeft, Clock3, FileDown, LockKeyhole, ReceiptText, Trash2, UnlockKeyhole, X } from 'lucide-react'
import { formatCurrency, formatDate, formatDateTime } from '../utils/formatters.js'
import { downloadCashBoxPdf } from '../utils/cashBoxPdf.js'

function getBoxTotal(cashBox) {
  return cashBox.sales.reduce((total, sale) => (
    total + sale.items.reduce((saleTotal, item) => saleTotal + item.price * item.quantity, 0)
  ), 0)
}

function getLocalDateKey(value) {
  const date = new Date(value)
  const year = date.getFullYear()
  const month = `${date.getMonth() + 1}`.padStart(2, '0')
  const day = `${date.getDate()}`.padStart(2, '0')
  return `${year}-${month}-${day}`
}

function CashDetailsView({ cashBoxes, onBack, onDeleteCashBox }) {
  const [selectedDate, setSelectedDate] = useState('')
  const orderedCashBoxes = [...cashBoxes].sort((first, second) => (
    new Date(second.openedAt).getTime() - new Date(first.openedAt).getTime()
  ))
  const visibleCashBoxes = selectedDate
    ? orderedCashBoxes.filter((cashBox) => getLocalDateKey(cashBox.openedAt) === selectedDate)
    : orderedCashBoxes
  const visibleTotal = visibleCashBoxes.reduce((sum, cashBox) => sum + getBoxTotal(cashBox), 0)

  const deleteCashBox = (cashBox) => {
    const confirmed = window.confirm(
      `¿Deseas borrar el registro del turno del ${formatDate(cashBox.openedAt)}?\n\nSe eliminarán de ComidasPeque el turno y sus ventas. Los PDF descargados no se borrarán de tu dispositivo. Esta acción no se puede deshacer.`,
    )

    if (confirmed) onDeleteCashBox(cashBox.id)
  }

  return (
    <section className="work-section">
      <button className="back-button" type="button" onClick={onBack}>
        <ArrowLeft size={17} /> Volver al inicio
      </button>
      <div className="work-heading">
        <div>
          <p className="eyebrow">CONTROL</p>
          <h1>Detalle de cajas</h1>
          <p className="work-subtitle">Aperturas, cierres y ventas registradas.</p>
        </div>
        <div className="cash-total-summary">
          <span>{selectedDate ? 'Ventas del día' : 'Ventas acumuladas'}</span>
          <strong>{formatCurrency(visibleTotal)}</strong>
        </div>
      </div>

      {orderedCashBoxes.length === 0 ? (
        <div className="history-empty">
          <span className="empty-icon"><ReceiptText size={25} /></span>
          <h2>Aún no hay cajas registradas</h2>
          <p>Cuando abras una caja, sus horarios y ventas aparecerán aquí.</p>
        </div>
      ) : (
        <>
          <div className="history-toolbar">
            <label className="date-filter">
              <span>Buscar turnos por fecha</span>
              <input
                type="date"
                value={selectedDate}
                onChange={(event) => setSelectedDate(event.target.value)}
              />
            </label>
            {selectedDate && (
              <button className="clear-date-filter" type="button" onClick={() => setSelectedDate('')}>
                <X size={15} /> Limpiar fecha
              </button>
            )}
          </div>
          {visibleCashBoxes.length === 0 ? (
            <div className="history-empty filtered-empty">
              <span className="empty-icon"><ReceiptText size={25} /></span>
              <h2>No hay cajas para esa fecha</h2>
              <p>Prueba con otro día o limpia el filtro para ver todos los turnos.</p>
            </div>
          ) : (
            <div className="box-history">
              {visibleCashBoxes.map((cashBox) => {
            const total = getBoxTotal(cashBox)
            const itemCount = cashBox.sales.reduce((sum, sale) => (
              sum + sale.items.reduce((saleCount, item) => saleCount + item.quantity, 0)
            ), 0)

            return (
              <article className="box-record" key={cashBox.id}>
                <div className="box-record-heading">
                  <div>
                    <p className="eyebrow">{formatDate(cashBox.openedAt)}</p>
                    <h2>Caja del {formatDate(cashBox.openedAt, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</h2>
                  </div>
                  <div className="box-record-actions">
                    <button
                      className="button danger delete-cashbox-button"
                      type="button"
                      onClick={() => deleteCashBox(cashBox)}
                      aria-label={`Borrar turno del ${formatDate(cashBox.openedAt)}`}
                    >
                      <Trash2 size={15} /> Borrar turno
                    </button>
                    <button
                      className="button secondary document-button"
                      type="button"
                      onClick={() => downloadCashBoxPdf(cashBox)}
                      aria-label={`Descargar PDF del turno del ${formatDate(cashBox.openedAt)}`}
                    >
                      <FileDown size={16} /> PDF del turno
                    </button>
                    <span className={`cash-status ${cashBox.closedAt ? 'closed' : 'open'}`}>
                      {cashBox.closedAt ? <LockKeyhole size={16} /> : <UnlockKeyhole size={16} />}
                      {cashBox.closedAt ? 'Cerrada' : 'Abierta'}
                    </span>
                  </div>
                </div>

                <div className="box-metrics">
                  <div className="box-time-metric">
                    <span><Clock3 size={15} /> Apertura</span>
                    <strong>{formatDateTime(cashBox.openedAt)}</strong>
                  </div>
                  <div className="box-time-metric">
                    <span><Clock3 size={15} /> Cierre</span>
                    <strong>{cashBox.closedAt ? formatDateTime(cashBox.closedAt) : 'En curso'}</strong>
                  </div>
                  <div className="box-number-metric">
                    <span>Ventas</span>
                    <strong>{cashBox.sales.length}</strong>
                  </div>
                  <div className="box-number-metric">
                    <span>Productos</span>
                    <strong>{itemCount}</strong>
                  </div>
                  <div className="box-number-metric total-metric">
                    <span>Total vendido</span>
                    <strong>{formatCurrency(total)}</strong>
                  </div>
                </div>

                {cashBox.sales.length > 0 && (
                  <div className="sales-list">
                    <h3><ReceiptText size={16} /> Ventas de esta caja</h3>
                    {cashBox.sales.map((sale) => {
                      const saleTotal = sale.items.reduce((sum, item) => sum + item.price * item.quantity, 0)
                      const itemsLabel = sale.items.map((item) => `${item.quantity} × ${item.name}`).join(', ')
                      return (
                        <div className="sale-row" key={sale.id}>
                          <div>
                            <strong>{formatDateTime(sale.soldAt)}</strong>
                            <span>{itemsLabel}</span>
                          </div>
                          <strong>{formatCurrency(saleTotal)}</strong>
                        </div>
                      )
                    })}
                  </div>
                )}
              </article>
            )
              })}
            </div>
          )}
        </>
      )}
    </section>
  )
}

export default CashDetailsView