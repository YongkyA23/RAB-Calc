import {
  addDoc,
  collection,
  deleteDoc,
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
import { buildEstimatePayload, buildPriceAuditEntry, buildQuotePayload, buildUserProfilePayload, buildVendorEstimatePayload } from './payloads'

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

export async function saveEstimate(estimateInput) {
  const payload = buildEstimatePayload(estimateInput)
  await setDoc(doc(db, COLLECTIONS.quotes, payload.id), payload)
  return payload
}

export async function saveQuote(quoteInput) {
  const payload = buildQuotePayload(quoteInput)
  await setDoc(doc(db, COLLECTIONS.quotes, payload.id), payload)
  return payload
}

export async function listEstimates() {
  const snapshot = await getDocs(query(collection(db, COLLECTIONS.quotes), orderBy('date', 'desc')))
  return snapshot.docs.map((document) => ({ id: document.id, ...document.data() }))
}

export async function listQuotes() {
  return listEstimates()
}

export async function listVendorEstimates() {
  const snapshot = await getDocs(query(collection(db, COLLECTIONS.vendorEstimates), orderBy('updatedAt', 'desc')))
  return snapshot.docs.map((document) => ({ id: document.id, ...document.data() }))
}

export async function getVendorEstimate(vendorEstimateId) {
  const snapshot = await getDoc(doc(db, COLLECTIONS.vendorEstimates, vendorEstimateId))
  return snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } : null
}

export async function saveVendorEstimate(input) {
  const payload = buildVendorEstimatePayload(input)
  await setDoc(doc(db, COLLECTIONS.vendorEstimates, payload.id), payload)
  return payload
}

export async function deleteVendorEstimate(vendorEstimateId) {
  await deleteDoc(doc(db, COLLECTIONS.vendorEstimates, vendorEstimateId))
}

// Email allowlist management
export const EMAIL_ALLOWLIST_COLLECTION = 'emailAllowlist'
export const USER_INVITES_COLLECTION = 'userInvites'
export const INITIAL_ADMIN_EMAIL = 'noobsnoobs28@gmail.com'
export const INITIAL_ALLOWLIST_EMAILS = [INITIAL_ADMIN_EMAIL]

export function normalizeEmail(email) {
  return email.trim().toLowerCase()
}

export function getAllowlistDocId(email) {
  return normalizeEmail(email).replace(/[^a-z0-9]/g, '_')
}

export function buildInviteProfile(email, role = 'Admin', status = 'active', invitedBy = 'system') {
  const normalizedEmail = normalizeEmail(email)
  return {
    email: normalizedEmail,
    name: normalizedEmail,
    role,
    status,
    invitedBy,
    invitedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
}

export async function listUserInvites() {
  const snapshot = await getDocs(collection(db, USER_INVITES_COLLECTION))
  return snapshot.docs.map((document) => ({ id: document.id, ...document.data(), pending: true }))
}

export async function getUserInviteByEmail(email) {
  const snapshot = await getDoc(doc(db, USER_INVITES_COLLECTION, getAllowlistDocId(email)))
  return snapshot.exists() ? { id: snapshot.id, ...snapshot.data(), pending: true } : null
}

export async function saveUserInvite({ email, role = 'Admin', status = 'active', invitedBy = 'system' }) {
  const payload = buildInviteProfile(email, role, status, invitedBy)
  await setDoc(doc(db, USER_INVITES_COLLECTION, getAllowlistDocId(payload.email)), payload)
  await addAllowedEmail(payload.email, invitedBy)
  return payload
}

export async function getAllowlistEmails() {
  const snapshot = await getDocs(collection(db, EMAIL_ALLOWLIST_COLLECTION))
  return snapshot.docs.map((document) => document.data().email).filter(Boolean).map(normalizeEmail)
}

export async function addAllowedEmail(email, addedBy) {
  const normalizedEmail = normalizeEmail(email)
  const payload = {
    email: normalizedEmail,
    addedBy,
    addedAt: new Date().toISOString(),
  }
  await setDoc(doc(db, EMAIL_ALLOWLIST_COLLECTION, getAllowlistDocId(normalizedEmail)), payload)
}

export async function removeAllowedEmail(email) {
  await deleteDoc(doc(db, EMAIL_ALLOWLIST_COLLECTION, getAllowlistDocId(email)))
}

export async function ensureInitialAllowlistEmails(addedBy = 'system') {
  await Promise.all(
    INITIAL_ALLOWLIST_EMAILS.map(async (email) => {
      const ref = doc(db, USER_INVITES_COLLECTION, getAllowlistDocId(email))
      const snapshot = await getDoc(ref)
      if (snapshot.exists()) return
      await saveUserInvite({ email, role: 'Admin', status: 'active', invitedBy: addedBy })
    }),
  )
}
