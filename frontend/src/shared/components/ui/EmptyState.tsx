import React from 'react';
import { Icon } from './Icon';

interface EmptyStateProps {
  icon?: string;
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon = 'clipboard',
  title,
  description,
  actionText,
  onAction,
}) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '48px 24px',
        textAlign: 'center',
        background: 'var(--surface)',
        borderRadius: 'var(--bento-r, 20px)',
        border: '1px dashed var(--border)',
        margin: '16px 0',
      }}
    >
      <div
        style={{
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          background: 'var(--surface-3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--muted)',
          marginBottom: '16px',
        }}
      >
        <Icon name={icon} size={28} />
      </div>
      <h3
        style={{
          fontSize: 'var(--fs-card-title, 14px)',
          fontWeight: 800,
          color: 'var(--ink)',
          marginBottom: '6px',
        }}
      >
        {title}
      </h3>
      <p
        style={{
          fontSize: 'var(--fs-caption, 11px)',
          color: 'var(--muted)',
          maxWidth: '380px',
          marginBottom: actionText ? '20px' : '0',
          lineHeight: 1.5,
        }}
      >
        {description}
      </p>
      {actionText && onAction && (
        <button
          onClick={onAction}
          style={{
            padding: '8px 18px',
            fontSize: 'var(--fs-caption, 11px)',
            fontWeight: 700,
            borderRadius: '8px',
            border: 'none',
            background: 'var(--brand)',
            color: 'var(--text-on-brand)',
            cursor: 'pointer',
            transition: 'background 150ms ease',
          }}
        >
          {actionText}
        </button>
      )}
    </div>
  );
};
