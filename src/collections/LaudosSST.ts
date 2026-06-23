import type { CollectionConfig } from 'payload'
import { tenantAccessForCollection, tenantCreateAccess } from '../access/tenantIsolation'
import { auditoriaField } from '../fields/auditoria'
import { populateAuditoriaHook, createAuditLogHook } from '../hooks/auditLog'

export const LaudosSST: CollectionConfig = {
  slug: 'laudos-sst',
  labels: {
    singular: 'Laudo SST',
    plural: 'Laudos SST',
  },
  admin: {
    useAsTitle: 'tipoLaudo',
    defaultColumns: ['tipoLaudo', 'empresa', 'validade', 'acoes'],
  },
  access: {
    read: tenantAccessForCollection('empresa'),
    update: tenantAccessForCollection('empresa'),
    delete: tenantAccessForCollection('empresa'),
    create: tenantCreateAccess,
  },
  fields: [
    {
      name: 'empresa',
      type: 'relationship',
      relationTo: 'empresas',
      required: true,
      label: 'Empresa',
    },
    {
      name: 'tipoLaudo',
      type: 'text',
      required: true,
      label: 'Tipo de Laudo',
    },
    {
      name: 'validade',
      type: 'date',
      required: true,
      label: 'Validade',
    },
    {
      name: 'arquivoPdf',
      type: 'upload',
      relationTo: 'media',
      required: true,
      label: 'Arquivo PDF',
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
    afterChange: [createAuditLogHook('laudos-sst')],
  },
}
