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
  React.useEffect(() => {
    if (typeof window === 'undefined') return

    const updatePasswordFields = () => {
      const passwordInputs = document.querySelectorAll(
        'input[type="password"], input[data-is-password="true"]'
      )
      passwordInputs.forEach((element) => {
        const input = element as HTMLInputElement
        
        // If we already handled it, skip
        if (input.classList.contains('has-password-toggle')) return
        input.classList.add('has-password-toggle')

        const wrap = input.parentElement
        if (!wrap) return

        // Create button
        const button = document.createElement('button')
        button.type = 'button'
        button.className = 'password-toggle-btn'
        button.setAttribute('aria-label', 'Mostrar senha')

        const eyeOpenSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-eye"><path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0z"/><circle cx="12" cy="12" r="3"/></svg>`
        const eyeClosedSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-eye-off"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.52 13.52 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" x2="22" y1="2" y2="22"/></svg>`

        button.innerHTML = eyeOpenSvg

        // Add toggle functionality
        let isVisible = false
        button.addEventListener('click', (e) => {
          e.preventDefault()
          e.stopPropagation()
          isVisible = !isVisible

          if (isVisible) {
            input.setAttribute('type', 'text')
            input.setAttribute('data-is-password', 'true')
            button.innerHTML = eyeClosedSvg
            button.setAttribute('aria-label', 'Ocultar senha')
          } else {
            input.setAttribute('type', 'password')
            button.innerHTML = eyeOpenSvg
            button.setAttribute('aria-label', 'Mostrar senha')
          }
        })

        wrap.appendChild(button)
      })
    }

    // Run initially
    updatePasswordFields()

    // Watch for mutations
    const observer = new MutationObserver(updatePasswordFields)
    observer.observe(document.body, { childList: true, subtree: true })

    return () => {
      observer.disconnect()
    }
  }, [])

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
