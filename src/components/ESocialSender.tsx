'use client'

import React, { useState } from 'react'
import { Send, CheckCircle2, Loader2, AlertCircle } from 'lucide-react'

interface ESocialSenderProps {
  empresaId: string | number
  empresaNome: string
  cnpj: string
}

type SendingState = 'idle' | 'xml' | 'signing' | 'transmitting' | 'success' | 'error'

export function ESocialSender({ empresaId, empresaNome, cnpj }: ESocialSenderProps) {
  const [status, setStatus] = useState<SendingState>('idle')
  const [receipt, setReceipt] = useState<string | null>(null)

  const handleSend = async () => {
    if (status !== 'idle' && status !== 'success' && status !== 'error') return

    // Sequence of mock states
    setStatus('xml')
    
    await new Promise((resolve) => setTimeout(resolve, 800))
    setStatus('signing')
    
    await new Promise((resolve) => setTimeout(resolve, 800))
    setStatus('transmitting')
    
    await new Promise((resolve) => setTimeout(resolve, 1000))
    
    // Simulate successful transmission
    const randomReceipt = `1.2026.0611.${Math.floor(100000 + Math.random() * 900000)}`
    setReceipt(randomReceipt)
    setStatus('success')
  }

  return (
    <div className="flex items-center justify-between gap-4 py-2">
      <div className="flex flex-col gap-0.5">
        {status === 'success' && receipt && (
          <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 px-2.5 py-0.5 rounded-full border border-emerald-200/50 dark:border-emerald-900/50">
            Recibo: {receipt}
          </span>
        )}
        {status === 'idle' && (
          <span className="text-xs text-zinc-500">Pronto para transmissão</span>
        )}
        {status === 'xml' && (
          <span className="text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1.5 font-medium animate-pulse">
            <Loader2 className="h-3 w-3 animate-spin" />
            Gerando XML S-2220/2240...
          </span>
        )}
        {status === 'signing' && (
          <span className="text-xs text-cyan-600 dark:text-cyan-400 flex items-center gap-1.5 font-medium animate-pulse">
            <Loader2 className="h-3 w-3 animate-spin" />
            Assinando com Certificado...
          </span>
        )}
        {status === 'transmitting' && (
          <span className="text-xs text-blue-600 dark:text-blue-400 flex items-center gap-1.5 font-medium animate-pulse">
            <Loader2 className="h-3 w-3 animate-spin" />
            Transmitindo para o Governo...
          </span>
        )}
      </div>

      <button
        onClick={handleSend}
        disabled={status !== 'idle' && status !== 'success'}
        className={`relative flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-all duration-300 ${
          status === 'success'
            ? 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-md shadow-emerald-600/10'
            : status === 'idle'
            ? 'bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-800 dark:hover:bg-zinc-700 shadow-sm'
            : 'bg-zinc-100 text-zinc-400 dark:bg-zinc-900 dark:text-zinc-600 cursor-not-allowed border border-zinc-200/50 dark:border-zinc-800/50'
        }`}
      >
        {status === 'success' ? (
          <>
            <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
            Transmitido
          </>
        ) : status === 'idle' ? (
          <>
            <Send className="h-3.5 w-3.5 shrink-0" />
            Enviar eSocial
          </>
        ) : (
          <>
            <Loader2 className="h-3.5 w-3.5 shrink-0 animate-spin" />
            Processando
          </>
        )}
      </button>
    </div>
  )
}
