/**
 * Biblioteca para geração de eventos eSocial em formato JSON.
 * Suporta os leiautes:
 * - S-2210: Comunicação de Acidente de Trabalho (CAT)
 * - S-2220: Monitoramento da Saúde do Trabalhador (ASO)
 * - S-2240: Condições Ambientais do Trabalho (Fatores de Risco / EPIs)
 */

export interface FuncionarioESocial {
  nome: string
  cpf: string
  cargo: string
  setor: string
  matricula?: string
}

export interface EmpresaESocial {
  razaoSocial: string
  cnpj: string
  tipo: 'privado' | 'publico'
}

export interface ExameESocial {
  tipoExame: string
  dataExame: string
  validade: string
  status: 'apto' | 'inapto'
  crmMedico?: string
  ufMedico?: string
}

export interface AcidenteESocial {
  dataAcidente: string
  tipoAcidente: '1' | '2' | '3' // 1: Típico, 2: Doença, 3: Trajeto
  localAcidente: string
  parteCorpo?: string
  descricaoCAT?: string
}

/**
 * Gera o JSON para o evento S-2210: Comunicação de Acidente de Trabalho (CAT)
 */
export function gerarS2210(
  funcionario: FuncionarioESocial,
  empresa: EmpresaESocial,
  acidente: AcidenteESocial
) {
  const cnpjLimpo = empresa.cnpj.replace(/\D/g, '')
  const cpfLimpo = funcionario.cpf.replace(/\D/g, '')

  return {
    eSocial: {
      envio: {
        ideEmissor: {
          tpInsc: 1, // CNPJ
          nrInsc: cnpjLimpo,
        },
      },
      evento: {
        id: `ID1${cnpjLimpo}${new Date().toISOString().replace(/\D/g, '').substring(0, 14)}00001`,
        evtCAT: {
          ideEvento: {
            indRetif: 1, // Original
            tpAmb: 2, // Produção restrita / Homologação
            procEmi: 1, // Aplicativo do empregador
            verProc: '1.0.0',
          },
          ideEmpregador: {
            tpInsc: 1,
            nrInsc: cnpjLimpo,
          },
          ideVinculo: {
            cpfTrab: cpfLimpo,
            matricula: funcionario.matricula || 'MAT-ESOC-903',
          },
          cat: {
            dtAcit: acidente.dataAcidente,
            tpAcit: parseInt(acidente.tipoAcidente),
            localAcidente: {
              tpLocal: 1, // Estabelecimento do empregador no Brasil
              dscLocal: acidente.localAcidente,
            },
            parteAtingida: {
              codParte: acidente.parteCorpo || '702080000', // Código padrão para parte do corpo
              lateralidade: 0, // Não aplicável
            },
            detalheCAT: {
              codSit: '1010100', // Situação geradora padrão
              dscSit: acidente.descricaoCAT || 'Queda ou acidente no local de trabalho',
            },
          },
        },
      },
    },
  }
}

/**
 * Gera o JSON para o evento S-2220: Monitoramento da Saúde do Trabalhador
 */
