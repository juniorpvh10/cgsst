import type { CollectionConfig } from 'payload'
import { tenantAccessForCollection, tenantCreateAccess } from '../access/tenantIsolation'
import { auditoriaField } from '../fields/auditoria'
import { populateAuditoriaHook, createAuditLogHook } from '../hooks/auditLog'

export const Notificacoes: CollectionConfig = {
  slug: 'notificacoes',
  labels: {
    singular: 'Notificação',
    plural: 'Notificações',
  },
  admin: {
    useAsTitle: 'titulo',
    defaultColumns: ['titulo', 'empresa', 'tipo', 'lida', 'createdAt', 'acoes'],
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
      name: 'titulo',
      type: 'text',
      required: true,
      label: 'Título',
    },
    {
      name: 'mensagem',
      type: 'textarea',
      required: true,
      label: 'Mensagem',
    },
    {
      name: 'lida',
      type: 'checkbox',
      defaultValue: false,
      required: true,
      label: 'Lida',
    },
    {
      name: 'tipo',
      type: 'select',
      defaultValue: 'alerta',
      required: true,
      options: [
        { label: 'Alerta', value: 'alerta' },
        { label: 'Informação', value: 'info' },
        { label: 'Erro', value: 'erro' },
      ],
      label: 'Tipo de Notificação',
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
        if (data && req.user && req.user.role !== 'admin' && !data.empresa) {
          data.empresa = req.user.empresa && typeof req.user.empresa === 'object' ? req.user.empresa.id : req.user.empresa
        }
        return data
      },
    ],
    afterChange: [createAuditLogHook('notificacoes')],
  },
}
