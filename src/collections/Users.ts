import type { CollectionConfig } from 'payload'

export const Users: CollectionConfig = {
  slug: 'users',
  labels: {
    singular: 'Usuário',
    plural: 'Usuários',
  },
  auth: true,
  admin: {
    useAsTitle: 'email',
    defaultColumns: ['email', 'role', 'empresa', 'acoes'],
  },
  access: {
    read: ({ req: { user } }): any => {
      if (!user) return false
      if (user.role === 'admin') return true
      const empresaId = user.empresa && typeof user.empresa === 'object' ? user.empresa.id : user.empresa
      if (empresaId) {
        return {
          empresa: {
            equals: empresaId,
          },
        }
      }
      return {
        id: {
          equals: user.id,
        },
      }
    },
    create: ({ req: { user } }) => !user || user.role === 'admin', // Allow initial user creation if no one is logged in, then restrict to admins
    update: ({ req: { user } }) => Boolean(user && (user.role === 'admin' || user.id)),
    delete: ({ req: { user } }) => Boolean(user && user.role === 'admin'),
  },
  fields: [
    {
      name: 'role',
      type: 'select',
      defaultValue: 'user',
      required: true,
      options: [
        { label: 'Administrador', value: 'admin' },
        { label: 'Usuário Cliente', value: 'user' },
      ],
    },
    {
      name: 'empresa',
      type: 'relationship',
      relationTo: 'empresas',
      required: false, // Optional for global admins
      admin: {
        position: 'sidebar',
      },
    },
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
}
