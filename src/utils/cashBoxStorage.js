import { openDB } from 'idb'

const DATABASE_NAME = 'comidaspeque-local'
const DATABASE_VERSION = 1
const STORE_NAME = 'app-state'
const CASH_BOXES_KEY = 'cashBoxes'
const PURCHASES_KEY = 'productPurchases'
const LEGACY_STORAGE_KEY = 'comidaspeque.cashboxes.v1'

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