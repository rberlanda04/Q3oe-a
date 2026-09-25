import { getAnalytics, isSupported } from 'firebase/analytics'
import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import {
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
} from 'firebase/firestore'

// A configuração web do Firebase é pública por natureza.
// A segurança dos dados vem das regras em firestore.rules.
const firebaseConfig = {
  apiKey: 'AIzaSyBdjEcOdEoNIuenwzbYsTnfF2ZF_OkrtjA',
  authDomain: 'q3orca.firebaseapp.com',
  projectId: 'q3orca',
  storageBucket: 'q3orca.firebasestorage.app',
  messagingSenderId: '599421577050',
  appId: '1:599421577050:web:532db59d214dc3e6c6f563',
  measurementId: 'G-D2N9C81JBC',
}

export const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)

// Cache local persistente: o app continua funcionando sem internet
// e sincroniza quando a conexão volta.
export const db = initializeFirestore(app, {
  // Campos opcionais sem valor (undefined) são simplesmente omitidos.
  ignoreUndefinedProperties: true,
  localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }),
})

isSupported()
  .then((ok) => {
    if (ok) getAnalytics(app)
  })
  .catch(() => {})
