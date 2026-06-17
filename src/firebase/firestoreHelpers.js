import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore'
import { DEFAULT_CATEGORIES, DEFAULT_PRICE_ITEMS } from '../data/seedData'
import { db } from './app'
import { COLLECTIONS } from './collections'
import { buildPriceAuditEntry, buildQuotePayload, buildUserProfilePayload } from './payloads'

export async function listCollection(collectionName) {
  const snapshot = await getDocs(collection(db, collectionName))
  return snapshot.docs.map((document) => ({ id: document.id, ...document.data() }))
}

export async function listCategories() {
  const snapshot = await getDocs(collection(db, COLLECTIONS.categories))
  return snapshot.docs.map((document) => ({ id: document.id, ...document.data() }))
}

export async function listPriceItems() {
  const snapshot = await getDocs(collection(db, COLLECTIONS.priceItems))
  return snapshot.docs.map((document) => ({ id: document.id, ...document.data() }))
}

export async function listActivePriceItems() {
  const snapshot = await getDocs(
    query(collection(db, COLLECTIONS.priceItems), where('active', '==', true)),
  )
  return snapshot.docs.map((document) => ({ id: document.id, ...document.data() }))
}

export async function listRecentPriceAuditEntries(maxEntries = 10) {
  const snapshot = await getDocs(
    query(collection(db, COLLECTIONS.priceAuditEntries), orderBy('editedAt', 'desc'), limit(maxEntries)),
  )
  return snapshot.docs.map((document) => ({ id: document.id, ...document.data() }))
}

export async function getUserProfile(uid) {
  const snapshot = await getDoc(doc(db, COLLECTIONS.users, uid))
  return snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } : null
}

export async function getUserProfileCount() {
  const snapshot = await getDocs(collection(db, COLLECTIONS.users))
  return snapshot.size
}

export async function seedDefaultCatalog(editedBy) {
  await Promise.all(
    DEFAULT_CATEGORIES.map((category) =>
      setDoc(doc(db, COLLECTIONS.categories, category.id), {
        ...category,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }),
    ),
  )

  await Promise.all(
    DEFAULT_PRICE_ITEMS.map(async (priceItem) => {
      const payload = {
        ...priceItem,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        lastEditedBy: editedBy,
      }

      await setDoc(doc(db, COLLECTIONS.priceItems, priceItem.id), payload)
      await addDoc(
        collection(db, COLLECTIONS.priceAuditEntries),
        buildPriceAuditEntry({
          itemId: priceItem.id,
          categoryId: priceItem.categoryId,
          action: 'seed',
          previous: {},
          next: payload,
          editedBy,
        }),
      )
    }),
  )

  return { categories: DEFAULT_CATEGORIES.length, priceItems: DEFAULT_PRICE_ITEMS.length }
}

export async function saveUserProfile(profile) {
  const payload = buildUserProfilePayload(profile)
  await setDoc(doc(db, COLLECTIONS.users, profile.uid), payload)
  return payload
}

export async function updateUserProfile(uid, changes) {
  const payload = { ...changes, updatedAt: new Date().toISOString() }
  await updateDoc(doc(db, COLLECTIONS.users, uid), payload)
  return payload
}

export async function savePriceItem(priceItem, editedBy, previous = {}) {
  const payload = {
    ...priceItem,
    updatedAt: new Date().toISOString(),
    lastEditedBy: editedBy,
  }

  await setDoc(doc(db, COLLECTIONS.priceItems, priceItem.id), payload, { merge: true })
  await addDoc(
    collection(db, COLLECTIONS.priceAuditEntries),
    buildPriceAuditEntry({
      itemId: priceItem.id,
      categoryId: priceItem.categoryId,
      action: previous?.id ? 'update' : 'create',
      previous,
      next: payload,
      editedBy,
    }),
  )

  return payload
}

export async function deactivatePriceItem(priceItem, editedBy) {
  return savePriceItem({ ...priceItem, active: false }, editedBy, priceItem)
}

export async function saveQuote(quoteInput) {
  const payload = buildQuotePayload(quoteInput)
  await setDoc(doc(db, COLLECTIONS.quotes, payload.id), payload)
  return payload
}

export async function listQuotes() {
  const snapshot = await getDocs(query(collection(db, COLLECTIONS.quotes), orderBy('date', 'desc')))
  return snapshot.docs.map((document) => ({ id: document.id, ...document.data() }))
}
