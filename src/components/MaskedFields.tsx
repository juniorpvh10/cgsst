'use client'

import React, { ChangeEvent } from 'react'
import { useField, FieldLabel } from '@payloadcms/ui'

export const CpfField: React.FC<any> = (props) => {
  const { path, readOnly, required, field } = props
  const { value, setValue, showError, errorMessage } = useField<string>({ path })

  const formatCPF = (val: string) => {
    if (!val) return ''
    let v = val.replace(/\D/g, '')
    if (v.length > 11) v = v.slice(0, 11)
    if (v.length > 9) v = v.replace(/(\d{3})(\d{3})(\d{3})(\d{1,2})/, '$1.$2.$3-$4')
    else if (v.length > 6) v = v.replace(/(\d{3})(\d{3})(\d{1,3})/, '$1.$2.$3')
    else if (v.length > 3) v = v.replace(/(\d{3})(\d{1,3})/, '$1.$2')
    return v
  }

  return (
    <div className={`field-type text ${showError ? 'error' : ''}`} style={{ marginBottom: '24px' }}>
      <FieldLabel htmlFor={`field-${path}`} label={field?.label || 'CPF'} required={required} />
      <input
        id={`field-${path}`}
        type="text"
        value={value || ''}
        onChange={(e) => setValue(formatCPF(e.target.value))}
        readOnly={readOnly}
        placeholder="000.000.000-00"
        style={{
          width: '100%',
          padding: '12px 16px',
          borderRadius: '8px',
          border: showError ? '1px solid #ef4444' : '1px solid #cbd5e1',
          fontSize: '15px',
          backgroundColor: readOnly ? '#f8fafc' : '#ffffff',
          color: '#0f172a',
          outline: 'none',
          boxShadow: '0 1px 2px rgba(0,0,0,0.02) inset',
        }}
      />
      {showError && <div style={{ color: '#ef4444', fontSize: '13px', marginTop: '4px' }}>{errorMessage}</div>}
    </div>
  )
}

export const CnpjField: React.FC<any> = (props) => {
  const { path, readOnly, required, field } = props
  const { value, setValue, showError, errorMessage } = useField<string>({ path })

  const formatCNPJ = (val: string) => {
    if (!val) return ''
    let v = val.replace(/\D/g, '')
    if (v.length > 14) v = v.slice(0, 14)
    if (v.length > 12) v = v.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{1,2})/, '$1.$2.$3/$4-$5')
    else if (v.length > 8) v = v.replace(/(\d{2})(\d{3})(\d{3})(\d{1,4})/, '$1.$2.$3/$4')
    else if (v.length > 5) v = v.replace(/(\d{2})(\d{3})(\d{1,3})/, '$1.$2.$3')
    else if (v.length > 2) v = v.replace(/(\d{2})(\d{1,3})/, '$1.$2')
    return v
  }

  return (
    <div className={`field-type text ${showError ? 'error' : ''}`} style={{ marginBottom: '24px' }}>
      <FieldLabel htmlFor={`field-${path}`} label={field?.label || 'CNPJ'} required={required} />
      <input
        id={`field-${path}`}
        type="text"
        value={value || ''}
        onChange={(e) => setValue(formatCNPJ(e.target.value))}
        readOnly={readOnly}
        placeholder="00.000.000/0000-00"
        style={{
          width: '100%',
          padding: '12px 16px',
          borderRadius: '8px',
          border: showError ? '1px solid #ef4444' : '1px solid #cbd5e1',
          fontSize: '15px',
          backgroundColor: readOnly ? '#f8fafc' : '#ffffff',
          color: '#0f172a',
          outline: 'none',
          boxShadow: '0 1px 2px rgba(0,0,0,0.02) inset',
        }}
      />
      {showError && <div style={{ color: '#ef4444', fontSize: '13px', marginTop: '4px' }}>{errorMessage}</div>}
    </div>
  )
}

export const TelefoneField: React.FC<any> = (props) => {
  const { path, readOnly, required, field } = props
  const { value, setValue, showError, errorMessage } = useField<string>({ path })

  const formatTelefone = (val: string) => {
    if (!val) return ''
    let v = val.replace(/\D/g, '')
    if (v.length > 11) v = v.slice(0, 11)
    
    if (v.length > 10) {
      v = v.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')
    } else if (v.length > 6) {
      v = v.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3')
    } else if (v.length > 2) {
      v = v.replace(/(\d{2})(\d{0,5})/, '($1) $2')
    }
    return v
  }

  return (
    <div className={`field-type text ${showError ? 'error' : ''}`} style={{ marginBottom: '24px' }}>
      <FieldLabel htmlFor={`field-${path}`} label={field?.label || 'Contato'} required={required} />
      <input
        id={`field-${path}`}
        type="text"
        value={value || ''}
        onChange={(e) => setValue(formatTelefone(e.target.value))}
        readOnly={readOnly}
        placeholder="(00) 00000-0000"
        style={{
          width: '100%',
          padding: '12px 16px',
          borderRadius: '8px',
          border: showError ? '1px solid #ef4444' : '1px solid #cbd5e1',
          fontSize: '15px',
          backgroundColor: readOnly ? '#f8fafc' : '#ffffff',
          color: '#0f172a',
          outline: 'none',
          boxShadow: '0 1px 2px rgba(0,0,0,0.02) inset',
        }}
      />
      {showError && <div style={{ color: '#ef4444', fontSize: '13px', marginTop: '4px' }}>{errorMessage}</div>}
    </div>
  )
}
