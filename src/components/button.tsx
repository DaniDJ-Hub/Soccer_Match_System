import { type ButtonHTMLAttributes, type ReactNode } from "react";

type Variant = "primary" | "secondary" | "danger";

const variantClasses: Record<Variant, string> = {
  primary: "bg-accent text-white font-semibold hover:opacity-90",
  secondary: "border border-border hover:bg-bg-card-hover",
  danger: "bg-red-500 text-white font-semibold hover:opacity-90",
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  block?: boolean;
  children: ReactNode;
}

export function Button({
  variant = "primary",
  block = false,
  className = "",
  children,
  ...props
}: ButtonProps) {
  const rounded = variant === "primary" ? (block ? "rounded-lg" : "rounded-full") : "rounded-lg";
  const padding = block ? "px-4 py-2.5" : "px-4 py-2";

  return (
    <button
      className={`inline-flex cursor-pointer items-center justify-center gap-1.5 text-sm transition disabled:cursor-not-allowed disabled:opacity-50 ${variantClasses[variant]} ${rounded} ${padding} ${block ? "w-full" : ""} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
