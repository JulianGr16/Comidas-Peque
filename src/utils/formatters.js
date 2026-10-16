const currencyFormatter = new Intl.NumberFormat('es-AR', {
  maximumFractionDigits: 0,
})

export function formatCurrency(amount) {
  return `$${currencyFormatter.format(amount)}`
}

export function formatDateTime(value) {
  return new Intl.DateTimeFormat('es-AR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(value))
}

export function formatDate(value, options = { dateStyle: 'short' }) {
  return new Intl.DateTimeFormat('es-AR', options).format(new Date(value))
}