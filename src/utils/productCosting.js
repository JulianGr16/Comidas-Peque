const measurementUnits = {
  kg: { dimension: 'mass', factor: 1000 },
  g: { dimension: 'mass', factor: 1 },
  litro: { dimension: 'volume', factor: 1000 },
  ml: { dimension: 'volume', factor: 1 },
  unidad: { dimension: 'count', factor: 1 },
  paquete: { dimension: 'package', factor: 1 },
}

function normalizeIngredientName(name) {
  return name.trim().toLocaleLowerCase('es')
}

function toBaseQuantity(quantity, unit) {
  const definition = measurementUnits[unit]
  if (!definition || !Number.isFinite(quantity) || quantity <= 0) return null

  return {
    dimension: definition.dimension,
    quantity: quantity * definition.factor,
  }
}

export function getIngredientOptions(purchases) {
  const ingredients = new Map()

  purchases.forEach((purchase) => {
    const items = Array.isArray(purchase.items) ? purchase.items : []
    items.forEach((item) => {
      const name = item.name?.trim()
      if (!name) return

      const key = normalizeIngredientName(name)
      if (!ingredients.has(key)) ingredients.set(key, name)
    })
  })

  return [...ingredients.entries()].map(([id, name]) => ({ id, name }))
}

export function getRecipeUnitCost(product, purchases) {
  const recipe = product.recipe ?? []
  if (recipe.length === 0) {
    return { complete: false, cost: null, missingIngredients: [] }
  }

  let cost = 0
  const missingIngredients = []

  recipe.forEach((recipeItem) => {
    const recipeQuantity = toBaseQuantity(Number(recipeItem.quantity), recipeItem.unit)
    if (!recipeItem.name || !recipeQuantity) {
      missingIngredients.push(recipeItem.name || 'Insumo sin configurar')
      return
    }

    let purchasedQuantity = 0
    let purchaseCost = 0

    purchases.forEach((purchase) => {
      const items = Array.isArray(purchase.items) ? purchase.items : []
      items.forEach((item) => {
        if (normalizeIngredientName(item.name ?? '') !== normalizeIngredientName(recipeItem.name)) return

        const itemQuantity = toBaseQuantity(Number(item.quantity), item.unit)
        if (!itemQuantity || itemQuantity.dimension !== recipeQuantity.dimension) return

        purchasedQuantity += itemQuantity.quantity
        purchaseCost += Number(item.amount) || 0
      })
    })

    if (purchasedQuantity <= 0) {
      missingIngredients.push(recipeItem.name)
      return
    }

    cost += recipeQuantity.quantity * (purchaseCost / purchasedQuantity)
  })

  return {
    complete: missingIngredients.length === 0,
    cost: missingIngredients.length === 0 ? Math.round(cost * 100) / 100 : null,
    missingIngredients,
  }
}