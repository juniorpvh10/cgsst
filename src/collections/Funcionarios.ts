import type { CollectionConfig } from 'payload'
import { tenantAccessForCollection, tenantCreateAccess } from '../access/tenantIsolation'
import { auditoriaField } from '../fields/auditoria'
import { populateAuditoriaHook, createAuditLogHook } from '../hooks/auditLog'

export const Funcionarios: CollectionConfig = {
  slug: 'funcionarios',
  labels: {
    singular: 'Funcionário',
    plural: 'Funcionários',
  },
  admin: {
    useAsTitle: 'nome',
    defaultColumns: ['nome', 'cpf', 'cargo', 'empresa', 'setor', 'acoes'],
  },
  access: {
    read: tenantAccessForCollection('empresa'),
    update: tenantAccessForCollection('empresa'),
    delete: tenantAccessForCollection('empresa'),
    create: tenantCreateAccess,
  },
  fields: [
    {
      name: 'cpf',
      type: 'text',
      required: true,
      unique: true,
      label: 'CPF',
      validate: (val: string | null | undefined) => {
        if (!val) return true
        return /^\d{3}\.\d{3}\.\d{3}\-\d{2}$|^\d{11}$/.test(val) || 'Apenas números ou formato CPF válido (000.000.000-00)'
      },
      admin: {
        components: {
          Field: '/src/components/MaskedFields.tsx#CpfField',
        },
      },
    },
    {
      name: 'nome',
      type: 'text',
      required: true,
      label: 'Nome Completo',
      validate: (val: string | null | undefined) => {
        if (!val) return true
        return /^[A-Za-zÀ-ÖØ-öø-ÿ\s'´\-]+$/.test(val) || 'O nome deve conter apenas letras e espaços (sem números)'
      },
    },
    {
      name: 'cargo',
      type: 'text',
      required: true,
      label: 'Cargo',
    },
    {
      name: 'empresa',
      type: 'relationship',
      relationTo: 'empresas',
      required: true,
      label: 'Empresa',
    },
    {
      name: 'setor',
      type: 'text',
      required: true,
      label: 'Setor',
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
      // Auto-assign empresa for non-admins to prevent spoofing
      async ({ data, req }) => {
        if (data && req.user && req.user.role !== 'admin') {
          data.empresa = req.user.empresa && typeof req.user.empresa === 'object' ? req.user.empresa.id : req.user.empresa
        }
        return data
      },
    ],
    afterChange: [createAuditLogHook('funcionarios')],
  },
}
