/**
 * Prepara e roda o teste de pagamento nos emuladores (npm run test:pagamento).
 * Cria os arquivos locais de teste das funções, se ainda não existirem.
 * Eles só valem no emulador e não vão para o Git nem para produção.
 */
import { spawnSync } from 'node:child_process'
import { existsSync, writeFileSync } from 'node:fs'

if (!existsSync('functions/.secret.local')) {
  writeFileSync('functions/.secret.local', 'ABACATEPAY_API_KEY=chave-de-teste\nABACATEPAY_WEBHOOK_SECRET=segredo-de-teste\n')
}
if (!existsSync('functions/.env.local')) {
  writeFileSync('functions/.env.local', 'ABACATEPAY_URL=http://127.0.0.1:4999/v2\n')
}

const resultado = spawnSync(
  'firebase emulators:exec --only auth,firestore,functions --project demo-q3orca "node tests/pagamento-emulador.mjs"',
  {
    stdio: 'inherit',
    shell: true,
    // A pasta do projeto pode ser lenta (OneDrive); dá tempo para as funções carregarem.
    env: { ...process.env, FUNCTIONS_DISCOVERY_TIMEOUT: '120' },
  },
)
process.exit(resultado.status ?? 1)
