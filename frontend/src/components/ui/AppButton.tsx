import { Button, type ButtonProps } from "react-aria-components";
import "./ui.css";

type Variant = "primary" | "secondary" | "ghost";

type AppButtonProps = ButtonProps & {
  children: React.ReactNode;
  variant?: Variant;
};

export function AppButton({
  children,
  variant = "primary",
  ...props
}: AppButtonProps) {
  return (
    <Button
      {...props}
      className={`ds-button ds-button-${variant}`}
    >
      {children}
    </Button>
  );
}