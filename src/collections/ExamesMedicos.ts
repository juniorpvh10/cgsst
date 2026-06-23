import type { CollectionConfig } from 'payload'
import { tenantAccessForCollection, tenantCreateAccess } from '../access/tenantIsolation'
import { auditoriaField } from '../fields/auditoria'
import { populateAuditoriaHook, createAuditLogHook } from '../hooks/auditLog'

export const ExamesMedicos: CollectionConfig = {
  slug: 'exames-medicos',
  labels: {
    singular: 'Exame Médico',
    plural: 'Exames Médicos',
  },
  admin: {
    useAsTitle: 'tipoExame',
    defaultColumns: ['funcionario', 'tipoExame', 'dataExame', 'validade', 'status', 'acoes'],
  },
  access: {
    read: tenantAccessForCollection('empresa'),
    update: tenantAccessForCollection('empresa'),
    delete: tenantAccessForCollection('empresa'),
    create: tenantCreateAccess,
  },
  fields: [
    {
      name: 'funcionario',
      type: 'relationship',
      relationTo: 'funcionarios',
      required: true,
      label: 'Funcionário',
    },
    {
      name: 'empresa',
      type: 'relationship',
      relationTo: 'empresas',
      required: true,
      admin: {
        readOnly: true,
        position: 'sidebar',
      },
      label: 'Empresa',
    },
    {
      name: 'tipoExame',
      type: 'select',
      required: true,
      options: [
        { label: 'Admissional', value: 'admissional' },
        { label: 'Periódico', value: 'periodico' },
        { label: 'Retorno ao Trabalho', value: 'retorno_trabalho' },
        { label: 'Mudança de Função', value: 'mudanca_funcao' },
        { label: 'Demissional', value: 'demissional' },
      ],
      label: 'Tipo de Exame',
    },
    {
      name: 'dataExame',
      type: 'date',
      required: true,
      label: 'Data de Realização',
    },
    {
      name: 'validade',
      type: 'date',
      required: true,
      label: 'Data de Validade (ASO)',
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      options: [
        { label: 'Apto', value: 'apto' },
        { label: 'Inapto', value: 'inapto' },
      ],
      label: 'Resultado (Aptidão)',
    },
    {
      name: 'crmMedico',
      type: 'text',
      label: 'CRM do Médico Examinador',
      validate: (val: string | null | undefined) => {
        if (!val) return true
        return /^[A-Za-z0-9]+$/.test(val) || 'Apenas números e letras permitidos no CRM (sem símbolos)'
      },
    },
    {
      name: 'ufMedico',
      type: 'text',
      label: 'UF do CRM',
      admin: {
        description: 'Exemplo: RO, SP, RJ',
      },
      validate: (val: string | null | undefined) => {
        if (!val) return true
        return /^[A-Za-z]{2}$/.test(val) || 'A UF deve conter exatamente 2 letras (Ex: SP)'
      },
    },
    auditoriaField,
    {
      name: 'acoes',
      type: 'ui',
      label: 'Ações',
      admin: {
        components: {
          Field: '/src/components/ActionCell.tsx#ActionField',
          Cell: '/src/components/ActionCell.tsx#ActionCell',
        },
      },
    },
  ],
  hooks: {
    beforeValidate: [
      populateAuditoriaHook,
      // Auto-populate empresa relation based on associated employee
      async ({ data, req }) => {
        if (data && data.funcionario) {
          try {
            const funcionario = await req.payload.findByID({
              collection: 'funcionarios',
              id: data.funcionario,
            })
            if (funcionario) {
              data.empresa = typeof funcionario.empresa === 'object' ? funcionario.empresa.id : funcionario.empresa
            }
          } catch (err) {
            console.error('Erro ao buscar funcionário no hook de ExamesMedicos:', err)
          }
        }
        return data
      },
    ],
    afterChange: [createAuditLogHook('exames-medicos')],
  },
}
