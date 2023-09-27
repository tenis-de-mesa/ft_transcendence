import React, { FC } from "react";
import classNames from "classnames";

type BadgeVariant = "primary" | "info" | "success" | "warning" | "error" | "gray";
type BadgeSize = "sm" | "md" | "lg";

export interface BadgeProps {
  children: string | React.ReactElement;
  className?: string;
  variant: BadgeVariant;
  size?: BadgeSize;
  LeadingIcon?: React.ReactElement;
  TrailingIcon?: React.ReactElement;
}

const BadgeVariantClasses: Record<BadgeVariant, string> = {
  primary: "badge-primary",
  success: "badge-success",
  info: "badge-info",
  warning: "badge-warning",
  error: "badge-error",
  gray: "badge-gray",
};

const BadgeSizeClasses: Record<BadgeSize, string> = {
  sm: "badge-sm",
  md: "badge-md ",
  lg: "badge-lg",
};

export const Badge: FC<BadgeProps> = ({
  variant,
  size = "md",
  LeadingIcon,
  TrailingIcon,
  className,
  children,
}) => {
  const BadgeVariantClassName = BadgeVariantClasses[variant];
  const BadgeSizeClassName = BadgeSizeClasses[size];

  return (
    <div
      className={classNames(
        "badge-base",
        BadgeVariantClassName,
        BadgeSizeClassName,
        className,
      )}
    >
      {LeadingIcon ? (
        <LeadingIcon.type
          {...LeadingIcon.props}
          className={classNames("mr-1.5", LeadingIcon.props.className)}
        />
      ) : null}
      {children}
      {TrailingIcon ? (
        <TrailingIcon.type
          {...TrailingIcon.props}
          className={classNames("ml-1.5", TrailingIcon.props.className)}
        />
      ) : null}
    </div>
  );
};