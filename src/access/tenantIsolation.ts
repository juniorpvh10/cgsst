import type { Access } from 'payload'

export const isAdmin: Access = ({ req: { user } }) => {
  return Boolean(user && user.role === 'admin')
}

export const tenantAccessForCollection = (empresaField = 'empresa'): Access => {
  return ({ req: { user } }): any => {
    if (!user) return false
    if (user.role === 'admin') return true

    const empresaId = user.empresa && typeof user.empresa === 'object' ? user.empresa.id : user.empresa
    if (!empresaId) return false

    if (empresaField === 'id') {
      return {
        id: {
          equals: empresaId,
        },
      }
    }

    return {
      [empresaField]: {
        equals: empresaId,
      },
    }
  }
}

export const tenantCreateAccess: Access = ({ req: { user } }) => {
  if (!user) return false
  if (user.role === 'admin') return true
  return Boolean(user.empresa)
}
