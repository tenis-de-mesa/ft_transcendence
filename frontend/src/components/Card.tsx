import React from "react";
import classNames from "classnames";
import { Hr } from "./Hr";

const CardWrapper = ({ children, className = "" }) => (
  <div className={classNames(
    "block text-center rounded-xl",
    "bg-white dark:bg-gray-700",
    "shadow-xl",
    className
  )}>
    {children}
  </div>
)

interface CardBodyProps {
  children: string | React.ReactElement;
  className?: string;
}

const CardBody = ({ 
  children,
  className,
}: CardBodyProps) => (
  <div className={classNames("p-6", className)}>
    {children}
  </div>
);

interface CardOptional {
  children: string | React.ReactElement;
  position?: "left" | "center" | "right";
  className?: string;
}

const CardTitle = ({ 
  children, 
  position = "center",
  className,
}: CardOptional) => (
  <div className={classNames(
    `text-${position}`,
    className
  )}>
    {children}
    <Hr />
  </div>
);

const CardFooter = ({ 
  children, 
  position = "center", 
  className, 
}: CardOptional) => (
  <div className={classNames(
    `text-${position}`, 
    "px-6 py-3 border-t-2 border-primary-50 dark:border-white",
    className
  )}>
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
