import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import { pt } from '@payloadcms/translations/languages/pt'
import { vercelBlobStorage } from '@payloadcms/storage-vercel-blob'

import { Users } from './src/collections/Users'
import { Empresas } from './src/collections/Empresas'
import { Funcionarios } from './src/collections/Funcionarios'
import { LaudosSST } from './src/collections/LaudosSST'
import { Media } from './src/collections/Media'
import { LogsAuditoria } from './src/collections/LogsAuditoria'
import { ExamesMedicos } from './src/collections/ExamesMedicos'
import { Notificacoes } from './src/collections/Notificacoes'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  telemetry: false,
  routes: {
    api: '/api/payload',
  },
  i18n: {
    supportedLanguages: { pt },
    fallbackLanguage: 'pt',
    translations: {
      pt: {
        general: {
          untitled: 'Novo Registro',
        },
      },
    },
  },
  admin: {
    user: Users.slug,
    theme: 'light',
    dateFormat: 'dd/MM/yyyy HH:mm',
    meta: {
      titleSuffix: '— CG SST',
      description: 'Sistema de Gerenciamento de Saúde e Segurança do Trabalho',
    },
    components: {
      Nav: '/src/components/AdminNav.tsx',
      providers: ['/src/components/MuiProvider.tsx'],
      graphics: {
        Icon: '/src/components/AdminBrandIcon.tsx',
        Logo: '/src/components/AdminBrandLogo.tsx',
      },
      views: {
        dashboard: {
          Component: '/src/components/DashboardAdmin.tsx',
        },
      },
    },
  },
  collections: [Users, Empresas, Funcionarios, LaudosSST, Media, LogsAuditoria, ExamesMedicos, Notificacoes],
  editor: lexicalEditor({}),
  plugins: [
    vercelBlobStorage({
      collections: {
        media: true,
      },
      token: process.env.BLOB_READ_WRITE_TOKEN,
    }),
  ],
  secret: process.env.PAYLOAD_SECRET || '',
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URI || '',
    },
  }),
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
})
