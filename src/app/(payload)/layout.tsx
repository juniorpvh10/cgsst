import { handleServerFunctions, RootLayout } from '@payloadcms/next/layouts'
import React from 'react'
import '@payloadcms/next/css'
import './admin.css'

import config from '@payload-config'
import { importMap } from './admin/importMap'
import type { ServerFunctionClient } from 'payload'
import { RemoveDarkModeProvider } from '../../components/RemoveDarkModeProvider'

type Args = {
  children: React.ReactNode
}

const serverFunction: ServerFunctionClient = async function (args) {
  "use server";
  return handleServerFunctions({
    ...args,
    config,
    importMap,
  });
};

const Layout = ({ children }: Args) => {
  // Forcing Next.js to recompile to pick up admin.css changes
  return (
    <RootLayout config={config} importMap={importMap} serverFunction={serverFunction}>
      <RemoveDarkModeProvider>
        {children}
      </RemoveDarkModeProvider>
    </RootLayout>
  )
}

export default Layout
