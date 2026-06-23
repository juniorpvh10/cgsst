import type { Payload } from 'payload'

export async function verificarEGerarNotificacoes(payload: Payload) {
  const now = new Date()
  const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)

  try {
    // 1. Fetch exams expiring in less than 30 days (validade > now and validade <= 30 days)
    const examesRes = await payload.find({
      collection: 'exames-medicos',
      where: {
        and: [
          { validade: { greater_than: now.toISOString() } },
          { validade: { less_than_equal: thirtyDaysFromNow.toISOString() } },
        ],
      },
      limit: 100,
      depth: 2, // Populate funcionario and empresa relationships
    })

    const examesExpiring = examesRes.docs

    for (const exame of examesExpiring) {
      const funcionario = exame.funcionario
      const empresa = exame.empresa

      if (!funcionario || !empresa) continue

      const funcionarioId = typeof funcionario === 'object' ? funcionario.id : funcionario
      const funcionarioNome = typeof funcionario === 'object' ? funcionario.nome : 'Funcionário'
      const empresaId = typeof empresa === 'object' ? empresa.id : empresa
      const tipoExameFormatado = exame.tipoExame === 'periodico' 
        ? 'Periódico' 
        : exame.tipoExame === 'admissional' 
        ? 'Admissional' 
        : exame.tipoExame === 'demissional' 
        ? 'Demissional' 
        : 'Ocupacional'

      const diasRestantes = Math.ceil(
        (new Date(exame.validade).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      )

      const titulo = `Alerta: Exame Ocupacional Vencendo - ${funcionarioNome}`
      const mensagem = `O exame médico (${tipoExameFormatado}) do funcionário ${funcionarioNome} irá vencer em ${diasRestantes} dias (validade: ${new Date(exame.validade).toLocaleDateString('pt-BR')}). Favor agendar a reavaliação.`

      // 2. Check if notification already exists for this title and company
      const notificacoesExistentes = await payload.find({
        collection: 'notificacoes',
        where: {
          and: [
            { empresa: { equals: empresaId } },
            { titulo: { equals: titulo } },
          ],
        },
        limit: 1,
      })

      // 3. Create the notification if it doesn't exist
      if (notificacoesExistentes.docs.length === 0) {
        await payload.create({
          collection: 'notificacoes',
          data: {
            empresa: empresaId,
            titulo,
            mensagem,
            lida: false,
            tipo: 'alerta',
          },
        })
        console.log(`[AlertScanner] Nova notificação registrada para ${funcionarioNome} (Empresa ID: ${empresaId})`)
      }
    }
  } catch (error) {
    console.error('[AlertScanner] Erro ao escanear exames e gerar notificações:', error)
  }
}
