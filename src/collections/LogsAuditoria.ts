import type { CollectionConfig } from 'payload'
import { tenantAccessForCollection, isAdmin } from '../access/tenantIsolation'

export const LogsAuditoria: CollectionConfig = {
  slug: 'logs-auditoria',
  labels: {
    singular: 'Log de Auditoria',
    plural: 'Logs de Auditoria',
  },
  admin: {
    useAsTitle: 'onde',
    defaultColumns: ['onde', 'quem', 'quando'],
  },
  access: {
    read: tenantAccessForCollection('empresa'),
    create: () => true, // Hook context will trigger creation
    update: () => false, // Immutable audit logs
    delete: isAdmin,     // Only admins can delete logs, or make it false for absolute immutability
  },
  fields: [
    {
      name: 'quem',
      type: 'relationship',
      relationTo: 'users',
      required: false,
    },
    {
      name: 'onde',
      type: 'text',
      required: true,
    },
    {
      name: 'quando',
      type: 'date',
      required: true,
    },
    {
      name: 'valorAnterior',
      type: 'json',
      required: false,
    },
    {
      name: 'valorNovo',
      type: 'json',
      required: false,
    },
    {
      name: 'empresa',
      type: 'relationship',
      relationTo: 'empresas',
      required: false,
      admin: {
        position: 'sidebar',
      },
    },
  ],
}
