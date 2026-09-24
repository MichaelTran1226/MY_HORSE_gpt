import React from 'react';
import { EmptyState } from '@/shared/components/ui/EmptyState';

export const StallMapPage: React.FC = () => {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h1 style={{ fontSize: 'var(--fs-h1, 26px)', fontWeight: 800, color: 'var(--ink)', margin: 0 }}>
            Stables & Nutrition Management (Flow 4)
          </h1>
          <p style={{ fontSize: 'var(--fs-caption, 11px)', color: 'var(--muted)', marginTop: '4px' }}>
            Barn stall allocations, meal ration balancing, groom checklists, and incident camera reports.
          </p>
        </div>
        <button
          style={{
            padding: '10px 20px',
            background: 'var(--brand)',
            color: 'var(--text-on-brand)',
            borderRadius: '10px',
            border: 'none',
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          + Report Stable Incident
        </button>
      </div>

      <EmptyState
        icon="grid"
        title="Stall Grid Matrix"
        description="The stables module is scaffolded for Member 4. Ready for StallGrid and mobile grooming task checklists."
        actionText="View Stall Allocation"
        onAction={() => alert('Member 4 task: Implement Stall Grid Matrix')}
      />
    </div>
  );
};
