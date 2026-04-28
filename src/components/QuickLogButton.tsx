import React from 'react';

export interface QuickLogMedication {
  id: string;
  name: string;
  isActive: boolean;
}

interface QuickLogButtonProps {
  medication: QuickLogMedication;
  onTakeNow: (medicationId: string) => Promise<void> | void;
  disabled?: boolean;
}

export function QuickLogButton({ medication, onTakeNow, disabled = false }: QuickLogButtonProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleTakeNow = async () => {
    if (isSubmitting || disabled) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onTakeNow(medication.id);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleTakeNow}
      disabled={disabled || isSubmitting}
      aria-label={`Take ${medication.name} now`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        padding: '0.75rem 1rem',
        borderRadius: '0.75rem',
        border: 'none',
        fontWeight: 700,
        fontSize: '1rem',
        cursor: disabled || isSubmitting ? 'not-allowed' : 'pointer',
        color: '#ffffff',
        background: disabled || isSubmitting ? '#94a3b8' : '#2563eb',
        boxShadow: '0 10px 24px rgba(37, 99, 235, 0.28)',
      }}
    >
      {isSubmitting ? 'Logging…' : 'Take now'}
    </button>
  );
}

export default QuickLogButton;
