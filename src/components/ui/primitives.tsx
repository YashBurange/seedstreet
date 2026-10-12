import type { ButtonHTMLAttributes, InputHTMLAttributes, PropsWithChildren, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Button({ className, ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button className={cn("button", className)} {...props} />;
}

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn("field", className)} {...props} />;
}

export function Select({ className, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className={cn("field", className)} {...props} />;
}

export function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cn("field min-h-28 resize-y", className)} {...props} />;
}

export function Badge({ children, className }: PropsWithChildren<{ className?: string }>) {
  return <span className={cn("badge", className)}>{children}</span>;
}

export function Progress({ value }: { value: number }) {
  return <div className="progress" aria-label={`${value}% funded`}><span style={{ width: `${Math.min(100, value)}%` }} /></div>;
}
