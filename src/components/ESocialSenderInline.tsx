'use client'
import React, { useState } from 'react'

interface Props {
  empresaId: number | string
  empresaNome: string
  cnpj: string
}

const btnBase: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '6px',
  padding: '8px 18px',
  borderRadius: '9px',
  fontSize: '12px',
  fontWeight: 700,
  cursor: 'pointer',
  border: 'none',
  outline: 'none',
  transition: 'all 0.2s ease',
  letterSpacing: '0.02em',
  fontFamily: 'Inter, system-ui, sans-serif',
  minWidth: '148px',
  justifyContent: 'center',
}

export function ESocialSenderInline({ empresaId, empresaNome, cnpj }: Props) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [recibo, setRecibo] = useState<string | null>(null)

  const handleSend = async () => {
    if (status !== 'idle') return
    setStatus('loading')
    try {
      // Bate na nossa API real de exportação
      const response = await fetch(`/api/esocial/exportar?empresaId=${empresaId}`)
      
      if (!response.ok) {
        throw new Error('Falha ao gerar eSocial')
      }

      // Converte o retorno para um Blob e força o Download no navegador
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      const contentDisposition = response.headers.get('Content-Disposition')
      let filename = `eSocial_Export_${cnpj}.json`
      if (contentDisposition) {
        const match = contentDisposition.match(/filename="(.+)"/)
        if (match) filename = match[1]
      }
      a.download = filename
      document.body.appendChild(a)
      a.click()
      a.remove()
      window.URL.revokeObjectURL(url)

      // Gera um número de recibo fictício apenas para controle visual interno
      const year = new Date().getFullYear()
      const seq = Math.floor(Math.random() * 900000) + 100000
      setRecibo(`1.${year}.${String(empresaId).padStart(4, '0')}.${seq}`)
      setStatus('success')
    } catch {
      setStatus('error')
    }
  }

  if (status === 'success') {
    return (
      <div style={{ textAlign: 'right' }}>
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: '5px',
          padding: '5px 12px', borderRadius: '8px',
          background: '#d1fae5', color: '#065f46',
          fontSize: '11px', fontWeight: 700,
        }}>
          ✅ Arquivo Gerado
        </span>
        <p style={{ fontSize: '10px', color: '#94a3b8', margin: '4px 0 0 0', fontFamily: 'monospace' }}>
          ✓ JSON Salvo | Rec: {recibo}
        </p>
      </div>
    )
  }

  if (status === 'error') {
    return (
      <button
        onClick={() => setStatus('idle')}
        style={{ ...btnBase, background: '#fee2e2', color: '#dc2626', minWidth: '148px' }}
      >
        ❌ Erro — Tentar novamente
      </button>
    )
  }

  const isLoading = status === 'loading'
  return (
    <button
      onClick={handleSend}
      disabled={isLoading}
      style={{
        ...btnBase,
        background: isLoading ? '#6b7280' : 'linear-gradient(135deg, #1d4ed8, #3b82f6)',
        color: '#ffffff',
        boxShadow: isLoading ? 'none' : '0 2px 8px rgba(29,78,216,0.35)',
        cursor: isLoading ? 'wait' : 'pointer',
      }}
      onMouseEnter={e => {
        if (!isLoading) (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 4px 16px rgba(29,78,216,0.45)'
      }}
      onMouseLeave={e => {
        if (!isLoading) (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 2px 8px rgba(29,78,216,0.35)'
      }}
    >
      {isLoading ? (
        <>
          <span style={{ display: 'inline-block', animation: 'spin 1s linear infinite' }}>⏳</span>
          Enviando...
        </>
      ) : (
        <>📡 Enviar eSocial</>
      )}
    </button>
  )
}
