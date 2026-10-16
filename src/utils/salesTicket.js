import { formatCurrency, formatDateTime } from './formatters.js'

function getTicketText(sale) {
  const lines = [
    'COMIDASPEQUE',
    'TICKET DE VENTA',
    `Fecha: ${formatDateTime(sale.soldAt)}`,
    `Venta: ${sale.id}`,
    '--------------------------------',
  ]

  sale.items.forEach((item) => {
    lines.push(`${item.quantity} x ${item.name}`)
    lines.push(`  ${formatCurrency(item.price)} c/u  ${formatCurrency(item.price * item.quantity)}`)
  })

  const total = sale.items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  lines.push('--------------------------------')
  lines.push(`TOTAL: ${formatCurrency(total)}`)
  lines.push('Gracias por tu compra.')
  return lines.join('\n')
}

function getTicketFilename(sale) {
  const date = new Date(sale.soldAt).toLocaleDateString('sv-SE')
  return `ticket-comidaspeque-${date}-${sale.id}.txt`
}

export function downloadSaleTicket(sale) {
  const file = new Blob([`\uFEFF${getTicketText(sale)}`], { type: 'text/plain;charset=utf-8' })
  const objectUrl = URL.createObjectURL(file)
  const link = document.createElement('a')
  link.href = objectUrl
  link.download = getTicketFilename(sale)
  document.body.append(link)
  link.click()
  link.remove()
  window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1000)
}

