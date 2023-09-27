import React, { FC, ButtonHTMLAttributes } from "react";
import classNames from "classnames";


type ButtonVariant = "primary" | "success" | "info" | "warning" | "error";
type ButtonState = "default" | "hover" | "focus" | "disabled";

const ButtonVariantClasses: Record<ButtonVariant, Record<ButtonState, string>> = {
  primary: {
    default: "btn-primary",
    hover: "btn-primary-hover",
    focus: "btn-primary-focus shadow-grayDark",
    disabled: "btn-primary-disabled",
  },
  success: {
    default: "btn-success",
    hover: "btn-success-hover",
    focus: "btn-success-focus shadow-grayDark",
    disabled: "btn-success-disabled",
  },
  info: {
    default: "btn-info",
    hover: "btn-info-hover",
    focus: "btn-info-focus shadow-grayDark",
    disabled: "btn-info-disabled",
  },
  warning: {
    default: "btn-warning",
    hover: "btn-warning-hover",
    focus: "btn-warning-focus shadow-grayDark",
    disabled: "btn-warning-disabled",
  },
  error: {
    default: "btn-error",
    hover: "btn-error-hover",
    focus: "btn-error-focus shadow-grayDark",
    disabled: "btn-error-disabled",
  }
};

type ButtonSize = "sm" | "md" | "lg" | "xl" | "2xl";

const ButtonSizeClasses: Record<ButtonSize, string> = {
  sm: "btn-sm",
  md: "btn-md",
  lg: "btn-lg",
  xl: "btn-xl",
  "2xl": "btn-2xl",
};

const ButtonIconSizeClasses: Record<ButtonSize, string> = {
  sm: "btn-icon-sm",
  md: "btn-icon-md",
  lg: "btn-icon-lg",
  xl: "btn-icon-xl",
  "2xl": "btn-icon-2xl",
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children?: string | React.ReactElement;
  className?: string;
  variant: ButtonVariant;
  size?: ButtonSize;
  LeadingIcon?: React.ReactElement;
  TrailingIcon?: React.ReactElement;
  IconOnly?: React.ReactElement;
  disabled?: boolean;
}

export const Button: FC<ButtonProps> = ({
  children,
  className,
  variant,
  size = "md",
  LeadingIcon,
  TrailingIcon,
  IconOnly,
  disabled,
  ...buttonProps
}) => {
  const ButtonVariantClassName = ButtonVariantClasses[variant];
  const ButtonIconSizeClassName = ButtonIconSizeClasses[size];

  return (
    <button
      {...buttonProps}
      className={classNames("btn-base", className, {
        [ButtonSizeClasses[size]]: !IconOnly,
        [classNames(ButtonIconSizeClassName, "justify-center")]: IconOnly,
        [classNames(ButtonVariantClassName.default, ButtonVariantClassName.hover, ButtonVariantClassName.focus)]: !disabled,
        [classNames(ButtonVariantClassName.disabled, "cursor-not-allowed")]: disabled,
      })}
    >
      {LeadingIcon ? (
        <LeadingIcon.type
          {...LeadingIcon.props}
          className={classNames(
            {
              "mr-2": size !== "2xl",
              "mr-3": size === "2xl",
            },
            LeadingIcon.props.className,
          )}
        />
      ) : null}
      {children}
      {IconOnly ? (
        <IconOnly.type {...IconOnly.props} size={size === "2xl" ? 24 : 20} />
      ) : null}
      {TrailingIcon ? (
        <TrailingIcon.type
          {...TrailingIcon.props}
          className={classNames({
            "ml-2": size !== "2xl",
            "ml-3": size === "2xl",
          })}
        />
      ) : null}
    </button>
  );
};