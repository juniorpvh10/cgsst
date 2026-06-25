'use client'

import React, { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  Box,
  Divider,
  IconButton,
  Avatar,
  useTheme,
  useMediaQuery,
  AppBar,
} from '@mui/material'
import MenuIcon from '@mui/icons-material/Menu'
import DashboardIcon from '@mui/icons-material/Dashboard'
import BusinessIcon from '@mui/icons-material/Business'
import PeopleIcon from '@mui/icons-material/People'
import LocalHospitalIcon from '@mui/icons-material/LocalHospital'
import DescriptionIcon from '@mui/icons-material/Description'
import NotificationsIcon from '@mui/icons-material/Notifications'
import FactCheckIcon from '@mui/icons-material/FactCheck'
import PermMediaIcon from '@mui/icons-material/PermMedia'
import SecurityIcon from '@mui/icons-material/Security'
import PeopleAltIcon from '@mui/icons-material/PeopleAlt'
import ExitToAppIcon from '@mui/icons-material/ExitToApp'

const drawerWidth = 260

const NAV_GROUPS = [
  {
    label: 'Visão Geral',
    items: [
      { href: '/admin', icon: <DashboardIcon />, label: 'Dashboard', exact: true },
    ],
  },
  {
    label: 'Gestão',
    items: [
      { href: '/admin/collections/empresas', icon: <BusinessIcon />, label: 'Empresas' },
      { href: '/admin/collections/funcionarios', icon: <PeopleIcon />, label: 'Funcionários' },
      { href: '/admin/collections/exames-medicos', icon: <LocalHospitalIcon />, label: 'Exames Médicos' },
      { href: '/admin/collections/laudos-sst', icon: <DescriptionIcon />, label: 'Laudos SST' },
    ],
  },
  {
    label: 'Sistema',
    items: [
      { href: '/admin/collections/notificacoes', icon: <NotificationsIcon />, label: 'Notificações' },
      { href: '/admin/collections/logs-auditoria', icon: <FactCheckIcon />, label: 'Logs de Auditoria' },
      { href: '/admin/collections/media', icon: <PermMediaIcon />, label: 'Mídias' },
      { href: '/admin/collections/users', icon: <PeopleAltIcon />, label: 'Usuários' },
    ],
  },
]

