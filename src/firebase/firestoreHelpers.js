import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  onSnapshot,
  query,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore'
import { DEFAULT_CATEGORIES, DEFAULT_PRICE_ITEMS } from '../data/seedData'
import { isStandaloneMode } from '../features/auth/authService'
import {
  localDeactivatePriceItem,
  localDeleteEstimate,
  localDeleteEstimatesBulk,
  localDeletePaperCalculation,
  localDeletePaperCustomSize,
  localDeleteVendorEstimate,
  localGetActualCost,
  localGetPaperCalculatorDraft,
  localGetUserProfile,
  localGetVendorEstimate,
  localListActivePriceItems,
  localListActualCosts,
  localListCategories,
  localListCollection,
  localListEstimates,
  localListPaperCalculations,
  localListPaperCustomSizes,
  localListPriceItems,
  localListRecentPriceAuditEntries,
  localListUsers,
  localListVendorEstimates,
  localSaveActualCost,
  localSaveEstimate,
  localSavePaperCalculation,
  localSavePaperCalculatorDraft,
  localSavePaperCustomSize,
  localSavePriceItem,
  localSaveQuote,
  localSaveUserProfile,
  localSaveVendorEstimate,
  localSeedDefaultCatalog,
  localUpdateUserProfile,
} from '../lib/localStore'
import { db } from './app'
import { COLLECTIONS } from './collections'
import {
  buildEstimatePayload,
  buildPaperCalculationPayload,
  buildPaperCalculatorDraftPayload,
  buildPaperCustomSizePayload,
  buildPriceAuditEntry,
  buildQuotePayload,
  buildUserProfilePayload,
  buildVendorEstimatePayload,
} from './payloads'

export async function listCollection(collectionName) {
  if (isStandaloneMode()) return localListCollection(collectionName)
  const snapshot = await getDocs(collection(db, collectionName))
  return snapshot.docs.map((document) => ({ id: document.id, ...document.data() }))
}

export async function listCategories() {
  if (isStandaloneMode()) return localListCategories()
  const snapshot = await getDocs(collection(db, COLLECTIONS.categories))
  return snapshot.docs.map((document) => ({ id: document.id, ...document.data() }))
}

export async function listPriceItems() {
  if (isStandaloneMode()) return localListPriceItems()
  const snapshot = await getDocs(collection(db, COLLECTIONS.priceItems))
  return snapshot.docs.map((document) => ({ id: document.id, ...document.data() }))
}

export async function listActivePriceItems() {
  if (isStandaloneMode()) return localListActivePriceItems()
  const snapshot = await getDocs(
    query(collection(db, COLLECTIONS.priceItems), where('active', '==', true)),
  )
  return snapshot.docs.map((document) => ({ id: document.id, ...document.data() }))
}

export async function listRecentPriceAuditEntries(maxEntries = 10) {
  if (isStandaloneMode()) return localListRecentPriceAuditEntries(maxEntries)
  const snapshot = await getDocs(
    query(collection(db, COLLECTIONS.priceAuditEntries), orderBy('editedAt', 'desc'), limit(maxEntries)),
  )
  return snapshot.docs.map((document) => ({ id: document.id, ...document.data() }))
}

export async function getUserProfile(uid) {
  if (isStandaloneMode() || uid?.startsWith('local-')) return localGetUserProfile(uid)
  const snapshot = await getDoc(doc(db, COLLECTIONS.users, uid))
  return snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } : null
}

export async function getUserProfileCount() {
  if (isStandaloneMode()) {
    const users = await localListUsers()
    return users.length
  }
  const snapshot = await getDocs(collection(db, COLLECTIONS.users))
  return snapshot.size
}

export async function seedDefaultCatalog(editedBy) {
  if (isStandaloneMode()) return localSeedDefaultCatalog(editedBy)
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
  if (isStandaloneMode() || profile?.uid?.startsWith('local-')) return localSaveUserProfile(profile)
  const payload = buildUserProfilePayload(profile)
  await setDoc(doc(db, COLLECTIONS.users, profile.uid), payload)
  return payload
}

export async function updateUserProfile(uid, changes) {
  if (isStandaloneMode() || uid?.startsWith('local-')) return localUpdateUserProfile(uid, changes)
  const payload = { ...changes, updatedAt: new Date().toISOString() }
  await updateDoc(doc(db, COLLECTIONS.users, uid), payload)
  return payload
}

export async function savePriceItem(priceItem, editedBy, previous = {}) {
  if (isStandaloneMode()) return localSavePriceItem(priceItem, editedBy, previous)
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
  if (isStandaloneMode()) return localDeactivatePriceItem(priceItem, editedBy)
  return savePriceItem({ ...priceItem, active: false }, editedBy, priceItem)
}

