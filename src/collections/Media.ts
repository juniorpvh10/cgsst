import type { CollectionConfig } from 'payload'
import { tenantAccessForCollection, tenantCreateAccess } from '../access/tenantIsolation'

export const Media: CollectionConfig = {
  slug: 'media',
  labels: {
    singular: 'Mídia',
    plural: 'Mídias',
  },
  upload: {
    staticDir: 'media',
    mimeTypes: ['application/pdf', 'image/*'],
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
      required: false,
      admin: {
        position: 'sidebar',
      },
    },
  ],
  hooks: {
    beforeValidate: [
      async ({ data, req }) => {
        if (data && req.user && req.user.role !== 'admin') {
          data.empresa = req.user.empresa && typeof req.user.empresa === 'object' ? req.user.empresa.id : req.user.empresa
        }
        return data
      },
    ],
  },
}
