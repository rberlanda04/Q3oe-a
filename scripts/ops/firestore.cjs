/**
 * Leitura e escrita administrativa no Firestore de produção.
 * Ignora as regras de segurança: use com cuidado.
 *
 * Uso:
 *   npm run ops:firestore -- ler admins/UID
 *   npm run ops:firestore -- listar interesses
 *   npm run ops:firestore -- gravar admins/UID '{"nome":"Fulano"}'
 *   npm run ops:firestore -- apagar contatos/ID
 */
const { firestore } = require('./google.cjs')

;(async () => {
  const [acao, caminho, json] = process.argv.slice(2)
  if (acao === 'ler') console.log(JSON.stringify(await firestore.ler(caminho), null, 2))
  else if (acao === 'listar') console.log(JSON.stringify(await firestore.listar(caminho), null, 2))
  else if (acao === 'gravar') {
    await firestore.gravar(caminho, JSON.parse(json))
    console.log(`Gravado em ${caminho}.`)
  } else if (acao === 'apagar') {
    await firestore.apagar(caminho)
    console.log(`Apagado ${caminho}.`)
  } else {
    console.log('Ações: ler, listar, gravar, apagar. Veja o comentário no topo do arquivo.')
    process.exit(1)
  }
})().catch((e) => {
  console.error('Erro:', e.message)
  process.exit(1)
})