export async function saveEstimate(estimateInput) {
  if (isStandaloneMode()) return localSaveEstimate(estimateInput)
  const payload = buildEstimatePayload(estimateInput)
  await setDoc(doc(db, COLLECTIONS.quotes, payload.id), payload)
  return payload
}

export async function saveQuote(quoteInput) {
  if (isStandaloneMode()) return localSaveQuote(quoteInput)
  const payload = buildQuotePayload(quoteInput)
  await setDoc(doc(db, COLLECTIONS.quotes, payload.id), payload)
  return payload
}

export async function listEstimates() {
  if (isStandaloneMode()) return localListEstimates()
  const snapshot = await getDocs(query(collection(db, COLLECTIONS.quotes), orderBy('date', 'desc')))
  return snapshot.docs.map((document) => ({ id: document.id, ...document.data() }))
}

export async function listQuotes() {
  return listEstimates()
}

export async function deleteEstimate(estimateId) {
  if (isStandaloneMode()) return localDeleteEstimate(estimateId)
  await deleteDoc(doc(db, COLLECTIONS.quotes, estimateId))
}

export async function deleteEstimatesBulk(estimateIds) {
  if (isStandaloneMode()) return localDeleteEstimatesBulk(estimateIds)
  await Promise.all(estimateIds.map((id) => deleteDoc(doc(db, COLLECTIONS.quotes, id))))
}

export async function getSsoAccess(uid) {
  if (isStandaloneMode() || uid?.startsWith('local-')) {
    return {
      id: uid,
      appId: 'rab-calc',
      centralUid: uid,
      grantVersion: 1,
      role: uid === 'local-estimator-uid' ? 'estimator' : 'admin',
      enabled: true,
    }
  }
  const snapshot = await getDoc(doc(db, 'ssoAccess', uid))
  return snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } : null
}

export function subscribeToSsoAccess(uid, onValue, onError) {
  if (isStandaloneMode() || uid?.startsWith('local-')) {
    onValue({
      id: uid,
      appId: 'rab-calc',
      centralUid: uid,
      grantVersion: 1,
      role: uid === 'local-estimator-uid' ? 'estimator' : 'admin',
      enabled: true,
    })
    return () => {}
  }
  return onSnapshot(
    doc(db, 'ssoAccess', uid),
    (snapshot) => onValue(snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } : null),
    onError,
  )
}

export async function listActualCosts() {
  if (isStandaloneMode()) return localListActualCosts()
  const snapshot = await getDocs(collection(db, COLLECTIONS.actualCosts))
  return snapshot.docs.map((document) => ({ id: document.id, ...document.data() }))
}

export async function getActualCost(estimateId) {
  if (isStandaloneMode()) return localGetActualCost(estimateId)
  const snapshot = await getDoc(doc(db, COLLECTIONS.actualCosts, estimateId))
  return snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } : null
}

export async function saveActualCost(actualCost) {
  if (isStandaloneMode()) return localSaveActualCost(actualCost)
  await setDoc(doc(db, COLLECTIONS.actualCosts, actualCost.estimateId), actualCost)
  return actualCost
}

export async function listVendorEstimates() {
  if (isStandaloneMode()) return localListVendorEstimates()
  const snapshot = await getDocs(query(collection(db, COLLECTIONS.vendorEstimates), orderBy('updatedAt', 'desc')))
  return snapshot.docs.map((document) => ({ id: document.id, ...document.data() }))
}

export async function getVendorEstimate(vendorEstimateId) {
  if (isStandaloneMode()) return localGetVendorEstimate(vendorEstimateId)
  const snapshot = await getDoc(doc(db, COLLECTIONS.vendorEstimates, vendorEstimateId))
  return snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } : null
}

export async function saveVendorEstimate(input) {
  if (isStandaloneMode()) return localSaveVendorEstimate(input)
  const payload = buildVendorEstimatePayload(input)
  await setDoc(doc(db, COLLECTIONS.vendorEstimates, payload.id), payload)
  return payload
}

export async function deleteVendorEstimate(vendorEstimateId) {
  if (isStandaloneMode()) return localDeleteVendorEstimate(vendorEstimateId)
  await deleteDoc(doc(db, COLLECTIONS.vendorEstimates, vendorEstimateId))
}

export async function getPaperCalculatorDraft(userId) {
  if (isStandaloneMode()) return localGetPaperCalculatorDraft(userId)
  const snapshot = await getDoc(doc(db, COLLECTIONS.paperCalculatorDrafts, userId))
  return snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } : null
}