export function gerarS2220(
  funcionario: FuncionarioESocial,
  empresa: EmpresaESocial,
  exame: ExameESocial
) {
  const cnpjLimpo = empresa.cnpj.replace(/\D/g, '')
  const cpfLimpo = funcionario.cpf.replace(/\D/g, '')

  // Mapeamento simples do tipo de exame para códigos do eSocial
  let tpExameOcup = 1 // 1: Admissional
  if (exame.tipoExame === 'periodico') tpExameOcup = 2
  else if (exame.tipoExame === 'retorno_trabalho') tpExameOcup = 3
  else if (exame.tipoExame === 'mudanca_funcao') tpExameOcup = 4
  else if (exame.tipoExame === 'demissional') tpExameOcup = 0

  return {
    eSocial: {
      envio: {
        ideEmissor: {
          tpInsc: 1,
          nrInsc: cnpjLimpo,
        },
      },
      evento: {
        id: `ID1${cnpjLimpo}${new Date().toISOString().replace(/\D/g, '').substring(0, 14)}00002`,
        evtMonit: {
          ideEvento: {
            indRetif: 1,
            tpAmb: 2,
            procEmi: 1,
            verProc: '1.0.0',
          },
          ideEmpregador: {
            tpInsc: 1,
            nrInsc: cnpjLimpo,
          },
          ideVinculo: {
            cpfTrab: cpfLimpo,
          },
          aso: {
            dtAso: exame.dataExame,
            resAso: exame.status === 'apto' ? 'A' : 'I', // A: Apto, I: Inapto
            medico: {
              nmMed: 'Dr. Roberto Macário de Oliveira',
              nrCrm: exame.crmMedico || '90346',
              ufCrm: exame.ufMedico || 'RO',
            },
            exame: [
              {
                dtEx: exame.dataExame,
                procRealizado: '0234', // Código padrão do procedimento de avaliação clínica
                obsProc: 'Avaliação física geral e anamnese ocupacional',
                ordExame: tpExameOcup,
              },
            ],
          },
        },
      },
    },
  }
}

/**
 * Gera o JSON para o evento S-2240: Condições Ambientais do Trabalho - Fatores de Risco
 */
export function gerarS2240(
  funcionario: FuncionarioESocial,
  empresa: EmpresaESocial
) {
  const cnpjLimpo = empresa.cnpj.replace(/\D/g, '')
  const cpfLimpo = funcionario.cpf.replace(/\D/g, '')

  return {
    eSocial: {
      envio: {
        ideEmissor: {
          tpInsc: 1,
          nrInsc: cnpjLimpo,
        },
      },
      evento: {
        id: `ID1${cnpjLimpo}${new Date().toISOString().replace(/\D/g, '').substring(0, 14)}00003`,
        evtCondEv: {
          ideEvento: {
            indRetif: 1,
            tpAmb: 2,
            procEmi: 1,
            verProc: '1.0.0',
          },
          ideEmpregador: {
            tpInsc: 1,
            nrInsc: cnpjLimpo,
          },
          ideVinculo: {
            cpfTrab: cpfLimpo,
          },
          infoAmb: {
            dtIniCond: new Date().toISOString().split('T')[0],
            localAmb: [
              {
                tpLocal: 1, // Estabelecimento do empregador
                dscSetor: funcionario.setor,
              },
            ],
            agenteNoc: [
              {
                codAgNoc: '09.01.001', // Código eSocial para "Ausência de fator de risco ou atividades previstas no Anexo IV do Regulamento da Previdência Social"
                dscAgNoc: 'Ausência de agentes nocivos físicos, químicos ou biológicos acima do limite de tolerância legal.',
                epcEpi: {
                  utilizEp: 0, // Não se aplica (sem risco)
                },
              },
            ],
          },
        },
      },
    },
  }
}

/**
 * Gera todos os eventos em um único objeto de lote
 */
export function gerarLoteEventos(
  funcionario: FuncionarioESocial,
  empresa: EmpresaESocial,
  ultimoExame?: ExameESocial,
  acidente?: AcidenteESocial
) {
  const lote: any = {
    empresa: empresa.razaoSocial,
    cnpj: empresa.cnpj,
    funcionario: funcionario.nome,
    cpf: funcionario.cpf,
    eventos: [],
  }

  // S-2240 sempre gerado (Fatores de risco ambientais padrão)
  lote.eventos.push(gerarS2240(funcionario, empresa))

  // S-2220 gerado se houver informações de exames
  if (ultimoExame) {
    lote.eventos.push(gerarS2220(funcionario, empresa, ultimoExame))
  }

  // S-2210 gerado se houver histórico de acidente recente
  if (acidente) {
    lote.eventos.push(gerarS2210(funcionario, empresa, acidente))
  }

  return lote
}
