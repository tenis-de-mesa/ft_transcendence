import React, { FC } from "react";
import classNames from "classnames";
import { Hr } from "./Hr";

interface CardWrapperProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

const CardWrapper: FC<CardWrapperProps> = ({
  children,
  className = "",
  ...props
}: CardProps) => (
  <div
    className={classNames(
      "block text-center rounded-xl",
      "bg-white dark:bg-gray-800",
      "shadow-xl",
      className
    )}
    {...props}
  >
    {children}
  </div>
);

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: string | React.ReactElement;
  position?: "left" | "center" | "right";
  className?: string;
  hr?: boolean;
}

const CardTitle = ({
  children,
  position = "center",
  hr = true,
  className,
}: CardProps) => (
  <div className={classNames(`text-${position}`, "px-6 py-3", className)}>
    {children}
    {hr && <Hr />}
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
  hr = true,
  className,
}: CardProps) => (
  <div className={classNames(`text-${position}`, "px-6 py-3", className)}>
    {hr && <Hr />}
    {children}
  </div>
);

export const Card = Object.assign(CardWrapper, {
  Title: CardTitle,
  Body: CardBody,
  Footer: CardFooter,
});

Card.Title = CardTitle;
Card.Body = CardBody;
Card.Footer = CardFooter;
