import { getAnalytics, isSupported, type Analytics } from 'firebase/analytics'
import { initializeApp } from 'firebase/app'
import { connectAuthEmulator, getAuth } from 'firebase/auth'
import {
  connectFirestoreEmulator,
  initializeFirestore,
  memoryLocalCache,
  persistentLocalCache,
  persistentMultipleTabManager,
} from 'firebase/firestore'

/**
 * Build de teste (VITE_EMULADORES=1): usa os emuladores locais do Firebase,
 * no projeto de demonstração "demo-q3orca". Nunca vale em produção.
 */
export const USANDO_EMULADORES = import.meta.env.VITE_EMULADORES === '1'

// A configuração web do Firebase é pública por natureza.
// A segurança dos dados vem das regras em firestore.rules.
const firebaseConfig = USANDO_EMULADORES
  ? { apiKey: 'chave-de-emulador', authDomain: 'demo-q3orca.firebaseapp.com', projectId: 'demo-q3orca', appId: 'demo' }
  : {
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
if (USANDO_EMULADORES) connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true })

// Cache local persistente: o app continua funcionando sem internet
// e sincroniza quando a conexão volta.
export const db = initializeFirestore(app, {
  // Campos opcionais sem valor (undefined) são simplesmente omitidos.
  ignoreUndefinedProperties: true,
  // No build (pré-renderização em Node) não há IndexedDB; usa cache em memória.
  localCache:
    typeof window === 'undefined' || USANDO_EMULADORES
      ? memoryLocalCache()
      : persistentLocalCache({ tabManager: persistentMultipleTabManager() }),
})
if (USANDO_EMULADORES) connectFirestoreEmulator(db, '127.0.0.1', 8080)

// Analytics só existe no navegador e só quando o ambiente permite (bloqueadores, modo privado).
export const analytics: Promise<Analytics | null> =
  typeof window === 'undefined' || USANDO_EMULADORES
    ? Promise.resolve(null)
    : isSupported()
        .then((ok) => (ok ? getAnalytics(app) : null))
        .catch(() => null)
