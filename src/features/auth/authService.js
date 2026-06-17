import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth'
import { auth } from '../../firebase/app'

export function subscribeToAuthState(callback) {
  return onAuthStateChanged(auth, callback)
}

export async function signInWithEmail({ email, password }) {
  return signInWithEmailAndPassword(auth, email, password)
}

export async function signUpWithEmail({ email, password }) {
  return createUserWithEmailAndPassword(auth, email, password)
}

export async function signOutUser() {
  return signOut(auth)
}
