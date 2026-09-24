import React from 'react';
import { EmptyState } from '@/shared/components/ui/EmptyState';

export const StaffDirectoryPage: React.FC = () => {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h1 style={{ fontSize: 'var(--fs-h1, 26px)', fontWeight: 800, color: 'var(--ink)', margin: 0 }}>
            Staff & Personnel Directory
          </h1>
          <p style={{ fontSize: 'var(--fs-caption, 11px)', color: 'var(--muted)', marginTop: '4px' }}>
            Club personnel management, employee invitations, role assignments (RBAC), and account lock states.
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
          + Invite Staff Member
        </button>
      </div>

      <EmptyState
        icon="users"
        title="Staff Directory"
        description="Managerial personnel view with role filter (Trainer, Veterinarian, Groom)."
      />
    </div>
  );
};
