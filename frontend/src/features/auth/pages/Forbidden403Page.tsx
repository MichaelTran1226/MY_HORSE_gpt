import React from 'react';
import { EmptyState } from '@/shared/components/ui/EmptyState';

export const Forbidden403Page: React.FC = () => {
  return (
    <div style={{ padding: '60px 20px', display: 'flex', justifyContent: 'center' }}>
      <div style={{ maxWidth: '500px', width: '100%' }}>
        <EmptyState
          icon="shield"
          title="403 — Access Forbidden"
          description="You do not have sufficient role permissions or ownership privileges to access this operational view."
          actionText="Return to Dashboard"
          onAction={() => { window.location.href = '/dashboard'; }}
        />
      </div>
    </div>
  );
};
