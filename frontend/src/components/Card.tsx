import React from "react";
import classNames from "classnames";
import { Hr } from "./Hr";

const CardWrapper = ({ children, className = "" }) => (
  <div
    className={classNames(
      "block text-center rounded-xl",
      "bg-white dark:bg-gray-800",
      "shadow-xl",
      className
    )}
  >
    {children}
  </div>
);

interface CardProps {
  children: string | React.ReactElement;
  position?: "left" | "center" | "right";
  className?: string;
}

const CardTitle = ({ children, position = "center", className }: CardProps) => (
  <div className={classNames(`text-${position}`, "px-6 py-3", className)}>
    {children}
    <Hr />
  </div>
);

const CardBody = ({ children, position = "center", className }: CardProps) => (
  <div className={classNames(`text-${position}`, "px-6 py-3", className)}>
    {children}
  </div>
);

const CardFooter = ({
  children,
  position = "center",
  className,
}: CardProps) => (
  <div className={classNames(`text-${position}`, "px-6 py-3", className)}>
    <Hr />
    {children}
  </div>
);

export const Card = CardWrapper as typeof CardWrapper & {
  Title: typeof CardTitle;
  Body: typeof CardBody;
  Footer: typeof CardFooter;
};

Card.Title = CardTitle;
Card.Body = CardBody;
Card.Footer = CardFooter;
