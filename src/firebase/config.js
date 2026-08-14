const stagingConfig = {
  apiKey: 'AIzaSyDldXl7LRGYqXi7w_ODt1mzOb9ia5Q0pjo',
  authDomain: 'rab-staging.firebaseapp.com',
  projectId: 'rab-staging',
  storageBucket: 'rab-staging.firebasestorage.app',
  messagingSenderId: '864604425340',
  appId: '1:864604425340:web:40dbf681f64e47abb70df9',
}

export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || stagingConfig.apiKey,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || stagingConfig.authDomain,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || stagingConfig.projectId,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || stagingConfig.storageBucket,
  messagingSenderId:
    import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || stagingConfig.messagingSenderId,
  appId: import.meta.env.VITE_FIREBASE_APP_ID || stagingConfig.appId,
}
