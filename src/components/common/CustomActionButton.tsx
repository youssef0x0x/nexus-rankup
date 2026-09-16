import React from 'react';
import { ArrowUpRight, Sparkles } from 'lucide-react';

export type CustomActionButtonVariant = 'cyan' | 'purple' | 'gold';

interface CustomActionButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: CustomActionButtonVariant;
  icon?: React.ReactNode;
  showArrow?: boolean;
}

export const CustomActionButton = React.forwardRef<HTMLButtonElement, CustomActionButtonProps>(
  ({ children, variant = 'cyan', icon = <Sparkles size={16} />, showArrow = true, className = '', ...props }, ref) => (
    <button
      ref={ref}
      type="button"
      className={`btn-glow custom-action-button--${variant} ${className}`}
      {...props}
    >
      <span className="custom-action-button__shine" aria-hidden="true" />
      <span className="custom-action-button__content">
        <span className="custom-action-button__icon" aria-hidden="true">{icon}</span>
        <span>{children}</span>
        {showArrow && <ArrowUpRight className="custom-action-button__arrow" size={16} aria-hidden="true" />}
      </span>
    </button>
  ),
);

CustomActionButton.displayName = 'CustomActionButton';

export default CustomActionButton;
