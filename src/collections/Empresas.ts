import type { CollectionConfig } from 'payload'
import { tenantAccessForCollection, isAdmin, tenantCreateAccess } from '../access/tenantIsolation'
import { auditoriaField } from '../fields/auditoria'
import { populateAuditoriaHook, createAuditLogHook } from '../hooks/auditLog'

export const Empresas: CollectionConfig = {
  slug: 'empresas',
  labels: {
    singular: 'Empresa',
    plural: 'Empresas',
  },
  admin: {
    useAsTitle: 'razaoSocial',
    defaultColumns: ['razaoSocial', 'cnpj', 'tipo', 'acoes'],
  },
  access: {
    read: tenantAccessForCollection('id'),
    update: tenantAccessForCollection('id'),
    delete: isAdmin,
    create: tenantCreateAccess,
  },
  fields: [
    {
      name: 'cnpj',
      type: 'text',
      required: true,
      unique: true,
      label: 'CNPJ',
      validate: (val: string | null | undefined) => {
        if (!val) return true
        return /^\d{2}\.\d{3}\.\d{3}\/\d{4}\-\d{2}$|^\d{14}$/.test(val) || 'Apenas números ou formato CNPJ (00.000.000/0000-00)'
      },
      admin: {
        components: {
          Field: '/src/components/MaskedFields.tsx#CnpjField',
        },
      },
    },
    {
      name: 'razaoSocial',
      type: 'text',
      required: true,
      label: 'Razão Social',
    },
    {
      name: 'tipo',
      type: 'select',
      required: true,
      options: [
        { label: 'Privado', value: 'privado' },
        { label: 'Público', value: 'publico' },
      ],
      label: 'Tipo de Empresa',
    },
    {
      name: 'contato',
      type: 'text',
      label: 'Contato',
      validate: (val: string | null | undefined) => {
        if (!val) return true
        const plain = val.replace(/\D/g, '')
        return plain.length >= 10 || 'Telefone inválido. Digite o DDD e o número corretamente.'
      },
      admin: {
        components: {
          Field: '/src/components/MaskedFields.tsx#TelefoneField',
        },
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
    beforeValidate: [populateAuditoriaHook],
    afterChange: [createAuditLogHook('empresas')],
  },
}
