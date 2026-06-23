'use client'

import React from 'react'
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material'

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#2563eb', // Premium Royal Blue
      dark: '#1d4ed8',
      light: '#60a5fa',
    },
    secondary: {
      main: '#10b981', // Emerald Green (Safety/Health)
      dark: '#059669',
    },
    background: {
      default: '#f4f6f8',
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: '"Inter", system-ui, -apple-system, sans-serif',
    button: {
      textTransform: 'uppercase',
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0px 2px 4px -1px rgba(0,0,0,0.2),0px 4px 5px 0px rgba(0,0,0,0.14),0px 1px 10px 0px rgba(0,0,0,0.12)',
          },
        },
      },
    },
  },
})

export default function MuiProvider({ children }: { children?: React.ReactNode }) {
  return (
    <ThemeProvider theme={theme}>
      {/* 
        CssBaseline kickstarts an elegant, consistent, and simple baseline to build upon.
        However, since Payload CMS has its own CSS reset, we should be careful.
        In this case, we only want MUI's ThemeProvider to wrap the app, so we don't include
        CssBaseline directly here to avoid wiping out Payload's native layout entirely.
        We just want MUI components (like our Sidebar) to use this theme.
      */}
      {children}
    </ThemeProvider>
  )
}
