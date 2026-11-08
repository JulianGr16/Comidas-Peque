import { getRecipeUnitCost } from './productCosting.js'

export function calculateCashBoxProfit(cashBox, menuProducts, productPurchases) {
  const productsById = new Map(menuProducts.map((product) => [product.id, product]))
  const soldProducts = new Map()

  ;(cashBox.sales ?? []).forEach((sale) => {
    ;(sale.items ?? []).forEach((item) => {
      const key = item.id ?? item.name
      const sold = soldProducts.get(key) ?? {
        id: item.id,
        name: item.name,
        quantity: 0,
        revenue: 0,
      }
      sold.quantity += Number(item.quantity) || 0
      sold.revenue += (Number(item.price) || 0) * (Number(item.quantity) || 0)
      soldProducts.set(key, sold)
    })
  })

  const products = [...soldProducts.values()].map((sold) => {
    const menuProduct = productsById.get(sold.id)
    const costing = menuProduct
      ? getRecipeUnitCost(menuProduct, productPurchases)
      : { complete: false, cost: null }
    const cost = costing.complete ? costing.cost * sold.quantity : null

    return {
      ...sold,
      cost,
      profit: cost === null ? null : sold.revenue - cost,
      costComplete: costing.complete,
    }
  })

  const totalRevenue = products.reduce((total, product) => total + product.revenue, 0)
  const knownCost = products.reduce((total, product) => total + (product.cost ?? 0), 0)
  const allCostsComplete = products.every((product) => product.costComplete)
  const grossProfit = allCostsComplete ? totalRevenue - knownCost : null
  const cashExpenses = (cashBox.expenses ?? []).reduce((total, expense) => total + (Number(expense.amount) || 0), 0)

  return {
    products,
    totalRevenue,
    totalCost: allCostsComplete ? knownCost : null,
    grossProfit,
    cashExpenses,
    netProfit: grossProfit === null ? null : grossProfit - cashExpenses,
    allCostsComplete,
    calculatedAt: new Date().toISOString(),
  }
}