export default function AdminNav() {
  const pathname = usePathname()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const [mobileOpen, setMobileOpen] = useState(false)
  const [headerNode, setHeaderNode] = useState<Element | null>(null)

  useEffect(() => {
    // Find the Payload native header content area to inject the logout button
    const node = document.querySelector('.app-header__content')
    if (node) setHeaderNode(node)
  }, [pathname])

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen)
  }

  const isActive = (href: string, exact = false) => {
    if (exact || href === '/admin') return pathname === href
    return pathname.startsWith(href)
  }

  const drawerContent = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', bgcolor: '#0f172a', color: '#f8fafc' }}>
      <Toolbar sx={{ px: 2, display: 'flex', alignItems: 'center', mt: 1, mb: 1, width: '100%', boxSizing: 'border-box' }}>
        <Avatar sx={{ bgcolor: 'primary.main', width: 40, height: 40, boxShadow: '0 4px 10px rgba(37,99,235,0.4)', mr: 1.5, flexShrink: 0 }}>
          <SecurityIcon fontSize="small" />
        </Avatar>
        <Box sx={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
          <Typography variant="subtitle1" noWrap sx={{ fontWeight: 'bold', lineHeight: 1.2, color: '#ffffff', letterSpacing: '-0.02em', fontSize: '18px' }}>
            CG SST
          </Typography>
          <Typography variant="caption" noWrap sx={{ display: 'block', color: '#94a3b8', fontWeight: 500, fontSize: '13px' }}>
            Saúde & Segurança
          </Typography>
        </Box>
      </Toolbar>
      <Divider sx={{ borderColor: 'rgba(255,255,255,0.08)' }} />
      <Box sx={{ overflowY: 'auto', flex: 1, px: 2, py: 2 }}>
        {NAV_GROUPS.map((group, index) => (
          <React.Fragment key={group.label}>
            <Typography
              variant="overline"
              sx={{ px: 1, pt: 1, pb: 0.5, display: 'block', fontWeight: 700, color: '#64748b', letterSpacing: '0.08em', fontSize: '0.75rem' }}
            >
              {group.label}
            </Typography>
            <List sx={{ pb: 1 }}>
              {group.items.map((item) => {
                const active = isActive(item.href, (item as any).exact)
                return (
                  <ListItem key={item.href} disablePadding sx={{ mb: 0.5 }}>
                    <ListItemButton
                      component="a"
                      href={item.href}
                      selected={active}
                      onClick={isMobile ? handleDrawerToggle : undefined}
                      sx={{
                        borderRadius: '10px',
                        py: 1,
                        color: active ? '#ffffff' : '#cbd5e1',
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          bgcolor: 'rgba(255,255,255, 0.06)',
                          color: '#ffffff',
                          transform: 'translateX(2px)',
                        },
                        '&.Mui-selected': {
                          background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                          color: '#ffffff',
                          boxShadow: '0 4px 12px rgba(37,99,235,0.3)',
                          '& .MuiListItemIcon-root': {
                            color: '#ffffff',
                          },
                          '&:hover': {
                            background: 'linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%)',
                          },
                        },
                      }}
                    >
                      <ListItemIcon
                        sx={{
                          minWidth: 40,
                          color: active ? '#ffffff' : '#94a3b8',
                          transition: 'color 0.2s ease',
                        }}
                      >
                        {item.icon}
                      </ListItemIcon>
                      <ListItemText
                        disableTypography
                        primary={
                          <Typography variant="body2" sx={{ fontWeight: active ? 600 : 500, fontSize: '1rem' }}>
                            {item.label}
                          </Typography>
                        }
                      />
                    </ListItemButton>
                  </ListItem>
                )
              })}
            </List>
          </React.Fragment>
        ))}
        <Divider sx={{ borderColor: 'rgba(255,255,255,0.08)', my: 2 }} />
        <List sx={{ pb: 2 }}>
          <ListItem disablePadding>
            <ListItemButton
              component="a"
              href="/admin/logout"
              sx={{
                borderRadius: '10px',
                py: 1,
                color: '#f87171',
                transition: 'all 0.2s ease',
                '&:hover': {
                  bgcolor: 'rgba(239, 68, 68, 0.1)',
                  color: '#ef4444',
                  transform: 'translateX(2px)',
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 40, color: 'inherit' }}>
                <ExitToAppIcon />
              </ListItemIcon>
              <ListItemText
                disableTypography
                primary={
                  <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '1rem' }}>
                    Sair
                  </Typography>
                }
              />
            </ListItemButton>
          </ListItem>
        </List>
      </Box>
    </Box>
  )

  return (
    <Box sx={{ display: 'flex' }}>
      {isMobile && (
        <IconButton
          color="inherit"
          aria-label="open drawer"
          edge="start"
          onClick={handleDrawerToggle}
          sx={{
            position: 'fixed',
            top: 10,
            left: 10,
            width: 48,
            height: 48,
            zIndex: theme.zIndex.drawer + 1,
            bgcolor: 'background.paper',
            boxShadow: 3,
            color: '#0f172a',
            '&:hover': { bgcolor: '#f1f5f9' },
          }}
        >
          <MenuIcon sx={{ fontSize: 28 }} />
        </IconButton>
      )}

      {/* GLOBAL LOGOUT BUTTON - INJECTED INTO HEADER VIA PORTAL */}
      {headerNode && createPortal(
        <Box
          component="a"
          href="/admin/logout"
          title="Sair da Plataforma"
          sx={{
            display: { xs: 'none', md: 'flex' },
            alignItems: 'center',
            color: '#f87171',
            bgcolor: 'rgba(239, 68, 68, 0.1)',
            height: 30,
            px: 1.5,
            ml: 2, /* Margin left to separate from the user avatar/breadcrumbs */
            borderRadius: '6px',
            border: '1px solid rgba(239, 68, 68, 0.25)',
            textDecoration: 'none',
            transition: 'all 0.2s',
            fontWeight: 600,
            fontSize: '13px',
            '&:hover': {
              color: '#ffffff',
              bgcolor: '#ef4444',
              borderColor: '#ef4444',
              transform: 'translateY(-1px)',
              boxShadow: '0 4px 12px rgba(239,68,68,0.4)'
            }
          }}
        >
          <ExitToAppIcon sx={{ fontSize: 16, mr: 0.5 }} />
          SAIR
        </Box>,
        headerNode
      )}
      <Box component="nav" sx={{ width: { md: drawerWidth }, flexShrink: { sm: 0 } }}>
        {/* Mobile Drawer */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth, bgcolor: '#0f172a', borderRight: 'none' },
          }}
        >
          {drawerContent}
        </Drawer>
        {/* Desktop Drawer */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth, position: 'fixed', top: 0, height: '100vh', borderRight: 'none', bgcolor: '#0f172a' },
          }}
          open
        >
          {drawerContent}
        </Drawer>
      </Box>
    </Box>
  )
}
