import {forwardRef, useRef} from 'react';
import {mergeProps, useButton} from 'react-aria';

type AppButtonVariant = "primary" | "secondary" | "tertiary" | "dark" | "danger";
type AppButtonSize = 'sm' | 'md';

export type AppButtonProps = {
  children: React.ReactNode;
  variant?: AppButtonVariant;
  size?: AppButtonSize;
  isLoading?: boolean;
  isDisabled?: boolean;
  fullWidth?: boolean;
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
  type?: 'button' | 'submit' | 'reset';
  onPress?: () => void;
  className?: string;
};

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ');
}

export const AppButton = forwardRef<HTMLButtonElement, AppButtonProps>(
  function AppButton(
    {
      children,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      isDisabled = false,
      fullWidth = false,
      startIcon,
      endIcon,
      type = 'button',
      onPress,
      className,
    },
    forwardedRef
  ) {
    const innerRef = useRef<HTMLButtonElement>(null);
    const ref = (forwardedRef ?? innerRef) as React.RefObject<HTMLButtonElement>;

    const {buttonProps, isPressed} = useButton(
      {
        type,
        onPress,
        isDisabled: isDisabled || isLoading,
      },
      ref
    );

    const disabled = isDisabled || isLoading;

    return (
      <button
        {...mergeProps(buttonProps)}
        ref={ref}
        type={type}
        className={cn(
          'app-button',
          `app-button--${variant}`,
          `app-button--${size}`,
          fullWidth && 'app-button--full-width',
          isPressed && 'is-pressed',
          isLoading && 'is-loading',
          className
        )}
        disabled={disabled}
        data-variant={variant}
        data-size={size}
        data-loading={isLoading ? 'true' : undefined}
      >
        {isLoading && <span className="app-button__spinner" aria-hidden="true" />}

        {startIcon && !isLoading && (
          <span className="app-button__icon app-button__icon--start" aria-hidden="true">
            {startIcon}
          </span>
        )}

        <span className="app-button__label">
          {children}
        </span>

        {endIcon && !isLoading && (
          <span className="app-button__icon app-button__icon--end" aria-hidden="true">
            {endIcon}
          </span>
        )}
      </button>
    );
  }
);

export default AppButton;