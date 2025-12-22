"use client";

import React from "react";

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

interface CardHeaderProps {
  children: React.ReactNode;
  className?: string;
}

interface CardBodyProps {
  children: React.ReactNode;
  className?: string;
}

interface CardFooterProps {
  children: React.ReactNode;
  className?: string;
}

export function Card({ children, className = "" }: CardProps) {
  return (
    <div
      className={`
        rounded-lg border border-gray-200 bg-white shadow-sm
        ${className}
      `}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className = "" }: CardHeaderProps) {
  return (
    <div
      className={`
        border-b border-gray-200 px-4 py-3
        ${className}
      `}
    >
      {children}
    </div>
  );
}

export function CardBody({ children, className = "" }: CardBodyProps) {
  return <div className={`p-4 ${className}`}>{children}</div>;
}

export function CardFooter({ children, className = "" }: CardFooterProps) {
  return (
    <div
      className={`
        border-t border-gray-200 px-4 py-3
        ${className}
      `}
    >
      {children}
    </div>
  );
}

export default Card;
