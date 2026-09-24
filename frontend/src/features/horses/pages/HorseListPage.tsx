import React from 'react';
import { EmptyState } from '@/shared/components/ui/EmptyState';

export const HorseListPage: React.FC = () => {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h1 style={{ fontSize: 'var(--fs-h1, 26px)', fontWeight: 800, color: 'var(--ink)', margin: 0 }}>
            Horse Registry (Flow 1)
          </h1>
          <p style={{ fontSize: 'var(--fs-caption, 11px)', color: 'var(--muted)', marginTop: '4px' }}>
            Individual horse identification, health condition status, intake requests, and ownership.
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
          + Register New Horse
        </button>
      </div>

      {/* Placeholder / Empty State */}
      <EmptyState
        icon="horse"
        title="No Horses In View"
        description="The horse list module is scaffolded for Member 1. Connect API or switch VITE_USE_MOCK=true to load mock horses."
        actionText="Load Sample Data"
        onAction={() => alert('Member 1 task: Connect horse list API')}
      />
    </div>
  );
};
