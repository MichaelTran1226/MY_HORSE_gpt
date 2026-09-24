import React from 'react';
import { Icon } from '@/shared/components/ui/Icon';

export const DashboardPage: React.FC = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Page Title */}
      <div>
        <h1 style={{ fontSize: 'var(--fs-h1, 26px)', fontWeight: 800, color: 'var(--ink)', margin: 0 }}>
          Equestrian Operations Dashboard
        </h1>
        <p style={{ fontSize: 'var(--fs-caption, 11px)', color: 'var(--muted)', marginTop: '4px' }}>
          Overview of herd readiness, medical locks, active training plans, and stable occupancy.
        </p>
      </div>

      {/* Bento Box Grid (Asymmetric Modular Cards) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gridAutoRows: 'minmax(140px, auto)',
          gap: 'var(--bento-gap, 16px)',
        }}
      >
        {/* Bento 1: Herd Summary (Span 1x1) */}
        <div
          style={{
            background: 'var(--surface)',
            borderRadius: 'var(--bento-r, 20px)',
            padding: 'var(--kpi-pad, 20px 24px)',
            border: '1px solid var(--border-soft)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase' }}>
              Total Horses
            </span>
            <Icon name="horse" size={18} color="var(--brand)" />
          </div>
          <div>
            <div style={{ fontSize: 'var(--kpi-value-size, 32px)', fontWeight: 800, color: 'var(--ink)' }}>34</div>
            <div style={{ fontSize: '10px', color: 'var(--ok)', fontWeight: 600 }}>● 28 Fit for Training</div>
          </div>
        </div>

        {/* Bento 2: Medical Training Locks (Span 1x1 - Danger Alert) */}
        <div
          style={{
            background: 'var(--surface)',
            borderRadius: 'var(--bento-r, 20px)',
            padding: 'var(--kpi-pad, 20px 24px)',
            border: '1px solid var(--danger-bg)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--danger)', textTransform: 'uppercase' }}>
              Training Locks
            </span>
            <Icon name="ban" size={18} color="var(--danger)" />
          </div>
          <div>
            <div style={{ fontSize: 'var(--kpi-value-size, 32px)', fontWeight: 800, color: 'var(--danger)' }}>2</div>
            <div style={{ fontSize: '10px', color: 'var(--muted)', fontWeight: 600 }}>Active veterinary holds</div>
          </div>
        </div>

        {/* Bento 3: Today's Training Sessions (Span 1x1) */}
        <div
          style={{
            background: 'var(--surface)',
            borderRadius: 'var(--bento-r, 20px)',
            padding: 'var(--kpi-pad, 20px 24px)',
            border: '1px solid var(--border-soft)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase' }}>
              Sessions Today
            </span>
            <Icon name="activity" size={18} color="var(--brand)" />
          </div>
          <div>
            <div style={{ fontSize: 'var(--kpi-value-size, 32px)', fontWeight: 800, color: 'var(--ink)' }}>12</div>
            <div style={{ fontSize: '10px', color: 'var(--muted)', fontWeight: 600 }}>8 completed, 4 pending</div>
          </div>
        </div>

        {/* Bento 4: Stall Occupancy (Span 1x1) */}
        <div
          style={{
            background: 'var(--surface)',
            borderRadius: 'var(--bento-r, 20px)',
            padding: 'var(--kpi-pad, 20px 24px)',
            border: '1px solid var(--border-soft)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase' }}>
              Barn Occupancy
            </span>
            <Icon name="grid" size={18} color="var(--brand)" />
          </div>
          <div>
            <div style={{ fontSize: 'var(--kpi-value-size, 32px)', fontWeight: 800, color: 'var(--ink)' }}>85%</div>
            <div style={{ fontSize: '10px', color: 'var(--muted)', fontWeight: 600 }}>34 of 40 stalls occupied</div>
          </div>
        </div>

        {/* Bento 5: Quick Workflow Jump Strip (Span 4x1) */}
        <div
          style={{
            gridColumn: 'span 4',
            background: 'var(--surface)',
            borderRadius: 'var(--bento-r, 20px)',
            padding: '20px 24px',
            border: '1px solid var(--border-soft)',
          }}
        >
          <div style={{ fontSize: '13px', fontWeight: 800, color: 'var(--ink)', marginBottom: '12px' }}>
            5 Core Business Flows (SWP391 Team Task Allocations)
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '12px' }}>
            <div style={{ padding: '12px', background: 'var(--surface-2)', borderRadius: '12px' }}>
              <div style={{ fontWeight: 700, fontSize: '11px', color: 'var(--brand)' }}>Flow 1 (Required)</div>
              <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--ink)', marginTop: '2px' }}>Horses & Intake</div>
              <div style={{ fontSize: '10px', color: 'var(--muted)' }}>No pedigree · Microchip ID</div>
            </div>
            <div style={{ padding: '12px', background: 'var(--surface-2)', borderRadius: '12px' }}>
              <div style={{ fontWeight: 700, fontSize: '11px', color: 'var(--brand)' }}>Flow 2 (Required)</div>
              <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--ink)', marginTop: '2px' }}>Training Plans</div>
              <div style={{ fontSize: '10px', color: 'var(--muted)' }}>Wizard · Calendar · Trials</div>
            </div>
            <div style={{ padding: '12px', background: 'var(--surface-2)', borderRadius: '12px' }}>
              <div style={{ fontWeight: 700, fontSize: '11px', color: 'var(--brand)' }}>Flow 3 (Required)</div>
              <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--ink)', marginTop: '2px' }}>Health & Locks</div>
              <div style={{ fontSize: '10px', color: 'var(--danger)' }}>Medical Training Lock</div>
            </div>
            <div style={{ padding: '12px', background: 'var(--surface-2)', borderRadius: '12px' }}>
              <div style={{ fontWeight: 700, fontSize: '11px', color: 'var(--brand)' }}>Flow 4 (Optional)</div>
              <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--ink)', marginTop: '2px' }}>Stables & Feed</div>
              <div style={{ fontSize: '10px', color: 'var(--muted)' }}>Stall map · Feeding ration</div>
            </div>
            <div style={{ padding: '12px', background: 'var(--surface-2)', borderRadius: '12px' }}>
              <div style={{ fontWeight: 700, fontSize: '11px', color: 'var(--brand)' }}>Flow 5 (Optional)</div>
              <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--ink)', marginTop: '2px' }}>Racing & Awards</div>
              <div style={{ fontSize: '10px', color: 'var(--muted)' }}>Entries · Results · Billing</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
