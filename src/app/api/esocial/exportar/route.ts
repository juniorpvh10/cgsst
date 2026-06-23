import { getPayload } from 'payload'
import config from '@payload-config'
import { NextResponse } from 'next/server'
import { gerarLoteEventos, FuncionarioESocial, EmpresaESocial, ExameESocial } from '@/lib/esocial'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const empresaId = searchParams.get('empresaId')

  if (!empresaId) {
    return NextResponse.json({ error: 'empresaId é obrigatório' }, { status: 400 })
  }

  const payload = await getPayload({ config })

  try {
    // 1. Fetch Empresa
    const empresaRes = await payload.findByID({
      collection: 'empresas',
      id: empresaId,
    })

    if (!empresaRes) {
      return NextResponse.json({ error: 'Empresa não encontrada' }, { status: 404 })
    }

    const empresaESocial: EmpresaESocial = {
      razaoSocial: empresaRes.razaoSocial,
      cnpj: empresaRes.cnpj,
      tipo: 'privado',
    }

    // 2. Fetch Funcionarios da Empresa
    const funcionariosRes = await payload.find({
      collection: 'funcionarios',
      where: {
        empresa: { equals: empresaId },
      },
      limit: 1000,
    })

    const lotes = []

    // 3. Para cada Funcionario, buscar o Exame Médico mais recente
    for (const func of funcionariosRes.docs) {
      const funcESocial: FuncionarioESocial = {
        nome: func.nome,
        cpf: func.cpf,
        cargo: func.cargo,
        setor: func.setor,
        matricula: undefined,
      }

      // Buscar Exames
      const examesRes = await payload.find({
        collection: 'exames-medicos',
        where: {
          funcionario: { equals: func.id },
        },
        sort: '-dataExame',
        limit: 1,
      })

      let exameESocial: ExameESocial | undefined = undefined
      if (examesRes.docs.length > 0) {
        const exame = examesRes.docs[0]
        exameESocial = {
          tipoExame: exame.tipoExame,
          dataExame: new Date(exame.dataExame).toISOString().split('T')[0],
          validade: new Date(exame.validade).toISOString().split('T')[0],
          status: exame.status,
          crmMedico: exame.crmMedico || '00000',
          ufMedico: exame.ufMedico || 'RO',
        }
      }

      // Gera os eventos (S-2220 e S-2240)
      const loteFunc = gerarLoteEventos(funcESocial, empresaESocial, exameESocial)
      lotes.push(loteFunc)
    }

    // 4. Return as a downloadable JSON file
    const fileContent = JSON.stringify({ lotes }, null, 2)
    
    return new NextResponse(fileContent, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="eSocial_Export_${empresaRes.cnpj}_${new Date().toISOString().split('T')[0]}.json"`,
      },
    })

  } catch (error) {
    console.error('Erro ao gerar exportação eSocial:', error)
    return NextResponse.json({ error: 'Erro interno ao gerar o arquivo' }, { status: 500 })
  }
}
