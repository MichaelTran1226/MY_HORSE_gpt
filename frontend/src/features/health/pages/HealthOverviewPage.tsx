import React from 'react';
import { EmptyState } from '@/shared/components/ui/EmptyState';

export const HealthOverviewPage: React.FC = () => {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h1 style={{ fontSize: 'var(--fs-h1, 26px)', fontWeight: 800, color: 'var(--ink)', margin: 0 }}>
            Veterinary Health & Medical Locks (Flow 3)
          </h1>
          <p style={{ fontSize: 'var(--fs-caption, 11px)', color: 'var(--muted)', marginTop: '4px' }}>
            Medical records, interactive injury anatomies, vaccination schedules, and emergency Training Locks.
          </p>
        </div>
        <button
          style={{
            padding: '10px 20px',
            background: 'var(--accent)',
            color: '#fff',
            borderRadius: '10px',
            border: 'none',
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          + Issue Medical Training Lock
        </button>
      </div>

      <EmptyState
        icon="stethoscope"
        title="Medical Records Center"
        description="The health module is scaffolded for Member 3. Ready for injury map and medical training lock state enforcement."
        actionText="Record Clinical Entry"
        onAction={() => alert('Member 3 task: Implement Medical Lock & Diagnosis')}
      />
    </div>
  );
};