export async function savePaperCalculatorDraft(userId, workspace) {
  if (isStandaloneMode()) return localSavePaperCalculatorDraft(userId, workspace)
  const payload = buildPaperCalculatorDraftPayload({ userId, ...workspace })
  await setDoc(doc(db, COLLECTIONS.paperCalculatorDrafts, userId), payload)
  return payload
}

export async function listPaperCalculations() {
  if (isStandaloneMode()) return localListPaperCalculations()
  const snapshot = await getDocs(query(collection(db, COLLECTIONS.paperCalculations), orderBy('createdAt', 'desc')))
  return snapshot.docs.map((document) => ({ id: document.id, ...document.data() }))
}

export async function savePaperCalculation(input) {
  if (isStandaloneMode()) return localSavePaperCalculation(input)
  const payload = buildPaperCalculationPayload(input)
  await setDoc(doc(db, COLLECTIONS.paperCalculations, payload.id), payload)
  return payload
}

export async function deletePaperCalculation(calculationId) {
  if (isStandaloneMode()) return localDeletePaperCalculation(calculationId)
  await deleteDoc(doc(db, COLLECTIONS.paperCalculations, calculationId))
}

export async function listPaperCustomSizes() {
  if (isStandaloneMode()) return localListPaperCustomSizes()
  const snapshot = await getDocs(query(collection(db, COLLECTIONS.paperCustomSizes), orderBy('createdAt', 'asc')))
  return snapshot.docs.map((document) => ({ id: document.id, ...document.data() }))
}

export async function savePaperCustomSize(input) {
  if (isStandaloneMode()) return localSavePaperCustomSize(input)
  const payload = buildPaperCustomSizePayload(input)
  await setDoc(doc(db, COLLECTIONS.paperCustomSizes, payload.id), payload)
  return payload
}

export async function deletePaperCustomSize(sizeId) {
  if (isStandaloneMode()) return localDeletePaperCustomSize(sizeId)
  await deleteDoc(doc(db, COLLECTIONS.paperCustomSizes, sizeId))
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
  if (isStandaloneMode()) return []
  const snapshot = await getDocs(collection(db, USER_INVITES_COLLECTION))
  return snapshot.docs.map((document) => ({ id: document.id, ...document.data(), pending: true }))
}

export async function getUserInviteByEmail(email) {
  if (isStandaloneMode()) return null
  const snapshot = await getDoc(doc(db, USER_INVITES_COLLECTION, getAllowlistDocId(email)))
  return snapshot.exists() ? { id: snapshot.id, ...snapshot.data(), pending: true } : null
}

export async function saveUserInvite({ email, role = 'Admin', status = 'active', invitedBy = 'system' }) {
  if (isStandaloneMode()) return buildInviteProfile(email, role, status, invitedBy)
  const payload = buildInviteProfile(email, role, status, invitedBy)
  await setDoc(doc(db, USER_INVITES_COLLECTION, getAllowlistDocId(payload.email)), payload)
  await addAllowedEmail(payload.email, invitedBy)
  return payload
}

export async function getAllowlistEmails() {
  if (isStandaloneMode()) return ['admin@local.test', 'estimator@local.test']
  const snapshot = await getDocs(collection(db, EMAIL_ALLOWLIST_COLLECTION))
  return snapshot.docs.map((document) => document.data().email).filter(Boolean).map(normalizeEmail)
}

export async function addAllowedEmail(email, addedBy) {
  if (isStandaloneMode()) return
  const normalizedEmail = normalizeEmail(email)
  const payload = {
    email: normalizedEmail,
    addedBy,
    addedAt: new Date().toISOString(),
  }
  await setDoc(doc(db, EMAIL_ALLOWLIST_COLLECTION, getAllowlistDocId(normalizedEmail)), payload)
}

export async function removeAllowedEmail(email) {
  if (isStandaloneMode()) return
  await deleteDoc(doc(db, EMAIL_ALLOWLIST_COLLECTION, getAllowlistDocId(email)))
}

export async function ensureInitialAllowlistEmails(addedBy = 'system') {
  if (isStandaloneMode()) return
  await Promise.all(
    INITIAL_ALLOWLIST_EMAILS.map(async (email) => {
      const ref = doc(db, USER_INVITES_COLLECTION, getAllowlistDocId(email))
      const snapshot = await getDoc(ref)
      if (snapshot.exists()) return
      await saveUserInvite({ email, role: 'Admin', status: 'active', invitedBy: addedBy })
    }),
  )
}
