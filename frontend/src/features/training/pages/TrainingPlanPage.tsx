import React from 'react';
import { EmptyState } from '@/shared/components/ui/EmptyState';

export const TrainingPlanPage: React.FC = () => {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h1 style={{ fontSize: 'var(--fs-h1, 26px)', fontWeight: 800, color: 'var(--ink)', margin: 0 }}>
            Training Plans & Calendar (Flow 2)
          </h1>
          <p style={{ fontSize: 'var(--fs-caption, 11px)', color: 'var(--muted)', marginTop: '4px' }}>
            Wizard-based curriculum builder, daily staff assignment, and trial run performance logs.
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
          + Create Training Plan
        </button>
      </div>

      <EmptyState
        icon="activity"
        title="Training Calendar Ready"
        description="The training module is scaffolded for Member 2. Ready for calendar view and trial run logger."
        actionText="Open Plan Wizard"
        onAction={() => alert('Member 2 task: Implement Training Plan Wizard')}
      />
    </div>
  );
};
