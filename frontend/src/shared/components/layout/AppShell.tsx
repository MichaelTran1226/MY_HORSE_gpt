import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { Icon } from '../ui/Icon';
import { BRAND } from '../../lib/brand';

interface NavItem {
  to: string;
  label: string;
  icon: string;
  flow?: string;
}

const NAV_ITEMS: NavItem[] = [
  { to: '/dashboard', label: 'Dashboard', icon: 'home' },
  { to: '/horses', label: 'Horses', icon: 'horse', flow: 'Flow 1' },
  { to: '/training', label: 'Training', icon: 'activity', flow: 'Flow 2' },
  { to: '/health', label: 'Health & Vitals', icon: 'stethoscope', flow: 'Flow 3' },
  { to: '/stables', label: 'Stables', icon: 'grid', flow: 'Flow 4' },
  { to: '/racing', label: 'Racing & Awards', icon: 'trophy', flow: 'Flow 5' },
  { to: '/accounts', label: 'Staff Accounts', icon: 'users' },
];

export const AppShell: React.FC = () => {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--page)' }}>
      {/* Sidebar (248px) */}
      <aside
        style={{
          width: '248px',
          background: 'var(--nav-bg)',
          borderRight: '1px solid var(--border)',
          display: 'flex',
          flexDirection: 'column',
          position: 'sticky',
          top: 0,
          height: '100vh',
          zIndex: 10,
        }}
      >
        {/* Brand Header */}
        <div
          style={{
            padding: '24px 20px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            borderBottom: '1px solid var(--border-soft)',
          }}
        >
          <img src={BRAND.logo.path} alt={BRAND.logo.alt} style={{ width: '36px', height: '36px' }} />
          <div>
            <div style={{ fontWeight: 800, fontSize: '14px', color: 'var(--ink)', letterSpacing: '-0.3px' }}>
              {BRAND.displayName}
            </div>
            <div style={{ fontSize: '9px', fontWeight: 700, color: 'var(--brand)', textTransform: 'uppercase', letterSpacing: '1px' }}>
              {BRAND.shortName} CLUB
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav style={{ padding: '16px 12px', flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '10px 14px',
                borderRadius: '10px',
                textDecoration: 'none',
                fontSize: 'var(--fs-body, 12px)',
                fontWeight: isActive ? 700 : 500,
                color: isActive ? 'var(--brand)' : 'var(--text-2)',
                background: isActive ? 'var(--brand-50)' : 'transparent',
                transition: 'all 150ms ease',
              })}
            >
              <Icon name={item.icon} size={18} />
              <span style={{ flex: 1 }}>{item.label}</span>
              {item.flow && (
                <span
                  style={{
                    fontSize: '9px',
                    fontWeight: 700,
                    padding: '2px 6px',
                    borderRadius: '4px',
                    background: 'var(--surface-3)',
                    color: 'var(--muted)',
                  }}
                >
                  {item.flow}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Footer Support info */}
        <div style={{ padding: '16px 20px', borderTop: '1px solid var(--border-soft)', fontSize: '11px', color: 'var(--muted)' }}>
          <div>EquiFlow v2.0</div>
          <div style={{ fontSize: '10px', color: 'var(--muted-2)' }}>Hotline: {BRAND.hotline}</div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Topbar (76px) */}
        <header
          style={{
            height: '76px',
            background: 'var(--surface)',
            borderBottom: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 34px',
            position: 'sticky',
            top: 0,
            zIndex: 9,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: 'var(--fs-body, 12px)', color: 'var(--muted)' }}>
            <span style={{ fontWeight: 600 }}>EquiFlow Platform</span>
            <span>/</span>
            <span style={{ color: 'var(--ink)', fontWeight: 700 }}>Management Hub</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 14px',
                background: 'var(--surface-2)',
                borderRadius: '20px',
                border: '1px solid var(--border-soft)',
                fontSize: '11px',
                fontWeight: 600,
                color: 'var(--text-2)',
              }}
            >
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--ok)' }} />
              Active Session
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  background: 'var(--brand-100)',
                  color: 'var(--brand)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                  fontSize: '12px',
                }}
              >
                CM
              </div>
              <div>
                <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--ink)' }}>Club Manager</div>
                <div style={{ fontSize: '10px', color: 'var(--muted)' }}>Admin Portal</div>
              </div>
            </div>
          </div>
        </header>

        {/* Content Canvas */}
        <main
          style={{
            flex: 1,
            padding: '28px 34px',
            maxWidth: '1600px',
            width: '100%',
            margin: '0 auto',
          }}
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
};
