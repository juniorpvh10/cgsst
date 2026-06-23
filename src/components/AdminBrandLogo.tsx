import React from 'react'
import { Shield } from 'lucide-react'

export default function AdminBrandLogo() {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12,
      fontFamily: "'Inter', system-ui, sans-serif",
    }}>
      <div style={{
        width: 44, height: 44,
        background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)',
        borderRadius: 13,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 4px 16px rgba(37,99,235,0.4)',
      }}>
        <Shield size={24} color="#fff" />
      </div>
      <div>
        <div style={{ fontSize: 22, fontWeight: 900, color: '#0f172a', letterSpacing: '-0.5px', lineHeight: 1 }}>
          CG SST
        </div>
        <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 500, marginTop: 2 }}>
          Saúde &amp; Segurança do Trabalho
        </div>
      </div>
    </div>
  )
}
