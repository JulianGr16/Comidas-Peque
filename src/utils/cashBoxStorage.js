import { openDB } from 'idb'
import { defaultCashMenuProducts } from './cashMenu.js'

const DATABASE_NAME = 'comidaspeque-local'
const DATABASE_VERSION = 1
const STORE_NAME = 'app-state'
const CASH_BOXES_KEY = 'cashBoxes'
const PURCHASES_KEY = 'productPurchases'
const CASH_MENU_KEY = 'cashMenuProducts'
const CASH_MENU_RECIPE_MIGRATION_KEY = 'cashMenuRecipeDefaultsV2'
const LEGACY_STORAGE_KEY = 'comidaspeque.cashboxes.v1'

const previousDefaultRecipes = new Map([
  ['burger-clasica', [
    { name: 'Carne', quantity: 0.2, unit: 'kg' }, { name: 'Lechuga', quantity: 0.015, unit: 'kg' },
    { name: 'Tomate', quantity: 0.03, unit: 'kg' }, { name: 'Cebolla', quantity: 0.02, unit: 'kg' },
    { name: 'Papas', quantity: 0.2, unit: 'kg' },
  ]],
  ['burger-especial', [
    { name: 'Carne', quantity: 0.2, unit: 'kg' }, { name: 'Lechuga', quantity: 0.015, unit: 'kg' },
    { name: 'Tomate', quantity: 0.03, unit: 'kg' }, { name: 'Cebolla', quantity: 0.02, unit: 'kg' },
    { name: 'Jamón', quantity: 0.02, unit: 'kg' }, { name: 'Huevo', quantity: 1, unit: 'unidad' },
    { name: 'Cheddar', quantity: 0.03, unit: 'kg' }, { name: 'Papas', quantity: 0.2, unit: 'kg' },
  ]],
  ['peque-burger-2', [
    { name: 'Carne', quantity: 0.2, unit: 'kg' }, { name: 'Cheddar', quantity: 0.03, unit: 'kg' },
    { name: 'Cebolla', quantity: 0.03, unit: 'kg' }, { name: 'Papas', quantity: 0.2, unit: 'kg' },
  ]],
  ['peque-burger-3', [
    { name: 'Carne', quantity: 0.3, unit: 'kg' }, { name: 'Cheddar', quantity: 0.03, unit: 'kg' },
    { name: 'Cebolla', quantity: 0.03, unit: 'kg' }, { name: 'Papas', quantity: 0.2, unit: 'kg' },
  ]],
  ['bacon-burger', [
    { name: 'Carne', quantity: 0.2, unit: 'kg' }, { name: 'Bacon', quantity: 0.03, unit: 'kg' },
    { name: 'Cheddar', quantity: 0.03, unit: 'kg' }, { name: 'Cebolla', quantity: 0.03, unit: 'kg' },
    { name: 'Papas', quantity: 0.2, unit: 'kg' },
  ]],
  ['medallon', [{ name: 'Carne', quantity: 0.1, unit: 'kg' }]],
  ['napolitana-2', [
    { name: 'Milanesa', quantity: 0.36, unit: 'kg' }, { name: 'Queso cremoso', quantity: 0.12, unit: 'kg' },
    { name: 'Jamón', quantity: 0.04, unit: 'kg' }, { name: 'Tomate', quantity: 0.08, unit: 'kg' },
    { name: 'Papas', quantity: 0.4, unit: 'kg' },
  ]],
  ['napolitana-3', [
    { name: 'Milanesa', quantity: 0.54, unit: 'kg' }, { name: 'Queso cremoso', quantity: 0.18, unit: 'kg' },
    { name: 'Jamón', quantity: 0.06, unit: 'kg' }, { name: 'Tomate', quantity: 0.12, unit: 'kg' },
    { name: 'Papas', quantity: 0.6, unit: 'kg' },
  ]],
])

let databasePromise

function getDatabase() {
  databasePromise ??= openDB(DATABASE_NAME, DATABASE_VERSION, {
    upgrade(database) {
      if (!database.objectStoreNames.contains(STORE_NAME)) {
        database.createObjectStore(STORE_NAME)
      }
    },
  })

  return databasePromise
}

async function migrateLegacyCashBoxes(database) {
  let legacyData

  try {
    legacyData = window.localStorage.getItem(LEGACY_STORAGE_KEY)
  } catch {
    return []
  }

  if (!legacyData) return []

  let cashBoxes
  try {
    cashBoxes = JSON.parse(legacyData)
  } catch {
    return []
  }

  if (!Array.isArray(cashBoxes)) return []

  await database.put(STORE_NAME, cashBoxes, CASH_BOXES_KEY)

  try {
    window.localStorage.removeItem(LEGACY_STORAGE_KEY)
  } catch {
    // The migrated IndexedDB copy remains authoritative if localStorage is unavailable.
  }

  return cashBoxes
}

export async function loadCashBoxes() {
  const database = await getDatabase()
  const storedCashBoxes = await database.get(STORE_NAME, CASH_BOXES_KEY)

  if (Array.isArray(storedCashBoxes)) return storedCashBoxes
  return migrateLegacyCashBoxes(database)
}

export async function saveCashBoxes(cashBoxes) {
  const database = await getDatabase()
  await database.put(STORE_NAME, cashBoxes, CASH_BOXES_KEY)
}

export async function loadProductPurchases() {
  const database = await getDatabase()
  const purchases = await database.get(STORE_NAME, PURCHASES_KEY)
  return Array.isArray(purchases) ? purchases : []
}

export async function saveProductPurchases(purchases) {
  const database = await getDatabase()
  await database.put(STORE_NAME, purchases, PURCHASES_KEY)
}

export async function loadCashMenuProducts() {
  const database = await getDatabase()
  const products = await database.get(STORE_NAME, CASH_MENU_KEY)
  const recipeDefaultsApplied = await database.get(STORE_NAME, CASH_MENU_RECIPE_MIGRATION_KEY)
  if (recipeDefaultsApplied && Array.isArray(products)) return products

  const storedProducts = Array.isArray(products) ? products : []
  const defaultsById = new Map(defaultCashMenuProducts.map((product) => [product.id, product]))
  const existingProductIds = new Set(storedProducts.map((product) => product.id))
  const mergedProducts = storedProducts.map((product) => {
    const defaultProduct = defaultsById.get(product.id)
    if (!defaultProduct?.recipe?.length) return product
    const previousRecipe = previousDefaultRecipes.get(product.id)
    const hasPreviousDefaultRecipe = previousRecipe
      && JSON.stringify(product.recipe) === JSON.stringify(previousRecipe)
    if (product.recipe?.length && !hasPreviousDefaultRecipe) return product
    return { ...product, recipe: defaultProduct.recipe.map((item) => ({ ...item })) }
  })
  const newlyAddedDefaults = defaultCashMenuProducts
    .filter((product) => !existingProductIds.has(product.id))
    .map((product) => ({
      ...product,
      recipe: (product.recipe ?? []).map((item) => ({ ...item })),
    }))
  const mergedMenu = [...mergedProducts, ...newlyAddedDefaults]

  await database.put(STORE_NAME, mergedMenu, CASH_MENU_KEY)
  await database.put(STORE_NAME, true, CASH_MENU_RECIPE_MIGRATION_KEY)
  return mergedMenu
}

export async function saveCashMenuProducts(products) {
  const database = await getDatabase()
  await database.put(STORE_NAME, products, CASH_MENU_KEY)
}
