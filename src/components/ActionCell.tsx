'use client'

import React from 'react'
import { IconButton, Tooltip } from '@mui/material'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'

export const ActionField = () => null; // We don't render anything in the actual edit form

export const ActionCell = (props: any) => {
  const { rowData } = props
  const router = useRouter()
  const pathname = usePathname()

  // Payload 3 passes collectionSlug, but if not we can extract it from the URL
  const slug = props.collectionSlug || pathname.split('/')[3]
  const id = rowData?.id

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    
    if (confirm('Tem certeza que deseja excluir este registro?')) {
      try {
        const res = await fetch(`/api/${slug}/${id}`, {
          method: 'DELETE',
        })
        if (res.ok) {
          // Refresh the page or trigger Payload's internal list refresh
          window.location.reload()
        } else {
          alert('Erro ao excluir o registro.')
        }
      } catch (err) {
        console.error(err)
      }
    }
  }

  if (!id) return null

  const editUrl = `/admin/collections/${slug}/${id}`

  return (
    <div style={{ display: 'flex', gap: '8px' }}>
      <Tooltip title="Editar">
        <Link href={editUrl} passHref style={{ textDecoration: 'none' }}>
          <IconButton size="small" color="primary" onClick={(e) => e.stopPropagation()}>
            <EditIcon fontSize="small" />
          </IconButton>
        </Link>
      </Tooltip>
      
      <Tooltip title="Excluir">
        <IconButton size="small" color="error" onClick={handleDelete}>
          <DeleteIcon fontSize="small" />
        </IconButton>
      </Tooltip>
    </div>
  )
}
