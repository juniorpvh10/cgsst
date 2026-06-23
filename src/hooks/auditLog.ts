import type { CollectionBeforeValidateHook, CollectionAfterChangeHook } from 'payload'

export const populateAuditoriaHook: CollectionBeforeValidateHook = async ({ data, req }) => {
  if (!data) return data

  data.auditoria = {
    usuario: req.user ? req.user.id : null,
    dataAlteracao: new Date().toISOString(),
  }

  return data
}

export const createAuditLogHook = (collectionSlug: string): CollectionAfterChangeHook => {
  return async ({ doc, previousDoc, operation, req }) => {
    // Prevent infinite loop recursion
    if (req.context?.triggeringAuditLog) return

    try {
      let empresaId = null
      if (collectionSlug === 'empresas') {
        empresaId = doc.id
      } else if (doc.empresa) {
        empresaId = typeof doc.empresa === 'object' ? doc.empresa.id : doc.empresa
      } else if (req.user) {
        empresaId = req.user.empresa && typeof req.user.empresa === 'object' ? req.user.empresa.id : req.user.empresa
      }

      req.context.triggeringAuditLog = true
      await req.payload.create({
        collection: 'logs-auditoria',
        data: {
          quem: req.user ? req.user.id : null,
          onde: collectionSlug,
          quando: new Date().toISOString(),
          valorAnterior: operation === 'update' ? previousDoc : null,
          valorNovo: doc,
          empresa: empresaId,
        },
      })
    } catch (error) {
      req.payload.logger.error(`Erro ao gravar Log de Auditoria para ${collectionSlug}: ${error instanceof Error ? error.message : String(error)}`)
    } finally {
      req.context.triggeringAuditLog = false
    }
  }
}
