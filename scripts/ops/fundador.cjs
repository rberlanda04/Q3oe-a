/**
 * Ativa ou renova o Pro de um profissional pelo e-mail da conta.
 * Uso: npm run ops:fundador -- email@exemplo.com [meses=3]
 *
 * Soma os meses ao fim do período atual, se ainda houver Pro ativo.
 * Mesma regra de novaValidade() em src/domain/plano.ts.
 */
const { firestore, contas } = require('./google.cjs')

function novaValidade(atual, agora, meses) {
  const base = new Date(Math.max(atual ?? 0, agora))
  const dia = base.getDate()
  base.setMonth(base.getMonth() + meses)
  if (base.getDate() < dia) base.setDate(0)
  return base.getTime()
}

;(async () => {
  const [email, mesesTexto = '3'] = process.argv.slice(2)
  const meses = Number(mesesTexto)
  if (!email || !Number.isInteger(meses) || meses < 1 || meses > 24) {
    console.log('Uso: npm run ops:fundador -- email@exemplo.com [meses de 1 a 24, padrão 3]')
    process.exit(1)
  }
  const conta = await contas.porEmail(email)
  if (!conta) {
    console.log(`Nenhuma conta com o e-mail ${email}. A pessoa precisa se cadastrar no app primeiro.`)
    process.exit(1)
  }
  const atual = await firestore.ler(`assinaturas/${conta.localId}`)
  const perfil = await firestore.ler(`users/${conta.localId}`)
  const validoAte = novaValidade(atual?.validoAte, Date.now(), meses)
  await firestore.gravar(`assinaturas/${conta.localId}`, {
    plano: 'pro',
    validoAte,
    nome: perfil?.nome || conta.displayName || '',
    email,
    periodo: 'mensal',
    origem: 'fundador',
    atualizadoEm: Date.now(),
  })
  console.log(`Pro de ${email} ativo até ${new Date(validoAte).toLocaleDateString('pt-BR')} (${meses} ${meses === 1 ? 'mês' : 'meses'}).`)
})().catch((e) => {
  console.error('Erro:', e.message)
  process.exit(1)
})
