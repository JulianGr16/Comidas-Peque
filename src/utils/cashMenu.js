export const cashMenuCategories = [
  'Hamburguesas',
  'Agregados',
  'Porciones de papas',
  'Sándwiches y lomitos',
  'Comidas varias',
]

export const defaultCashMenuProducts = [
  { id: 'burger-clasica', name: 'Burger clásica', price: 9000, category: 'Hamburguesas', recipe: [
    { name: 'Carne', quantity: 0.24, unit: 'kg' }, { name: 'Papas', quantity: 0.2, unit: 'kg' },
  ] },
  { id: 'burger-especial', name: 'Burger especial', price: 10000, category: 'Hamburguesas', recipe: [
    { name: 'Carne', quantity: 0.24, unit: 'kg' }, { name: 'Jamón', quantity: 0.02, unit: 'kg' },
    { name: 'Huevo', quantity: 1, unit: 'unidad' },
    { name: 'Cheddar', quantity: 0.03, unit: 'kg' }, { name: 'Papas', quantity: 0.2, unit: 'kg' },
  ] },
  { id: 'peque-burger-2', name: 'Peque Burger 2.0', price: 10000, category: 'Hamburguesas', recipe: [
    { name: 'Carne', quantity: 0.24, unit: 'kg' }, { name: 'Cheddar', quantity: 0.03, unit: 'kg' },
    { name: 'Papas', quantity: 0.2, unit: 'kg' },
  ] },
  { id: 'peque-burger-3', name: 'Peque Burger 3.0', price: 12000, category: 'Hamburguesas', recipe: [
    { name: 'Carne', quantity: 0.36, unit: 'kg' }, { name: 'Cheddar', quantity: 0.03, unit: 'kg' },
    { name: 'Papas', quantity: 0.2, unit: 'kg' },
  ] },
  { id: 'bacon-burger', name: 'Bacon Burger', price: 11000, category: 'Hamburguesas', recipe: [
    { name: 'Carne', quantity: 0.24, unit: 'kg' }, { name: 'Bacon', quantity: 0.03, unit: 'kg' },
    { name: 'Cheddar', quantity: 0.03, unit: 'kg' },
    { name: 'Papas', quantity: 0.2, unit: 'kg' },
  ] },
  { id: 'medallon', name: 'Medallón', price: 2500, category: 'Agregados', recipe: [
    { name: 'Carne', quantity: 0.12, unit: 'kg' },
  ] },
  { id: 'huevo', name: 'Huevo', price: 1000, category: 'Agregados', recipe: [
    { name: 'Huevo', quantity: 1, unit: 'unidad' },
  ] },
  { id: 'cheddar', name: 'Cheddar', price: 2000, category: 'Agregados', recipe: [
    { name: 'Cheddar', quantity: 0.03, unit: 'kg' },
  ] },
  { id: 'bacon-extra', name: 'Bacon', price: 2500, category: 'Agregados', recipe: [
    { name: 'Bacon', quantity: 0.03, unit: 'kg' },
  ] },
  { id: 'papas-comunes', name: 'Papas comunes', price: 6000, category: 'Porciones de papas', recipe: [
    { name: 'Papas', quantity: 0.2, unit: 'kg' },
  ] },
  { id: 'papas-cheddar', name: 'Papas con cheddar', price: 8000, category: 'Porciones de papas', recipe: [
    { name: 'Papas', quantity: 0.2, unit: 'kg' }, { name: 'Cheddar', quantity: 0.06, unit: 'kg' },
  ] },
  { id: 'sandwich-comun', name: 'Sándwich común', price: 7500, category: 'Sándwiches y lomitos', recipe: [
    { name: 'Milanesa', quantity: 0.18, unit: 'kg' }, { name: 'Lechuga', quantity: 0.015, unit: 'kg' },
    { name: 'Tomate', quantity: 0.03, unit: 'kg' }, { name: 'Papas', quantity: 0.2, unit: 'kg' },
  ] },
  { id: 'sandwich-especial', name: 'Sándwich especial', price: 9000, category: 'Sándwiches y lomitos', recipe: [
    { name: 'Milanesa', quantity: 0.18, unit: 'kg' }, { name: 'Lechuga', quantity: 0.015, unit: 'kg' },
    { name: 'Tomate', quantity: 0.03, unit: 'kg' }, { name: 'Jamón', quantity: 0.02, unit: 'kg' },
    { name: 'Huevo', quantity: 1, unit: 'unidad' }, { name: 'Queso cremoso', quantity: 0.03, unit: 'kg' },
    { name: 'Papas', quantity: 0.2, unit: 'kg' },
  ] },
  { id: 'lomito-comun', name: 'Lomito común', price: 10000, category: 'Sándwiches y lomitos', recipe: [
    { name: 'Carne', quantity: 0.18, unit: 'kg' }, { name: 'Lechuga', quantity: 0.015, unit: 'kg' },
    { name: 'Tomate', quantity: 0.03, unit: 'kg' }, { name: 'Papas', quantity: 0.2, unit: 'kg' },
  ] },
  { id: 'lomito-especial', name: 'Lomito especial', price: 11500, category: 'Sándwiches y lomitos', recipe: [
    { name: 'Carne', quantity: 0.18, unit: 'kg' }, { name: 'Lechuga', quantity: 0.015, unit: 'kg' },
    { name: 'Tomate', quantity: 0.03, unit: 'kg' }, { name: 'Jamón', quantity: 0.02, unit: 'kg' },
    { name: 'Huevo', quantity: 1, unit: 'unidad' }, { name: 'Queso cremoso', quantity: 0.03, unit: 'kg' },
    { name: 'Papas', quantity: 0.2, unit: 'kg' },
  ] },
  { id: 'napolitana-2', name: 'Napo para 2', price: 15000, category: 'Comidas varias', recipe: [
    { name: 'Milanesa', quantity: 0.36, unit: 'kg' }, { name: 'Queso cremoso', quantity: 0.12, unit: 'kg' },
    { name: 'Jamón', quantity: 0.04, unit: 'kg' }, { name: 'Tomate', quantity: 0.08, unit: 'kg' },
    { name: 'Papas', quantity: 0.4, unit: 'kg' },
  ] },
  { id: 'napolitana-3', name: 'Napo para 3', price: 28000, category: 'Comidas varias', recipe: [
    { name: 'Milanesa', quantity: 0.54, unit: 'kg' }, { name: 'Queso cremoso', quantity: 0.18, unit: 'kg' },
    { name: 'Jamón', quantity: 0.06, unit: 'kg' }, { name: 'Tomate', quantity: 0.12, unit: 'kg' },
    { name: 'Papas', quantity: 0.6, unit: 'kg' },
  ] },
]
