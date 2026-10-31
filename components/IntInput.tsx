'use client';

import { inputCls } from '@/lib/constants';

type Props = {
  value: number | '';
  onChange: (v: number | '') => void;
  min?: number;
  max?: number;
  allowEmpty?: boolean;
  placeholder?: string;
  className?: string;
  ariaLabel?: string;
  disabled?: boolean;
};

export default function IntInput({
  value, onChange, min = 0, max = 9999, allowEmpty = false,
  placeholder, className = '', ariaLabel, disabled,
}: Props) {
  return (
    <input
      type="text"
      inputMode="numeric"
      pattern="[0-9]*"
      aria-label={ariaLabel}
      placeholder={placeholder}
      disabled={disabled}
      className={`${inputCls} ${className}`}
      value={value}
      onFocus={(e) => e.target.select()}
      onChange={(e) => {
        const digits = e.target.value.replace(/\D/g, '');
        if (digits === '') {
          onChange(allowEmpty ? '' : min);
          return;
        }
        onChange(Math.min(max, Math.max(min, parseInt(digits, 10))));
      }}
    />
  );
}