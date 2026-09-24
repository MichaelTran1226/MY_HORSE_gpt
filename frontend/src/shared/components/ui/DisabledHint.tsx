import React from 'react';

interface DisabledHintProps {
  disabled: boolean;
  reason?: string;
  children: React.ReactElement<{ disabled?: boolean; style?: React.CSSProperties; title?: string }>;
}

export const DisabledHint: React.FC<DisabledHintProps> = ({ disabled, reason, children }) => {
  if (!disabled) {
    return children;
  }

  return (
    <span
      style={{
        display: 'inline-block',
        cursor: 'not-allowed',
        opacity: 0.65,
      }}
      title={reason || 'Action disabled due to permission restrictions'}
    >
      {React.cloneElement(children, {
        disabled: true,
        style: {
          ...children.props.style,
          pointerEvents: 'none',
        },
      })}
    </span>
  );
};
