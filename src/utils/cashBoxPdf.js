import { formatCurrency, formatDate, formatDateTime } from './formatters.js'

const PAGE_WIDTH = 210
const PAGE_HEIGHT = 297
const LEFT = 16
const RIGHT = PAGE_WIDTH - LEFT

function getSaleTotal(sale) {
  return sale.items.reduce((total, item) => total + item.price * item.quantity, 0)
}

function getBoxTotal(cashBox) {
  return cashBox.sales.reduce((total, sale) => total + getSaleTotal(sale), 0)
}

function getBoxExpenses(cashBox) {
  return cashBox.expenses ?? []
}

function getBoxExpenseTotal(cashBox) {
  return getBoxExpenses(cashBox).reduce((total, expense) => total + expense.amount, 0)
}

function getProductCount(cashBox) {
  return cashBox.sales.reduce((total, sale) => (
    total + sale.items.reduce((saleCount, item) => saleCount + item.quantity, 0)
  ), 0)
}

function drawPageHeader(document, cashBox, continued = false) {
  document.setFillColor(36, 70, 52)
  document.rect(0, 0, PAGE_WIDTH, 32, 'F')
  document.setTextColor(255, 255, 255)
  document.setFont('helvetica', 'bold')
  document.setFontSize(17)
  document.text('ComidasPeque', LEFT, 14)
  document.setFont('helvetica', 'normal')
  document.setFontSize(9)
  document.text(continued ? 'Informe de caja por turno - continuacion' : 'Informe de caja por turno', LEFT, 23)
  document.text(`Turno ${cashBox.id}`, RIGHT, 14, { align: 'right' })
  document.text(formatDate(cashBox.openedAt), RIGHT, 23, { align: 'right' })
  document.setTextColor(35, 56, 47)
  return 43
}

function drawTableHeader(document, y) {
  document.setFillColor(236, 241, 235)
  document.rect(LEFT, y - 5, RIGHT - LEFT, 8, 'F')
  document.setFont('helvetica', 'bold')
  document.setFontSize(8)
  document.text('Producto', LEFT + 2, y)
  document.text('Cant.', 132, y, { align: 'right' })
  document.text('Unitario', 160, y, { align: 'right' })
  document.text('Subtotal', RIGHT - 2, y, { align: 'right' })
  document.setFont('helvetica', 'normal')
  return y + 8
}

