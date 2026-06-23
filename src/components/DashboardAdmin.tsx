import React from 'react'
import { getPayload } from 'payload'
import config from '@payload-config'
import { headers as nextHeaders } from 'next/headers'
import { ESocialSenderInline } from './ESocialSenderInline'
import { verificarEGerarNotificacoes } from '../lib/alertScanner'

export default async function DashboardAdmin() {
  const payload = await getPayload({ config })
  const headersList = await nextHeaders()
  const authResult = await payload.auth({ headers: headersList })
  const user = authResult?.user

  if (!user) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', color: '#64748b', fontFamily: 'Inter, system-ui, sans-serif' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔒</div>
          <p style={{ fontSize: '16px', fontWeight: 600 }}>Não autenticado. Por favor, realize o login.</p>
        </div>
      </div>
    )
  }

  await verificarEGerarNotificacoes(payload)

  const isAdmin = user.role === 'admin'
  const userEmpresaId = user.empresa && typeof user.empresa === 'object' ? (user.empresa as any).id : user.empresa

  const q = (field: string) => isAdmin ? undefined : { [field]: { equals: userEmpresaId as any } }

  const [empresasRes, funcionariosRes, laudosRes, examesRes, notificacoesRes] = await Promise.all([
    payload.find({ collection: 'empresas', where: q('id'), limit: 100 }),
    payload.find({ collection: 'funcionarios', where: q('empresa'), limit: 100, depth: 2 }),
    payload.find({ collection: 'laudos-sst', where: q('empresa'), limit: 100, depth: 2 }),
    payload.find({ collection: 'exames-medicos', where: q('empresa'), limit: 100, depth: 2 }),
    payload.find({ collection: 'notificacoes', where: q('empresa'), limit: 10, sort: '-createdAt', depth: 2 }),
  ])

  const empresas = empresasRes.docs
  const funcionarios = funcionariosRes.docs
  const laudos = laudosRes.docs
  const exames = examesRes.docs
  const notifications = notificacoesRes.docs

  const now = new Date()
  const in30 = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)

  const complianceMap = empresas.map(emp => {
    const el = laudos.filter(l => (typeof l.empresa === 'object' ? (l.empresa as any)?.id : l.empresa) === emp.id)
    const ee = exames.filter(e => (typeof e.empresa === 'object' ? (e.empresa as any)?.id : e.empresa) === emp.id)
    const ok = (el.length > 0 && el.every(l => new Date(l.validade) > now)) && (ee.length > 0 && ee.every(e => new Date(e.validade) > now))
    return { ...emp, status: ok ? 'Conforme' : 'Pendente', laudosCount: el.length, examesCount: ee.length }
  })

  const conformeCount = complianceMap.filter(e => e.status === 'Conforme').length
  const pendenteCount = complianceMap.filter(e => e.status === 'Pendente').length
  const total = empresas.length
  const pct = total > 0 ? (conformeCount / total) * 100 : 0

  const r = 44, sw = 9
  const circ = 2 * Math.PI * r
  const offset = circ - (pct / 100) * circ

  const mkAlert = (list: any[], tipo: string, getItem: (x: any) => string, status: 'expiring' | 'expired', prefix: string) =>
    list.filter(x => status === 'expired' ? new Date(x.validade) <= now : (new Date(x.validade) > now && new Date(x.validade) <= in30))
      .map(x => ({
        id: `${prefix}-${x.id}`, tipo, status,
        item: getItem(x),
        empresa: typeof x.empresa === 'object' ? (x.empresa as any)?.razaoSocial : '—',
        validade: new Date(x.validade).toLocaleDateString('pt-BR'),
        dias: status === 'expired' ? 0 : Math.ceil((new Date(x.validade).getTime() - now.getTime()) / 86400000),
      }))

  const allAlerts = [
    ...mkAlert(laudos, 'Laudo SST', l => String(l.tipoLaudo), 'expired', 'lx'),
    ...mkAlert(exames, 'Exame Ocupacional', e => `ASO — ${typeof e.funcionario === 'object' ? (e.funcionario as any)?.nome : '—'}`, 'expired', 'ex'),
    ...mkAlert(laudos, 'Laudo SST', l => String(l.tipoLaudo), 'expiring', 'l'),
    ...mkAlert(exames, 'Exame Ocupacional', e => `ASO — ${typeof e.funcionario === 'object' ? (e.funcionario as any)?.nome : '—'}`, 'expiring', 'e'),
  ]

  const employeeList = funcionarios.map(func => {
    const fe = exames.filter(e => (typeof e.funcionario === 'object' ? (e.funcionario as any)?.id : e.funcionario) === func.id)
    if (fe.length === 0) return { ...func, examStatus: 'none' as const, message: 'Nenhum exame', diasRestantes: null }
    const oldest = [...fe].sort((a, b) => new Date(a.validade).getTime() - new Date(b.validade).getTime())[0]
    const vDate = new Date(oldest.validade)
    if (vDate <= now) return { ...func, examStatus: 'critical' as const, message: `Vencido em ${vDate.toLocaleDateString('pt-BR')}`, diasRestantes: 0 }
    const days = Math.ceil((vDate.getTime() - now.getTime()) / 86400000)
    if (vDate <= in30) return { ...func, examStatus: 'warning' as const, message: `Vence em ${days} dias`, diasRestantes: days }
    return { ...func, examStatus: 'ok' as const, message: `Válido até ${vDate.toLocaleDateString('pt-BR')}`, diasRestantes: days }
  })

  // ─── CSS-in-JS via <style> tag ─────────────────────────────────────────
  const css = `
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

    .sst-dash * { box-sizing: border-box; margin: 0; padding: 0; }
    .sst-dash {
      font-family: 'Inter', 'Segoe UI', system-ui, sans-serif;
      background: #f0f4f8;
      min-height: 100vh;
      padding: 28px 32px;
      color: #0f172a;
    }
    
    /* ── Header ── */
    .sst-header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 12px;
      margin-bottom: 28px;
    }
    .sst-header h1 {
      font-size: 30px;
      font-weight: 800;
      letter-spacing: -0.5px;
      color: #0f172a;
      display: flex;
      align-items: center;
      gap: 10px;
      line-height: 1.2;
    }
    .sst-header p {
      font-size: 15px;
      color: #64748b;
      margin-top: 6px;
    }
    .sst-header strong { color: #1e40af; font-weight: 600; }
    .sst-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 6px 14px;
      border-radius: 99px;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.03em;
      white-space: nowrap;
      background: linear-gradient(135deg, #1e40af, #3b82f6);
      color: #ffffff;
      box-shadow: 0 2px 8px rgba(30,64,175,0.3);
    }

    /* ── Metric Cards ── */
    .sst-metrics {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 16px;
      margin-bottom: 24px;
    }
    @media (max-width: 1024px) { .sst-metrics { grid-template-columns: repeat(2, 1fr); } }
    @media (max-width: 600px) { .sst-metrics { grid-template-columns: 1fr; } }

    .sst-metric-card {
      background: #ffffff;
      border-radius: 16px;
      padding: 20px 22px;
      display: flex;
      align-items: center;
      gap: 16px;
      border: 1px solid rgba(0,0,0,0.06);
      box-shadow: 0 1px 3px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.04);
      transition: transform 0.15s, box-shadow 0.15s;
    }
    .sst-metric-card:hover { transform: translateY(-1px); box-shadow: 0 4px 16px rgba(0,0,0,0.1); }
    .sst-metric-icon {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 22px;
      flex-shrink: 0;
    }
    .sst-metric-label {
      font-size: 12px;
      font-weight: 700;
      color: #94a3b8;
      text-transform: uppercase;
      letter-spacing: 0.08em;
    }
    .sst-metric-value {
      font-size: 40px;
      font-weight: 800;
      line-height: 1;
      margin-top: 4px;
      color: #0f172a;
    }
    .sst-metric-value.danger { color: #dc2626; }

    /* ── Middle Grid ── */
    .sst-mid {
      display: grid;
      grid-template-columns: 260px 1fr 1fr;
      gap: 16px;
      margin-bottom: 20px;
      align-items: stretch; /* Make all items stretch to match the tallest one */
    }
    @media (max-width: 1100px) { .sst-mid { grid-template-columns: 1fr 1fr; } }
    @media (max-width: 700px) { .sst-mid { grid-template-columns: 1fr; } }

    /* ── Cards ── */
    .sst-card {
      background: #ffffff;
      border-radius: 16px;
      border: 1px solid rgba(0,0,0,0.06);
      box-shadow: 0 1px 3px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.04);
      overflow: hidden;
      display: flex;
      flex-direction: column;
      height: 100%; /* Force height 100% to fill the grid cell */
    }
    .sst-card-body { 
      padding: 22px;
      flex: 1; /* Pushes the body to fill the card */
      display: flex;
      flex-direction: column;
    }
    .sst-card-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 4px;
    }
    .sst-card-title {
      font-size: 16px;
      font-weight: 700;
      color: #0f172a;
    }
    .sst-card-sub {
      font-size: 13px;
      color: #94a3b8;
      margin-bottom: 16px;
      line-height: 1.4;
    }

    /* ── Donut Chart ── */
    .sst-donut-wrap {
      display: flex;
      flex-direction: column;
      align-items: center;
      position: relative;
      margin: 8px 0 16px;
    }
    .sst-donut-center {
      position: absolute;
      top: 50%; left: 50%;
      transform: translate(-50%, -50%);
      text-align: center;
    }
    .sst-donut-pct { font-size: 36px; font-weight: 800; color: #0f172a; line-height: 1; }
    .sst-donut-label { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: #94a3b8; display: block; margin-top: 2px; }
    .sst-legend { display: flex; justify-content: space-around; padding-top: 12px; border-top: 1px solid #f1f5f9; }
    .sst-legend-item { text-align: center; }
    .sst-legend-dot { display: inline-block; width: 8px; height: 8px; border-radius: 50%; margin-right: 4px; vertical-align: middle; }
    .sst-legend-label { font-size: 13px; color: #64748b; }
    .sst-legend-count { font-size: 24px; font-weight: 800; margin-top: 2px; }

    /* ── Alert List ── */
    .sst-scroll { overflow-y: auto; max-height: 220px; }
    .sst-scroll::-webkit-scrollbar { width: 4px; }
    .sst-scroll::-webkit-scrollbar-track { background: #f8fafc; border-radius: 4px; }
    .sst-scroll::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }

    .sst-alert-row {
      display: flex;
      align-items: flex-start;
      gap: 10px;
      padding: 10px 12px;
      border-radius: 10px;
      margin-bottom: 8px;
      border-width: 1px;
      border-style: solid;
    }
    .sst-alert-row.expired { background: #fff1f2; border-color: #fecdd3; }
    .sst-alert-row.expiring { background: #fffbeb; border-color: #fde68a; }
    .sst-alert-icon { font-size: 15px; flex-shrink: 0; margin-top: 1px; }
    .sst-alert-tipo {
      font-size: 11px; font-weight: 800; text-transform: uppercase;
      letter-spacing: 0.06em; display: block; margin-bottom: 2px;
    }
    .sst-alert-tipo.expired { color: #be123c; }
    .sst-alert-tipo.expiring { color: #b45309; }
    .sst-alert-item { font-size: 14px; font-weight: 700; color: #0f172a; display: block; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .sst-alert-empresa { font-size: 13px; color: #64748b; display: block; margin-top: 1px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .sst-alert-pill {
      flex-shrink: 0;
      display: inline-block;
      padding: 2px 8px;
      border-radius: 99px;
      font-size: 11px;
      font-weight: 800;
      white-space: nowrap;
      margin-top: 2px;
    }
    .sst-alert-pill.expired { background: #fee2e2; color: #be123c; }
    .sst-alert-pill.expiring { background: #fef9c3; color: #92400e; }
    .sst-empty { text-align: center; padding: 28px 16px; color: #94a3b8; font-size: 12px; }
    .sst-empty-icon { font-size: 32px; display: block; margin-bottom: 8px; }

    /* ── Section Card ── */
    .sst-section {
      background: #ffffff;
      border-radius: 16px;
      border: 1px solid rgba(0,0,0,0.06);
      box-shadow: 0 1px 3px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.04);
      margin-bottom: 20px;
      overflow: hidden;
    }
    .sst-section-head {
      padding: 20px 24px 16px;
      border-bottom: 1px solid #f1f5f9;
    }
    .sst-section-head h2 { font-size: 18px; font-weight: 700; color: #0f172a; display: flex; align-items: center; gap: 8px; }
    .sst-section-head p { font-size: 14px; color: #94a3b8; margin-top: 4px; line-height: 1.5; }

    /* ── Table ── */
    .sst-table-wrap { overflow-x: auto; }
    .sst-table { width: 100%; border-collapse: collapse; font-size: 15px; }
    .sst-table thead tr { background: #f8fafc; }
    .sst-table th {
      padding: 11px 20px;
      text-align: left;
      font-size: 12px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: #94a3b8;
      border-bottom: 1px solid #f1f5f9;
      white-space: nowrap;
    }
    .sst-table th:last-child { text-align: right; }
    .sst-table td {
      padding: 14px 20px;
      border-bottom: 1px solid #f8fafc;
      vertical-align: middle;
    }
    .sst-table tbody tr { transition: background 0.1s; }
    .sst-table tbody tr:hover { background: #f8fafc; }
    .sst-table tbody tr:last-child td { border-bottom: none; }

    /* Row status highlights */
    .sst-table tbody tr.row-warning { background: #fffbeb !important; border-left: 4px solid #f59e0b; }
    .sst-table tbody tr.row-warning:hover { background: #fef3c7 !important; }
    .sst-table tbody tr.row-critical { background: #fff1f2 !important; border-left: 4px solid #f43f5e; }
    .sst-table tbody tr.row-critical:hover { background: #fce7f3 !important; }

    .sst-func-name { font-weight: 700; font-size: 15px; color: #0f172a; display: block; }
    .sst-func-cpf { font-size: 13px; color: #94a3b8; display: block; margin-top: 2px; }
    .sst-cargo { font-weight: 600; font-size: 14px; color: #334155; display: block; }
    .sst-setor { font-size: 13px; color: #94a3b8; display: block; margin-top: 1px; }

    .sst-status-ok { color: #059669; font-weight: 700; font-size: 14px; }
    .sst-status-warning { color: #d97706; font-weight: 700; font-size: 14px; }
    .sst-status-critical { color: #dc2626; font-weight: 700; font-size: 14px; }
    .sst-status-none { color: #94a3b8; font-size: 12px; }

    .sst-conforme { color: #059669; font-weight: 700; font-size: 12px; display: flex; align-items: center; gap: 6px; }
    .sst-pendente { color: #dc2626; font-weight: 700; font-size: 12px; display: flex; align-items: center; gap: 6px; }
    .sst-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; display: inline-block; }
    .sst-dot-green { background: #059669; }
    .sst-dot-red { background: #dc2626; }

    .sst-tipo-pill {
      display: inline-block;
      padding: 4px 10px;
      border-radius: 6px;
      font-size: 11px;
      font-weight: 600;
      background: #f1f5f9;
      color: #334155;
      text-transform: capitalize;
    }

    /* ── Notif row ── */
    .sst-notif-row {
      display: flex;
      align-items: flex-start;
      gap: 10px;
      padding: 10px 12px;
      border-radius: 10px;
      margin-bottom: 8px;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
    }
    .sst-notif-tipo { font-size: 9px; font-weight: 800; text-transform: uppercase; color: #dc2626; letter-spacing: 0.05em; display: block; }
    .sst-notif-date { font-size: 9px; color: #94a3b8; white-space: nowrap; }
    .sst-notif-title { font-size: 11px; font-weight: 700; color: #0f172a; display: block; margin: 2px 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .sst-notif-msg { font-size: 10px; color: #64748b; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; line-height: 1.5; }

    /* ── Responsive fixes ── */
    @media (max-width: 768px) {
      .sst-dash { padding: 16px; }
      .sst-header h1 { font-size: 18px; }
    }
  `

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: css }} />
      <div className="sst-dash">

        {/* ── Header ── */}
        <div className="sst-header">
          <div>
            <h1>
              <span style={{ fontSize: '28px' }}>🛡️</span>
              Painel Geral de Saúde e Segurança
            </h1>
            <p>
              Olá, <strong>{user.email}</strong>. Acompanhe exames, conformidade legal e integrações do eSocial.
            </p>
          </div>
          <span className="sst-badge">
            {isAdmin ? '🔐 Acesso Administrativo Global' : '🏢 Acesso da Empresa'}
          </span>
        </div>

        {/* ── Metric Cards ── */}
        <div className="sst-metrics">
          <div className="sst-metric-card">
            <div className="sst-metric-icon" style={{ background: '#dbeafe' }}>🏢</div>
            <div>
              <p className="sst-metric-label">Empresas</p>
              <p className="sst-metric-value">{total}</p>
            </div>
          </div>
          <div className="sst-metric-card">
            <div className="sst-metric-icon" style={{ background: '#ede9fe' }}>👥</div>
            <div>
              <p className="sst-metric-label">Funcionários</p>
              <p className="sst-metric-value">{funcionarios.length}</p>
            </div>
          </div>
          <div className="sst-metric-card">
            <div className="sst-metric-icon" style={{ background: '#dcfce7' }}>📄</div>
            <div>
              <p className="sst-metric-label">Laudos Registrados</p>
              <p className="sst-metric-value">{laudos.length}</p>
            </div>
          </div>
          <div className="sst-metric-card">
            <div className="sst-metric-icon" style={{ background: allAlerts.length > 0 ? '#fee2e2' : '#dcfce7' }}>
              {allAlerts.length > 0 ? '🚨' : '✅'}
            </div>
            <div>
              <p className="sst-metric-label">Alertas Críticos</p>
              <p className={`sst-metric-value${allAlerts.length > 0 ? ' danger' : ''}`}>{allAlerts.length}</p>
            </div>
          </div>
        </div>

        {/* ── Middle Row: Chart + Alerts + Notifications ── */}
        <div className="sst-mid">

          {/* Donut Chart */}
          <div className="sst-card">
            <div className="sst-card-body">
              <div className="sst-card-header">
                <span className="sst-card-title">📊 Conformidade</span>
              </div>
              <p className="sst-card-sub">Empresas com laudos e exames válidos.</p>
              <div className="sst-donut-wrap">
                <svg width="130" height="130" viewBox="0 0 110 110" style={{ transform: 'rotate(-90deg)' }}>
                  <circle cx="55" cy="55" r={r} stroke="#f1f5f9" strokeWidth={sw} fill="transparent" />
                  <circle cx="55" cy="55" r={r}
                    stroke={pct >= 75 ? '#059669' : pct >= 40 ? '#f59e0b' : '#dc2626'}
                    strokeWidth={sw} fill="transparent"
                    strokeDasharray={circ} strokeDashoffset={offset}
                    strokeLinecap="round"
                    style={{ transition: 'stroke-dashoffset 0.6s ease' }}
                  />
                </svg>
                <div className="sst-donut-center">
                  <span className="sst-donut-pct">{Math.round(pct)}%</span>
                  <span className="sst-donut-label">Conforme</span>
                </div>
              </div>
              <div className="sst-legend">
                <div className="sst-legend-item">
                  <div><span className="sst-legend-dot" style={{ background: '#059669' }} /><span className="sst-legend-label">Conforme</span></div>
                  <p className="sst-legend-count" style={{ color: '#059669' }}>{conformeCount}</p>
                </div>
                <div className="sst-legend-item">
                  <div><span className="sst-legend-dot" style={{ background: '#dc2626' }} /><span className="sst-legend-label">Pendente</span></div>
                  <p className="sst-legend-count" style={{ color: '#dc2626' }}>{pendenteCount}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Alerts */}
          <div className="sst-card">
            <div className="sst-card-body">
              <div className="sst-card-header">
                <span className="sst-card-title">🔴 Vencimentos Próximos</span>
                <span style={{ background: '#fee2e2', color: '#be123c', padding: '3px 8px', borderRadius: '6px', fontSize: '10px', fontWeight: 700 }}>
                  &lt; 30 dias
                </span>
              </div>
              <p className="sst-card-sub">Laudos SST e exames médicos (ASO) vencendo.</p>
              <div className="sst-scroll">
                {allAlerts.length > 0 ? allAlerts.map(a => (
                  <div key={a.id} className={`sst-alert-row ${a.status}`}>
                    <span className="sst-alert-icon">{a.status === 'expired' ? '⛔' : '⚠️'}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' }}>
                        <span className={`sst-alert-tipo ${a.status}`}>{a.tipo}</span>
                        <span className={`sst-alert-pill ${a.status}`}>
                          {a.status === 'expired' ? 'VENCIDO' : `${a.dias}d`}
                        </span>
                      </div>
                      <span className="sst-alert-item">{a.item}</span>
                      <span className="sst-alert-empresa">🏢 {a.empresa}</span>
                    </div>
                  </div>
                )) : (
                  <div className="sst-empty">
                    <span className="sst-empty-icon">✅</span>
                    Nenhum alerta crítico ativo
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Notifications */}
          <div className="sst-card">
            <div className="sst-card-body">
              <div className="sst-card-header">
                <span className="sst-card-title">🔔 Notificações</span>
                <span style={{ background: '#dbeafe', color: '#1e40af', padding: '3px 8px', borderRadius: '6px', fontSize: '10px', fontWeight: 700 }}>Banco de Dados</span>
              </div>
              <p className="sst-card-sub">Alertas automáticos salvos no banco.</p>
              <div className="sst-scroll">
                {notifications.length > 0 ? notifications.map(n => (
                  <div key={n.id} className="sst-notif-row">
                    <span style={{ fontSize: '15px', flexShrink: 0, marginTop: '1px' }}>🔴</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span className="sst-notif-tipo">{String(n.tipo)}</span>
                        <span className="sst-notif-date">{new Date(n.createdAt).toLocaleDateString('pt-BR')}</span>
                      </div>
                      <span className="sst-notif-title">{String(n.titulo)}</span>
                      <span className="sst-notif-msg">{String(n.mensagem)}</span>
                    </div>
                  </div>
                )) : (
                  <div className="sst-empty">
                    <span className="sst-empty-icon">🔕</span>
                    Nenhuma notificação registrada
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ── Employee Status Table ── */}
        <div className="sst-section">
          <div className="sst-section-head">
            <h2>👨‍💼 Status de Saúde Ocupacional dos Funcionários</h2>
            <p>
              Linhas <strong style={{ color: '#d97706' }}>amarelas</strong> = ASO vence em &lt;30 dias. &nbsp;
              Linhas <strong style={{ color: '#dc2626' }}>vermelhas</strong> = ASO vencido.
            </p>
          </div>
          <div className="sst-table-wrap">
            {employeeList.length > 0 ? (
              <table className="sst-table">
                <thead>
                  <tr>
                    <th>Funcionário</th>
                    <th>Cargo / Setor</th>
                    <th>Empresa</th>
                    <th>Status do ASO</th>
                  </tr>
                </thead>
                <tbody>
                  {employeeList.map(func => (
                    <tr key={func.id} className={
                      func.examStatus === 'critical' ? 'row-critical'
                      : func.examStatus === 'warning' ? 'row-warning' : ''
                    }>
                      <td>
                        <span className="sst-func-name">{String(func.nome)}</span>
                        <span className="sst-func-cpf">CPF: {String(func.cpf)}</span>
                      </td>
                      <td>
                        <span className="sst-cargo">{String(func.cargo)}</span>
                        <span className="sst-setor">{String(func.setor)}</span>
                      </td>
                      <td style={{ fontSize: '12px', color: '#475569' }}>
                        {typeof func.empresa === 'object' && func.empresa !== null
                          ? String((func.empresa as any).razaoSocial ?? '—')
                          : 'Vincular Empresa'}
                      </td>
                      <td>
                        <span className={
                          func.examStatus === 'ok' ? 'sst-status-ok'
                          : func.examStatus === 'warning' ? 'sst-status-warning'
                          : func.examStatus === 'critical' ? 'sst-status-critical'
                          : 'sst-status-none'
                        }>
                          {func.examStatus === 'ok' && '✅ '}
                          {func.examStatus === 'warning' && '⚠️ '}
                          {func.examStatus === 'critical' && '⛔ '}
                          {func.message}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="sst-empty" style={{ padding: '40px' }}>
                <span className="sst-empty-icon">👤</span>
                Nenhum funcionário cadastrado. Adicione funcionários na seção correspondente.
              </div>
            )}
          </div>
        </div>

        {/* ── eSocial Table ── */}
        <div className="sst-section">
          <div className="sst-section-head">
            <h2>📡 Integração eSocial por Empresa</h2>
            <p>Transmita as informações de SST (S-2220, S-2240) de cada empresa conveniada diretamente para o eSocial.</p>
          </div>
          <div className="sst-table-wrap">
            {complianceMap.length > 0 ? (
              <table className="sst-table">
                <thead>
                  <tr>
                    <th>Empresa / CNPJ</th>
                    <th>Tipo</th>
                    <th>Conformidade</th>
                    <th>Transmissão eSocial</th>
                  </tr>
                </thead>
                <tbody>
                  {complianceMap.map(emp => (
                    <tr key={emp.id}>
                      <td>
                        <span style={{ fontWeight: 700, fontSize: '13px', color: '#0f172a', display: 'block' }}>{String(emp.razaoSocial)}</span>
                        <span style={{ fontSize: '11px', color: '#94a3b8', display: 'block', marginTop: '2px' }}>CNPJ: {String(emp.cnpj)}</span>
                      </td>
                      <td><span className="sst-tipo-pill">{String(emp.tipo)}</span></td>
                      <td>
                        <span className={emp.status === 'Conforme' ? 'sst-conforme' : 'sst-pendente'}>
                          <span className={`sst-dot ${emp.status === 'Conforme' ? 'sst-dot-green' : 'sst-dot-red'}`} />
                          {emp.status}
                          <span style={{ fontWeight: 400, color: '#94a3b8', fontSize: '11px' }}>
                            ({emp.laudosCount} laudos, {emp.examesCount} exames)
                          </span>
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <ESocialSenderInline
                          empresaId={emp.id}
                          empresaNome={String(emp.razaoSocial)}
                          cnpj={String(emp.cnpj)}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="sst-empty" style={{ padding: '40px' }}>
                <span className="sst-empty-icon">🏢</span>
                Nenhuma empresa cadastrada. Adicione uma empresa para começar.
              </div>
            )}
          </div>
        </div>

      </div>
    </>
  )
}
