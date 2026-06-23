'use client'
import { useEffect } from 'react'

export const RemoveDarkModeProvider = ({ children }: { children: React.ReactNode }) => {
  useEffect(() => {
    const html = document.documentElement
    
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'data-theme' && html.getAttribute('data-theme') !== 'light') {
          html.setAttribute('data-theme', 'light')
        }
      })
    })

    observer.observe(html, { attributes: true })
    html.setAttribute('data-theme', 'light')
    
    return () => observer.disconnect()
  }, [])

  return <>{children}</>
}
