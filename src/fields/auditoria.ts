import type { Field } from 'payload'

export const auditoriaField: Field = {
  name: 'auditoria',
  type: 'group',
  admin: {
    readOnly: true,
    position: 'sidebar',
  },
  fields: [
    {
      name: 'usuario',
      type: 'relationship',
      relationTo: 'users',
      required: false,
    },
    {
      name: 'dataAlteracao',
      type: 'date',
      required: false,
    },
  ],
}
