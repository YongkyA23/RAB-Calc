import { DEFAULT_CATEGORIES, DEFAULT_PRICE_ITEMS } from '../data/seedData'
import {
  buildEstimatePayload,
  buildPaperCalculationPayload,
  buildPaperCalculatorDraftPayload,
  buildPaperCustomSizePayload,
  buildPriceAuditEntry,
  buildQuotePayload,
  buildUserProfilePayload,
  buildVendorEstimatePayload,
} from '../firebase/payloads'

const STORAGE_PREFIX = 'rab_calc_local_'

function getKey(collectionName) {
  return `${STORAGE_PREFIX}${collectionName}`
}

function getCollection(collectionName) {
  try {
    const raw = localStorage.getItem(getKey(collectionName))
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch (error) {
    console.error(`Failed to read collection ${collectionName} from localStorage:`, error)
    return []
  }
}

function setCollection(collectionName, items) {
  try {
    localStorage.setItem(getKey(collectionName), JSON.stringify(items))
  } catch (error) {
    console.error(`Failed to write collection ${collectionName} to localStorage:`, error)
  }
}

export function initializeLocalStore() {
  const existingCategories = getCollection('categories')
  if (existingCategories.length === 0) {
    const categoriesWithDates = DEFAULT_CATEGORIES.map((c) => ({
      ...c,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }))
    setCollection('categories', categoriesWithDates)
  }

  const existingItems = getCollection('priceItems')
  if (existingItems.length === 0) {
    const itemsWithDates = DEFAULT_PRICE_ITEMS.map((item) => ({
      ...item,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastEditedBy: 'local-admin',
    }))
    setCollection('priceItems', itemsWithDates)
  }
}

// Auto-initialize once
if (typeof window !== 'undefined' && window.localStorage) {
  initializeLocalStore()
}

export async function localListCollection(collectionName) {
  return getCollection(collectionName)
}

export async function localListCategories() {
  initializeLocalStore()
  return getCollection('categories')
}

export async function localListPriceItems() {
  initializeLocalStore()
  return getCollection('priceItems')
}

export async function localListActivePriceItems() {
  initializeLocalStore()
  return getCollection('priceItems').filter((item) => item.active !== false)
}

export async function localListRecentPriceAuditEntries(maxEntries = 10) {
  const entries = getCollection('priceAuditEntries')
  return entries
    .sort((a, b) => new Date(b.editedAt || 0) - new Date(a.editedAt || 0))
    .slice(0, maxEntries)
}

export async function localSeedDefaultCatalog(editedBy = 'local-admin') {
  const categoriesWithDates = DEFAULT_CATEGORIES.map((c) => ({
    ...c,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }))
  setCollection('categories', categoriesWithDates)

  const itemsWithDates = DEFAULT_PRICE_ITEMS.map((item) => ({
    ...item,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    lastEditedBy: editedBy,
  }))
  setCollection('priceItems', itemsWithDates)

  const auditEntries = getCollection('priceAuditEntries')
  itemsWithDates.forEach((priceItem) => {
    auditEntries.unshift(
      buildPriceAuditEntry({
        itemId: priceItem.id,
        categoryId: priceItem.categoryId,
        action: 'seed',
        previous: {},
        next: priceItem,
        editedBy,
      }),
    )
  })
  setCollection('priceAuditEntries', auditEntries.slice(0, 50))

  return { categories: DEFAULT_CATEGORIES.length, priceItems: DEFAULT_PRICE_ITEMS.length }
}

export async function localSavePriceItem(priceItem, editedBy = 'local-admin', previous = {}) {
  const payload = {
    ...priceItem,
    updatedAt: new Date().toISOString(),
    lastEditedBy: editedBy,
  }

  const items = getCollection('priceItems')
  const index = items.findIndex((i) => i.id === priceItem.id)
  if (index >= 0) {
    items[index] = { ...items[index], ...payload }
  } else {
    items.push(payload)
  }
  setCollection('priceItems', items)

  const auditEntries = getCollection('priceAuditEntries')
  auditEntries.unshift(
    buildPriceAuditEntry({
      itemId: priceItem.id,
      categoryId: priceItem.categoryId,
      action: previous?.id ? 'update' : 'create',
      previous,
      next: payload,
      editedBy,
    }),
  )
  setCollection('priceAuditEntries', auditEntries.slice(0, 50))

  return payload
}

export async function localDeactivatePriceItem(priceItem, editedBy = 'local-admin') {
  return localSavePriceItem({ ...priceItem, active: false }, editedBy, priceItem)
}

export async function localSaveEstimate(estimateInput) {
  const payload = buildEstimatePayload(estimateInput)
  const estimates = getCollection('quotes')
  const index = estimates.findIndex((e) => e.id === payload.id)
  if (index >= 0) {
    estimates[index] = payload
  } else {
    estimates.unshift(payload)
  }
  setCollection('quotes', estimates)
  return payload
}

export async function localSaveQuote(quoteInput) {
  const payload = buildQuotePayload(quoteInput)
  const quotes = getCollection('quotes')
  const index = quotes.findIndex((q) => q.id === payload.id)
  if (index >= 0) {
    quotes[index] = payload
  } else {
    quotes.unshift(payload)
  }
  setCollection('quotes', quotes)
  return payload
}

export async function localListEstimates() {
  const estimates = getCollection('quotes')
  return estimates.sort((a, b) => new Date(b.date || b.updatedAt || 0) - new Date(a.date || a.updatedAt || 0))
}

export async function localListQuotes() {
  return localListEstimates()
}

export async function localDeleteEstimate(estimateId) {
  const estimates = getCollection('quotes').filter((e) => e.id !== estimateId)
  setCollection('quotes', estimates)
}

export async function localDeleteEstimatesBulk(estimateIds) {
  const idsSet = new Set(estimateIds)
  const estimates = getCollection('quotes').filter((e) => !idsSet.has(e.id))
  setCollection('quotes', estimates)
}

export async function localListActualCosts() {
  return getCollection('actualCosts')
}

export async function localGetActualCost(estimateId) {
  const items = getCollection('actualCosts')
  return items.find((item) => item.estimateId === estimateId) || null
}

export async function localSaveActualCost(actualCost) {
  const items = getCollection('actualCosts')
  const index = items.findIndex((item) => item.estimateId === actualCost.estimateId)
  if (index >= 0) {
    items[index] = actualCost
  } else {
    items.push(actualCost)
  }
  setCollection('actualCosts', items)
  return actualCost
}

export async function localListVendorEstimates() {
  const items = getCollection('vendorEstimates')
  return items.sort((a, b) => new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0))
}

