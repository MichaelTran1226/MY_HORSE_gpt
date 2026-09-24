import React from 'react';
import { EmptyState } from '@/shared/components/ui/EmptyState';

export const RaceListPage: React.FC = () => {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h1 style={{ fontSize: 'var(--fs-h1, 26px)', fontWeight: 800, color: 'var(--ink)', margin: 0 }}>
            Racing Entries & Awards (Flow 5)
          </h1>
          <p style={{ fontSize: 'var(--fs-caption, 11px)', color: 'var(--muted)', marginTop: '4px' }}>
            Tournament registrations, race finish times, medals, and monthly owner financial statements.
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
          + Register for Race
        </button>
      </div>

      <EmptyState
        icon="trophy"
        title="Tournament Schedule"
        description="The racing module is scaffolded for Member 5. Ready for race entries, prize billing, and performance certificates."
        actionText="Check Upcoming Cups"
        onAction={() => alert('Member 5 task: Implement Racing Registry')}
      />
    </div>
  );
};
