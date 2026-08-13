import { readFile } from 'node:fs/promises'
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
} from '@firebase/rules-unit-testing'
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore'

const rules = await readFile('firestore.rules', 'utf8')
const environment = await initializeTestEnvironment({
  projectId: 'rab-calc-rules-test',
  firestore: { host: '127.0.0.1', port: 8080, rules },
})

function session(uid, role, overrides = {}) {
  return environment.authenticatedContext(uid, {
    email: `${uid}@example.com`,
    email_verified: true,
    portalAccess: true,
    appId: 'rab-calc',
    ssoVersion: 2,
    centralUid: `central-${uid}`,
    grantVersion: 1,
    role,
    ...overrides,
  })
}

const estimator = session('estimator', 'estimator')
const admin = session('admin', 'admin')
const stale = session('stale', 'estimator', { grantVersion: 1 })
const mismatched = session('mismatch', 'estimator', {
  centralUid: 'wrong-central',
})
const direct = environment.authenticatedContext('direct', {
  email: 'direct@example.com',
  email_verified: true,
})

try {
  await environment.withSecurityRulesDisabled(async (context) => {
    const db = context.firestore()
    for (const [uid, role, version] of [
      ['estimator', 'estimator', 1],
      ['admin', 'admin', 1],
      ['stale', 'estimator', 2],
      ['mismatch', 'estimator', 1],
    ]) {
      await setDoc(doc(db, 'ssoAccess', uid), {
        appId: 'rab-calc',
        centralUid: `central-${uid}`,
        grantVersion: version,
        role,
        enabled: true,
      })
      await setDoc(doc(db, 'users', uid), {
        uid,
        role: role === 'admin' ? 'Admin' : 'Estimator',
        status: 'active',
      })
    }
    await setDoc(doc(db, 'categories', 'print'), { name: 'Print' })
  })

  await assertSucceeds(getDoc(doc(estimator.firestore(), 'categories', 'print')))
  await assertSucceeds(getDoc(doc(estimator.firestore(), 'users', 'estimator')))
  await assertFails(getDoc(doc(direct.firestore(), 'categories', 'print')))
  await assertFails(getDoc(doc(stale.firestore(), 'categories', 'print')))
  await assertFails(getDoc(doc(mismatched.firestore(), 'categories', 'print')))
  await assertFails(
    updateDoc(doc(estimator.firestore(), 'users', 'estimator'), {
      role: 'Admin',
    }),
  )
  await assertFails(
    updateDoc(doc(estimator.firestore(), 'ssoAccess', 'estimator'), {
      role: 'admin',
    }),
  )
  await assertFails(
    setDoc(doc(estimator.firestore(), 'priceItems', 'forged'), {
      name: 'Forged price',
    }),
  )
  await assertSucceeds(
    setDoc(doc(admin.firestore(), 'priceItems', 'valid'), {
      name: 'Managed price',
    }),
  )

  await environment.withSecurityRulesDisabled(async (context) => {
    await updateDoc(doc(context.firestore(), 'ssoAccess', 'estimator'), {
      enabled: false,
      grantVersion: 2,
    })
  })
  await assertFails(getDoc(doc(estimator.firestore(), 'categories', 'print')))
  console.log('RAB-Calc Firestore Rules: all checks passed.')
} finally {
  await environment.cleanup()
}