export async function localGetVendorEstimate(vendorEstimateId) {
  const items = getCollection('vendorEstimates')
  return items.find((item) => item.id === vendorEstimateId) || null
}

export async function localSaveVendorEstimate(input) {
  const payload = buildVendorEstimatePayload(input)
  const items = getCollection('vendorEstimates')
  const index = items.findIndex((item) => item.id === payload.id)
  if (index >= 0) {
    items[index] = payload
  } else {
    items.unshift(payload)
  }
  setCollection('vendorEstimates', items)
  return payload
}

export async function localDeleteVendorEstimate(vendorEstimateId) {
  const items = getCollection('vendorEstimates').filter((item) => item.id !== vendorEstimateId)
  setCollection('vendorEstimates', items)
}

export async function localGetPaperCalculatorDraft(userId) {
  const drafts = getCollection('paperCalculatorDrafts')
  return drafts.find((d) => d.userId === userId) || null
}

export async function localSavePaperCalculatorDraft(userId, workspace) {
  const payload = buildPaperCalculatorDraftPayload({ userId, ...workspace })
  const drafts = getCollection('paperCalculatorDrafts')
  const index = drafts.findIndex((d) => d.userId === userId)
  if (index >= 0) {
    drafts[index] = payload
  } else {
    drafts.push(payload)
  }
  setCollection('paperCalculatorDrafts', drafts)
  return payload
}

export async function localListPaperCalculations() {
  const items = getCollection('paperCalculations')
  return items.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
}

export async function localSavePaperCalculation(input) {
  const payload = buildPaperCalculationPayload(input)
  const items = getCollection('paperCalculations')
  const index = items.findIndex((i) => i.id === payload.id)
  if (index >= 0) {
    items[index] = payload
  } else {
    items.unshift(payload)
  }
  setCollection('paperCalculations', items)
  return payload
}

export async function localDeletePaperCalculation(calculationId) {
  const items = getCollection('paperCalculations').filter((i) => i.id !== calculationId)
  setCollection('paperCalculations', items)
}

export async function localListPaperCustomSizes() {
  const items = getCollection('paperCustomSizes')
  return items.sort((a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0))
}

export async function localSavePaperCustomSize(input) {
  const payload = buildPaperCustomSizePayload(input)
  const items = getCollection('paperCustomSizes')
  const index = items.findIndex((i) => i.id === payload.id)
  if (index >= 0) {
    items[index] = payload
  } else {
    items.push(payload)
  }
  setCollection('paperCustomSizes', items)
  return payload
}

export async function localDeletePaperCustomSize(sizeId) {
  const items = getCollection('paperCustomSizes').filter((i) => i.id !== sizeId)
  setCollection('paperCustomSizes', items)
}

export async function localGetUserProfile(uid) {
  const users = getCollection('users')
  const found = users.find((u) => u.uid === uid || u.id === uid)
  if (found) return found
  return {
    id: uid,
    uid,
    name: 'Local Admin',
    email: 'admin@local.test',
    role: 'Admin',
    status: 'active',
  }
}

export async function localSaveUserProfile(profile) {
  const payload = buildUserProfilePayload(profile)
  const users = getCollection('users')
  const index = users.findIndex((u) => u.uid === profile.uid || u.id === profile.uid)
  if (index >= 0) {
    users[index] = payload
  } else {
    users.push(payload)
  }
  setCollection('users', users)
  return payload
}

export async function localUpdateUserProfile(uid, changes) {
  const users = getCollection('users')
  const index = users.findIndex((u) => u.uid === uid || u.id === uid)
  const payload = { ...changes, updatedAt: new Date().toISOString() }
  if (index >= 0) {
    users[index] = { ...users[index], ...payload }
  } else {
    users.push({ id: uid, uid, ...payload })
  }
  setCollection('users', users)
  return payload
}

export async function localListUsers() {
  const users = getCollection('users')
  if (users.length === 0) {
    return [
      {
        id: 'local-admin-uid',
        uid: 'local-admin-uid',
        name: 'Local Admin',
        email: 'admin@local.test',
        role: 'Admin',
        status: 'active',
      },
    ]
  }
  return users
}