export async function createCashBoxPdf(cashBox) {
  const { jsPDF } = await import('jspdf')
  const document = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  const total = getBoxTotal(cashBox)
  const expenses = getBoxExpenses(cashBox)
  const expenseTotal = getBoxExpenseTotal(cashBox)
  const netTotal = total - expenseTotal
  const productCount = getProductCount(cashBox)
  let y = drawPageHeader(document, cashBox)

  document.setFont('helvetica', 'bold')
  document.setFontSize(12)
  document.text(`Caja del ${formatDate(cashBox.openedAt, { day: 'numeric', month: 'long', year: 'numeric' })}`, LEFT, y)
  y += 9

  document.setFont('helvetica', 'normal')
  document.setFontSize(9)
  document.text(`Apertura: ${formatDateTime(cashBox.openedAt)}`, LEFT, y)
  document.text(`Cierre: ${cashBox.closedAt ? formatDateTime(cashBox.closedAt) : 'Turno en curso'}`, 108, y)
  y += 12

  document.setFillColor(36, 70, 52)
  document.roundedRect(LEFT, y, RIGHT - LEFT, 27, 2, 2, 'F')
  document.setTextColor(255, 255, 255)
  document.setFontSize(7)
  document.text('VENTAS', LEFT + 6, y + 8)
  document.text('PRODUCTOS', LEFT + 40, y + 8)
  document.text('VENDIDO', LEFT + 76, y + 8)
  document.text('GASTOS', LEFT + 113, y + 8)
  document.text('NETO', RIGHT - 6, y + 8, { align: 'right' })
  document.setFont('helvetica', 'bold')
  document.setFontSize(10)
  document.text(`${cashBox.sales.length}`, LEFT + 6, y + 19)
  document.text(`${productCount}`, LEFT + 40, y + 19)
  document.text(formatCurrency(total), LEFT + 76, y + 19)
  document.text(formatCurrency(expenseTotal), LEFT + 113, y + 19)
  document.text(formatCurrency(netTotal), RIGHT - 6, y + 19, { align: 'right' })
  document.setTextColor(35, 56, 47)
  y += 37

  if (cashBox.sales.length === 0) {
    document.setFont('helvetica', 'normal')
    document.setFontSize(10)
    document.text('Sin ventas registradas en este turno.', LEFT, y)
  }

  cashBox.sales.forEach((sale, saleIndex) => {
    if (y > PAGE_HEIGHT - 42) {
      document.addPage()
      y = drawPageHeader(document, cashBox, true)
    }

    document.setFont('helvetica', 'bold')
    document.setFontSize(10)
    document.text(`Venta ${saleIndex + 1}`, LEFT, y)
    document.setFont('helvetica', 'normal')
    document.setFontSize(8)
    document.text(formatDateTime(sale.soldAt), LEFT + 23, y)
    document.setFont('helvetica', 'bold')
    document.text(formatCurrency(getSaleTotal(sale)), RIGHT, y, { align: 'right' })
    y = drawTableHeader(document, y + 7)

    sale.items.forEach((item) => {
      const productLines = document.splitTextToSize(item.name, 96)
      const rowHeight = Math.max(6, productLines.length * 4.5)

      if (y + rowHeight > PAGE_HEIGHT - 16) {
        document.addPage()
        y = drawPageHeader(document, cashBox, true)
        y = drawTableHeader(document, y)
      }

      document.setFont('helvetica', 'normal')
      document.setFontSize(8)
      document.text(productLines, LEFT + 2, y)
      document.text(`${item.quantity}`, 132, y, { align: 'right' })
      document.text(formatCurrency(item.price), 160, y, { align: 'right' })
      document.text(formatCurrency(item.price * item.quantity), RIGHT - 2, y, { align: 'right' })
      y += rowHeight
    })

    y += 7
    document.setDrawColor(215, 223, 215)
    document.line(LEFT, y - 3, RIGHT, y - 3)
  })

  if (expenses.length > 0) {
    if (y > PAGE_HEIGHT - 28) {
      document.addPage()
      y = drawPageHeader(document, cashBox, true)
    }

    document.setFont('helvetica', 'bold')
    document.setFontSize(11)
    document.text('Gastos varios del turno', LEFT, y)
    y += 8

    expenses.forEach((expense) => {
      const conceptLines = document.splitTextToSize(expense.concept, 112)
      const rowHeight = Math.max(9, conceptLines.length * 4 + 4)

      if (y + rowHeight > PAGE_HEIGHT - 16) {
        document.addPage()
        y = drawPageHeader(document, cashBox, true)
      }

      document.setFont('helvetica', 'normal')
      document.setFontSize(8)
      document.text(conceptLines, LEFT + 2, y)
      document.setFontSize(7)
      document.text(formatDateTime(expense.recordedAt), LEFT + 2, y + 4)
      document.setFont('helvetica', 'bold')
      document.setFontSize(8)
      document.text(formatCurrency(expense.amount), RIGHT - 2, y, { align: 'right' })
      y += rowHeight
    })
  }

  const datePart = new Date(cashBox.openedAt).toLocaleDateString('sv-SE')
  return {
    document,
    filename: `comidaspeque-turno-${datePart}-${cashBox.id}.pdf`,
  }
}

export async function downloadCashBoxPdf(cashBox) {
  const { document, filename } = await createCashBoxPdf(cashBox)
  document.save(filename)
}